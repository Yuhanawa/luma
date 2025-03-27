import { Stack } from "expo-router";
import { ExternalLink } from "lucide-react-native";
import { Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationList } from "~/components/navigation/NavigationList";

const MOCK_EXTERNAL = [
	{
		id: "https://example1.com",
		text: "External Resource 1",
		description: "Visit this amazing resource",
		icon: <ExternalLink className="text-primary" size={20} />,
	},
	{
		id: "https://example2.com",
		text: "External Resource 2",
		description: "Another useful external link",
		icon: <ExternalLink className="text-primary" size={20} />,
	},
];

export default function ExternalLinksScreen() {
	return (
		<SafeAreaView className="flex-1 bg-background">
			<Stack.Screen
				options={{
					title: "External Links",
					headerLargeTitle: true,
					headerBlurEffect: "regular",
				}}
			/>

			<NavigationList items={MOCK_EXTERNAL} onItemPress={Linking.openURL} />
		</SafeAreaView>
	);
}
