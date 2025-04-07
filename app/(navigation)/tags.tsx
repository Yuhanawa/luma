import { Stack } from "expo-router";
import { Hash } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import { NavigationList } from "~/components/navigation/NavigationList";
import { useTagsStore } from "~/store/tagsStore";
import { useActivityNavigation } from "../activityScreen";

export default function TagsScreen() {
	const { tags, init } = useTagsStore();
	const { navigate } = useActivityNavigation();

	useEffect(() => {
		init();
	}, [init]);

	const tagItems = tags.map((tag) => ({
		id: tag.key.toString(),
		text: tag.text,
		count: tag.data.count,
		icon: <Hash className="text-primary" size={20} />,
		data: tag,
	}));

	return (
		<View className="flex-1 bg-background">
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
					navigate({
						listTopics: "getTag",
						name: tag.text,
						title: `Tag: ${tag.text}`,
					});
				}}
			/>
		</View>
	);
}
