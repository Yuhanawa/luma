import { Check } from "lucide-react-native";
import { Animated, Pressable, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { FadeIn } from "react-native-reanimated";
import Reanimated from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import type { GetNotifications200NotificationsItem } from "~/lib/gen/api/discourseAPI/schemas";
import { UserAvatar } from "../UserAvatar";

export type NotificationItem = GetNotifications200NotificationsItem & {
	acting_user_avatar_template?: string;
	acting_user_name?: string;
	created_at: string;
	data: {
		display_name?: string;
		display_username?: string;
		original_name?: string;
		original_post_id?: number;
		original_post_type?: number;
		original_username?: string;
		reaction_icon?: string;
		revision_number?: number;
		topic_title?: string;
		badge_id?: number;
		badge_name?: string;
		badge_slug?: string;
		badge_title?: boolean;
		username?: string;
		message?: string;
		title?: string;
		count?: number;
	};
	fancy_title?: string;
	high_priority?: boolean;
	id: number;
	notification_type: number;
	post_number?: number;
	read: boolean;
	slug?: string;
	topic_id?: number;
	user_id: number;
};

interface NotificationItemProps {
	notification: NotificationItem;
	index: number;
	onPress?: (notification: NotificationItem) => void;
	onMarkAsRead?: (notification: NotificationItem) => void;
}

export function NotificationItem({ notification, index, onPress, onMarkAsRead }: NotificationItemProps) {
	const renderRightActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
		const translateX = dragX.interpolate({
			inputRange: [-80, 0],
			outputRange: [0, 80],
		});

		return (
			<View className="flex-row">
				<Animated.View style={{ transform: [{ translateX }] }}>
					<Pressable
						className="bg-primary justify-center items-center w-20 h-full"
						onPress={() => {
							onMarkAsRead?.(notification);
						}}
					>
						<Check size={24} color="white" />
						<Text className="text-white text-xs mt-1">{notification.read ? "Unread" : "Read"}</Text>
					</Pressable>
				</Animated.View>
			</View>
		);
	};

	return (
		<GestureHandlerRootView>
			<Swipeable renderRightActions={renderRightActions} friction={2} overshootRight={false}>
				<Reanimated.View entering={FadeIn.delay(100 + index * 50)}>
					<Pressable
						onPress={() => onPress?.(notification)}
						className={`flex-row items-center p-4 gap-3 ${notification.read ? "opacity-60" : ""}`}
					>
						<UserAvatar
							username={notification.acting_user_name ?? notification.fancy_title ?? "notification"}
							avatarTemplate={notification.acting_user_avatar_template}
						/>
						<View className="flex-1">
							<Text className="font-medium">
								{notification.notification_type}: {notification.fancy_title ?? notification.topic_id}
							</Text>
							<Text className="text-sm text-muted-foreground">{JSON.stringify(notification.data)}</Text>
						</View>
						{!notification.read && <View className="w-2 h-2 rounded-full bg-primary" />}
					</Pressable>
				</Reanimated.View>
			</Swipeable>
		</GestureHandlerRootView>
	);
}
