import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "./NotificationItem";

interface NotificationListProps {
	notifications: Notification[];
	onNotificationPress?: (notification: Notification) => void;
	onMarkAsRead?: (notification: Notification) => void;
	onRefresh?: () => Promise<void>;
	isRefreshing?: boolean;
}

export function NotificationList({ notifications, onNotificationPress, onMarkAsRead, onRefresh, isRefreshing }: NotificationListProps) {
	return (
		<View className="flex-1">
			<Text className="px-4 text-lg font-medium mb-2">Message and notification list</Text>
			<FlashList
				data={notifications}
				renderItem={({ item, index }) => (
					<NotificationItem notification={item} index={index} onPress={onNotificationPress} onMarkAsRead={onMarkAsRead} />
				)}
				estimatedItemSize={80}
				onRefresh={onRefresh}
				refreshing={isRefreshing}
			/>
		</View>
	);
}
