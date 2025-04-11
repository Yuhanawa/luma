// https://github.com/gadicc/discourse2

/**
 * @module
 *
 * The complete Discourse API, fully typed.
 *
 * @example
 * ```ts
 * import Discourse from "discourse2";
 *
 * const discourse = new Discourse("https://discourse.example.com");
 *
 *
 * discourse.on('cookieChanged', (newCookie) => {
 *   console.log('New cookie:', newCookie);
 * });
 *
 * discourse.on('usernameChanged', (newUsername, oldUsername) => {
 *   console.log('Username changed from', oldUsername, 'to', newUsername);
 * });
 *
 * const initialCookie = "...";
 * discourse.setCookie(initialCookie);
 *
 * const result = await discourse.listLatestTopics();
 * ```
 */

import { EventEmitter } from "events";
import { Ajv } from "ajv";
import type { ValidateFunction } from "ajv";
import _ajvErrors from "ajv-errors";
import _ajvFormats from "ajv-formats";
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { wrapper as axios_cookiejar_warper } from "axios-cookiejar-support";
import Constants from "expo-constants";
import type { OpenAPIV3_1 } from "openapi-types";
import { Cookie, CookieJar, type SerializedCookieJar } from "tough-cookie";
import DiscourseAPIGenerated from "./generated";
import spec from "./openapi.json";

// Type helper for better type inference.  Makes complex types easier to read in IDE tooltips.
type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

type Operation = OpenAPIV3_1.OperationObject;
type Schema = OpenAPIV3_1.SchemaObject;

// Initialize Ajv with appropriate configuration.
const ajv = new Ajv({
	allErrors: true, // Show all validation errors instead of stopping at the first one.
});
ajv.addKeyword("example"); //  OpenAPI uses 'example', but it's not a standard JSON Schema keyword.
const ajvErrors = _ajvErrors.default;
const ajvFormats = _ajvFormats.default;
ajvErrors(ajv);
ajvFormats(ajv, ["email"]); // Add validation for email format.

/**
 * Cache for compiled schema validators.
 * Improves performance by avoiding recompilation of schemas.
 */
const compiledValidators = new Map<object, ValidateFunction>();

/**
 * Get or create a validator for a schema.
 * @param schema - JSON Schema to validate against.
 * @returns Compiled validator function.
 */
function getValidator(schema: object): ValidateFunction {
	let validator = compiledValidators.get(schema);
	if (!validator) {
		validator = ajv.compile(schema);
		compiledValidators.set(schema, validator);
	}
	return validator;
}

/**
 * Create a base schema stub for parameter validation.
 */
function schemaStub(): Schema {
	return {
		type: "object",
		additionalProperties: false, // Don't allow extra properties not defined in the schema.
		properties: {},
		required: [],
	};
}

/**
 * Schema cache for operations.
 * Improves performance by avoiding regeneration of schemas.
 */
const operationSchemas = new Map<object, Schema>();

/**
 * Generate a schema for validating operation parameters.
 * @param operation - OpenAPI operation object.
 * @returns JSON Schema for validation.
 */
function operationSchema(operation: Operation): Schema {
	let schema = operationSchemas.get(operation);
	if (!schema) {
		schema = {
			type: "object",
			properties: {
				header: schemaStub(),
				path: schemaStub(),
				query: schemaStub(),
			},
			required: [],
		};

		if (operation.parameters) {
			for (const param of operation.parameters) {
				if (!("in" in param)) continue;
				const where = param.in;
				if (!["header", "path", "query"].includes(where)) {
					throw new Error(`Unexpected parameter location: ${where}`);
				}

				if (!schema.required!.includes(where)) {
					schema.required!.push(where);
				}

				const properties = schema.properties!;
				const whereSchema = properties[where]!;

				if ("properties" in whereSchema) {
					whereSchema.properties![param.name] = param.schema!;
					if (param.required) {
						whereSchema.required!.push(param.name);
					}
				}
			}
		}

		if ("requestBody" in operation && operation.requestBody && "content" in operation.requestBody) {
			const content = operation.requestBody.content;
			if ("properties" in schema) {
				const keys = Object.keys(content);
				if (keys.length === 0) {
					throw new Error("No requestBody content types");
				}
				if (keys.length > 1) {
					throw new Error("Multiple requestBody content types not supported, please report");
				}

				const type = keys[0]!;
				const contentInner = content[type];

				if (contentInner) {
					schema.properties!.body = {
						type: "object",
						...contentInner.schema!,
					};

					if ("required" in contentInner.schema! && contentInner.schema!.required?.length && !schema.required!.includes("body")) {
						schema.required!.push("body");
					}

					if (operation.operationId === "createUpload") {
						schema.properties!.body = {};
					}
				} else {
					throw new Error(`No ${type} content type`);
				}
			}
		}

		operationSchemas.set(operation, schema);
	}
	return schema;
}

