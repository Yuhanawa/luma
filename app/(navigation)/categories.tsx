import { Stack, useRouter } from "expo-router";
import { Bookmark } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationList } from "~/components/navigation/NavigationList";

const MOCK_COLLECTIONS = [
	{
		id: "1",
		text: "Popular Collection 1",
		description: "Curated collection of popular items",
		count: 42,
		icon: <Bookmark className="text-primary" size={20} />,
	},
	{
		id: "2",
		text: "Popular Collection 2",
		description: "Another great collection",
		count: 28,
		icon: <Bookmark className="text-primary" size={20} />,
	},
];

export default function CollectionsScreen() {
	const router = useRouter();

	return (
		<SafeAreaView className="flex-1 bg-background">
			<Stack.Screen
				options={{
					title: "Collections",
					headerLargeTitle: true,
					headerBlurEffect: "regular",
				}}
			/>

			<NavigationList
				items={MOCK_COLLECTIONS}
				// onItemPress={(id) => router.push(`/collection/${id}`)}
			/>
		</SafeAreaView>
	);
}
