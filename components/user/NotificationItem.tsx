import {
	AtSign,
	Award,
	Bell,
	BookMarked,
	Check,
	Heart,
	Link,
	Mail,
	MessageCircle,
	MessageSquare,
	MoveDiagonal,
	PawPrint,
	Quote,
	Reply,
	Sparkle,
	Star,
	ThumbsUp,
	User,
	Users,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FadeIn } from "react-native-reanimated";
import Reanimated from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import type { GetNotifications200NotificationsItem } from "~/lib/gen/api/discourseAPI/schemas";
import { SwipeableWrapper } from "../SwipeableWrapper";
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
	notification_type: NotificationTypeCode | number;
	post_number?: number;
	read: boolean;
	slug?: string;
	topic_id?: number;
	user_id: number;
};

// from https://github.com/discourse/discourse/blob/231e9ca99a76f6ca8ab383a2beb124458baeff5a/app/models/notification.rb#L125-L173
export enum NotificationTypeCode {
	mentioned = 1,
	replied = 2,
	quoted = 3,
	edited = 4,
	liked = 5,
	private_message = 6,
	invited_to_private_message = 7,
	invitee_accepted = 8,
	posted = 9,
	moved_post = 10,
	linked = 11,
	granted_badge = 12,
	invited_to_topic = 13,
	custom = 14,
	group_mentioned = 15,
	group_message_summary = 16,
	watching_first_post = 17,
	topic_reminder = 18,
	liked_consolidated = 19,
	post_approved = 20,
	code_review_commit_approved = 21,
	membership_request_accepted = 22,
	membership_request_consolidated = 23,
	bookmark_reminder = 24,
	reaction = 25,
	votes_released = 26,
	event_reminder = 27,
	event_invitation = 28,
	chat_mention = 29,
	chat_message = 30,
	chat_invitation = 31,
	chat_group_mention = 32, // March 2022 - This is obsolete, as all chat_mentions use `chat_mention` type
	chat_quoted = 33,
	assigned = 34,
	question_answer_user_commented = 35, // Used by https://github.com/discourse/discourse-question-answer
	watching_category_or_tag = 36,
	new_features = 37,
	admin_problems = 38,
	linked_consolidated = 39,
	chat_watched_thread = 40,
	following = 800, // Used by https://github.com/discourse/discourse-follow
	following_created_topic = 801, // Used by https://github.com/discourse/discourse-follow
	following_replied = 802, // Used by https://github.com/discourse/discourse-follow
	circles_activity = 900, // Used by https://github.com/discourse/discourse-circles
}

