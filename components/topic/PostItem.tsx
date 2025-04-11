import { Reply } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";
import { getInnerText } from "~/lib/utils/html";
import { PostActions } from "./PostActions";
import { PostContent } from "./PostContent";
import { PostHeader } from "./PostHeader";

interface PostItemProps {
	post: GetTopic200PostStreamPostsItem;
	replyToPost?: GetTopic200PostStreamPostsItem | null;
	onReply?: (post: GetTopic200PostStreamPostsItem) => void;
	onLike?: (post: GetTopic200PostStreamPostsItem) => void;
	renderMore?: (post: GetTopic200PostStreamPostsItem, rerenderItem: () => void) => React.ReactNode;
}

export const PostItem = ({ post, replyToPost, onReply, onLike, renderMore }: PostItemProps) => {
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const excerpt = useMemo(() => replyToPost && getInnerText(replyToPost.cooked).substring(0, 100), [replyToPost?.cooked]);
	const [viewKey, setViewKey] = useState(0);
	const rerenderItem = useCallback(() => setViewKey((k) => k + 1), []);

	return (
		<View key={viewKey} className="p-4 mb-2 bg-card rounded-md">
			<PostHeader
				username={post.username}
				avatarTemplate={post.avatar_template}
				createdAt={post.created_at}
				postNumber={post.post_number}
			/>

			{replyToPost && (
				<View className="mb-2 px-3 py-1 bg-muted rounded-md">
					<View className="flex-row items-center p-0.5">
						<Reply size={16} className="text-muted-foreground mr-2 -mt-1" />
						<Text className="text-xs text-muted-foreground text-ellipsis overflow-hidden" numberOfLines={1}>
							<Text className="font-medium">@{replyToPost.username}</Text> : {excerpt}
						</Text>
					</View>
				</View>
			)}

			<PostContent html={post.cooked} />

			<PostActions post={post} onReply={onReply} onLike={onLike} renderMore={(i) => renderMore?.(i, rerenderItem)} />
		</View>
	);
};
