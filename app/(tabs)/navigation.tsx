import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategorySection } from "~/components/navigation/CategorySection";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

// Mock data
const MOCK_CATEGORIES = {
	popular: [
		{ id: "1", text: "Category 1" },
		{ id: "2", text: "Category 2" },
		{ id: "3", text: "Category 3" },
		{ id: "4", text: "Category 4" },
	],
	tags: [
		{ id: "5", text: "Tag 1" },
		{ id: "6", text: "Tag 2" },
		{ id: "7", text: "Tag 3" },
		{ id: "8", text: "Tag 4" },
	],
	external: [
		{ id: "9", text: "Link 1" },
		{ id: "10", text: "Link 2" },
		{ id: "11", text: "Link 3" },
		{ id: "12", text: "Link 4" },
	],
};

export default function CategoriesScreen() {
	const router = useRouter();

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1">
				<View className="p-4">
					<Text className="text-xl font-bold mb-4">Categories</Text>
				</View>

				<CategorySection
					title="热门分类"
					items={MOCK_CATEGORIES.popular}
					// onItemPress={(id) => router.push(`/category/${id}`)}
					// onViewMore={() => router.push("/categories/popular")}
					delay={100}
				/>

				<CategorySection
					title="热门标签"
					items={MOCK_CATEGORIES.tags}
					// onItemPress={(id) => router.push(`/tag/${id}`)}
					// onViewMore={() => router.push("/categories/tags")}
					delay={200}
				/>

				<CategorySection
					title="外部链接"
					items={MOCK_CATEGORIES.external}
					// onItemPress={(id) => router.push(`/external/${id}`)}
					// onViewMore={() => router.push("/categories/external")}
					delay={300}
				/>

				<View className="flex-row justify-between px-4 mt-auto mb-4">
					{["quick1", "quick2", "quick3"].map((item) => (
						<Button
							key={item}
							variant="outline"
							size="sm"
							className="flex-1 mx-1"
							// onPress={() => router.push(`/quick/${item}`)}
						>
							<Text className="text-sm">quick </Text>
						</Button>
					))}
				</View>
			</View>
		</SafeAreaView>
	);
}
