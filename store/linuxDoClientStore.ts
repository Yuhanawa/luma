import * as FileSystem from "expo-file-system";
import { Cookie, CookieJar } from "tough-cookie";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import DiscourseAPI from "~/lib/api";
import LinuxDoClient from "~/lib/linuxDoClient";

interface LinuxDoClientState {
	client: LinuxDoClient | null;
	init: () => Promise<void>;
	isLoading: boolean;
}

export const useLinuxDoClientStore = create<LinuxDoClientState>()(
	devtools(
		(set, get) => ({
			client: null,
			isLoading: false,
			init: async () => {
				const { client: clientMaybeNull, isLoading } = get();
				if (isLoading || clientMaybeNull !== null) return;
				set({ isLoading: true });
				const client = await LinuxDoClient.create();
				try {
					await client.get_session_csrf();
				} catch (e) {
					console.error("ERROR: When load_session_csrf", e);
				}
				set({ client: client, isLoading: false });
			},
		}),
		{
			name: "LinuxDoClient-storage",
		},
	),
);