// Build a lookup table for operations by operationId (for faster access).
const byOperationId: {
	[key: string]: { path: string; method: string; data: Operation };
} = {};

// Iterate through the OpenAPI specification's paths and methods.
for (const [path, pathData] of Object.entries(spec.paths)) {
	for (const [method, methodData] of Object.entries(pathData)) {
		const operationId = methodData.operationId; // Unique identifier for the operation.
		// Store the path, method, and operation data for easy lookup by operationId.
		byOperationId[operationId] = { path, method, data: methodData };
	}
}

/**
 * Error class for HTTP errors.
 * Contains status code, message, and full response.
 */
export class HTTPError extends Error {
	status: number;
	response: AxiosResponse;

	constructor(status: number, message: string, response: AxiosResponse) {
		super(message);
		this.status = status;
		this.response = response;
	}
}

/**
 * Error class for parameter validation failures.
 * Contains the validation errors from Ajv.
 */
export class ParamaterValidationError extends Error {
	errors: typeof ajv.errors; //  Type of Ajv errors.

	constructor(message: string, errors: typeof ajv.errors) {
		super(message);
		this.errors = errors;
	}
}

/**
 * Error class for response validation failures.
 * Contains the validation errors from Ajv.
 */
export class ResponseValidationError extends Error {
	errors: typeof ajv.errors; //  Type of Ajv errors.

	constructor(message: string, errors: typeof ajv.errors) {
		super(message);
		this.errors = errors;
	}
}

/**
 * A Discourse API client that extends the generated API client and provides
 * robust cookie management, redirect handling, and error handling using Axios.
 */
export default class DiscourseAPI extends DiscourseAPIGenerated {
	protected axiosInstance: AxiosInstance;
	protected eventEmitter: EventEmitter;
	protected cookieJar: CookieJar;
	private url: string;
	protected username?: string;

