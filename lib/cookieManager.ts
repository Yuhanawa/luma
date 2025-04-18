import * as SecureStore from "expo-secure-store";
import { type Cookie, CookieJar, type SerializedCookieJar } from "tough-cookie";
import { v4 as uuidV4 } from "uuid";
import { LINUXDO_CONST } from "~/constants/linuxDo";

export default class CookieManager {
	private COOKIE_STORE_KEY = "IWillEatAllCookies" as const;
	private cookieStore: cookieStore;

	constructor() {
		this.cookieStore = this.getCookieStore();
	}
	getCurrentCookieBoxUUID(): string | null {
		return this.cookieStore.eating;
	}
	getTruck(): Map<string, cookieBox> {
		return this.cookieStore.truck;
	}
	getCookieJar(uuid: string): CookieJar | null {
		const cookieBox = this.getCookieBox(uuid);
		if (cookieBox === null) return null;
		return CookieJar.deserializeSync(cookieBox.cookieJar);
	}
	getCurrentCookieJar(): CookieJar | null {
		return this.cookieStore.eating ? this.getCookieJar(this.cookieStore.eating) : null;
	}
	getCookieBox(uuid: string): cookieBox | null {
		return this.cookieStore.truck.get(uuid) ?? null;
	}
	getCurrentCookieBox(): cookieBox | null {
		return this.cookieStore.eating ? this.getCookieBox(this.cookieStore.eating) : null;
	}
	deleteCookieBox(uuid: string) {
		this.cookieStore.truck.delete(uuid);
		if (this.cookieStore.eating === uuid) this.cookieStore.eating = null;
		this.saveCookieStore();
	}
	switchCookieBox(uuid: string) {
		if (!uuid) {
			throw Error("No uuid provided, cannot switch");
		}
		if (!this.cookieStore.truck.has(uuid)) {
			throw Error("Cookie box not found, cannot switch");
		}
		this.cookieStore.eating = uuid;
		this.saveCookieStoreAsync();
	}
	switchNewCookieBox() {
		this.cookieStore.eating = null;
		this.saveCookieStoreAsync();
	}
	async setCookieJarAsync(uuid: string, serializedCookieJar: SerializedCookieJar, username?: string | null) {
		if (!uuid) {
			console.error("No uuid provided, cannot save cookie jar");
			return;
		}
		serializedCookieJar.cookies = serializedCookieJar.cookies.filter((c) => c.key !== "_forum_session");

		const oldCookieBox = this.cookieStore.truck.get(uuid);
		if (oldCookieBox && username !== undefined) oldCookieBox.username = username ?? undefined;
		this.cookieStore.truck.set(uuid, {
			createdAt: Date.now(),
			username: username ?? undefined,
			...oldCookieBox,
			cookieJar: serializedCookieJar,
			updatedAt: Date.now(),
		});

		await this.saveCookieStoreAsync();
	}
	async setCurrentCookieJar(serializedCookieJar: SerializedCookieJar, username?: string | null) {
		if (!this.cookieStore.eating) this.cookieStore.eating = uuidV4();

		await this.setCookieJarAsync(this.cookieStore.eating, serializedCookieJar, username);
	}
	static async checkCookie(cookieJar: CookieJar): Promise<boolean> {
		const cookies = await cookieJar.getCookies(LINUXDO_CONST.HTTPS_URL);
		return cookies.findIndex((c: Cookie) => c.key === "_t") !== -1;
	}
	private getCookieStore(): cookieStore {
		const cookieStoreStr = SecureStore.getItem(this.COOKIE_STORE_KEY);
		let cookieStore: cookieStore | null = null;
		if (cookieStoreStr !== null) {
			try {
				const parsedStore = JSON.parse(cookieStoreStr);
				// Convert truck from object to Map
				if (parsedStore?.truck && !(parsedStore.truck instanceof Map)) {
					const truckMap = new Map();
					// If truck is an object with entries
					if (typeof parsedStore.truck === "object") {
						// biome-ignore lint/complexity/noForEach: <explanation>
						Object.entries(parsedStore.truck).forEach(([key, value]) => truckMap.set(key, value as cookieBox));
					} else throw Error("Invalid cookie store");

					parsedStore.truck = truckMap;
				}
				cookieStore = parsedStore;
			} catch (error) {
				console.error("Error parsing cookie store, use new:", error);
			}
		} else console.log("Cookie store not found, use new");

		cookieStore ??= { eating: null, truck: new Map() };
		return cookieStore;
	}
	private async getCookieStoreAsync(): Promise<cookieStore> {
		const cookieStoreStr = await SecureStore.getItemAsync(this.COOKIE_STORE_KEY);
		let cookieStore: cookieStore | null = null;
		if (cookieStoreStr !== null) {
			try {
				const parsedStore = JSON.parse(cookieStoreStr);
				// Convert truck from object to Map
				if (parsedStore?.truck && !(parsedStore.truck instanceof Map)) {
					const truckMap = new Map();
					// If truck is an object with entries
					if (typeof parsedStore.truck === "object") {
						// biome-ignore lint/complexity/noForEach: <explanation>
						Object.entries(parsedStore.truck).forEach(([key, value]) => truckMap.set(key, value as cookieBox));
					} else throw Error("Invalid cookie store");

					parsedStore.truck = truckMap;
				}
				cookieStore = parsedStore;
			} catch (error) {
				console.error("Error parsing cookie store, use new:", error);
			}
		} else console.log("Cookie store not found, use new");

		cookieStore ??= { eating: null, truck: new Map() };
		return cookieStore;
	}
	private setCookieStore(cookieStore: cookieStore) {
		this.cookieStore = cookieStore;
		this.saveCookieStore();
	}
	private saveCookieStore() {
		// because of the limit of secure store, we only save the latest two cookies
		// TODO
		let truck = Array.from(this.cookieStore.truck.entries())
			.sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
			.slice(0, 2);

		if (this.cookieStore.eating) {
			if (!truck.some(([uuid]) => uuid === this.cookieStore.eating)) {
				const eatingCookieBox = this.cookieStore.truck.get(this.cookieStore.eating);
				if (!eatingCookieBox) this.cookieStore.eating = null;
				else {
					truck = [[this.cookieStore.eating, eatingCookieBox], ...truck];
					truck = truck.slice(0, 2);
				}
			}
		}
		this.cookieStore.truck = new Map(truck);

		// Convert Map to object for JSON serialization
		const serializedStore = {
			eating: this.cookieStore.eating,
			truck: Object.fromEntries(truck),
		};
		SecureStore.setItem(this.COOKIE_STORE_KEY, JSON.stringify(serializedStore));
	}
	private async setCookieStoreAsync(cookieStore: cookieStore) {
		this.cookieStore = cookieStore;
		await this.saveCookieStoreAsync();
	}
	private async saveCookieStoreAsync() {
		// because of the limit of secure store, we only save the latest two cookies
		// TODO
		let truck = Array.from(this.cookieStore.truck.entries())
			.sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
			.slice(0, 2);

		if (this.cookieStore.eating) {
			if (!truck.some(([uuid]) => uuid === this.cookieStore.eating)) {
				const eatingCookieBox = this.cookieStore.truck.get(this.cookieStore.eating);
				if (!eatingCookieBox) this.cookieStore.eating = null;
				else {
					truck = [[this.cookieStore.eating, eatingCookieBox], ...truck];
					truck = truck.slice(0, 2);
				}
			}
		}
		this.cookieStore.truck = new Map(truck);

		// Convert Map to object for JSON serialization
		const serializedStore = {
			eating: this.cookieStore.eating,
			truck: Object.fromEntries(truck),
		};
		await SecureStore.setItemAsync(this.COOKIE_STORE_KEY, JSON.stringify(serializedStore));
	}
}

interface cookieStore {
	eating: string | null;
	truck: Map<string, cookieBox>;
}

interface cookieBox {
	username?: string;
	cookieJar: SerializedCookieJar;
	createdAt: number;
	updatedAt: number;
}
