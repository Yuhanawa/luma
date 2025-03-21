import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { TopicCardItem } from "~/components/topicCard";
import { TopicList } from "~/components/topicCardList";
import { Text } from "~/components/ui/text";
import { useLinuxDoClientStore } from "~/store/linuxDoClientStore";

export default function HomeScreen() {
	const client = useLinuxDoClientStore().client!;
	const [topicItems, setTopicItems] = useState<TopicCardItem[] | undefined>(undefined);
	const [page, setPage] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		handleRefresh();
	}, []);

	const handleRefresh = useCallback(async () => {
		if (isLoading) return; // Prevent multiple simultaneous calls

		try {
			setIsLoading(true);
			const topics = await client.listLatestTopics();
			setTopicItems(topics.topic_list?.topics);
			console.log(topics.topic_list?.topics);
			setPage(1);
		} catch (error) {
			console.error("Error fetching topics:", error);
		} finally {
			setIsLoading(false);
		}
	}, [client, isLoading]);

	const handleLoadMore = useCallback(async () => {
		if (isLoading || page === 0) return; // Prevent loading if already loading or no initial data

		try {
			setIsLoading(true);
			console.log("Loading more topics, page:", page + 1);

			const topics = await client.listLatestTopicsEx({
				no_definitions: true,
				page: page + 1,
			});

			if (topics.topic_list?.topics?.length) {
				setTopicItems((prev) => {
					const existingIds = new Set(prev?.map((item) => item.id));
					const newTopics = topics.topic_list?.topics?.filter((topic) => !existingIds.has(topic.id));
					return [...(prev || []), ...(newTopics || [])];
				});
				setPage((prevPage) => prevPage + 1);
			}
		} catch (error) {
			console.error("Error loading more topics:", error);
		} finally {
			setIsLoading(false);
		}
	}, [client, page, isLoading]);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View className="bg-primary mb-2 p-2">
				<Text className="color-background font-bold self-center">LUMA</Text>
			</View>
			{topicItems ? (
				<TopicList 
					initialItems={topicItems} 
					onRefresh={handleRefresh} 
					onLoadMore={handleLoadMore} 
					title="Forum Topics"
					onMarkAsRead={(id) => { /* TODO: Implement mark as read */ }}
					onDelete={(id) => { /* TODO: Implement delete */ }}
					onBookmark={(id) => { /* TODO: Implement bookmark */ }}
				/>
			) : (
				<View className="flex-1 items-center justify-center">
					<Text>Loading topics...</Text>
				</View>
			)}
		</SafeAreaView>
	);
}
