import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type CookieManager from "~/lib/cookieManager";
import LinuxDoClient from "~/lib/linuxDoClient";
import { type AuthState, useAuthStore } from "./authStore";

interface LinuxDoClientState {
	client: LinuxDoClient | null;
	init: (args?: { cookieManager?: CookieManager; authState?: AuthState }) => Promise<void>;
	isLoading: boolean;
}

export const useLinuxDoClientStore = create<LinuxDoClientState>()(
	devtools(
		(set, get) => ({
			client: null,
			isLoading: false,
			init: async ({ cookieManager, authState } = {}) => {
				const { client: clientMaybeNull, isLoading } = get();
				if (isLoading || clientMaybeNull !== null) return;
				set({ isLoading: true });
				authState ??= useAuthStore.getState();
				const client = await LinuxDoClient.create({ cookieManager, authState });
				try {
					await client.get_session_csrf();
				} catch (e) {
					console.error("ERROR: When load_session_csrf", e);
				}
				set({ client: client, isLoading: false });
			},
		}),
		{
			name: "LinuxDoClient-store",
		},
	),
);
