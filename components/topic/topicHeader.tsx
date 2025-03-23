import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Eye, MessageCircle, Star } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { LINUXDO_CONST } from "~/constants/linuxDo";
import type { GetTopic200 } from "~/lib/gen/api/discourseAPI/schemas/getTopic200";

type TopicHeaderProps = {
	topic: GetTopic200;
};

export const TopicHeader = ({ topic }: TopicHeaderProps) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	const formatDate = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch (e) {
			console.warn("formatDate", e);
			return dateString;
		}
	};

	const getAvatarUrl = (template: string) => {
		return template.startsWith("http") ? template.replace("{size}", "48") : `${LINUXDO_CONST.HTTPS_URL}${template.replace("{size}", "48")}`;
	};

	return (
		<View className={`p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
			{/* Author Info */}
			<View className="flex-row items-center mb-4">
				{topic.details?.created_by?.avatar_template && (
					<Image source={{ uri: getAvatarUrl(topic.details.created_by.avatar_template) }} className="w-10 h-10 rounded-full mr-3" />
				)}
				<View>
					<Text className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
						{topic.details?.created_by?.username || "Unknown"}
					</Text>
					<Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{formatDate(topic.created_at)}</Text>
				</View>
			</View>

			{/* Title */}
			<Text className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{topic.fancy_title || topic.title}</Text>

			{/* Stats */}
			<View className="flex-row justify-between items-center">
				<View className="flex-row items-center">
					<View className="flex-row items-center mr-4">
						<MessageCircle size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
						<Text className={`ml-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{topic.posts_count}</Text>
					</View>

					<View className="flex-row items-center mr-4">
						<Eye size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
						<Text className={`ml-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{topic.views}</Text>
					</View>

					{topic.like_count > 0 && (
						<View className="flex-row items-center">
							<Star size={16} color={isDark ? "#9CA3AF" : "#6B7280"} fill={topic.bookmarked ? "#EAB308" : "none"} />
							<Text className={`ml-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{topic.like_count}</Text>
						</View>
					)}
				</View>

				<Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{formatDate(topic.created_at)}</Text>
			</View>

			{/* Tags */}
			{topic.tags && topic.tags.length > 0 && (
				<View className="flex-row flex-wrap mt-2">
					{topic.tags.map((tag) => (
						<View key={`${tag}`} className={`px-2 py-1 rounded-full mr-2 mb-1 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
							<Text className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>{`${tag}`}</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);
};
