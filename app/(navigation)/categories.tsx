import { Stack } from "expo-router";
import { Bookmark } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import { NavigationList } from "~/components/navigation/NavigationList";
import { useCategoriesStore } from "~/store/categoriesStore";
import { useActivityNavigation } from "../activityScreen";

export default function CategoriesScreen() {
	const { categories, init } = useCategoriesStore();
	const { navigate } = useActivityNavigation();

	useEffect(() => {
		init();
	}, [init]);

	const categoryItems = categories.map((category) => ({
		id: category.key.toString(),
		text: category.text,
		description: category.data.description ? String(category.data.description) : undefined,
		count: category.data.topic_count,
		icon: <Bookmark className="text-primary" size={20} />,
		data: category,
	}));

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen
				options={{
					title: "Categories",
					headerLargeTitle: true,
					headerBlurEffect: "regular",
				}}
			/>

			<NavigationList
				items={categoryItems}
				onItemPress={(item) => {
					const category = item.data;
					navigate({
						listTopics: "listCategoryTopics",
						id: String(category.data.id),
						slug: category.data.slug,
						title: `Category: ${category.text}`,
					});
				}}
			/>
		</View>
	);
}
