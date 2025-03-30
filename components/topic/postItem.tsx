import { View } from "react-native";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";
import { PostActions } from "./PostActions";
import { PostContent } from "./PostContent";
import { PostHeader } from "./PostHeader";

interface PostItemProps {
	post: GetTopic200PostStreamPostsItem;
	onReply?: (post: GetTopic200PostStreamPostsItem) => void;
	onLike?: (post: GetTopic200PostStreamPostsItem) => void;
	renderMore?: (post: GetTopic200PostStreamPostsItem) => React.ReactNode;
}

export const PostItem = ({ post, onReply, onLike, renderMore }: PostItemProps) => {
	return (
		<View className="p-4 mb-2 bg-card">
			<PostHeader
				username={post.username}
				avatarTemplate={post.avatar_template}
				createdAt={post.created_at}
				postNumber={post.post_number}
			/>

			<PostContent html={post.cooked} />

			<PostActions post={post} onReply={onReply} onLike={onLike} renderMore={renderMore} />
		</View>
	);
};
