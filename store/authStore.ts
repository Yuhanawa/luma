import { Cookie, CookieJar } from "tough-cookie";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { LINUXDO_CONST } from "~/constants/linuxDo";
import CookieManager from "~/lib/cookieManager";
import { useLinuxDoClientStore } from "./linuxDoClientStore";
import { useUserStore } from "./userStore";

interface AuthState {
	isLoggedIn: boolean | undefined;
	isLoading: boolean;
	error: string | null;
	cookieManager: CookieManager;

	// Methods
	init: () => Promise<void>;
	login: (cookieValue: string) => Promise<void>;
	logout: () => Promise<void>;
	checkLoginStatus: () => Promise<boolean>;
	switchAccount: (uuid: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
	devtools(
		(set, get) => ({
			isLoggedIn: undefined,
			isLoading: false,
			error: null,
			cookieManager: new CookieManager(),

			init: async () => {
				const { isLoading, checkLoginStatus } = get();
				if (isLoading) return;

				set({ isLoading: true, error: null });
				try {
					const isLoggedIn = await checkLoginStatus();
					set({ isLoggedIn, isLoading: false });

					if (isLoggedIn) await useLinuxDoClientStore.getState().init();
				} catch (e) {
					console.error("ERROR: When initializing auth store", e);
					set({ isLoading: false, error: "Failed to initialize auth" });
				}
			},

			checkLoginStatus: async () => {
				const { cookieManager } = get();
				const cookieJar = cookieManager.getCurrentCookieJar();

				if (cookieJar === null) {
					return false;
				}

				return CookieManager.checkCookie(cookieJar);
			},

			login: async (cookieValue: string) => {
				const { cookieManager } = get();
				set({ isLoading: true, error: null });

				try {
					const cookieJar = new CookieJar();
					cookieJar.setCookie(
						new Cookie({
							key: "_t",
							value: cookieValue,
							domain: LINUXDO_CONST.DOMAIN,
							path: "/",
						}),
						LINUXDO_CONST.HTTPS_URL,
					);
					const serializedCookieJar = cookieJar.serializeSync();

					if (!serializedCookieJar) {
						throw new Error("Failed to create cookie jar");
					}

					cookieManager.switchNewCookieBox();
					await cookieManager.setCurrentCookieJar(serializedCookieJar);

					await useLinuxDoClientStore.getState().init(cookieManager);

					set({ isLoggedIn: true, isLoading: false });
				} catch (e) {
					console.error("ERROR: When logging in", e);
					set({
						isLoading: false,
						error: e instanceof Error ? e.message : String(e),
						isLoggedIn: false,
					});
					throw e;
				}
			},

			logout: async () => {
				const { cookieManager } = get();
				set({ isLoading: true, error: null });

				try {
					// Clear the current cookie by setting eating to null
					cookieManager.switchNewCookieBox();

					// Reset state
					useLinuxDoClientStore.setState({ client: null, isLoading: false });
					useUserStore.setState({ username: "", userData: null, isInited: false, isLoading: false, error: null });
					set({ isLoggedIn: false, isLoading: false });
				} catch (e) {
					console.error("ERROR: When logging out", e);
					set({
						isLoading: false,
						error: e instanceof Error ? e.message : String(e),
					});
				}
			},

			switchAccount: async (uuid: string) => {
				const { cookieManager, logout } = get();
				set({ isLoading: true, error: null });

				try {
					await logout();
					cookieManager.switchCookieBox(uuid);

					await useLinuxDoClientStore.getState().init(cookieManager);

					set({ isLoggedIn: true, isLoading: false });
				} catch (e) {
					console.error("ERROR: When switching accounts", e);
					set({
						isLoading: false,
						error: e instanceof Error ? e.message : String(e),
					});
					throw e;
				}
			},
		}),
		{
			name: "auth-store",
		},
	),
);
