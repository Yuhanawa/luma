import { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Notification } from "~/components/user/NotificationItem";
import { NotificationList } from "~/components/user/NotificationList";
import { UserAvatar } from "~/components/user/UserAvatar";
import { UserHeader } from "~/components/user/UserHeader";
import { UserInfo } from "~/components/user/UserInfo";
import { UserStats } from "~/components/user/UserStats";

const MOCK_NOTIFICATIONS: Notification[] = [
	{
		id: "1",
		title: "New Message",
		description: "You have a new message from John",
		read: false,
		createdAt: new Date().toISOString(),
	},
	{
		id: "2",
		title: "Level Up!",
		description: "Congratulations! You reached level 2",
		read: false,
		createdAt: new Date().toISOString(),
	},
	{
		id: "3",
		title: "New Feature",
		description: "Check out our latest features",
		read: true,
		createdAt: new Date().toISOString(),
	},
];

export default function UserScreen() {
	const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleNotificationPress = useCallback((notification: Notification) => {
		// Handle notification press
		console.log("Notification pressed:", notification);
	}, []);

	const handleMarkAsRead = useCallback((notification: Notification) => {
		setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: !n.read } : n)));
	}, []);

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
		// Reset notifications
		setNotifications(MOCK_NOTIFICATIONS);
		setIsRefreshing(false);
	}, []);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1">
				<View className="p-4">
					<UserHeader />
					<View className="flex-row gap-4">
						<UserAvatar />
						<UserInfo username="John Doe" userId="johndoe123" level={1} bio="Here is bio,\nit may need two lines" />
					</View>
					<UserStats />
				</View>

				<NotificationList
					notifications={notifications}
					onNotificationPress={handleNotificationPress}
					onMarkAsRead={handleMarkAsRead}
					onRefresh={handleRefresh}
					isRefreshing={isRefreshing}
				/>
			</View>
		</SafeAreaView>
	);
}
