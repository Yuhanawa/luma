import { FlashList } from "@shopify/flash-list";
import { BookmarkIcon, Filter, MessageSquare, RefreshCw, TrendingUp } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { ErrorRetry } from "../ErrorRetry";
import type { SwipeAction } from "../SwipeableWrapper";
import { TopicCard, type TopicCardItem } from "./TopicCard";
import { TopicSkeleton } from "./TopicSkeleton";

type TopicListProps = {
	initialItems?: TopicCardItem[];
	onPress?: (id: number) => void;
	onRefresh?: () => Promise<void>;
	disablePull2Refresh?: boolean;
	hasMore?: boolean | (() => boolean);
	onLoadMore?: () => Promise<void>;
	emptyStateMessage?: string;
	title?: string;
	enableSwipe?: boolean;
	swipe?: SwipeAction<TopicCardItem>[];
};

export const TopicList = ({
	initialItems = [],
	onRefresh,
	disablePull2Refresh,
	hasMore,
	onLoadMore,
	emptyStateMessage = "No topics to display",
	title = "Topics",
	onPress,
	enableSwipe = true,
	swipe,
}: TopicListProps) => {
	const { colorScheme } = useColorScheme();
	const [items, setItems] = useState<TopicCardItem[]>(initialItems);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [filterType, setFilterType] = useState<"all" | "unread" | "bookmarked" | "trending">("all");
	const listRef = useRef<FlashList<TopicCardItem>>(null);
	const onEndReachedCalledDuringMomentum = useRef(false);

	// Update items when initialItems change
	useEffect(() => {
		setItems(initialItems);
	}, [initialItems]);

	const isDark = colorScheme === "dark";

	const filteredItems = useMemo(
		() =>
			items.filter((item) => {
				if (filterType === "unread") return item.unseen || (item.unread_posts && item.unread_posts > 0);
				if (filterType === "bookmarked") return item.bookmarked;
				if (filterType === "trending") return (item.views ?? 0) > 100 || (item.like_count ?? 0) > 10;
				return true;
			}),
		[items, filterType],
	);

	const handleRefresh = async () => {
		if (onRefresh && !refreshing) {
			setRefreshing(true);
			try {
				await onRefresh();
			} catch (error) {
				console.error("Error refreshing:", error);
				return <ErrorRetry onRetry={handleRefresh} />;
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
		({ item }: { item: TopicCardItem }) => {
			return <TopicCard item={item} onPress={onPress} enableSwipe={enableSwipe} swipe={swipe} />;
		},
		[onPress, enableSwipe, swipe],
	);

	const renderFooter = () => {
		if (onLoadMore === undefined || hasMore === undefined || typeof hasMore === "boolean" ? !hasMore : !hasMore()) return null;

		return (
			<View className="py-4 flex items-center justify-center">
				<ActivityIndicator size="small" color={isDark ? "#E5E7EB" : "#6B7280"} />
				<Text className={`text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading more...</Text>
			</View>
		);
	};

	const renderEmpty = () => (
		<View className="flex-1 items-center justify-center py-10">
			<Text className={`text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>{emptyStateMessage}</Text>
		</View>
	);

	const getFilterIcon = () => {
		switch (filterType) {
			case "unread":
				return <MessageSquare size={16} color={isDark ? "#93C5FD" : "#3B82F6"} />;
			case "bookmarked":
				return <BookmarkIcon size={16} color={isDark ? "#93C5FD" : "#3B82F6"} />;
			case "trending":
				return <TrendingUp size={16} color={isDark ? "#93C5FD" : "#3B82F6"} />;
			default:
				return <Filter size={16} color={isDark ? "#93C5FD" : "#3B82F6"} />;
		}
	};

	if (!initialItems.length && refreshing) {
		return <TopicSkeleton />;
	}

	return (
		<View className="flex-1">
			<View className="flex-row justify-between items-center px-4 py-3">
				<Text className="font-bold text-lg text-foreground">{title}</Text>

				<View className="flex-row">
					{/* TODO  filter */}
					{/* <Pressable
						className={`mr-2 px-3 py-1 rounded-full flex-row items-center ${filterType !== "all" ? "bg-primary/10" : "bg-transparent"}`}
						onPress={() => {
							setFilterType((current) => {
								if (current === "all") return "unread";
								if (current === "unread") return "bookmarked";
								if (current === "bookmarked") return "trending";
								return "all";
							});
						}}
					>
						{getFilterIcon()}
						<Text className="ml-1 text-xs text-primary">
							{filterType === "all" ? "All" : filterType === "unread" ? "Unread" : filterType === "bookmarked" ? "Bookmarked" : "Trending"}
						</Text>
					</Pressable> */}

					{onRefresh && (
						<Pressable className="p-2 rounded-full" onPress={handleRefresh}>
							<RefreshCw size={16} color={isDark ? "#E5E7EB" : "#6B7280"} />
						</Pressable>
					)}
				</View>
			</View>

			<Animated.View entering={FadeInDown.duration(400)} exiting={FadeOutUp} className="flex-1">
				<FlashList
					ref={listRef}
					data={filteredItems}
					renderItem={renderItem}
					keyExtractor={(item) => item.id?.toString() || item.slug || item.title || "MISSING_KEY"}
					contentContainerStyle={{ padding: 16 }}
					showsVerticalScrollIndicator={false}
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
					ListFooterComponent={renderFooter}
					ListEmptyComponent={renderEmpty}
					removeClippedSubviews={true}
					estimatedItemSize={150}
					maintainVisibleContentPosition={{
						minIndexForVisible: 0,
						autoscrollToTopThreshold: 10,
					}}
				/>
			</Animated.View>
		</View>
	);
};
