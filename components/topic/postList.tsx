import { FlashList } from "@shopify/flash-list";
import { type ComponentType, type JSXElementConstructor, type ReactElement, useCallback } from "react";
import { View } from "react-native";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";
import { PostItem } from "./PostItem";

type PostListProps = {
	posts: GetTopic200PostStreamPostsItem[];
	onReply?: (post: GetTopic200PostStreamPostsItem) => void;
	onLike?: (post: GetTopic200PostStreamPostsItem) => void;
	onMore?: (post: GetTopic200PostStreamPostsItem) => void;
	onLoadMore?: () => Promise<void>;
	onRefresh?: () => Promise<void>;
	isLoading?: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	ListHeaderComponent?: ComponentType<any> | ReactElement<any, string | JSXElementConstructor<any>> | null | undefined;
};

export const PostList = ({ posts, onReply, onLike, onMore, onLoadMore, onRefresh, isLoading, ListHeaderComponent }: PostListProps) => {
	const renderItem = useCallback(
		({ item }: { item: GetTopic200PostStreamPostsItem }) => <PostItem post={item} onReply={onReply} onLike={onLike} onMore={onMore} />,
		[onReply, onLike, onMore],
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
