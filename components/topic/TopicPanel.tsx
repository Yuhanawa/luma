import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { TopicList } from "~/components/topic/TopicList";
import { Text } from "~/components/ui/text";
import type LinuxDoClient from "~/lib/linuxDoClient";
import { useLinuxDoClientStore } from "~/store/linuxDoClientStore";
import type { SwipeAction } from "../SwipeableWrapper";
import type { TopicCardItem } from "./TopicCard";

export type TopicMethods = "listLatestTopics" | "listUnreadTopics" | "getTag" | "listCategoryTopics";

export type CommonTopicPanelProps = {
	listTopics: "listLatestTopics" | "listUnreadTopics";
};
export type TagTopicPanelProps = {
	listTopics: "getTag";
	params: { name: string };
};

export type CategoryTopicPanelProps = {
	listTopics: "listCategoryTopics";
	params: { slug: string; id: number };
};

export type TopicPanelProps = CommonTopicPanelProps | TagTopicPanelProps | CategoryTopicPanelProps;

type FlattenParams<T> = T extends { params: infer P } ? Omit<T, "params"> & P : T;
export type FlattenedTopicPanelProps = FlattenParams<TopicPanelProps>;
export type WithTopicPanelComponentProps<T> = T & {
	title?: string;
	swipe?: SwipeAction<TopicCardItem>[];
};
export type TopicPanelComponentProps = WithTopicPanelComponentProps<TopicPanelProps>;

export function TopicPanel(props: TopicPanelComponentProps) {
	const listTopics = props.listTopics;

	const client = useLinuxDoClientStore().client!;
	const router = useRouter();

	const [topicItems, setTopicItems] = useState<TopicCardItem[] | undefined>(undefined);
	const [page, setPage] = useState(0);
	const [loadMoreUrl, setLoadMoreUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		handleRefresh();
	}, []);

	const handleRefresh = useCallback(async () => {
		if (isLoading) return; // Prevent multiple simultaneous calls

		try {
			setIsLoading(true);
			setTopicItems(undefined);
			let topics: Awaited<ReturnType<LinuxDoClient["listLatestTopics" | "listUnreadTopics" | "getTag" | "listCategoryTopics"]>>;
			if (listTopics === "listLatestTopics" || listTopics === "listUnreadTopics")
				topics = await (client[listTopics] as () => ReturnType<LinuxDoClient["listLatestTopics" | "listUnreadTopics"]>)();
			// biome-ignore lint/suspicious/noExplicitAny: I don't know how to make it perfect
			else topics = await client[listTopics]((props as any).params);

			setTopicItems(topics.topic_list?.topics as TopicCardItem[]);
			setPage(1);
			const moreUrl = client.getLoadMoreTopicsUrl(topics as { topic_list?: { more_topics_url?: string } });
			setLoadMoreUrl(moreUrl);
			setHasMore(moreUrl !== null);
		} catch (error) {
			console.error("Error fetching topics:", error);
		} finally {
			setIsLoading(false);
		}
	}, [client, isLoading, listTopics, props]);

	const handleLoadMore = useCallback(async () => {
		if (isLoading || !hasMore || !topicItems?.length) return;

		try {
			setIsLoading(true);
			const nextPage = page + 1;
			console.log("Loading more topics, page:", nextPage);

			const topics = await client.loadMoreTopics(loadMoreUrl!);
			console.log("Loaded more topics:", topics);

			const newTopics = topics?.topic_list?.topics;
			if (topics === null || !newTopics?.length) {
				throw Error("No more topics");
			}

			setTopicItems((prev) => {
				if (!prev) return newTopics;

				const existingTopics = new Set(prev.map((topic) => topic.id));
				const uniqueNewTopics = newTopics.filter((topic) => !existingTopics.has(topic.id));

				if (!uniqueNewTopics.length) {
					setHasMore(false);
					return prev;
				}

				return [...prev, ...uniqueNewTopics];
			});
			setPage(nextPage);
			const moreUrl = client.getLoadMoreTopicsUrl(topics);
			console.log("More topics URL:", moreUrl);
			setLoadMoreUrl(moreUrl);
			setHasMore(moreUrl !== null);
		} catch (error) {
			console.error("Error loading more topics:", error);
			setHasMore(false);
		} finally {
			setIsLoading(false);
		}
	}, [client, page, isLoading, hasMore, topicItems, loadMoreUrl]);

	return topicItems !== undefined ? (
		<TopicList
			initialItems={topicItems}
			onRefresh={handleRefresh}
			onLoadMore={handleLoadMore}
			hasMore={hasMore}
			title={props.title}
			onPress={(id) => router.push(`/topic/${id}`)}
			swipe={props.swipe}
		/>
	) : (
		<View className="flex-1 items-center justify-center">
			<Text>Loading topics...</Text>
		</View>
	);
}

/** @deprecated Use TopicPanel directly */
export function CommonTopicPanel({ listTopics, ...props }: WithTopicPanelComponentProps<CommonTopicPanelProps>) {
	return <TopicPanel listTopics={listTopics} {...props} />;
}
export function TagTopicPanel({ listTopics, name, ...props }: WithTopicPanelComponentProps<FlattenParams<TagTopicPanelProps>>) {
	return <TopicPanel listTopics={listTopics} params={{ name }} {...props} />;
}
export function CategoryTopicPanel({
	listTopics,
	slug,
	id,
	...props
}: WithTopicPanelComponentProps<FlattenParams<CategoryTopicPanelProps>>) {
	return <TopicPanel listTopics={listTopics} params={{ slug, id }} {...props} />;
}
