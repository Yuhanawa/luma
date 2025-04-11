import { formatDistanceToNow } from "date-fns";
import { View } from "react-native";
import { UserAvatar } from "~/components/UserAvatar";
import { Text } from "~/components/ui/text";

interface PostHeaderProps {
	username: string;
	avatarTemplate: string;
	createdAt: string;
	postNumber: number;
}

export const formatDate = (dateString: string) => {
	try {
		return formatDistanceToNow(new Date(dateString), { addSuffix: true });
	} catch (e) {
		console.warn("formatDate", e);
		return dateString;
	}
};

export const PostHeader = ({ username, avatarTemplate, createdAt, postNumber }: PostHeaderProps) => {
	return (
		<View className="flex-row justify-between items-center mb-3">
			<View className="flex-row items-center">
				<UserAvatar username={username} avatarTemplate={avatarTemplate} size={32} fallbackClassName="bg-muted" />
				<View className="ml-2">
					<Text className="font-medium text-foreground">{username}</Text>
					<Text className="text-xs text-muted-foreground">{formatDate(createdAt)}</Text>
				</View>
			</View>

			<Text className="text-xs text-muted-foreground">#{postNumber}</Text>
		</View>
	);
};
