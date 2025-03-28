import { Stack } from "expo-router";
import { Hash } from "lucide-react-native";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationList } from "~/components/navigation/NavigationList";
import { useTagsStore } from "~/store/tagsStore";
import { go2ActivityScreen } from "../activityScreen";

export default function TagsScreen() {
	const { tags, init } = useTagsStore();

	useEffect(() => {
		init();
	}, [init]);

	// Convert store tags to NavigationList format
	const tagItems = tags.map((tag) => ({
		id: tag.key.toString(),
		text: tag.text,
		count: tag.data.count,
		icon: <Hash className="text-primary" size={20} />,
		data: tag, // Store the original tag for easy access
	}));

	return (
		<SafeAreaView className="flex-1 bg-background">
			<Stack.Screen
				options={{
					title: "Tags",
					headerLargeTitle: true,
					headerBlurEffect: "regular",
				}}
			/>

			<NavigationList
				items={tagItems}
				onItemPress={(item) => {
					const tag = item.data;
					go2ActivityScreen(
						{
							listTopics: "getTag",
							name: tag.text,
						},
						`Tag: ${tag.text}`,
					);
				}}
			/>
		</SafeAreaView>
	);
}
