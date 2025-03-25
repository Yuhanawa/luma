import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import type { TopicCardItem } from "~/components/topicCard";
import { TopicList } from "~/components/topicCardList";
import { Text } from "~/components/ui/text";
import { useLinuxDoClientStore } from "~/store/linuxDoClientStore";

function TopicPage({ listTopics }: { listTopics: "listLatestTopics" | "listUnreadTopics" }) {
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
			const topics = await client[listTopics]();
			setTopicItems(topics.topic_list?.topics);
			setPage(1);
			const moreUrl = client.getLoadMoreTopicsUrl(topics);
			setLoadMoreUrl(moreUrl);
			setHasMore(moreUrl !== null);
		} catch (error) {
			console.error("Error fetching topics:", error);
		} finally {
			setIsLoading(false);
		}
	}, [client, isLoading, listTopics]);

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
			title="Forum Topics"
			onMarkAsRead={(id) => {
				/* TODO: Implement mark as read */
			}}
			onDelete={(id) => {
				/* TODO: Implement delete */
			}}
			onBookmark={(id) => {
				/* TODO: Implement bookmark */
			}}
			onPress={(id) => router.push(`/topic/${id}`)}
			enableSwipe={false}
		/>
	) : (
		<View className="flex-1 items-center justify-center">
			<Text>Loading topics...</Text>
		</View>
	);
}

const ROUTES = [
	{ key: "all", title: "All Topics" },
	{ key: "unread", title: "Unread" },
];

const SCENE_MAP = SceneMap({
	all: () => <TopicPage listTopics="listLatestTopics" />,
	unread: () => <TopicPage listTopics="listUnreadTopics" />,
});

const renderTabBar =
	// biome-ignore lint/suspicious/noExplicitAny: for convenience
	(props: any) => (
		<TabBar
			{...props}
			indicatorStyle={{ backgroundColor: "white" }}
			style={{ backgroundColor: "primary" }}
			pressColor="transparent"
			pressOpacity={1}
			swipeEnabled={true}
		/>
	);

export default function HomeScreen() {
	const layout = useWindowDimensions();

	const [index, setIndex] = useState(0);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View className="bg-primary mb-2 p-2">
				<Text className="color-background font-bold self-center">LUMA</Text>
			</View>
			<TabView
				navigationState={{ index, routes: ROUTES }}
				renderScene={SCENE_MAP}
				onIndexChange={setIndex}
				initialLayout={{ width: layout.width }}
				renderTabBar={renderTabBar}
				swipeEnabled={true}
				lazy={false}
			/>
		</SafeAreaView>
	);
}
