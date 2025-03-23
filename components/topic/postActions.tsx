import { Heart, MoreHorizontal, Reply } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";

interface PostActionsProps {
	post: GetTopic200PostStreamPostsItem;
	onReply?: (post: GetTopic200PostStreamPostsItem) => void;
	onLike?: (post: GetTopic200PostStreamPostsItem) => void;
	onMore?: (post: GetTopic200PostStreamPostsItem) => void;
}

export const PostActions = ({ post, onReply, onLike, onMore }: PostActionsProps) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";
	const iconColor = isDark ? "#9CA3AF" : "#6B7280";

	return (
		<View className="flex-row justify-end items-center">
			<Pressable onPress={() => onReply?.(post)} className="flex-row items-center mr-4">
				<Reply size={16} color={iconColor} />
				<Text className={`ml-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Reply</Text>
			</Pressable>

			<Pressable onPress={() => onLike?.(post)} className="flex-row items-center mr-4">
				<Heart
					size={16}
					color={iconColor}
					// fill={post.liked ? "#EF4444" : "none"}
				/>
				<Text className={`ml-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{/* {post.like_count || 0} */}</Text>
			</Pressable>

			<Pressable onPress={() => onMore?.(post)}>
				<MoreHorizontal size={16} color={iconColor} />
			</Pressable>
		</View>
	);
};
