import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { Bookmark, Bug, Cat, Dog, Send } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, Keyboard, Pressable, Share, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { NavBar } from "~/components/NavBar";
import { PostPanel } from "~/components/topic/PostPanel";
import { ReplyInput } from "~/components/topic/ReplyInput";
import { Text } from "~/components/ui/text";
import { LINUXDO_CONST } from "~/constants/linuxDo";
import type { GetTopic200 } from "~/lib/gen/api/discourseAPI/schemas/getTopic200";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";
import { usePostsCache } from "~/store/cacheStore";
import { useLinuxDoClientStore } from "~/store/linuxDoClientStore";

export default function TopicScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const client = useLinuxDoClientStore().client!;
	const [topic, setTopic] = useState<GetTopic200 | undefined>(undefined);
	const [replyInputVisible, setReplyInputVisible] = useState(false);
	const [replyingToPost, setReplyingToPost] = useState<GetTopic200PostStreamPostsItem | null>(null);
	const postsCache = usePostsCache();
	const [viewKey, setViewKey] = useState(0);

	const handleRefresh = useCallback(() => {
		postsCache.set(id, null);
		setViewKey((prev) => prev + 1);
	}, [id, postsCache.set]);

	const updatePost = useCallback((post: GetTopic200PostStreamPostsItem) => {
		setTopic((prevTopic) => {
			if (!prevTopic) return prevTopic;
			const updatedPosts = prevTopic.post_stream.posts.map((p) => (p.id === post.id ? post : p));
			return { ...prevTopic, post_stream: { ...prevTopic.post_stream, posts: updatedPosts } };
		});
	}, []);

	const handleReply = useCallback((post: GetTopic200PostStreamPostsItem) => {
		setReplyingToPost(post);
		setReplyInputVisible(true);
		Keyboard.dismiss();
	}, []);

	const handleLike = useCallback((post: GetTopic200PostStreamPostsItem) => {
		// TODO: Implement like
		Toast.show({
			type: "info",
			text1: `Thanks for your like! I know you liked this post (${post.id}), but don't like it yet, because it's not implemented yet.`,
		});
		console.log("Like post:", post.id);
	}, []);

	const handleBookmark = useCallback(
		(post: GetTopic200PostStreamPostsItem, rerenderItem: () => void) => {
			const bookmarkedPost = { ...post } as GetTopic200PostStreamPostsItem & {
				bookmarked: boolean;
				bookmark_reminder_at?: string | null;
				bookmark_id?: number;
				bookmark_name?: string | null;
				bookmark_auto_delete_preference?: number;
			};
			if (!post.bookmarked)
				client.createBookmark({ bookmarkable_id: bookmarkedPost.id, bookmarkable_type: "Post" }).then((res) => {
					bookmarkedPost.bookmark_id = res.id;
					bookmarkedPost.bookmarked = true;
					bookmarkedPost.bookmark_auto_delete_preference = 3;
					bookmarkedPost.bookmark_reminder_at = null;
					bookmarkedPost.bookmark_name = null;
					updatePost(bookmarkedPost);
					rerenderItem();
				});
			else if (bookmarkedPost.bookmark_id)
				client.deleteBookmark(bookmarkedPost.bookmark_id).then(() => {
					bookmarkedPost.bookmark_id = undefined;
					bookmarkedPost.bookmarked = false;
					bookmarkedPost.bookmark_auto_delete_preference = undefined;
					bookmarkedPost.bookmark_reminder_at = null;
					bookmarkedPost.bookmark_name = null;
					updatePost(bookmarkedPost);
					rerenderItem();
				});
		},
		[client, updatePost],
	);

	const renderMore = useCallback(
		(post: GetTopic200PostStreamPostsItem, rerenderItem: () => void) => {
			// 如果将这些逻辑移入PostPanel应该可以解决，同时代码会更清晰，明天解决
			// biome-ignore lint/style/noParameterAssign: TODO: post没有被正确刷新，暂时先这样解决
			post = topic?.post_stream.posts.find((p) => p.id === post.id) ?? post;
			return (
				<View className="m-2 p-2 bg-muted rounded-md flex gap-1">
					<View className="flex-row">
						<Pressable
							onPress={() => handleBookmark(post, rerenderItem)}
							className="rounded-sm flex-row bg-card items-center m-1 px-2 py-1"
						>
							<Bookmark size={16} className="text-card-foreground" fill={post.bookmarked ? "#3B82F6" : "none"} />
							<Text className="ml-1 text-card-foreground">{post.bookmarked ? "Unbookmark" : "Bookmark"}</Text>
						</Pressable>
						<Pressable onPress={() => Alert.alert(`nya! (${post.id})`)} className="rounded-sm flex-row bg-card items-center m-1 px-2 py-1">
							<Cat size={16} className="text-card-foreground" />
							<Dog size={16} className="text-card-foreground" />
							<Bug size={16} className="text-card-foreground" />
							<Text className="ml-1 text-card-foreground">TODO</Text>
						</Pressable>
						{/* TODO: add more */}
					</View>

					<View className="px-2 bg-muted rounded-md flex-col">
						<Text className="text-sm">Post id: {post.id}</Text>
						<Text className="text-sm">Created at: {new Date(post.created_at).toLocaleString()}</Text>
						<Text className="text-sm">Post type: {post.post_type}</Text>
						<Text className="text-sm">Post number: {post.post_number}</Text>
						<Text className="text-sm">Reply to: {post.reply_to_post_number ?? "none"}</Text>
						<Text className="text-sm">Reader count: {post.readers_count}</Text>
						<Text className="text-sm">Reply count: {post.reply_count}</Text>
						<Text className="text-sm">Quote count: {post.quote_count}</Text>
						{/* TODO: Add more options here */}
					</View>
				</View>
			);
		},
		[handleBookmark, topic],
	);

	// Handle submitting a reply
	const handleSubmitReply = useCallback(
		async (content: string, replyToPostId?: number) => {
			try {
				const response = await client.createTopicPostPM({
					raw: content,
					...(replyToPostId
						? {
								reply_to_post_number: replyToPostId,
							}
						: {
								topic_id: Number.parseInt(id),
							}),
				});
				console.log("Submitting reply:", { content, replyToPostId, topicId: id, response });
				handleRefresh();
			} catch (error) {
				console.error("Error submitting reply:", error);
				Alert.alert("Error", "Failed to submit reply");
			}
		},
		[id, client, handleRefresh],
	);

	// Close the reply input
	const handleCloseReplyInput = useCallback(() => {
		setReplyInputVisible(false);
		setReplyingToPost(null);
	}, []);

	const handleShare = useCallback(() => {
		if (topic) {
			Share.share({
				message: `${topic.title}\n${LINUXDO_CONST.HTTPS_URL}/t/${topic.id}`,
				title: topic.title,
			});
		}
	}, [topic]);

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			{/* TODO: Nav Bar Title */}
			<NavBar
				content={
					topic?.tags &&
					topic.tags.length > 0 && (
						<View className="flex-row flex-wrap ml-2">
							{topic.tags.map((tag) => (
								<View key={`${tag}`} className="px-2 py-1 rounded-full mr-2 mb-1 bg-muted">
									<Text className="text-xs text-muted-foreground">{`${tag}`}</Text>
								</View>
							))}
						</View>
					)
				}
				onShare={handleShare}
				onRefresh={handleRefresh}
			/>
			<View key={viewKey} className="flex-1 relative">
				<PostPanel
					topicId={id}
					initialTopic={topic}
					onTopicChange={setTopic}
					onReply={handleReply}
					onLike={handleLike}
					renderMore={renderMore}
				/>

				{/* Reply to topic button */}
				<Animated.View entering={FadeIn.delay(500).duration(400)} className="absolute bottom-4 right-4">
					<Pressable
						onPress={() => {
							setReplyingToPost(null);
							setReplyInputVisible(true);
						}}
						className="bg-primary rounded-full px-5 py-3 shadow-lg flex-row items-center"
					>
						<Text className="text-primary-foreground font-medium mr-2">Reply to Topic</Text>
						<Send size={16} className="text-primary-foreground" />
					</Pressable>
				</Animated.View>

				{/* Reply input component */}
				<ReplyInput visible={replyInputVisible} replyingTo={replyingToPost} onClose={handleCloseReplyInput} onSubmit={handleSubmitReply} />
			</View>
		</>
	);
}
