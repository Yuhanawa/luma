import { useColorScheme } from "nativewind";
import { View } from "react-native";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";
import { PostActions } from "./PostActions";
import { PostContent } from "./PostContent";
import { PostHeader } from "./PostHeader";

interface PostItemProps {
	post: GetTopic200PostStreamPostsItem;
	onReply?: (post: GetTopic200PostStreamPostsItem) => void;
	onLike?: (post: GetTopic200PostStreamPostsItem) => void;
	onMore?: (post: GetTopic200PostStreamPostsItem) => void;
}

export const PostItem = ({ post, onReply, onLike, onMore }: PostItemProps) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<View className={`p-4 mb-2 ${isDark ? "bg-gray-800" : "bg-white"}`}>
			<PostHeader
				username={post.username}
				avatarTemplate={post.avatar_template}
				createdAt={post.created_at}
				postNumber={post.post_number}
			/>

			<PostContent html={post.cooked} />

			<PostActions post={post} onReply={onReply} onLike={onLike} onMore={onMore} />
		</View>
	);
};
