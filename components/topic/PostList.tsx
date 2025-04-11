import { FlashList } from "@shopify/flash-list";
import { useColorScheme } from "nativewind";
import { type ComponentType, type JSXElementConstructor, type ReactElement, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";
import { ErrorRetry } from "../ErrorRetry";
import { PostItem } from "./PostItem";
import { PostSkeleton } from "./PostSkeleton";

type PostListProps = {
	posts: GetTopic200PostStreamPostsItem[];
	onReply?: (post: GetTopic200PostStreamPostsItem) => void;
	onLike?: (post: GetTopic200PostStreamPostsItem) => void;
	renderMore?: (post: GetTopic200PostStreamPostsItem, rerenderItem: () => void) => React.ReactNode;
	onLoadMore?: () => Promise<void>;
	onRefresh?: () => Promise<void>;
	isLoading?: boolean;
	headerComponent?: ReactElement;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	ListHeaderComponent?: ComponentType<any> | ReactElement<any, string | JSXElementConstructor<any>> | null | undefined;
	title?: string;
	emptyStateMessage?: string;
	disablePull2Refresh?: boolean;
	hasMore?: boolean | (() => boolean);
};

export const PostList = ({
	posts,
	onReply,
	onLike,
	renderMore,
	onLoadMore,
	onRefresh,
	isLoading,
	headerComponent,
	ListHeaderComponent,
	title = "Posts",
	emptyStateMessage = "No posts to display",
	disablePull2Refresh,
	hasMore,
}: PostListProps) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const [filterType, setFilterType] = useState<"all" | "unread" | "bookmarked">("all");
	const [loadingMore, setLoadingMore] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const listRef = useRef<FlashList<GetTopic200PostStreamPostsItem>>(null);
	const onEndReachedCalledDuringMomentum = useRef(false);

	const isDark = colorScheme === "dark";

	const handleRefresh = async () => {
		if (onRefresh && !refreshing) {
			setRefreshing(true);
			setError(null);
			try {
				await onRefresh();
			} catch (error) {
				console.error("Error refreshing:", error);
				setError(error instanceof Error ? error : new Error(String(error)));
			} finally {
				setRefreshing(false);
			}
		}
	};

	const handleLoadMore = async () => {
		if (
			onLoadMore &&
			!loadingMore &&
			!onEndReachedCalledDuringMomentum.current &&
			(hasMore === undefined || (typeof hasMore === "boolean" ? hasMore : hasMore()))
		) {
			onEndReachedCalledDuringMomentum.current = true;
			setLoadingMore(true);
			try {
				await onLoadMore();
			} catch (error) {
				console.error("Error loading more:", error);
			} finally {
				setLoadingMore(false);
			}
		}
	};

	const renderItem = useCallback(
		({ item }: { item: GetTopic200PostStreamPostsItem }) => {
			// Find the post being replied to if reply_to_post_number exists
			let replyToPost = null;
			if (item.reply_to_post_number) {
				replyToPost = posts.find((p) => p.post_number === Number(item.reply_to_post_number));
			}
			return <PostItem key={item.id} post={item} replyToPost={replyToPost} onReply={onReply} onLike={onLike} renderMore={renderMore} />;
		},
		[posts, onReply, onLike, renderMore],
	);

	const renderFooter = () => {
		if (onLoadMore === undefined || hasMore === undefined || typeof hasMore === "boolean" ? !hasMore : !hasMore()) return null;

		return (
			<View className="py-4 flex items-center justify-center">
				<ActivityIndicator size="small" color={isDark ? "#E5E7EB" : "#6B7280"} />
				<Text className={`text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("home.loadingPosts")}</Text>
			</View>
		);
	};

	const renderEmpty = () => (
		<View className="flex-1 items-center justify-center py-10">
			<Text className={`text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>{emptyStateMessage}</Text>
		</View>
	);

	if (error) {
		return <ErrorRetry onRetry={handleRefresh} />;
	}

	if (!posts.length && isLoading) {
		return <PostSkeleton />;
	}

	return (
		<View className="flex-1">
			<View style={{ paddingHorizontal: 8 }}>
				<View className="border-b border-border shadow-md rounded-b-md">{headerComponent}</View>
			</View>

			<Animated.View entering={FadeInDown.duration(400)} exiting={FadeOutUp} className="flex-1">
				<FlashList
					ref={listRef}
					data={posts}
					renderItem={renderItem}
					keyExtractor={(item) => `${item.id}-${item.post_number}`}
					estimatedItemSize={200}
					contentContainerStyle={{ paddingHorizontal: 8 }}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={renderEmpty}
					ListFooterComponent={renderFooter}
					ListHeaderComponent={ListHeaderComponent}
					{...(onRefresh
						? {
								onRefresh: disablePull2Refresh ? undefined : handleRefresh,
								refreshing: refreshing,
							}
						: {})}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.5}
					onMomentumScrollBegin={() => {
						onEndReachedCalledDuringMomentum.current = false;
					}}
				/>
			</Animated.View>
		</View>
	);
};
