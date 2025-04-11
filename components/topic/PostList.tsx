import { FlashList } from "@shopify/flash-list";
import { type ComponentType, type JSXElementConstructor, type ReactElement, useCallback, useEffect } from "react";
import { View } from "react-native";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";
import { PostItem } from "./PostItem";

type PostListProps = {
	posts: GetTopic200PostStreamPostsItem[];
	onReply?: (post: GetTopic200PostStreamPostsItem) => void;
	onLike?: (post: GetTopic200PostStreamPostsItem) => void;
	renderMore?: (post: GetTopic200PostStreamPostsItem) => React.ReactNode;
	onLoadMore?: () => Promise<void>;
	onRefresh?: () => Promise<void>;
	isLoading?: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	ListHeaderComponent?: ComponentType<any> | ReactElement<any, string | JSXElementConstructor<any>> | null | undefined;
};

export const PostList = ({ posts, onReply, onLike, renderMore, onLoadMore, onRefresh, isLoading, ListHeaderComponent }: PostListProps) => {
	const renderItem = useCallback(
		({ item }: { item: GetTopic200PostStreamPostsItem }) => {
			// Find the post being replied to if reply_to_post_number exists
			let replyToPost = null;
			if (item.reply_to_post_number) {
				replyToPost = posts.find((p) => p.post_number === Number(item.reply_to_post_number));
			}
			return <PostItem key={item.id} post={item} replyToPost={replyToPost} onReply={onReply} onLike={onLike} renderMore={renderMore} />;
		},
		[posts, onReply, onLike, renderMore],
	);

	return (
		<View className="flex-1">
			<FlashList
				data={posts}
				renderItem={renderItem}
				estimatedItemSize={200}
				onEndReached={onLoadMore}
				onEndReachedThreshold={0.5}
				onRefresh={onRefresh}
				refreshing={isLoading}
				ListHeaderComponent={ListHeaderComponent}
			/>
		</View>
	);
};
