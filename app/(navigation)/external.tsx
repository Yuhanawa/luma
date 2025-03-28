import { Stack } from "expo-router";
import { ExternalLink } from "lucide-react-native";
import { Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EXTERNAL_LINKS } from "~/app/(tabs)/navigation";
import { NavigationList } from "~/components/navigation/NavigationList";

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

			<NavigationList
				items={EXTERNAL_LINKS.map((link) => ({
					id: link.data,
					text: link.text,
					description: "External resource",
					icon: <ExternalLink className="text-primary" size={20} />,
					data: link.data,
				}))}
				onItemPress={(item) => Linking.openURL(item.data)}
			/>
		</SafeAreaView>
	);
}