	/**
	 * Creates a new Discourse API client.
	 * @param url - The base URL of the Discourse instance.
	 * @param opts - Configuration options.
	 * @param opts.initialCookie - An optional initial cookie string to load.
	 */
	constructor(url: string, opts: { initialCookie?: string | SerializedCookieJar | CookieJar; userAgent?: string } = {}) {
		console.log("Creating DiscourseAPI instance: ", url);
		super();

		this.url = url;
		this.eventEmitter = new EventEmitter();
		this.cookieJar = new CookieJar();

		this.axiosInstance =
			// axios_cookiejar_warper(
			axios.create({
				jar: this.cookieJar,
				baseURL: this.url,
				// !NOTE
				// First need to know:
				// fetch on React Native is implemented on top of native-level APIs and differs slightly from the whatwg specification and the well-known github polyfill.
				// This means that when the actual HTTP request is made, it's made by the native networking stack on iOS or OkHttp3 on Android, and in each case, it's the underlying ObjC or Java code that handles and stores the cookies, away from your JS code.
				// Source: https://stackoverflow.com/questions/41132167/react-native-fetch-cookie-persist/79293653
				// Than: there has two bugs
				// 1. `withCredentials: false` works confusingly and often doesn't work as expected
				// Source: Cookie based authentication is currently unstable. You can view some of the issues raised here: https://github.com/facebook/react-native/issues/23185
				// 2. `withCredentials: true` doesn't work
				// Source: The following options are currently not working with fetch: redirect:manual, credentials:omit
				// That is to say:
				// if you want **withCredentials**, you should use `withCredentials: false`
				// I don't what will be in future, but now it works
				// other reference:
				// https://reactnative.dev/docs/network#known-issues-with-fetch-and-cookie-based-authentication
				// https://github.com/facebook/react-native/issues/23185#issuecomment-1148130842
				withCredentials: false,
				headers: {
					"User-Agent": opts.userAgent ?? `Mozilla/5.0 (Mobile; rv:137.0) Gecko/20100101 Firefox/137.0 luma/${Constants.version ?? "0"}`,
					Accept: "application/json;q=0.9, text/plain;q=0.8, */*;q=0.5",
					"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
					"X-Requested-With": "XMLHttpRequest",
				},
				validateStatus: (status) => (status >= 200 && status < 300) || status === 302,
			});
		// );

		//  Set initial cookie *before* making any requests.
		if (opts.initialCookie) {
			this.loadCookies(opts.initialCookie);
		}

		this.axiosInstance.interceptors.request.use((config) => {
			config.headers.Cookie = this.cookieJar.getCookieStringSync(this.url);

			if (this.axiosInstance.defaults.headers.common["X-CSRF-Token"] === null) {
				this.axiosInstance.defaults.headers.common["X-CSRF-Token"] === undefined;
				config.headers["X-CSRF-Token"] = undefined;
				this.get_session_csrf();
			}

			if (this.axiosInstance.defaults.headers.common["X-CSRF-Token"]) {
				config.headers["X-CSRF-Token"] = this.axiosInstance.defaults.headers.common["X-CSRF-Token"];
			}

			// in fact: not need
			if (this.username) {
				config.headers["Discourse-Logged-In"] = "true";
			}

			// TODO: 暂时还不知道 _trackView 的机制，等UI部分写好再看看
			let _trackView = undefined;
			let _topicId = undefined;

			if (_trackView && (!config.method || config.method === "GET" || config.method === "GET")) {
				_trackView = false;
				config.headers["Discourse-Track-View"] = "true";
				if (_topicId) {
					config.headers["Discourse-Track-View-Topic-Id"] = _topicId;
				}
				_topicId = null;
			}

			// TODO
			const userPresent = () => false;
			if (userPresent()) {
				config.headers["Discourse-Present"] = "true";
			}

			console.log("Request:", config.url);
			return config;
		});
		this.axiosInstance.interceptors.response.use(
			(response) => {
				if (response.headers["set-cookie"]) {
					// biome-ignore lint/complexity/noForEach: <explanation>
					response.headers["set-cookie"].forEach((cookie) => this.cookieJar.setCookieSync(cookie, url));
					this.emitCookieChanged();
				}
				if (response.data.csrf) {
					this.axiosInstance.defaults.headers.common["X-CSRF-Token"] = response.data.csrf;
				}
				if (response.headers["x-discourse-username"]) {
					const oldUsername = this.username;
					const newUsername = response.headers["x-discourse-username"];
					if (newUsername && oldUsername !== newUsername) {
						this.username = newUsername;
						this.emitUsernameChanged(newUsername, oldUsername);
					}
				}

				console.log("Response:", response.config.url, response.status);
				return response;
			},
			(error) => {
				// note: for bad CSRF we don't loop an extra request right away.
				//  this allows us to eliminate the possibility of having a loop.
				if (error.response.status === 403 && error.response.data === '["BAD CSRF"]') {
					this.axiosInstance.defaults.headers.common["X-CSRF-Token"] = null;
				}

				// Handle HTTP errors using instanceof check
				if (error instanceof HTTPError) {
					console.error("HTTPError:", error.status, error.message);
					throw new HTTPError(
						error.status,
						`Authentication failed (status ${error.status}): ${error.message}`, // Include the response text.
						error.response,
					);
				}
				// Handle Axios-specific errors.
				if (axios.isAxiosError(error)) {
					this.emitAxiosError(error);
					if (error.response) {
						// The request was made and the server responded with a status code outside of the 2xx range.
						console.error("Request failed:", error.response.status, error.response.statusText);
						console.error("Response data:", error.response.data);
						// Create and throw a custom HTTPError with the response data.
						throw new HTTPError(
							error.response.status,
							`Request failed (status ${error.response.status}): ${JSON.stringify(error.response.data)}`, // Include the response text.
							error.response,
						);
					}
					if (error.request) {
						// The request was made, but no response was received.
						console.error("No response received:", error.request);
					} else {
						// Something else happened while setting up the request.
						console.error("Error setting up the request:", error.message);
					}
					console.error(error.stack); // Log the full error stack for debugging.
					throw error; // Re-throw the error for higher-level handling (if necessary).
				}

				// Handle non-Axios errors
				console.error("An unexpected error occurred:", error);
				throw error;
			},
		);
	}

