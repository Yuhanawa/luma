import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { UserAvatar } from "~/components/UserAvatar";
import { Text } from "~/components/ui/text";
import type { NotificationItem } from "~/components/user/NotificationItem";
import { NotificationList } from "~/components/user/NotificationList";
import { UserHeader } from "~/components/user/UserHeader";
import { UserInfo } from "~/components/user/UserInfo";
import { UserStats } from "~/components/user/UserStats";
import { useLinuxDoClientStore } from "~/store/linuxDoClientStore";
import { useUserStore } from "~/store/userStore";

export default function UserScreen() {
	const client = useLinuxDoClientStore().client!;
	const { userData, isLoading, error, init: initUser } = useUserStore();

	const [userSummary, setUserSummary] = useState<Awaited<ReturnType<typeof client.getUserSummary>> | null>(null);
	useEffect(() => {
		initUser();
	}, [initUser]);
	useEffect(() => {
		if (userData === null || userSummary !== null) return;
		client
			.getUserSummary(userData?.user.username)
			.then(setUserSummary)
			.catch((e) => {
				console.error("ERROR: When getting user summary", e);
			});
	}, [userData, client, userSummary]);

	const [notifications, setNotifications] = useState<NotificationItem[] | undefined>(undefined);
	const [isNotificationsRefreshing, setIsNotificationsRefreshing] = useState(false);

	const handleNotificationPress = useCallback((notification: NotificationItem) => {
		// TODO: Handle notification press
		console.log("Notification pressed:", notification);
		Alert.alert(JSON.stringify(notification));
	}, []);

	const handleMarkAsRead = useCallback((notification: NotificationItem) => {
		// TODO: Implement mark as read
		setNotifications((prev) =>
			prev === undefined ? [notification] : prev.map((n) => (n.id === notification.id ? { ...n, read: !n.read } : n)),
		);
	}, []);

	useEffect(() => {
		handleNotificationsRefresh();
	}, []);

	const handleNotificationsRefresh = useCallback(async () => {
		if (isNotificationsRefreshing) return;
		setIsNotificationsRefreshing(true);

		const { notifications } = await client.getNotifications();

		setNotifications((notifications as NotificationItem[]) ?? []);
		setIsNotificationsRefreshing(false);
	}, [client, isNotificationsRefreshing]);

	return (
		<View className="flex-1">
			<View className="p-4">
				{userData === null || isLoading || error ? (
					<View className="flex-1 items-center justify-center">
						<Text>{error ?? "Loading..."}</Text>
					</View>
				) : (
					<>
						<UserHeader />
						<View className="flex-row gap-4">
							<UserAvatar username={userData.user.username} avatarTemplate={userData.user.avatar_template} size={64} />
							<UserInfo
								name={userData.user.name || userData.user.username}
								username={userData.user.username}
								level={userData.user.trust_level}
								bio={userData.user.bio_excerpt || userData.user.bio_raw || "Unknown"}
							/>
						</View>
						{userSummary && (
							<UserStats
								stats={[
									{ label: "Days visited", value: userSummary.user_summary.days_visited },
									{ label: "Time read", value: userSummary.user_summary.time_read },
									{ label: "Posts read", value: userSummary.user_summary.posts_read_count },
									{ label: "Likes received", value: userSummary.user_summary.likes_received },
								]}
							/>
						)}
					</>
				)}
			</View>
			{notifications && (
				<NotificationList
					notifications={notifications}
					onNotificationPress={handleNotificationPress}
					onMarkAsRead={handleMarkAsRead}
					onRefresh={handleNotificationsRefresh}
					isRefreshing={isNotificationsRefreshing}
				/>
			)}
		</View>
	);
}
