import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { Bookmark, Bug, Cat, Dog, Send } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Keyboard, Pressable, Share, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { PostList } from "~/components/topic/PostList";
import { ReplyInput } from "~/components/topic/ReplyInput";
import { TopicHeader } from "~/components/topic/TopicHeader";
import { TopicNavBar } from "~/components/topic/TopicNavBar";
import { TopicDetailSkeleton } from "~/components/topic/TopicSkeleton";
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
	const [isLoading, setIsLoading] = useState(true);
	const [replyInputVisible, setReplyInputVisible] = useState(false);
	const [replyingToPost, setReplyingToPost] = useState<GetTopic200PostStreamPostsItem | null>(null);

	const postsCache = usePostsCache();

	useEffect(() => {
		if (topic) postsCache.set(id, topic);
	}, [topic, postsCache.set, id]);

	const loadTopic = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = postsCache.get(id) ?? (await client.getTopic({ id: id }));
			setTopic(response);
		} catch (error) {
			console.error("Error loading topic:", error);
			Alert.alert("Error", "Failed to load topic");
		} finally {
			setIsLoading(false);
		}
	}, [id, client, postsCache.get]);

	useEffect(() => {
		loadTopic();
	}, [loadTopic]);

	const updatePost = useCallback((post: GetTopic200PostStreamPostsItem) => {
		// Update the post in the topic
		setTopic((prevTopic) => {
			if (!prevTopic) return prevTopic;
			const updatedPosts = prevTopic.post_stream.posts.map((p) => (p.id === post.id ? post : p));
			return { ...prevTopic, post_stream: { ...prevTopic.post_stream, posts: updatedPosts } };
		});
	}, []);

	const handleReply = useCallback((post: GetTopic200PostStreamPostsItem) => {
		setReplyingToPost(post);
		setReplyInputVisible(true);
		Keyboard.dismiss(); // Dismiss any active keyboard
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
		(post: GetTopic200PostStreamPostsItem) => {
			const bookmarkedPost = post as unknown as GetTopic200PostStreamPostsItem & {
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
				});
			else if (bookmarkedPost.bookmark_id)
				client.deleteBookmark(bookmarkedPost.bookmark_id).then(() => {
					bookmarkedPost.bookmark_id = undefined;
					bookmarkedPost.bookmarked = false;
					bookmarkedPost.bookmark_auto_delete_preference = undefined;
					bookmarkedPost.bookmark_reminder_at = null;
					bookmarkedPost.bookmark_name = null;
					updatePost(bookmarkedPost);
				});
		},
		[client, updatePost],
	);

	const renderMore = useCallback(
		(post: GetTopic200PostStreamPostsItem) => {
			return (
				<View className="m-2 p-2 bg-muted rounded-md flex gap-1">
					<View className="flex-row">
						<Pressable onPress={() => handleBookmark(post)} className="rounded-sm flex-row bg-card items-center m-1 px-2 py-1">
							<Bookmark size={16} className="text-card-foreground" fill={post.bookmarked ? "#3B82F6" : "none"} />
							<Text className="ml-1 text-card-foreground">{post.bookmarked ? "Unbookmark" : "Bookmark"}</Text>
						</Pressable>
						<Pressable onPress={() => handleBookmark(post)} className="rounded-sm flex-row bg-card items-center m-1 px-2 py-1">
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
		[handleBookmark],
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
				// After successful submission, reload the topic to show the new reply
				await loadTopic();
			} catch (error) {
				console.error("Error submitting reply:", error);
				Alert.alert("Error", "Failed to submit reply");
			}
		},
		[id, loadTopic, client],
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

	if (!topic || isLoading) {
		return (
			<>
				<Stack.Screen options={{ headerShown: false }} />
				<SafeAreaView className="flex-1">
					<TopicDetailSkeleton />
				</SafeAreaView>
			</>
		);
	}

	return (
		<>
			<TopicNavBar topic={topic} onShare={handleShare} />
			<View className="flex-1 relative">
				<PostList
					ListHeaderComponent={<TopicHeader topic={topic} />}
					posts={topic.post_stream.posts}
					onReply={handleReply}
					onLike={handleLike}
					renderMore={renderMore}
					onRefresh={loadTopic}
					isLoading={isLoading}
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