	/**
	 * Loads and *sets* cookies from a cookie string.  Filters out session cookies.
	 * @param cookieStr - The cookie string.
	 */
	private loadCookies(cookie_str_or_jar: string | SerializedCookieJar | CookieJar) {
		try {
			let cookieJar: CookieJar | undefined = undefined;
			if (typeof cookie_str_or_jar === "object" && "getCookiesSync" in cookie_str_or_jar) {
				cookieJar = cookie_str_or_jar as CookieJar;
			} else cookieJar = CookieJar.deserializeSync(cookie_str_or_jar);
			const cookies = cookieJar.getCookiesSync(this.url);

			for (const cookie of cookies) {
				if (cookie.key !== "_forum_session") {
					try {
						this.cookieJar.setCookieSync(cookie, this.url);
					} catch (setCookieError) {
						console.error("Error setting cookie:", cookie, setCookieError);
					}
				}
			}
		} catch (deserializeError) {
			console.error("Error deserializing cookie jar:", deserializeError);
		} finally {
			console.log(
				"Loaded cookies:",
				this.cookieJar.serializeSync()?.cookies.map((c) => c.key),
			);
			this.emitCookieChanged();
		}
	}

	onCookieChanged(listener: (serializedCookieJar: SerializedCookieJar) => void): void {
		this.eventEmitter.on("cookieChanged", listener);
	}
	onUsernameChanged(listener: (newUsername: string, oldUsername: string | undefined) => void): void {
		this.eventEmitter.on("usernameChanged", listener);
	}
	onAxiosError(listener: (error: AxiosError) => void): void {
		this.eventEmitter.on("axiosError", listener);
	}

	/**
	 * Emits the 'cookieChanged' event.
	 * @private
	 */
	private async emitCookieChanged() {
		this.eventEmitter.emit("cookieChanged", await this.cookieJar.serialize());
	}

	/**
	 * Emits the 'usernameChanged' event.
	 * @param newUsername - The new username.
	 * @param oldUsername - The previous username.
	 * @private
	 */
	private emitUsernameChanged(newUsername: string, oldUsername: string | undefined) {
		this.eventEmitter.emit("usernameChanged", newUsername, oldUsername);
	}

	private emitAxiosError(error: AxiosError) {
		this.eventEmitter.emit("axiosError", error);
	}

	getUsername(): string | undefined {
		return this.username;
	}

