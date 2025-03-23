import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Check, Clock, Eye, MessageCircle, Star, Trash2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useRef, useState } from "react";
import { Alert, Animated, Pressable, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { Text } from "~/components/ui/text";
import type { paths } from "~/lib/api/schema";

export type TopicCardItem = NonNullable<
	NonNullable<paths["/latest.json"]["get"]["responses"]["200"]["content"]["application/json"]["topic_list"]>["topics"]
>[number];

type TopicCardProps = {
	item: TopicCardItem;
	onMarkAsRead?: (id: number) => void;
	onDelete?: (id: number) => void;
	onBookmark?: (id: number) => void;
	onPress?: (id: number) => void;
	enableSwipe?: boolean;
};

export const TopicCard = ({ item, onMarkAsRead, onDelete, onBookmark, onPress, enableSwipe = true }: TopicCardProps) => {
	const { colorScheme } = useColorScheme();
	const scaleAnim = useRef(new Animated.Value(1)).current;

	const isDark = colorScheme === "dark";
	const hasUnread = item.unseen || (item.unread_posts && item.unread_posts > 0);

	const handleLongPress = () => {
		Animated.sequence([
			Animated.timing(scaleAnim, {
				toValue: 0.97,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(scaleAnim, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}),
		]).start();

		showActionMenu();
	};

	const showActionMenu = () => {
		Alert.alert(
			"Topic Options",
			"Choose an action",
			[
				{
					text: hasUnread ? "Mark as read" : "Mark as unread",
					onPress: () => onMarkAsRead?.(item.id!),
				},
				{
					text: item.bookmarked ? "Remove bookmark" : "Bookmark",
					onPress: () => onBookmark?.(item.id!),
				},
				{
					text: "Delete",
					onPress: () => onDelete?.(item.id!),
					style: "destructive",
				},
				{
					text: "Cancel",
					style: "cancel",
				},
			],
			{ cancelable: true },
		);
	};

	const renderRightActions = (
		progress: Animated.AnimatedInterpolation<number>,
		drag: Animated.AnimatedInterpolation<number>,
		swipeable: Swipeable,
	) => {
		const translateX = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [100, 0],
		});

		if (item.id === undefined) {
			return (
				<View>
					<Text>ERROR: ID is undefined</Text>
				</View>
			);
		}

		return (
			<View className="flex-row pt-3 pb-6">
				<Animated.View style={{ transform: [{ translateX }] }}>
					<Pressable
						className="bg-blue-500 justify-center items-center w-20 h-full"
						onPress={() => {
							onMarkAsRead?.(item.id!);
							swipeable.close();
						}}
					>
						<Check size={24} color="white" />
						<Text className="text-white text-xs mt-1">{hasUnread ? "Read" : "Unread"}</Text>
					</Pressable>
				</Animated.View>

				<Animated.View style={{ transform: [{ translateX }] }}>
					<Pressable className="bg-red-500 justify-center items-center w-20 h-full" onPress={() => onDelete?.(item.id!)}>
						<Trash2 size={24} color="white" />
						<Text className="text-white text-xs mt-1">Delete</Text>
					</Pressable>
				</Animated.View>
			</View>
		);
	};

	const formatDate = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch (e) {
			console.warn("formatDate", e);
			return dateString;
		}
	};

	// Check for undefined values that might be causing issues
	const title = item.fancy_title || item.title || "";
	const postsCount = item.posts_count || 0;
	const views = item.views || 0;
	const likeCount = item.like_count || 0;
	const lastPostedAt = item.last_posted_at || item.created_at || "";
	const lastPosterUsername = item.last_poster_username || "";
	const categoryId = item.category_id || 0;

	return (
		<GestureHandlerRootView>
			{enableSwipe ? (
				// 	Why use the deprecated version:
				// 	the reanimated version has bugs, it cost my many time, fuck you!
				// 	1. renderRightActions not firing
				// 	similar issue: Swipeable renderLeftActions button not firing: https://github.com/software-mansion/react-native-gesture-handler/issues/3223
				// 	2. ReanimatedSwipeable generating warnings: https://github.com/software-mansion/react-native-gesture-handler/issues/3170
				// 	issue closed and fixed, but it still happens on me
				<Swipeable renderRightActions={renderRightActions} friction={2} overshootRight={false}>
					<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
						<Pressable
							onPress={() => onPress?.(item.id!)}
							onLongPress={handleLongPress}
							delayLongPress={300}
							className={`p-4 mb-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-white"}`}
							style={{
								shadowColor: "#000",
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.1,
								shadowRadius: 4,
								elevation: 3,
							}}
						>
							{/* Topic Header */}
							<View className="flex-row justify-between items-start mb-2">
								<View className="flex-1 mr-2">
									<Text
										className={`text-lg font-bold ${hasUnread ? (isDark ? "text-white" : "text-gray-900") : "text-gray-500"}`}
										numberOfLines={2}
									>
										{title}
									</Text>
								</View>

								{item.pinned && (
									<View className={`px-2 py-1 rounded-full ${isDark ? "bg-blue-900" : "bg-blue-100"}`}>
										<Text className={`text-xs font-medium ${isDark ? "text-blue-300" : "text-blue-700"}`}>Pinned</Text>
									</View>
								)}
							</View>

							{/* Topic Image (if available) */}
							{item.image_url && (
								<View className="mb-3 overflow-hidden rounded-lg">
									<Image source={{ uri: item.image_url }} className="h-40 w-full" contentFit="cover" transition={300} />
								</View>
							)}

							{/* Topic Stats */}
							<View className="flex-row justify-between items-center mb-2">
								<View className="flex-row items-center">
									<View className="flex-row items-center mr-4">
										<MessageCircle size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
										<Text className={`ml-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{postsCount}</Text>
									</View>

									<View className="flex-row items-center mr-4">
										<Eye size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
										<Text className={`ml-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{views}</Text>
									</View>

									{likeCount > 0 && (
										<View className="flex-row items-center">
											<Star size={16} color={isDark ? "#9CA3AF" : "#6B7280"} fill={item.bookmarked ? "#EAB308" : "none"} />
											<Text className={`ml-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{likeCount}</Text>
										</View>
									)}
								</View>

								<View className="flex-row items-center">
									<Clock size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
									<Text className={`ml-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{formatDate(lastPostedAt)}</Text>
								</View>
							</View>

							{/* Last Poster */}
							{lastPosterUsername && (
								<View className="flex-row items-center justify-between">
									<Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
										Last reply by <Text className="font-medium">{lastPosterUsername}</Text>
									</Text>

									{categoryId > 0 && (
										<View className={`px-2 py-1 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
											<Text className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>#{categoryId}</Text>
										</View>
									)}
								</View>
							)}

							{/* Unread Indicator */}
							{hasUnread === true && <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />}

							{/* Bookmarked Indicator */}
							{item.bookmarked === true && <View className="absolute top-4 right-8 w-2 h-2 rounded-full bg-yellow-500" />}
						</Pressable>
					</Animated.View>
				</Swipeable>
			) : (
				<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
					<Pressable
						onPress={() => onPress?.(item.id!)}
						onLongPress={handleLongPress}
						delayLongPress={300}
						className={`p-4 mb-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-white"}`}
						style={{
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.1,
							shadowRadius: 4,
							elevation: 3,
						}}
					>
						{/* Topic Header */}
						<View className="flex-row justify-between items-start mb-2">
							<View className="flex-1 mr-2">
								<Text
									className={`text-lg font-bold ${hasUnread ? (isDark ? "text-white" : "text-gray-900") : "text-gray-500"}`}
									numberOfLines={2}
								>
									{title}
								</Text>
							</View>

							{item.pinned && (
								<View className={`px-2 py-1 rounded-full ${isDark ? "bg-blue-900" : "bg-blue-100"}`}>
									<Text className={`text-xs font-medium ${isDark ? "text-blue-300" : "text-blue-700"}`}>Pinned</Text>
								</View>
							)}
						</View>

						{/* Topic Image (if available) */}
						{item.image_url && (
							<View className="mb-3 overflow-hidden rounded-lg">
								<Image source={{ uri: item.image_url }} className="h-40 w-full" contentFit="cover" transition={300} />
							</View>
						)}

						{/* Topic Stats */}
						<View className="flex-row justify-between items-center mb-2">
							<View className="flex-row items-center">
								<View className="flex-row items-center mr-4">
									<MessageCircle size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
									<Text className={`ml-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{postsCount}</Text>
								</View>

								<View className="flex-row items-center mr-4">
									<Eye size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
									<Text className={`ml-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{views}</Text>
								</View>

								{likeCount > 0 && (
									<View className="flex-row items-center">
										<Star size={16} color={isDark ? "#9CA3AF" : "#6B7280"} fill={item.bookmarked ? "#EAB308" : "none"} />
										<Text className={`ml-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{likeCount}</Text>
									</View>
								)}
							</View>

							<View className="flex-row items-center">
								<Clock size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
								<Text className={`ml-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{formatDate(lastPostedAt)}</Text>
							</View>
						</View>

						{/* Last Poster */}
						{lastPosterUsername && (
							<View className="flex-row items-center justify-between">
								<Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
									Last reply by <Text className="font-medium">{lastPosterUsername}</Text>
								</Text>

								{categoryId > 0 && (
									<View className={`px-2 py-1 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
										<Text className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>#{categoryId}</Text>
									</View>
								)}
							</View>
						)}

						{/* Unread Indicator */}
						{hasUnread === true && <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />}

						{/* Bookmarked Indicator */}
						{item.bookmarked === true && <View className="absolute top-4 right-8 w-2 h-2 rounded-full bg-yellow-500" />}
					</Pressable>
				</Animated.View>
			)}
		</GestureHandlerRootView>
	);
};
