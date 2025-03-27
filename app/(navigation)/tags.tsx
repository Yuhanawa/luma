import { Stack, useRouter } from "expo-router";
import { Hash } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationList } from "~/components/navigation/NavigationList";

const MOCK_TAGS = [
	{
		id: "1",
		text: "Popular Tag 1",
		count: 156,
		icon: <Hash className="text-primary" size={20} />,
	},
	{
		id: "2",
		text: "Popular Tag 2",
		count: 89,
		icon: <Hash className="text-primary" size={20} />,
	},
];

export default function TagsScreen() {
	const router = useRouter();

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
				items={MOCK_TAGS}
				// onItemPress={(id) => router.push(`/tag/${id}`)}
			/>
		</SafeAreaView>
	);
}
