import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import type { TopicCardItem } from "~/components/topicCard";
import { TopicList } from "~/components/topicCardList";
import { Text } from "~/components/ui/text";
import { useLinuxDoClientStore } from "~/store/linuxDoClientStore";

export default function HomeScreen() {
	const router = useRouter();
	const layout = useWindowDimensions();
	const client = useLinuxDoClientStore().client!;

	const [index, setIndex] = useState(0);
	const [routes] = useState([
		{ key: "all", title: "All Topics" },
		{ key: "unread", title: "Unread" },
	]);

	// All topics state
	const [topicItems, setTopicItems] = useState<TopicCardItem[] | undefined>(undefined);
	const [page, setPage] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	// Unread topics state
	const [unreadTopics, setUnreadTopics] = useState<TopicCardItem[] | undefined>(undefined);
	const [unreadPage, setUnreadPage] = useState(0);
	const [isLoadingUnread, setIsLoadingUnread] = useState(false);
	const [hasMoreUnread, setHasMoreUnread] = useState(true);

	useEffect(() => {
		Promise.all([handleRefresh(), handleUnreadRefresh()]);
	}, []);

	const handleRefresh = useCallback(async () => {
		if (isLoading) return; // Prevent multiple simultaneous calls

		try {
			setIsLoading(true);
			const topics = await client.listLatestTopics();
			setTopicItems(topics.topic_list?.topics);
			setPage(1);
		} catch (error) {
			console.error("Error fetching topics:", error);
		} finally {
			setIsLoading(false);
		}
	}, [client, isLoading]);

	const handleUnreadRefresh = useCallback(async () => {
		if (isLoadingUnread) return;

		try {
			setIsLoadingUnread(true);
			// TODO implement
			// const topics = await client.listUnreadTopics();
			const topics = await client.listLatestTopics();
			setUnreadTopics(topics.topic_list?.topics);
			setUnreadPage(1);
		} catch (error) {
			console.error("Error fetching unread topics:", error);
		} finally {
			setIsLoadingUnread(false);
		}
	}, [client, isLoadingUnread]);

	const handleLoadMore = useCallback(async () => {
		if (isLoading || !hasMore || !topicItems?.length) return;

		try {
			setIsLoading(true);
			const nextPage = page + 1;
			console.log("Loading more topics, page:", nextPage);

			const topics = await client.listLatestTopicsEx({
				no_definitions: true,
				page: nextPage,
			});

			const newTopics = topics.topic_list?.topics;
			if (!newTopics?.length) {
				setHasMore(false);
				return;
			}

			setTopicItems((prev) => {
				if (!prev) return newTopics;
				const existingTopics = new Map(prev.map((topic) => [topic.id, topic]));
				const uniqueNewTopics = newTopics.filter((topic) => !existingTopics.has(topic.id));

				if (!uniqueNewTopics.length) {
					setHasMore(false);
					return prev;
				}

				return [...prev, ...uniqueNewTopics];
			});
			setPage(nextPage);
		} catch (error) {
			console.error("Error loading more topics:", error);
			setHasMore(false);
		} finally {
			setIsLoading(false);
		}
	}, [client, page, isLoading, hasMore, topicItems]);

	const handleLoadMoreUnread = useCallback(async () => {
		if (isLoadingUnread || !hasMoreUnread || !unreadTopics?.length) return;

		try {
			setIsLoadingUnread(true);
			const nextPage = unreadPage + 1;
			// TODO implement
			const topics = await client.listLatestTopicsEx({
				no_definitions: true,
				page: nextPage,
			});

			const newTopics = topics.topic_list?.topics;
			if (!newTopics?.length) {
				setHasMoreUnread(false);
				return;
			}

			setUnreadTopics((prev) => {
				if (!prev) return newTopics;
				const existingTopics = new Map(prev.map((topic) => [topic.id, topic]));
				const uniqueNewTopics = newTopics.filter((topic) => !existingTopics.has(topic.id));

				if (!uniqueNewTopics.length) {
					setHasMoreUnread(false);
					return prev;
				}

				return [...prev, ...uniqueNewTopics];
			});
			setUnreadPage(nextPage);
		} catch (error) {
			console.error("Error loading more unread topics:", error);
			setHasMoreUnread(false);
		} finally {
			setIsLoadingUnread(false);
		}
	}, [client, unreadPage, isLoadingUnread, hasMoreUnread, unreadTopics]);

	const handleTopicPress = useCallback(
		(id: number) => {
			router.push(`/topic/${id}`);
		},
		[router],
	);

	// biome-ignore lint/suspicious/noExplicitAny: for convenience
	const renderTabBar = (props: any) => (
		<TabBar
			{...props}
			indicatorStyle={{ backgroundColor: "white" }}
			style={{ backgroundColor: "primary" }}
			pressColor="transparent"
			pressOpacity={1}
			swipeEnabled={true}
		/>
	);

	const AllTopicsRoute = useCallback(
		() =>
			topicItems ? (
				<TopicList
					initialItems={topicItems}
					onRefresh={handleRefresh}
					onLoadMore={handleLoadMore}
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
					onPress={handleTopicPress}
					enableSwipe={false}
				/>
			) : (
				<View className="flex-1 items-center justify-center">
					<Text>Loading topics...</Text>
				</View>
			),
		[topicItems, handleRefresh, handleLoadMore, handleTopicPress],
	);

	const UnreadTopicsRoute = useCallback(
		() =>
			unreadTopics ? (
				<TopicList
					initialItems={unreadTopics}
					onRefresh={handleUnreadRefresh}
					onLoadMore={handleLoadMoreUnread}
					title="Unread Topics"
					onMarkAsRead={(id) => {
						/* TODO: Implement mark as read */
					}}
					onDelete={(id) => {
						/* TODO: Implement delete */
					}}
					onBookmark={(id) => {
						/* TODO: Implement bookmark */
					}}
					onPress={handleTopicPress}
					enableSwipe={true}
				/>
			) : (
				<View className="flex-1 items-center justify-center">
					<Text>Loading unread topics...</Text>
				</View>
			),
		[unreadTopics, handleUnreadRefresh, handleLoadMoreUnread, handleTopicPress],
	);

	const renderScene = SceneMap({
		all: AllTopicsRoute,
		unread: UnreadTopicsRoute,
	});

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View className="bg-primary mb-2 p-2">
				<Text className="color-background font-bold self-center">LUMA</Text>
			</View>
			<TabView
				navigationState={{ index, routes }}
				renderScene={renderScene}
				onIndexChange={setIndex}
				initialLayout={{ width: layout.width }}
				renderTabBar={renderTabBar}
				swipeEnabled={true}
				lazy={false}
			/>
		</SafeAreaView>
	);
}
