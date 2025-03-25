import { Check } from "lucide-react-native";
import { Animated, Pressable, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { FadeIn } from "react-native-reanimated";
import Reanimated from "react-native-reanimated";
import { Text } from "~/components/ui/text";

export interface Notification {
	id: string;
	title: string;
	description: string;
	read: boolean;
	createdAt: string;
}

interface NotificationItemProps {
	notification: Notification;
	index: number;
	onPress?: (notification: Notification) => void;
	onMarkAsRead?: (notification: Notification) => void;
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
						<View className="w-8 h-8 rounded-full bg-primary/20" />
						<View className="flex-1">
							<Text className="font-medium">{notification.title}</Text>
							<Text className="text-sm text-muted-foreground">{notification.description}</Text>
						</View>
						{!notification.read && <View className="w-2 h-2 rounded-full bg-primary" />}
					</Pressable>
				</Reanimated.View>
			</Swipeable>
		</GestureHandlerRootView>
	);
}
