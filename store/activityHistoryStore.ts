import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type { ActivityScreenBaseParams } from "~/app/activityScreen";

export interface ActivityHistoryItem {
	id: string;
	title: string;
	timestamp: number;
	params: ActivityScreenBaseParams;
}

export type ActivityHistoryType = "tag" | "category" | "common";

interface ActivityHistoryState {
	history: ActivityHistoryItem[];
	addToHistory: (title: string, params: ActivityScreenBaseParams) => void;
	clearHistory: () => void;
}

export const useActivityHistoryStore = create<ActivityHistoryState>()(
	devtools(
		persist(
			(set, get) => ({
				history: [],

				addToHistory: (title, params) => {
					const newItem: ActivityHistoryItem = { title, params, id: getIdFromParams(params), timestamp: Date.now() };

					set((state) => {
						let newHistory = [newItem, ...state.history.filter((i) => i.id !== newItem.id)];

						if (newHistory.length > 10) newHistory = newHistory.slice(0, 10);

						return { history: newHistory };
					});
				},

				clearHistory: () => set({ history: [] }),
			}),
			{
				name: "history-storage",
				storage: createJSONStorage(() => AsyncStorage),
				partialize: (state) => ({ history: state.history }),
			},
		),
		{
			name: "history-store",
		},
	),
);

export function getIdFromParams(params: ActivityScreenBaseParams): string {
	if (params.listTopics === "listLatestTopics" || params.listTopics === "listUnreadTopics") return `common-${params.listTopics}`;
	if (params.listTopics === "listCategoryTopics") return `category-${params.id}-${params.slug}`;
	if (params.listTopics === "getTag") return `tag-${params.name}`;

	throw Error("Invalid params");
}