	/**
	 * Executes an API call to the Discourse instance.
	 * @param operationName - The name of the operation to execute (e.g., 'listLatestTopics').
	 * @param params - The parameters for the operation.
	 * @returns The parsed API response.
	 * @throws {HTTPError} If the API call fails with an HTTP error status.
	 * @throws {Error} If the operation is unknown or if there's a parameter mismatch.
	 */
	override async _exec<T>(operationName: string, params = {} as Record<string, string>): Promise<T> {
		// Get the operation data from the generated API client.
		const operation = byOperationId[operationName];
		if (!operation) {
			throw new Error(`Unknown operation: ${operationName}`);
		}

		// Initialize data structures for different parameter types.
		const header: { [key: string]: string | undefined } = {}; // Headers can be optional.
		const query: { [key: string]: string } = {};
		const path: { [key: string]: string } = {};
		const body: { [key: string]: string | Blob } = {}; // Body can be a string or a Blob.
		let formData: FormData | undefined; // For multipart/form-data requests.
		let contentType: string | undefined;

		// Process parameters based on their location (header, query, path).
		if ("parameters" in operation.data && operation.data.parameters) {
			for (const param of operation.data.parameters) {
				if ("in" in param) {
					// Check if the parameter value is defined before assigning it.
					if (param.in === "header" && params[param.name] !== undefined) {
						header[param.name] = params[param.name];
						delete params[param.name]; // Remove the parameter from the 'params' object.
					} else if (param.in === "query" && params[param.name] !== undefined) {
						query[param.name] = params[param.name];
						delete params[param.name];
					} else if (param.in === "path" && params[param.name] !== undefined) {
						path[param.name] = params[param.name];
						delete params[param.name];
					}
				} else {
					throw new Error(`Unexpected parameter type in "${operationName}": ${JSON.stringify(param)}`);
				}
			}
		} else if (Object.keys(params).length) {
			// If there are parameters, but the operation doesn't define any, it's an error.
			throw new Error(`${operationName} accepts no parameters, but given: ${JSON.stringify(params)}`);
		}

		// Process the request body (if present in the OpenAPI operation).
		if ("requestBody" in operation.data && operation.data.requestBody && "content" in operation.data.requestBody) {
			const content = operation.data.requestBody.content;
			const keys = Object.keys(content) as (keyof typeof content)[];

			// Currently, only one content type is supported.
			if (keys.length === 0) {
				throw new Error(`No requestBody content types for ${operationName}`);
			}
			if (keys.length > 1) {
				throw new Error("Multiple requestBody content types not supported, please report");
			}

			const type = keys[0]!; // Get the first (and only) content type.
			const schema = content[type]?.schema;

			if (!schema) {
				throw new Error(`No schema for ${operationName}`);
			}

			// Extract body parameters from the 'params' object based on the schema.
			if ("properties" in schema) {
				const properties = Object.keys(schema.properties || {});
				for (const property of properties) {
					if (params[property] !== undefined) {
						body[property] = params[property];
						delete params[property]; // Remove the parameter from the 'params' object.
					}
				}
			} else {
				throw new Error(`Unexpected schema for ${operationName}`);
			}

			// Set the content type and prepare the request body based on the content type.
			if (type === "application/json") {
				contentType = "application/json";
			} else if (type === "multipart/form-data") {
				formData = new FormData(); // Create a new FormData object for multipart/form-data.
				// Append body parameters to the FormData object.
				for (const [key, value] of Object.entries(body)) {
					formData.append(key, value as string | Blob);
				}
			} else {
				throw new Error(`Unexpected requestBody content type for ${operationName}`);
			}
		}

		// Check for any unused parameters (parameters provided but not defined in the OpenAPI spec).
		const additionalProperties = Object.keys(params);
		if (additionalProperties.length) {
			throw new Error(`Unknown parameter(s) for ${operationName}: ${additionalProperties.join(", ")}`);
		}

		// Set the Content-Type header if needed.
		if (contentType) {
			header["Content-Type"] = contentType;
		}

		// Construct the URL, replacing path parameters with their actual values.
		const url = operation.path.replace(/\{([^}]+)\}/g, (_, p) => path[p] || `{${p}}`);

		// Prepare the Axios request configuration.
		const requestConfig: AxiosRequestConfig = {
			method: operation.method, // HTTP method (GET, POST, PUT, DELETE, etc.).
			url: url, // The request URL.
			headers: header, // HTTP headers.
			params: query, // Query parameters (Axios handles these).
			data: formData || (Object.keys(body).length > 0 ? body : undefined), // Request body (Axios handles FormData and JSON).
		};

