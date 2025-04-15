import FingerprintJS from "@fingerprintjs/fingerprintjs";
import type { AxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { Alert, Platform } from "react-native";
import { Dimensions } from "react-native";
import { CookieJar, type SerializedCookieJar } from "tough-cookie";
import type { AuthState } from "~/store/authStore";
import DiscourseAPI from "./api";
import type DiscourseAPIGenerated from "./api/generated";
import CookieManager from "./cookieManager";
import type { ListLatestTopics200 } from "./gen/api/discourseAPI/schemas";
import ScreenTrack from "./screenTrack";

export default class LinuxDoClient extends DiscourseAPI {
	static async create({ cookieManager, authState }: { cookieManager?: CookieManager; authState?: AuthState }): Promise<LinuxDoClient> {
		cookieManager ??= new CookieManager();
		let cookieJar = cookieManager.getCurrentCookieJar();
		if (cookieJar !== null) {
			if (!(await CookieManager.checkCookie(cookieJar))) throw new Error("Cookie check failed: `_t` cookie not found");
		} else {
			console.warn("No cookie jar found, creating new one");
			console.warn("It only should happen when use credentials login");
			cookieJar = new CookieJar();
		}
		const client = new LinuxDoClient("https://linux.do", {
			initialCookie: cookieJar,
			// update time: 2025-04-05
			userAgent: Platform.select({
				android: `Mozilla/5.0 (Linux; Android 15;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36 luma/${Constants.version ?? "0"}`,
				ios: `Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1 luma/${Constants.version ?? "0"}`,
				default: undefined,
			}),
		});
		client.onCookieChanged((cookieJar: SerializedCookieJar) => {
			console.log(
				"Cookie changed, current cookies:",
				cookieJar.cookies.map((c) => c.key),
			);
			cookieManager.setCurrentCookieJar(cookieJar, client.getUsername() ?? undefined);
		});
		client.onAxiosError((e) => {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const data = e?.response?.data as any;
			if (data) {
				if (data.error_type === "not_logged_in") {
					console.log("Not logged in");
					Alert.alert("Cookie Expired, please login again");
					Alert.alert("Cookie 失效，请重新登录");
					cookieManager.switchNewCookieBox();
					authState?.logout();
				}
			}
		});
		return client;
	}

	/**
	 * @deprecated mask as deprecated, because you should not use axiosInstance, it only use for debugging
	 */
	__getAxiosInstance() {
		console.warn("You should not use axiosInstance, it only use for debugging");
		console.warn("You should not use axiosInstance, it only use for debugging");
		console.warn("You should not use axiosInstance, it only use for debugging");
		return this.axiosInstance;
	}

	getLoadMoreTopicsUrl(result: (ListLatestTopics200 & { topic_list?: { more_topics_url?: string } }) | undefined): string | null {
		return result?.topic_list?.more_topics_url ?? null;
	}

	async loadMoreTopics(
		input: (ListLatestTopics200 & { topic_list?: { more_topics_url?: string } }) | string,
	): Promise<(ListLatestTopics200 & { topic_list?: { more_topics_url?: string } }) | null> {
		const more_topics_url = typeof input === "string" ? input : this.getLoadMoreTopicsUrl(input);
		if (more_topics_url) {
			// I don't understand why this is needed, but they said that:
			// 'ensure we postfix with .json so username paths work correctly'
			// https://github.com/discourse/discourse/blob/ab3e85f8f10f5df7ccf70ab4d7b5e606b8a7c41e/app/assets/javascripts/discourse/app/models/topic-list.js#L175
			more_topics_url.replace(/(?!\.json)\?/, ".json?");

			const response = await this.axiosInstance.get(more_topics_url);
			return response.data;
		}
		return null;
	}

	/// `/latest?no_definitions=true&page=1`
	async listLatestTopicsByPage(
		data?: {
			no_definitions: boolean;
			page: number;
		},
		config?: AxiosRequestConfig,
	): Promise<ListLatestTopics200 & { topic_list?: { more_topics_url?: string } }> {
		return (
			await this.axiosInstance.get("/latest.json", {
				data,
				...config,
			})
		).data;
	}

	async listUnreadTopics(config?: AxiosRequestConfig): Promise<ListLatestTopics200 & { topic_list?: { more_topics_url?: string } }> {
		return (await this.axiosInstance.get("/unread.json", config)).data;
	}

	async createBookmark(
		data: { reminder_at?: string; name?: string; auto_delete_preference?: number; bookmarkable_id: number; bookmarkable_type: string },
		config?: AxiosRequestConfig,
	): Promise<{ success: string; id: number }> {
		await this.get_session_csrf();
		const response = await this.axiosInstance.post(
			"/bookmarks.json",
			{
				reminder_at: "",
				auto_delete_preference: 3,
				...data,
			},
			config,
		);

		return response.data;
	}

	async updateBookmark(
		data: {
			id: number;
			reminder_at?: string;
			name?: string;
			auto_delete_preference?: number;
			bookmarkable_id: number;
			bookmarkable_type: string;
		},
		config?: AxiosRequestConfig,
	): Promise<{ success: string }> {
		await this.get_session_csrf();
		const response = await this.axiosInstance.put(`/bookmarks/${data.id}.json`, {
			data: {
				reminder_at: "",
				auto_delete_preference: 3,
				...data,
			},
			...config,
		});
		return response.data;
	}

	async deleteBookmark(id: number, config?: AxiosRequestConfig): Promise<{ success: string; topic_bookmarked: boolean }> {
		await this.get_session_csrf();
		const response = await this.axiosInstance.delete(`/bookmarks/${id}.json`, config);
		return response.data;
	}

	async getUserSummary(
		username: string,
		config?: AxiosRequestConfig,
	): Promise<{
		topics: {
			id: number;
			title: string;
			fancy_title: string;
			slug: string;
			posts_count: number;
			category_id: number;
			like_count: number;
			created_at: string;
			has_accepted_answer: boolean;
			can_have_answer: boolean;
		}[];
		badges: {
			id: number;
			name: string;
			description: string;
			grant_count: number;
			allow_title: boolean;
			multiple_grant: boolean;
			icon: string;
			image_url?: string;
			listable: boolean;
			enabled: boolean;
			badge_grouping_id: number;
			system: boolean;
			slug: string;
			manually_grantable: boolean;
			show_in_post_header: boolean;
			badge_type_id: number;
		}[];
		badge_types: {
			id: number;
			name: string;
			sort_order: number;
		}[];
		users: {
			id: number;
			username: string;
			name: string;
			avatar_template: string;
			trust_level: number;
			animated_avatar?: unknown;
			admin?: boolean;
			moderator?: boolean;
		};
		user_summary: {
			likes_given: number;
			likes_received: number;
			topics_entered: number;
			posts_read_count: number;
			days_visited: number;
			topic_count: number;
			post_count: number;
			time_read: number;
			recent_time_read: number;
			bookmark_count: number;
			can_see_summary_stats: boolean;
			can_see_user_actions: boolean;
			solved_count: number;
			topic_ids: number[];
			replies: {
				post_number: number;
				like_count: number;
				created_at: string;
				topic_id: number;
			}[];
			links: {
				url: string;
				title: string;
				clicks: number;
				post_number: number;
				topic_id: number;
			}[];
			most_liked_by_users: {
				id: number;
				username: string;
				name?: string;
				count: number;
				avatar_template: string;
				admin: boolean;
				moderator: boolean;
				trust_level: number;
				flair_name?: string;
				flair_url?: string;
				flair_bg_color?: string;
				flair_color?: string;
				primary_group_name?: string;
			}[];
			most_liked_users: {
				id: number;
				username: string;
				name: string;
				count: number;
				avatar_template: string;
				admin: boolean;
				moderator: boolean;
				trust_level: number;
				flair_name?: string;
				flair_url?: string;
				flair_bg_color?: string;
				flair_color?: string;
				primary_group_name?: string;
			}[];
			most_replied_to_users: {
				id: number;
				username: string;
				name: string;
				count: number;
				avatar_template: string;
				admin: boolean;
				moderator: boolean;
				trust_level: number;
				flair_name?: string;
				flair_url?: string;
				flair_bg_color?: string;
				flair_color?: string;
				primary_group_name?: unknown;
			}[];
			badges: {
				id: number;
				granted_at: string;
				created_at: string;
				count: number;
				badge_id: number;
				user_id: number;
				granted_by_id: number;
			}[];
			top_categories: {
				topic_count: number;
				post_count: number;
				id: number;
				name: string;
				color: string;
				text_color: string;
				style_type: number;
				icon?: unknown;
				emoji?: unknown;
				slug: string;
				read_restricted: boolean;
				parent_category_id?: number;
			}[];
		};
	}> {
		const response = await this.axiosInstance.get(`/u/${username}/summary.json`, config);
		return response.data;
	}

	async sendLoginEmail(
		login: string,
		config?: AxiosRequestConfig,
	): Promise<{ success: string; error?: string; user_found?: boolean; hide_taken?: boolean }> {
		const response = await this.axiosInstance.post(
			"/u/email-login",
			{
				login,
			},
			config,
		);
		return response.data;
	}

	async emailLogin(token: string, config?: AxiosRequestConfig): Promise<{ success: string } | string[] | unknown> {
		const response = await this.axiosInstance.post(`/session/email-login/${token}`, {}, config);
		return response.data;
	}

	/**
	 * The correct version of getSpecificPostsFromTopic
	 */
	async getPostsFromTopic(
		topic: string,
		params: { post_ids: number[]; include_suggested?: boolean },
	): Promise<ReturnType<DiscourseAPIGenerated["getSpecificPostsFromTopic"]>> {
		const response = await this.axiosInstance.get(`/t/${topic}/posts.json`, {
			params,
			paramsSerializer: (params) => {
				const str: string[] = [];
				for (const p of Object.keys(params)) {
					if (Array.isArray(params[p]))
						// biome-ignore lint/complexity/noForEach: <explanation>
						params[p].forEach((value) => str.push(`${encodeURIComponent(p)}[]=${encodeURIComponent(value)}`));
					else str.push(`${encodeURIComponent(p)}=${encodeURIComponent(params[p])}`);
				}
				return str.join("&");
			},
		});
		return response.data;
	}

	// https://github.com/discourse/discourse-fingerprint/blob/main/assets/javascripts/initializers/fingerprint.js
	async pluginFingerprint() {
		console.log("pluginFingerprint");
		const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
		const { width: availWidth, height: availHeight } = Dimensions.get("window");
		globalThis.screen ??= {
			availWidth,
			availHeight,
			width: screenWidth,
			height: screenHeight,
			colorDepth: 24,
			orientation: {
				angle: 0,
				onchange: () => {},
				type: "portrait-primary",
				unlock: () => {},
				addEventListener: () => {},
				removeEventListener: () => {},
				dispatchEvent: (e) => false,
			},
			pixelDepth: 24,
		};
		FingerprintJS.load()
			.then((fp) => fp.get())
			.then((result) => {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const resultMap = {} as any;
				result.components.audio.value = 35;
				result.components.languages.value = [["en", "en-US"]];
				result.components.sessionStorage.value = true;
				result.components.localStorage.value = true;
				result.components.indexedDB.value = true;
				result.components.openDatabase.value = true;
				result.components.touchSupport.value = {
					maxTouchPoints: 2,
					touchEvent: true,
					touchStart: true,
				};
				// biome-ignore lint/complexity/noForEach: <explanation>
				// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
				Object.keys(result.components).forEach(
					// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
					(key) => (resultMap[key] = result.components[key as keyof typeof result.components].value),
				);

				this.axiosInstance.post("/fingerprint", {
					visitor_id: result.visitorId,
					version: result.version,
					data: JSON.stringify(resultMap),
				});
			});
	}

	// https://linux.do/chat/api/me/channels
	// https://github.com/discourse/discourse-chat-integration
	async pluginChatGetChannels(config?: AxiosRequestConfig): Promise<{
		public_channels: unknown[];
		direct_message_channels: unknown[];
		tracking: { channel_tracking: unknown; thread_tracking: unknown };
		meta: {
			message_bus_last_ids?:
				| {
						channel_metadata: number;
						channel_edits: number;
						channel_status: number;
						new_channel: number;
						archive_status: number;
						user_tracking_state: number;
				  }
				// biome-ignore lint/complexity/noBannedTypes: <explanation>
				| {};
		};
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		unread_thread_overview: unknown | {};
		global_presence_channel_state:
			| {
					count: number;
					last_message_id: number;
					users: {
						id: number;
						username: string;
						name?: string;
						avatar_template: string;
						animated_avatar?: string | null;
					}[];
			  }
			// biome-ignore lint/complexity/noBannedTypes: <explanation>
			| {};
	}> {
		const response = await this.axiosInstance.get("/chat/api/me/channels", config);
		return response.data;
	}

	async topicsTimings(
		data: {
			timings: Record<number, number>;
			topic_time: number;
			topic_id: number;
		},
		config?: AxiosRequestConfig,
	): Promise<unknown> {
		console.log("topicsTimings", data);
		// return {};
		const response = await this.axiosInstance.post("/topics/timings", data, {
			...config,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				"X-SILENCE-LOGGER": "true",
				"Discourse-Background": "true",
				...config?.headers,
			},
		});
		console.log("topicsTimings", response.data);
		return response.data;
	}

	getScreenTrack(onReadPost: (topicId: number, postNumbers: number[]) => void) {
		return new ScreenTrack({
			topicsTimings: this.topicsTimings.bind(this),
			readPosts: onReadPost,
		});
	}
}
