import { BookmarkIcon, Filter, MessageSquare, RefreshCw, TrendingUp } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { TopicCard, type TopicCardItem } from "./topicCard";

type TopicListProps = {
	initialItems?: TopicCardItem[];
	onRefresh?: () => Promise<void>;
	onLoadMore?: () => Promise<void>;
	emptyStateMessage?: string;
	title?: string;
	onMarkAsRead?: (id: number) => void;
	onDelete?: (id: number) => void;
	onBookmark?: (id: number) => void;
	onPress?: (id: number) => void;
	enableSwipe?: boolean;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export const TopicList = ({
	initialItems = [],
	onRefresh,
	onLoadMore,
	emptyStateMessage = "No topics to display",
	title = "Topics",
	onMarkAsRead,
	onDelete,
	onBookmark,
	onPress,
	enableSwipe = true,
}: TopicListProps) => {
	const { colorScheme } = useColorScheme();
	const [items, setItems] = useState<TopicCardItem[]>(initialItems);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [filterType, setFilterType] = useState<"all" | "unread" | "bookmarked" | "trending">("all");
	const listRef = useRef<FlatList>(null);
	const onEndReachedCalledDuringMomentum = useRef(false);

	// Update items when initialItems change
	useEffect(() => {
		setItems(initialItems);
	}, [initialItems]);

	const isDark = colorScheme === "dark";

	const filteredItems = items.filter((item) => {
		if (filterType === "unread") return item.unseen || (item.unread_posts && item.unread_posts > 0);
		if (filterType === "bookmarked") return item.bookmarked;
		if (filterType === "trending") return (item.views ?? 0) > 100 || (item.like_count ?? 0) > 10;
		return true;
	});

	const handleRefresh = async () => {
		if (onRefresh && !refreshing) {
			setRefreshing(true);
			try {
				await onRefresh();
			} catch (error) {
				console.error("Error refreshing:", error);
			} finally {
				setRefreshing(false);
			}
		}
	};

	const handleLoadMore = async () => {
		if (onLoadMore && !loadingMore && !onEndReachedCalledDuringMomentum.current && items.length >= 10) {
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
		({ item, index }: { item: TopicCardItem; index: number }) => (
			<AnimatedView entering={FadeInDown.delay(index * 50).springify()} exiting={FadeOutUp.springify()}>
				<TopicCard
					item={item}
					onMarkAsRead={onMarkAsRead}
					onDelete={onDelete}
					onBookmark={onBookmark}
					onPress={onPress}
					enableSwipe={enableSwipe}
				/>
			</AnimatedView>
		),
		[onMarkAsRead, onDelete, onBookmark, onPress, enableSwipe],
	);

	const renderFooter = () => {
		if (!loadingMore) return null;

		return (
			<View className="py-4 flex items-center justify-center">
				<ActivityIndicator size="small" color="#3B82F6" />
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

	return (
		<View className="flex-1">
			<View className="flex-row justify-between items-center px-4 py-3">
				<Text className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{title}</Text>

				<View className="flex-row">
					<Pressable
						className={`mr-2 px-3 py-1 rounded-full flex-row items-center ${
							filterType !== "all" ? (isDark ? "bg-blue-900" : "bg-blue-100") : "bg-transparent"
						}`}
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
						<Text className={`ml-1 text-xs ${isDark ? "text-blue-300" : "text-blue-600"}`}>
							{filterType === "all" ? "All" : filterType === "unread" ? "Unread" : filterType === "bookmarked" ? "Bookmarked" : "Trending"}
						</Text>
					</Pressable>

					<Pressable className="p-2 rounded-full" onPress={handleRefresh}>
						<RefreshCw size={16} color={isDark ? "#E5E7EB" : "#6B7280"} />
					</Pressable>
				</View>
			</View>

			<FlatList
				ref={listRef}
				data={filteredItems}
				renderItem={renderItem}
				keyExtractor={(item) => item.id?.toString() || item.title || "UNKNOWN"}
				contentContainerStyle={{ padding: 16 }}
				showsVerticalScrollIndicator={false}
				onRefresh={onRefresh ? handleRefresh : undefined}
				refreshing={refreshing}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.4}
				onMomentumScrollBegin={() => {
					onEndReachedCalledDuringMomentum.current = false;
				}}
				ListFooterComponent={renderFooter}
				ListEmptyComponent={renderEmpty}
			/>
		</View>
	);
};
