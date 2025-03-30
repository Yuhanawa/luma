import { Cat } from "lucide-react-native";
import { useState } from "react";
import { Alert, View, useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useTheme } from "~/components/providers/ThemeProvider";
import { TopicPanel } from "~/components/topic/TopicPanel";

const ROUTES = [
	{ key: "all", title: "All Topics" },
	{ key: "unread", title: "Unread" },
];

const SCENE_MAP = SceneMap({
	all: () => <TopicPanel listTopics="listLatestTopics" />,
	unread: () => (
		<TopicPanel
			title="Unread Topics"
			listTopics="listUnreadTopics"
			swipe={[
				// TODO
				{
					text: "say nya!",
					onPress: (item) => {
						Alert.alert(`nya! (${item?.id})`);
					},
					backgroundColor: "#ffa9a3",
					icon: <Cat size={24} className="text-sky-400" />,
				},
			]}
		/>
	),
});

const renderTabBar =
	// biome-ignore lint/suspicious/noExplicitAny: for convenience
	(props: any) => {
		const colors = useTheme().colors;
		return (
			<View className="bg-card text-card-foreground">
				<TabBar
					{...props}
					style={{ backgroundColor: colors.card }}
					indicatorStyle={{ backgroundColor: colors.primary }}
					pressColor="transparent"
					pressOpacity={1}
					swipeEnabled={true}
				/>
			</View>
		);
	};

export default function HomeScreen() {
	const layout = useWindowDimensions();

	const [index, setIndex] = useState(0);

	return (
		<TabView
			navigationState={{ index, routes: ROUTES }}
			renderScene={SCENE_MAP}
			onIndexChange={setIndex}
			initialLayout={{ width: layout.width }}
			renderTabBar={renderTabBar}
			swipeEnabled={true}
			lazy={false}
		/>
	);
}
