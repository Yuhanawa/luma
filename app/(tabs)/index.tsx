import { Cat } from "lucide-react-native";
import { useState } from "react";
import { Alert, Dimensions, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useActivityNavigation } from "~/app/activityScreen";
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
				// TODO: mark as read
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
					style={{ backgroundColor: colors.card, color: colors.cardForeground, borderColor: colors.border }}
					indicatorStyle={{ backgroundColor: colors.primary }}
					labelStyle={{ color: colors.cardForeground }}
					activeColor={colors.cardForeground}
					inactiveColor={colors.cardForeground}
					pressColor="transparent"
					pressOpacity={1}
					swipeEnabled={true}
				/>
			</View>
		);
	};

export default function HomeScreen() {
	const layout = useWindowDimensions();
	const SCREEN_WIDTH = Dimensions.get("window").width;
	const THRESHOLD = SCREEN_WIDTH * 0.3; // 30% of screen width as threshold for gesture

	const [index, setIndex] = useState(0);
	const translateX = useSharedValue(0);
	const { navigate } = useActivityNavigation();

	const rightSwipeGesture = Gesture.Pan()
		.activeOffsetX([-20, 20])
		.onBegin((event) => {
			// Only allow the gesture to start if we're on the first tab and swiping right
			return index === 0 && event.translationX >= 0 && event.absoluteX < 50;
		})
		.onUpdate((event) => {
			if (event.translationX > 0 && index === 0) {
				translateX.value = event.translationX;
			}
		})
		.onEnd((event) => {
			if (event.translationX > THRESHOLD && index === 0) {
				translateX.value = withSpring(0, { damping: 15 });
				runOnJS(navigate)({
					direction: "left",
				});
			} else translateX.value = withSpring(0, { damping: 15 });
		});

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }],
		};
	});

	return (
		// <GestureHandlerRootView style={{ flex: 1 }}>
		// <GestureDetector gesture={rightSwipeGesture}>
		<Animated.View style={[{ flex: 1 }, animatedStyle]}>
			<TabView
				navigationState={{ index, routes: ROUTES }}
				renderScene={SCENE_MAP}
				onIndexChange={setIndex}
				initialLayout={{ width: layout.width }}
				renderTabBar={renderTabBar}
				swipeEnabled={true}
				lazy={true}
				lazyPreloadDistance={1}
			/>
		</Animated.View>
		// </GestureDetector>
		// </GestureHandlerRootView>
	);
}
