import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { GetTopic200 } from "~/lib/gen/api/discourseAPI/schemas/getTopic200";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";
import { usePostsCache } from "~/store/cacheStore";
import { useLinuxDoClientStore } from "~/store/linuxDoClientStore";
import { PostList } from "./PostList";
import { TopicHeader } from "./TopicHeader";
import { TopicDetailSkeleton } from "./TopicSkeleton";

export type PostPanelProps = {
	topicId: string;
	title?: string;
	initialTopic?: GetTopic200;
	onTopicChange?: (topic: GetTopic200) => void;
	disableRefresh?: boolean;
	disablePull2Refresh?: boolean;
	onReply?: (post: GetTopic200PostStreamPostsItem) => void;
	onLike?: (post: GetTopic200PostStreamPostsItem) => void;
	renderMore?: (post: GetTopic200PostStreamPostsItem, rerenderItem: () => void) => React.ReactNode;
	headerComponent?: React.ReactElement;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	ListHeaderComponent?: React.ComponentType<any> | React.ReactElement<any> | null;
};

export function PostPanel(props: PostPanelProps) {
	const { topicId } = props;
	const { t } = useTranslation();
	const client = useLinuxDoClientStore().client!;

	const [topic, setTopic] = useState<GetTopic200 | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [hasMore, setHasMore] = useState(true);

	const postsCache = usePostsCache();

	// Initial load if no topic provided
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (props.initialTopic) {
			setTopic(props.initialTopic);
			setIsLoading(false);
		} else handleRefresh();
	}, []);

	// Update cache when topic changes
	useEffect(() => {
		if (topic) {
			postsCache.set(topicId, topic);
			props.onTopicChange?.(topic);
		}
	}, [topic, postsCache.set, topicId, props.onTopicChange]);

	const handleRefresh = useCallback(async () => {
		if (refreshing) return;
		try {
			setRefreshing(true);
			setError(null);
			const response = postsCache.get(topicId) ?? (await client.getTopic({ id: topicId }));
			setTopic(response);
		} catch (error) {
			console.error("Error loading topic:", error);
			setError(error instanceof Error ? error : new Error(String(error)));
			Alert.alert("Error", "Failed to load topic");
		} finally {
			setRefreshing(false);
			setIsLoading(false);
		}
	}, [refreshing, topicId, client, postsCache.get]);

	const handleLoadMore = useCallback(async () => {
		if (loadingMore || !hasMore || !topic) return;
		try {
			setLoadingMore(true);
			let neededPosts: number[] | null = null;
			const posts = topic?.post_stream.posts;

			if (!topic || !topic.post_stream.stream) {
				setHasMore(false);
				return;
			}

			if (posts) {
				const lastPostId = posts[posts.length - 1].id;
				const currentIndex = topic.post_stream.stream.findIndex((id) => id === lastPostId);
				neededPosts = topic.post_stream.stream.slice(currentIndex + 1, currentIndex + 20).map((id) => id as number);
			}

			if (!neededPosts || !neededPosts.length) {
				console.log("No more posts to load");
				setHasMore(false);
				return;
			}

			console.log("Loading more posts:", neededPosts);
			const response = await client.getPostsFromTopic(topicId, { post_ids: neededPosts });
			if (response.post_stream?.posts) {
				setTopic((prevTopic) => {
					if (!prevTopic) return prevTopic;
					return {
						...prevTopic,
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						post_stream: { ...prevTopic.post_stream, posts: [...prevTopic.post_stream.posts, ...(response.post_stream!.posts! as any)] },
					};
				});

				// Check if there are more posts to load
				if (posts) {
					const updatedPosts = [...posts, ...response.post_stream.posts];
					const lastUpdatedPostId = updatedPosts[updatedPosts.length - 1].id;
					const updatedIndex = topic.post_stream.stream.findIndex((id) => id === lastUpdatedPostId);
					setHasMore(updatedIndex < topic.post_stream.stream.length - 1);
				}
			}
		} catch (error) {
			console.error("Error loading more posts:", error);
			setError(error instanceof Error ? error : new Error(String(error)));
			Alert.alert("Error", "Failed to load more posts");
		} finally {
			setLoadingMore(false);
		}
	}, [client, topicId, topic, loadingMore, hasMore]);

	if (error) {
		return (
			<View className="flex-1 items-center justify-center p-4">
				<Text className="text-lg text-red-500 mb-4">Error loading topic</Text>
				<View className="bg-primary px-4 py-2 rounded-md">
					<Text className="text-primary-foreground" onPress={handleRefresh}>
						Retry
					</Text>
				</View>
			</View>
		);
	}

	if (!topic || isLoading) {
		return <TopicDetailSkeleton />;
	}

	return (
		<PostList
			headerComponent={
				props.headerComponent ?? <TopicHeader topic={topic} />
				// props.headerComponent ?? (
				// 	<View className="px-4 bg-card">
				// 		<Text className="text-xl font-bold mb-2 text-foreground">
				// 			{/* biome-ignore lint/suspicious/noExplicitAny: TODO */}
				// 			{(topic as any).unicode_title || topic.fancy_title || topic.title}
				// 		</Text>
				// 	</View>
				// )
			}
			ListHeaderComponent={props.ListHeaderComponent}
			posts={topic.post_stream.posts}
			onReply={props.onReply}
			onLike={props.onLike}
			renderMore={props.renderMore}
			onRefresh={props.disableRefresh ? undefined : handleRefresh}
			onLoadMore={handleLoadMore}
			isLoading={refreshing}
			title={props.title ?? topic.title}
			emptyStateMessage={t("topic.noPosts", "No posts in this topic yet")}
			hasMore={hasMore}
			disablePull2Refresh={props.disablePull2Refresh}
		/>
	);
}
