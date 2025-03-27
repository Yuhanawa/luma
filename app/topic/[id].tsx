import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Share, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PostList } from "~/components/topic/PostList";
import { TopicHeader } from "~/components/topic/TopicHeader";
import { TopicNavBar } from "~/components/topic/TopicNavBar";
import { TopicDetailSkeleton } from "~/components/topic/TopicSkeleton";
import type { GetTopic200 } from "~/lib/gen/api/discourseAPI/schemas/getTopic200";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";
import { useLinuxDoClientStore } from "~/store/linuxDoClientStore";

export default function TopicScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const client = useLinuxDoClientStore().client!;
	const [topic, setTopic] = useState<GetTopic200>();
	const [isLoading, setIsLoading] = useState(true);

	const loadTopic = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await client.getTopic({ id: id });
			setTopic(response);
		} catch (error) {
			console.error("Error loading topic:", error);
			Alert.alert("Error", "Failed to load topic");
		} finally {
			setIsLoading(false);
		}
	}, [id, client]);

	useEffect(() => {
		loadTopic();
	}, [loadTopic]);

	const handleReply = useCallback((post: GetTopic200PostStreamPostsItem) => {
		// TODO: Implement reply
		console.log("Reply to post:", post.id);
	}, []);

	const handleLike = useCallback((post: GetTopic200PostStreamPostsItem) => {
		// TODO: Implement like
		console.log("Like post:", post.id);
	}, []);

	const handleMore = useCallback((post: GetTopic200PostStreamPostsItem) => {
		// TODO: Implement more options
		console.log("More options for post:", post.id);
	}, []);

	const handleShare = useCallback(() => {
		if (topic) {
			Share.share({
				message: `${topic.title}\nhttps://linux.do/t/${topic.id}`,
				title: topic.title,
			});
		}
	}, [topic]);

	if (!topic || isLoading) {
		return (
			<>
				<Stack.Screen options={{ headerShown: false }} />
				<SafeAreaView className="flex-1">
					<TopicDetailSkeleton />
				</SafeAreaView>
			</>
		);
	}

	return (
		<>
			<TopicNavBar topic={topic} onShare={handleShare} />
			<PostList
				ListHeaderComponent={<TopicHeader topic={topic} />}
				posts={topic.post_stream.posts}
				onReply={handleReply}
				onLike={handleLike}
				onMore={handleMore}
				onRefresh={loadTopic}
				isLoading={isLoading}
			/>
		</>
	);
}
