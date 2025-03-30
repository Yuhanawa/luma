import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { NavigationItem } from "~/components/navigation/NavigationSection";
import type { ListCategories200CategoryListCategoriesItem } from "~/lib/gen/api/discourseAPI/schemas";
import { useLinuxDoClientStore } from "./linuxDoClientStore";

interface CategoriesState {
	categories: NavigationItem<ListCategories200CategoryListCategoriesItem>[];
	isLoading: boolean;
	error: string | null;
	init: () => Promise<void>;
	refresh: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>()(
	devtools(
		(set, get) => ({
			categories: [],
			isLoading: false,
			error: null,

			init: async () => {
				const { isLoading, categories, refresh } = get();
				if (isLoading || categories.length > 0) return;

				await refresh();
			},

			refresh: async () => {
				if (get().isLoading) return;

				const client = useLinuxDoClientStore.getState().client;
				if (!client) return;

				set({ isLoading: true, error: null });

				try {
					const data = await client.listCategories();
					set({
						categories: data.category_list.categories.map((category) => ({
							key: category.id,
							text: category.name,
							data: category,
						})),
						isLoading: false,
					});
				} catch (e) {
					console.error("ERROR: When listCategories", e);
					set({
						categories: [
							{
								key: "1",
								text: "Error loading categories",
								data: {} as ListCategories200CategoryListCategoriesItem,
							},
						],
						isLoading: false,
						error: "Failed to load categories",
					});
				}
			},
		}),
		{
			name: "categories-store",
		},
	),
);
