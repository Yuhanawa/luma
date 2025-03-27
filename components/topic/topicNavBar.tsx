import { router } from "expo-router";
import { ChevronLeft, Share2 } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { GetTopic200 } from "~/lib/gen/api/discourseAPI/schemas/getTopic200";

type TopicNavBarProps = {
	topic?: GetTopic200;
	onShare?: () => void;
};

export const TopicNavBar = ({ topic, onShare }: TopicNavBarProps) => {
	return (
		<View className="flex-row items-center justify-between px-4 py-3 bg-card">
			<Pressable onPress={() => router.back()} className="flex-row items-center">
				<ChevronLeft size={24} className="text-foreground" />
				<Text className="ml-2 text-base font-medium text-foreground" numberOfLines={1} style={{ maxWidth: "80%" }}>
					{topic?.title || "Topic"}
				</Text>
			</Pressable>

			<Pressable onPress={onShare}>
				<Share2 size={20} className="text-foreground" />
			</Pressable>
		</View>
	);
};
