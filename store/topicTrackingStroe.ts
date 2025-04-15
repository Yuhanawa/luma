import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface TopicTrackingState {
	highestSeenByTopic: Map<number, number>;
	setHighestSeenByTopic: (topicId: number, postNumber: number) => void;
	getHighestSeenByTopic: (topicId: number) => number;
}

export const useTopicTrackingStore = create<TopicTrackingState>()(
	devtools(
		(set, get) => ({
			highestSeenByTopic: new Map(),
			setHighestSeenByTopic: (topicId, postNumber) =>
				set((state) => ({ highestSeenByTopic: state.highestSeenByTopic.set(topicId, postNumber) })),
			getHighestSeenByTopic: (topicId) => get().highestSeenByTopic.get(topicId) ?? 0,
		}),
		{
			name: "topic-tracking-store",
		},
	),
);
