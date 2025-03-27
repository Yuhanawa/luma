import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useTheme } from "~/components/providers/ThemeProvider";
import { TopicPanel } from "~/components/topic/TopicPanel";

const ROUTES = [
	{ key: "all", title: "All Topics" },
	{ key: "unread", title: "Unread" },
];

const SCENE_MAP = SceneMap({
	all: () => <TopicPanel listTopics="listLatestTopics" />,
	unread: () => <TopicPanel listTopics="listUnreadTopics" />,
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
