import { formatDistanceToNow } from "date-fns";
import { Eye, MessageCircle, Star } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import type { GetTopic200 } from "~/lib/gen/api/discourseAPI/schemas/getTopic200";

type TopicHeaderProps = {
	topic: GetTopic200;
};

export const TopicHeader = ({ topic }: TopicHeaderProps) => {
	const formatDate = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch (e) {
			console.warn("formatDate", e);
			return dateString;
		}
	};

	return (
		<View className="p-4 bg-card">
			{/* biome-ignore lint/suspicious/noExplicitAny: TODO */}
			<Text className="text-xl font-bold mb-2 text-foreground">{(topic as any).unicode_title || topic.fancy_title || topic.title}</Text>

			{/* Stats */}
			<View className="flex-row justify-between items-center">
				<View className="flex-row items-center">
					<View className="flex-row items-center mr-4">
						<MessageCircle size={16} className="text-muted-foreground" />
						<Text className="ml-1 text-sm text-muted-foreground">{topic.posts_count}</Text>
					</View>

					<View className="flex-row items-center mr-4">
						<Eye size={16} className="text-muted-foreground" />
						<Text className="ml-1 text-sm text-muted-foreground">{topic.views}</Text>
					</View>

					{topic.like_count > 0 && (
						<View className="flex-row items-center">
							<Star size={16} className="text-muted-foreground" fill={topic.bookmarked ? "#EAB308" : "none"} />
							<Text className="ml-1 text-sm text-muted-foreground">{topic.like_count}</Text>
						</View>
					)}
				</View>

				<Text className="text-xs text-muted-foreground">{formatDate(topic.created_at)}</Text>
			</View>

			{/* Tags */}
			{topic.tags && topic.tags.length > 0 && (
				<View className="flex-row flex-wrap mt-2">
					{topic.tags.map((tag) => (
						<View key={`${tag}`} className="px-2 py-1 rounded-full mr-2 mb-1 bg-muted">
							<Text className="text-xs text-muted-foreground">{`${tag}`}</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);
};
