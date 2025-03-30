import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Clock, Eye, Heart, MessageCircle, Star, Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Pressable, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text } from "~/components/ui/text";
import type { paths } from "~/lib/api/schema";
import { useCategoriesStore } from "~/store/categoriesStore";
import { type SwipeAction, SwipeableWrapper } from "../SwipeableWrapper";

export type TopicCardItem = NonNullable<
	NonNullable<paths["/latest.json"]["get"]["responses"]["200"]["content"]["application/json"]["topic_list"]>["topics"]
>[number];

type TopicCardProps = {
	item: TopicCardItem;
	onPress?: (id: number) => void;
	enableSwipe?: boolean;
	swipe?: SwipeAction<TopicCardItem>[];
};

export const TopicCard = ({ item, onPress, enableSwipe = true, swipe }: TopicCardProps) => {
	const { categories, init: initCategories } = useCategoriesStore();

	useEffect(() => {
		initCategories();
	}, [initCategories]);

	const scaleAnim = useRef(new Animated.Value(1)).current;
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
					text: "TODO",
					style: "destructive",
				},
				{
					text: "Let's believe it will done soon",
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

	const formatDate = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch (e) {
			console.warn("formatDate", e);
			return dateString;
		}
	};

	// Check for undefined values that might be causing issues
	// biome-ignore lint/suspicious/noExplicitAny: TODO
	const title = (item as any).unicode_title || item.fancy_title || item.title || "";
	const postsCount = item.posts_count || 0;
	const views = item.views || 0;
	const likeCount = item.like_count || 0;
	const lastPostedAt = item.last_posted_at || item.created_at || "";
	const lastPosterUsername = item.last_poster_username || "";
	const categoryId = item.category_id || 0;
	const category = useMemo(() => categories.find((c) => c.data.id === categoryId), [categories, categoryId]);

	return (
		<GestureHandlerRootView>
			<SwipeableWrapper enableSwipe={enableSwipe} swipe={swipe} item={item}>
				<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
					<Pressable
						onPress={() => onPress?.(item.id!)}
						onLongPress={handleLongPress}
						delayLongPress={300}
						className="p-4 mb-3 rounded-xl bg-card shadow-sm"
					>
						{/* Topic Header */}
						<View className="flex-row justify-between items-start mb-2">
							<View className="flex-1 mr-2">
								<Text className={`text-lg font-bold ${hasUnread ? "text-foreground" : "text-muted-foreground"}`} numberOfLines={2}>
									{title}
								</Text>
							</View>

							{item.pinned && (
								<View className="px-2 py-1 rounded-full bg-primary/10">
									<Text className="text-xs font-medium text-primary">Pinned</Text>
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
									<Eye size={16} className="text-muted-foreground" />
									<Text className="ml-1 text-sm text-muted-foreground">{views}</Text>
								</View>

								<View className="flex-row items-center mr-4">
									<MessageCircle size={16} className="text-muted-foreground" />
									<Text className="ml-1 text-sm text-muted-foreground">{postsCount}</Text>
								</View>

								{likeCount > 0 && (
									<View className="flex-row items-center">
										<Heart size={16} className="text-muted-foreground" fill={item.bookmarked ? "#EAB308" : "none"} />
										<Text className="ml-1 text-sm text-muted-foreground">{likeCount}</Text>
									</View>
								)}
							</View>

							<View className="flex-row items-center">
								<Clock size={14} className="text-muted-foreground" />
								<Text className="ml-1 text-xs text-muted-foreground">{formatDate(lastPostedAt)}</Text>
							</View>
						</View>

						{/* Last Poster */}
						{lastPosterUsername && (
							<View className="flex-row items-center justify-between">
								<Text className="text-sm text-muted-foreground">
									Last reply by <Text className="font-medium">{lastPosterUsername}</Text>
								</Text>

								{category && (
									<View
										className="px-2 py-1 rounded-full bg-card-foreground/80"
										// style={{ backgroundColor: `#${category.data.color}` }}
										// ugly
									>
										{/* <Image source={{ uri: LINUXDO_CONST.HTTPS_URL + category.data.uploaded_logo }} className="w-4 h-4 mr-1" /> */}
										<Text
											className="text-xs text-card/80"
											// style={{ color: `#${category.data.text_color}` }}
										>
											#{category.text}
										</Text>
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
			</SwipeableWrapper>
		</GestureHandlerRootView>
	);
};
