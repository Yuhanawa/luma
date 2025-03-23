import { router } from "expo-router";
import { ChevronLeft, Share2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { GetTopic200 } from "~/lib/gen/api/discourseAPI/schemas/getTopic200";

type TopicNavBarProps = {
	topic?: GetTopic200;
	onShare?: () => void;
};

export const TopicNavBar = ({ topic, onShare }: TopicNavBarProps) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<View className={`flex-row items-center justify-between px-4 py-3 ${isDark ? "bg-gray-800" : "bg-white"}`}>
			<Pressable onPress={() => router.back()} className="flex-row items-center">
				<ChevronLeft size={24} color={isDark ? "#E5E7EB" : "#374151"} />
				<Text
					className={`ml-2 text-base font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}
					numberOfLines={1}
					style={{ maxWidth: "80%" }}
				>
					{topic?.title || "Topic"}
				</Text>
			</Pressable>

			<Pressable onPress={onShare}>
				<Share2 size={20} color={isDark ? "#E5E7EB" : "#374151"} />
			</Pressable>
		</View>
	);
};
