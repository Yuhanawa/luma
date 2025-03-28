import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { NavigationItem } from "~/components/navigation/NavigationSection";
import type { ListTags200TagsItem } from "~/lib/gen/api/discourseAPI/schemas";
import { useLinuxDoClientStore } from "./linuxDoClientStore";

interface TagsState {
	tags: NavigationItem<ListTags200TagsItem>[];
	isLoading: boolean;
	error: string | null;
	init: () => Promise<void>;
	refresh: () => Promise<void>;
}

export const useTagsStore = create<TagsState>()(
	devtools(
		(set, get) => ({
			tags: [],
			isLoading: false,
			error: null,

			init: async () => {
				// Skip if we already have tags
				if (get().tags.length > 0) return;

				await get().refresh();
			},

			refresh: async () => {
				const client = useLinuxDoClientStore.getState().client;
				if (!client) return;

				set({ isLoading: true, error: null });

				try {
					const data = await client.listTags();
					set({
						tags:
							data.tags?.map((tag) => ({
								key: tag.id || "",
								text: tag.text || "",
								data: tag,
							})) || [],
						isLoading: false,
					});
				} catch (e) {
					console.error("ERROR: When listTags", e);
					set({
						tags: [
							{
								key: "1",
								text: "Error loading tags",
								data: {} as ListTags200TagsItem,
							},
						],
						isLoading: false,
						error: "Failed to load tags",
					});
				}
			},
		}),
		{
			name: "tags-store",
		},
	),
);
