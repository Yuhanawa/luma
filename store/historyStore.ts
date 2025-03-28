import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { ActivityScreenParams } from "~/app/activityScreen";

export interface HistoryItem {
	id: string;
	title: string;
	timestamp: number;
	params: ActivityScreenParams;
}

interface HistoryState {
	history: HistoryItem[];
	addToHistory: (item: Omit<HistoryItem, "id" | "timestamp">) => void;
	clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
	devtools(
		persist(
			(set, get) => ({
				history: [],

				addToHistory: (item) => {
					const newItem: HistoryItem = {
						...item,
						id: Date.now().toString(),
						timestamp: Date.now(),
					};

					// Check if we already have this item (by title)
					const existingItemIndex = get().history.findIndex((historyItem) => historyItem.title === item.title);

					set((state) => {
						let newHistory = [...state.history];

						// If item exists, remove it (we'll add it to the top)
						if (existingItemIndex !== -1) {
							newHistory.splice(existingItemIndex, 1);
						}

						// Add new item to the beginning
						newHistory.unshift(newItem);

						// Keep only the latest 10 items
						if (newHistory.length > 10) {
							newHistory = newHistory.slice(0, 10);
						}

						return { history: newHistory };
					});
				},

				clearHistory: () => set({ history: [] }),
			}),
			{
				name: "history-storage",
			},
		),
		{
			name: "history-store",
		},
	),
);