function getNotificationText(i: NotificationItem): {
	title: string;
	description: string;
	icon?: React.ReactNode;
	backgroundColor?: string;
} {
	const { t } = useTranslation();
	const iconProps = { size: 24, className: "text-foreground" };
	const userName = i.data.display_name || i.data.display_username || i.acting_user_name || t("notifications.unknown.user", "an user");
	const topicTitle = i.data.topic_title || i.fancy_title || i.data.title || "Unknown topic";

	const getTranslatedText = (key: string, params: Record<string, string | number>) => {
		return {
			title: t(`notifications.${key}.title`, params),
			description: t(`notifications.${key}.description`, params),
		};
	};

	switch (i.notification_type) {
		case NotificationTypeCode.mentioned:
			return {
				...getTranslatedText("mentioned", { user: userName, topic: topicTitle }),
				icon: <AtSign {...iconProps} />,
			};

		case NotificationTypeCode.replied:
			return {
				...getTranslatedText("replied", { user: userName, topic: topicTitle }),
				icon: <Reply {...iconProps} />,
			};

		case NotificationTypeCode.quoted:
			return {
				...getTranslatedText("quoted", { user: userName, topic: topicTitle }),
				icon: <Quote {...iconProps} />,
			};

		case NotificationTypeCode.edited:
			return {
				...getTranslatedText("edited", { user: userName, topic: topicTitle }),
				icon: <MessageCircle {...iconProps} />,
			};

		case NotificationTypeCode.liked:
			return {
				...getTranslatedText("liked", { user: userName, topic: topicTitle }),
				icon: <Heart {...iconProps} />,
			};

		case NotificationTypeCode.private_message:
			return {
				...getTranslatedText("private_message", { user: userName, topic: topicTitle }),
				icon: <Mail {...iconProps} />,
			};

		case NotificationTypeCode.invited_to_private_message:
			return {
				...getTranslatedText("invited_to_private_message", { user: userName, topic: topicTitle }),
				icon: <Mail {...iconProps} />,
			};

		case NotificationTypeCode.invitee_accepted:
			return {
				...getTranslatedText("invitee_accepted", { user: userName, topic: topicTitle }),
				icon: <User {...iconProps} />,
			};

		case NotificationTypeCode.posted:
			return {
				...getTranslatedText("posted", { user: userName, topic: topicTitle }),
				icon: <MessageSquare {...iconProps} />,
			};

		case NotificationTypeCode.moved_post:
			return {
				...getTranslatedText("moved_post", { user: userName, topic: topicTitle }),
				icon: <MoveDiagonal {...iconProps} />,
			};

		case NotificationTypeCode.linked:
			return {
				...getTranslatedText("linked", { user: userName, topic: topicTitle }),
				icon: <Link {...iconProps} />,
			};

		case NotificationTypeCode.granted_badge:
			return {
				...getTranslatedText("granted_badge", { badge: i.data.badge_name ?? i.data.badge_id ?? "Unknown badge" }),
				icon: <Award {...iconProps} />,
			};

		case NotificationTypeCode.invited_to_topic:
			return {
				...getTranslatedText("invited_to_topic", { user: userName, topic: topicTitle }),
				icon: <Users {...iconProps} />,
			};

		case NotificationTypeCode.custom:
			return {
				...getTranslatedText("custom", { title: i.data.title ?? "", message: i.data.message ?? "" }),
				icon: <Bell {...iconProps} />,
			};

		case NotificationTypeCode.group_mentioned:
			return {
				...getTranslatedText("group_mentioned", { user: userName, topic: topicTitle }),
				icon: <Users {...iconProps} />,
			};

		case NotificationTypeCode.group_message_summary:
			return {
				...getTranslatedText("group_message_summary", { count: i.data.count ?? 0 }),
				icon: <Users {...iconProps} />,
			};

		case NotificationTypeCode.watching_first_post:
			return {
				...getTranslatedText("watching_first_post", { user: userName, topic: topicTitle }),
				icon: <Star {...iconProps} />,
			};

		case NotificationTypeCode.topic_reminder:
			return {
				...getTranslatedText("topic_reminder", { topic: topicTitle }),
				icon: <Bell {...iconProps} />,
			};

		case NotificationTypeCode.liked_consolidated:
			return {
				...getTranslatedText("liked_consolidated", { count: i.data.count ?? 0, topic: topicTitle }),
				icon: <ThumbsUp {...iconProps} />,
			};

		case NotificationTypeCode.reaction:
			return {
				...getTranslatedText("reaction", { user: userName, reaction: i.data.reaction_icon ?? "reaction icon" }),
				icon: <Heart {...iconProps} />,
			};

		case NotificationTypeCode.bookmark_reminder:
			return {
				...getTranslatedText("bookmark_reminder", { topic: topicTitle }),
				icon: <BookMarked {...iconProps} />,
			};

		case NotificationTypeCode.chat_mention:
			return {
				...getTranslatedText("chat_mention", { user: userName, topic: topicTitle }),
				icon: <MessageCircle {...iconProps} />,
			};

		case NotificationTypeCode.chat_message:
			return {
				...getTranslatedText("chat_message", { user: userName, message: i.data.message ?? "" }),
				icon: <MessageCircle {...iconProps} />,
			};

		case NotificationTypeCode.following:
			return {
				...getTranslatedText("following", { user: userName }),
				icon: <User {...iconProps} />,
			};

		default:
			console.log("Notification type not implemented", i.notification_type, i);
			return {
				...getTranslatedText("unknown", { type: String(i.notification_type) }),
				icon: <Sparkle {...iconProps} />,
			};
	}
}

interface NotificationItemProps {
	notification: NotificationItem;
	index: number;
	onPress?: (notification: NotificationItem) => void;
	onMarkAsRead?: (notification: NotificationItem) => void;
}

export function NotificationItem({ notification, index, onPress, onMarkAsRead }: NotificationItemProps) {
	const { t } = useTranslation();
	const notificationInfo = getNotificationText(notification);

	return (
		<GestureHandlerRootView>
			<SwipeableWrapper
				swipe={[
					{
						text: t("notifications.mark_as_read"),
						onPress: () => onMarkAsRead?.(notification),
					},
				]}
			>
				<Reanimated.View entering={FadeIn.delay(100 + index * 50)}>
					<Pressable
						onPress={() => onPress?.(notification)}
						className={`flex-row items-center p-4 gap-3 ${notification.read ? "opacity-60" : ""}`}
					>
						<UserAvatar
							username={notification.acting_user_name ?? notification.data.display_username ?? notification.fancy_title ?? "notification"}
							avatarTemplate={notification.acting_user_avatar_template}
						/>
						<View className="flex-1">
							<Text className="font-medium">{notificationInfo.title}</Text>
							<Text className="text-sm text-muted-foreground">{notificationInfo.description}</Text>
						</View>
						<View className="mr-2">{notificationInfo.icon}</View>
						{!notification.read && <View className="w-2 h-2 rounded-full bg-primary" />}
					</Pressable>
				</Reanimated.View>
			</SwipeableWrapper>
		</GestureHandlerRootView>
	);
}
