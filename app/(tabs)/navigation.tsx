import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { History } from "lucide-react-native";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { type NavigationItem, NavigationSection } from "~/components/navigation/NavigationSection";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useActivityHistoryStore } from "~/store/activityHistoryStore";
import { useCategoriesStore } from "~/store/categoriesStore";
import { useTagsStore } from "~/store/tagsStore";
import { useActivityNavigation } from "../activityScreen";

export const EXTERNAL_LINKS: NavigationItem<string>[] = [
	{ key: "status", text: "status", data: "https://status.linux.do/" },
	{ key: "connect", text: "connect", data: "https://connect.linux.do/" },
	{ key: "webmail", text: "webmail", data: "https://webmail.linux.do" },
	{ key: "NeverGonnaGiveYouUp", text: "你不会想点击的", data: "https://www.bilibili.com/video/BV1GJ411x7h7/" },
];

export default function NavigationScreen() {
	const router = useRouter();
	const { categories, init: initCategories } = useCategoriesStore();
	const { tags, init: initTags } = useTagsStore();
	const { history } = useActivityHistoryStore();
	const { navigate } = useActivityNavigation();

	useEffect(() => {
		initCategories();
		initTags();
	}, [initCategories, initTags]);

	return (
		<ScrollView className="flex-1">
			<View className="p-4">
				<Text className="text-xl font-semibold mb-4">Navigation</Text>
			</View>

			<NavigationSection
				title="热门分类"
				items={categories}
				onItemPress={(item) =>
					navigate({
						listTopics: "listCategoryTopics",
						id: String(item.data.id),
						slug: item.data.slug,
						title: `Category: ${item.text}`,
					})
				}
				onViewMore={() => router.navigate("/categories")}
				delay={100}
			/>

			<NavigationSection
				title="热门标签"
				items={tags}
				onItemPress={(item) =>
					navigate({
						listTopics: "getTag",
						name: item.text,
						title: `Tag: ${item.text}`,
					})
				}
				onViewMore={() => router.navigate("/tags")}
				delay={200}
			/>

			<NavigationSection
				title="外部链接"
				items={EXTERNAL_LINKS}
				onItemPress={(item) => Linking.openURL(item.data)}
				onViewMore={() => router.navigate("/external")}
				delay={300}
			/>

			{history.length > 0 && (
				<View className="px-4 mb-8">
					<View className="flex-row items-center mb-3">
						<History size={18} className="text-muted-foreground mr-2" />
						<Text className="text-lg font-semibold">History</Text>
					</View>
					<View className="flex-row flex-wrap gap-2">
						{history.slice(0, 5).map((item) => (
							<Button
								key={item.id}
								variant="outline"
								size="sm"
								className="flex-1 min-w-[45%]"
								onPress={() => navigate({ ...item.params, title: item.title })}
							>
								<Text className="text-sm" numberOfLines={1}>
									{item.title}
								</Text>
							</Button>
						))}
					</View>
				</View>
			)}
		</ScrollView>
	);
}
