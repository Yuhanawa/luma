import Markdown from "@ronradtke/react-native-markdown-display";
import { AtSign, Eye, Hash, Send, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	SlideInDown,
	SlideOutDown,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Textarea } from "~/components/ui/textarea";
import type { GetTopic200PostStreamPostsItem } from "~/lib/gen/api/discourseAPI/schemas/getTopic200PostStreamPostsItem";
import { getInnerText } from "~/lib/utils/html";
import { useTheme } from "../providers/ThemeProvider";

interface ReplyInputProps {
	visible: boolean;
	replyingTo?: GetTopic200PostStreamPostsItem | null;
	onClose: () => void;
	onSubmit: (content: string, replyToPostId?: number) => Promise<void>;
}

export const ReplyInput = ({ visible, replyingTo, onClose, onSubmit }: ReplyInputProps) => {
	const { colors } = useTheme();
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const textareaRef = useRef<React.ElementRef<typeof Textarea>>(null);
	const inputHeight = useSharedValue(120);

	// Focus the textarea when it becomes visible
	useEffect(() => {
		if (visible) {
			setTimeout(() => {
				textareaRef.current?.focus();
			}, 300);
		} else {
			setContent("");
			setIsSubmitting(false);
		}
	}, [visible]);

	// Handle content change
	const handleContentChange = useCallback(
		(text: string) => {
			setContent(text);

			// Adjust height based on content length and number of lines
			// Count newlines to estimate the number of lines
			const lineCount = (text.match(/\n/g) || []).length + 1;
			const baseHeight = 120;
			const lineHeight = 24; // Approximate line height
			const calculatedHeight = Math.min(baseHeight + lineCount * lineHeight, 300);

			inputHeight.value = withTiming(calculatedHeight, { duration: 150 });
		},
		[inputHeight],
	);

	// Insert special characters at cursor position
	const insertAtCursor = useCallback(
		(textToInsert: string) => {
			if (!textareaRef.current) return;

			// TODO: doesn't work
			// Get current selection
			const selectionStart = textareaRef.current.props?.selection?.start || content.length;
			const selectionEnd = textareaRef.current.props?.selection?.end || content.length;

			// Create new text with insertion
			const newText = content.substring(0, selectionStart) + textToInsert + content.substring(selectionEnd);

			setContent(newText);

			// Focus back on textarea after a short delay
			setTimeout(() => {
				textareaRef.current?.focus();
			}, 50);
		},
		[content],
	);

	// Toggle markdown preview
	const togglePreview = useCallback(() => {
		setShowPreview((prev) => !prev);
	}, []);

	// Handle submit
	const handleSubmit = useCallback(async () => {
		if (content.trim() && !isSubmitting) {
			try {
				setIsSubmitting(true);
				await onSubmit(content, replyingTo?.id);
				setContent("");
				onClose();
			} catch (error) {
				console.error("Error submitting reply:", error);
				setIsSubmitting(false);
			}
		}
	}, [content, onSubmit, replyingTo, onClose, isSubmitting]);

	// Animated styles
	const animatedContainerStyle = useAnimatedStyle(() => {
		return {
			height: inputHeight.value,
		};
	});

	if (!visible) return null;

	// If replying to a post, show a preview of what's being replied to
	const replyPreview = replyingTo ? getInnerText(replyingTo.cooked).substring(0, 100) : "";

	return (
		<Animated.View
			entering={SlideInDown.duration(300)}
			exiting={SlideOutDown.duration(200)}
			className="absolute bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg"
		>
			<View className="flex-row items-center justify-between px-4 py-2 border-b border-border">
				<Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)} className="flex-1">
					<Text className="font-medium">{replyingTo ? `Replying to @${replyingTo.username}` : "Replying to Topic"}</Text>
					{replyingTo && (
						<Text className="text-xs text-muted-foreground mt-1" numberOfLines={1}>
							{replyPreview}
						</Text>
					)}
				</Animated.View>
				<Pressable onPress={onClose} className="p-2 ml-2">
					<X size={20} className="text-muted-foreground" />
				</Pressable>
			</View>

			<Animated.View style={animatedContainerStyle} className="p-4 pb-6">
				{showPreview ? (
					<ScrollView
						className="flex-1 mb-2 p-2 border border-input rounded-md bg-background text-foreground"
						contentInsetAdjustmentBehavior="automatic"
						style={{ height: "100%" }}
					>
						<Markdown style={{ body: { color: colors.foreground } }}>{content || "*No content to preview*"}</Markdown>
					</ScrollView>
				) : (
					<Textarea
						ref={textareaRef}
						value={content}
						onChangeText={handleContentChange}
						placeholder="Be kind, polite, respectful, and professional"
						multiline
						className="flex-1 mb-2 text-base"
						autoFocus={false}
						textAlignVertical="top"
					/>
				)}

				<View className="flex-row justify-between items-center">
					{/* Quick insert buttons */}
					<View className="flex-row">
						<Button variant="outline" size="sm" onPress={() => insertAtCursor("#")} className="mr-2">
							<Hash size={16} className="text-foreground" />
						</Button>
						<Button variant="outline" size="sm" onPress={() => insertAtCursor("@")} className="mr-2">
							<AtSign size={16} className="text-foreground" />
						</Button>
						<Button variant={showPreview ? "default" : "outline"} size="sm" onPress={togglePreview}>
							<Eye size={16} className={showPreview ? "text-primary-foreground" : "text-foreground"} />
						</Button>
					</View>

					{/* Character count and send button */}
					<View className="flex-row items-center">
						<Text className="text-muted-foreground text-xs mr-2">{content.length > 0 ? `${content.length} characters` : ""}</Text>
						<Button onPress={handleSubmit} disabled={!content.trim() || isSubmitting} className="flex-row items-center">
							<Text className="mr-2 text-primary-foreground">{isSubmitting ? "Sending..." : "Send"}</Text>
							<Send size={16} className="text-primary-foreground" />
						</Button>
					</View>
				</View>
			</Animated.View>
		</Animated.View>
	);
};
