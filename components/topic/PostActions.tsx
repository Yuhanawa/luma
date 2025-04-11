import { Bookmark, Heart, MoreHorizontal, Reply } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";

interface PostActionsProps {
	post: GetTopic200PostStreamPostsItem;
	onReply?: (post: GetTopic200PostStreamPostsItem) => void;
	onLike?: (post: GetTopic200PostStreamPostsItem) => void;
	renderMore?: (post: GetTopic200PostStreamPostsItem) => React.ReactNode;
}

export const PostActions = ({ post, onReply, onLike, renderMore }: PostActionsProps) => {
	const [showMore, setShowMore] = useState(false);
	return (
		<View className="flex-col">
			<View className="flex-row justify-end items-center">
				<Pressable onPress={() => onReply?.(post)} className="flex-row items-center mr-4">
					<Reply size={16} className="text-muted-foreground" />
					<Text className="ml-1 text-sm text-muted-foreground">Reply</Text>
				</Pressable>

				<Pressable onPress={() => onLike?.(post)} className="flex-row items-center mr-4">
					<Heart
						size={16}
						className="text-muted-foreground"
						// fill={post.liked ? "#EF4444" : "none"} // TODO: like
					/>
					<Text className="ml-1 text-sm text-muted-foreground">{/* {post.like_count || 0} */}</Text>
				</Pressable>

				<Pressable onPress={() => setShowMore(!showMore)}>
					<MoreHorizontal size={16} className="text-muted-foreground" />
				</Pressable>
			</View>
			{showMore && renderMore && <View className="mt-2 w-full">{renderMore(post)}</View>}
		</View>
	);
};