		// Execute the request using the Axios instance.
		// Error has been handled in this.axiosInstance.interceptors.response.use
		const response = await this.axiosInstance(requestConfig);
		return response.data;
	}

	/**
	 * Get the CSRF token from "/session/csrf"
	 * axiosInstance will auto set the CSRF token to the header.
	 * @returns The CSRF token.
	 */
	async get_session_csrf() {
		const response = await this.axiosInstance.get("/session/csrf");
		return response.data;
	}

	/**
	 * Creates a new upload.  Overrides the base method to handle File/Blob types.
	 * @param params
	 * @param params.file - The file to upload (must be a File or Blob object).
	 */
	// @ts-expect-error: intentional break of types
	override createUpload(
		params: Prettify<
			Omit<Parameters<DiscourseAPIGenerated["createUpload"]>[0], "file"> & {
				file?: File | Blob; // Allow 'file' to be a File or Blob object.
			}
		>,
	): Prettify<ReturnType<DiscourseAPIGenerated["createUpload"]>> {
		const file = params.file;
		// Verify that 'file' is a File or Blob object.
		if (file && !(file instanceof File || file instanceof Blob)) {
			throw new Error(`file must be a File or Blob, not ${typeof file}`);
		}
		// Call the base class's createUpload method (type assertion needed due to overridden type).
		// @ts-expect-error: intentional break of types
		return super.createUpload(params);
	}

	/**
	 * Gets a topic by its external ID.  Handles redirects to the canonical topic URL.
	 * @param params
	 */
	override async getTopicByExternalId(
		params: Parameters<DiscourseAPIGenerated["getTopicByExternalId"]>[0],
	): ReturnType<DiscourseAPIGenerated["getTopic"]> {
		try {
			// Attempt to get the topic by its external ID.
			await super.getTopicByExternalId(params);
		} catch (error) {
			// If the request results in a 301 redirect, extract the topic ID from the 'Location' header.
			if (error instanceof HTTPError && error.status === 301) {
				const location = error.response.headers.Location; // Get the redirect URL.
				if (!location) {
					throw new Error("301 Redirect did not include location header");
				}

				// Extract the topic ID from the redirect URL using a regular expression.
				const match = location.match(/\/(?<id>(\d)+)\.json$/); // Matches URLs like /t/topic-title/123.json
				const id = match?.groups?.id;
				if (!id) {
					throw new Error("Could not extract topic ID from redirect");
				}

				// Get the topic using the extracted numeric ID.
				return super.getTopic({ id });
			}
			throw error; // Re-throw the error if it's not a 301 redirect.
		}
		throw new Error("Didn't receive redirect"); // Should not reach here if the redirect was handled.
	}

	/**
	 * Gets specific posts from a topic.  Corrects a bug in the Discourse API docs.
	 * @param params
	 */
	override getSpecificPostsFromTopic(
		params: Parameters<DiscourseAPIGenerated["getSpecificPostsFromTopic"]>[0],
	): ReturnType<DiscourseAPIGenerated["getSpecificPostsFromTopic"]> {
		// Get the operation data from the generated API client.
		const operation = byOperationId.getSpecificPostsFromTopic.data;

		// Fix for Discourse API bug where post_ids[] is incorrectly specified as a request body parameter.
		// https://meta.discourse.org/t/discourse-api-docs-mention-a-request-body-for-a-get-request/231137/13
		if (operation.requestBody && "content" in operation.requestBody && "application/json" in operation.requestBody.content) {
			const paramsSchema = operation.parameters;
			const rbSchema = operation.requestBody.content["application/json"].schema;

			if (paramsSchema && rbSchema && "properties" in rbSchema && rbSchema.properties) {
				// If the request body schema only contains 'post_ids[]', it should be a query parameter.
				if (Object.keys(rbSchema.properties).length === 1 && "post_ids[]" in rbSchema.properties) {
					// Add 'post_ids[]' as a required query parameter.
					paramsSchema.push({
						name: "post_ids[]",
						in: "query",
						schema: { type: "integer" }, // Assume integer type (adjust if necessary).
						required: true,
					});
				}
			}
			operation.requestBody = undefined; // Remove the incorrect requestBody definition.
		}

		// Call the base class's getSpecificPostsFromTopic method with the corrected parameters.
		return super.getSpecificPostsFromTopic(params);
	}

	async login(
		login: string,
		password: string,
		second_factor_method = 1,
		timezone = "Asia/Shanghai",
	): Promise<{
		token?: string;
		user?: {
			id: number;
			username: string;
			name?: string;
			avatar_template?: string;
			email?: string;
			trust_level: number;
			moderator: boolean;
			admin: boolean;
			can_create_topic: boolean;
		};
		error?: string;
	}> {
		const response = await this.axiosInstance.post("/session", {
			login,
			password,
			second_factor_method,
			timezone,
		});

		return response.data;
	}
}
