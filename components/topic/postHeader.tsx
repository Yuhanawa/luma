import { formatDistanceToNow } from "date-fns";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { UserAvatar } from "~/components/user-avatar";

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
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<View className="flex-row justify-between items-center mb-3">
			<View className="flex-row items-center">
				<UserAvatar
					username={username}
					avatarTemplate={avatarTemplate}
					size={32}
					fallbackClassName={isDark ? "bg-gray-700" : "bg-gray-200"}
				/>
				<View className="ml-2">
					<Text className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{username}</Text>
					<Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{formatDate(createdAt)}</Text>
				</View>
			</View>

			<Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>#{postNumber}</Text>
		</View>
	);
};
