import { Stack } from "expo-router";
import { Bookmark } from "lucide-react-native";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationList } from "~/components/navigation/NavigationList";
import { useCategoriesStore } from "~/store/categoriesStore";
import { go2ActivityScreen } from "../activityScreen";

export default function CategoriesScreen() {
	const { categories, init } = useCategoriesStore();

	useEffect(() => {
		init();
	}, [init]);

	// Convert store categories to NavigationList format
	const categoryItems = categories.map((category) => ({
		id: category.key.toString(),
		text: category.text,
		description: category.data.description ? String(category.data.description) : undefined,
		count: category.data.topic_count,
		icon: <Bookmark className="text-primary" size={20} />,
		data: category, // Store the original category for easy access
	}));

	return (
		<SafeAreaView className="flex-1 bg-background">
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
					go2ActivityScreen(
						{
							listTopics: "listCategoryTopics",
							id: String(category.data.id),
							slug: category.data.slug,
						},
						`Category: ${category.text}`,
					);
				}}
			/>
		</SafeAreaView>
	);
}
