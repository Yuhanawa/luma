import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { HistorySection } from "~/components/history/HistorySection";
import { type FlattenedTopicPanelProps, type TopicMethods, TopicPanel, type TopicPanelProps } from "~/components/topic/TopicPanel";
import { TopicSkeleton } from "~/components/topic/TopicSkeleton";
import { Text } from "~/components/ui/text";
import { useActivityHistoryStore } from "~/store/activityHistoryStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const THRESHOLD = SCREEN_WIDTH * 0.3;
const THRESHOLD_VERTICAL = SCREEN_HEIGHT * 0.2;

export type Direction = "top" | "bottom" | "left" | "right";

export type NumberToString<T> = {
	[K in keyof T]: T[K] extends number ? string : T[K] extends object ? NumberToString<T[K]> : T[K];
};
export type ActivityScreenBaseParams = NumberToString<FlattenedTopicPanelProps>;
export type ActivityScreenParams =
	| {
			direction?: Direction;
	  }
	| ({
			direction?: Direction;
	  } & ActivityScreenBaseParams);

export function go2ActivityScreen(params?: ActivityScreenParams, title?: string) {
	const router = useRouter();
	const historyStore = useActivityHistoryStore.getState();

	if (params && title) historyStore.addToHistory(title, params as ActivityScreenBaseParams);

	router.navigate(`/activityScreen?${new URLSearchParams({ direction: "bottom", ...params, auth: "go2ActivityScreen" }).toString()}`);
}

export default function ActivityScreen() {
	const router = useRouter();
	const localSearchparams = useLocalSearchParams<
		ActivityScreenParams & {
			auth: string;
		}
	>();
	const direction = localSearchparams.direction;

	const history = useActivityHistoryStore.getState().history;
	const params: ActivityScreenBaseParams =
		"listTopics" in localSearchparams || history.length === 0 ? (localSearchparams as ActivityScreenBaseParams) : history[0].params;
	const listTopics = "listTopics" in params ? params.listTopics : undefined;

	const [loaded, setLoaded] = useState(false);
	// Create appropriate shared values based on direction
	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: prevent content sudden change when switching to ActivityScreen for better UX
	useEffect(() => {
		if (localSearchparams.auth !== "go2ActivityScreen")
			throw Error(
				"Do not use router to navigate to this screen(ActivityScreen), use `go2ActivityScreen` instead to ensure correct parameters and type safety",
			);

		setLoaded(listTopics !== undefined);
		return () => setLoaded(false);
	}, [localSearchparams]);

	// Configure gesture based on direction
	const backGesture = Gesture.Pan()
		.activeOffsetX(direction === "left" || direction === "right" ? [-20, 20] : [-100, 100])
		.activeOffsetY(direction === "top" || direction === "bottom" ? [-20, 20] : [-100, 100])
		.onUpdate((event) => {
			switch (direction) {
				case "left":
					translateX.value = Math.max(0, -event.translationX);
					break;
				case "right":
					translateX.value = Math.max(0, event.translationX);
					break;
				case "top":
					translateY.value = Math.max(0, -event.translationY);
					break;
				case "bottom":
					translateY.value = Math.max(0, event.translationY);
					break;
			}
		})
		.onEnd((event) => {
			switch (direction) {
				case "left":
					if (-event.translationX > THRESHOLD) {
						translateX.value = withSpring(SCREEN_WIDTH, {
							damping: 15,
							velocity: -event.velocityX,
						});
						runOnJS(router.back)();
					} else {
						translateX.value = withSpring(0, {
							damping: 15,
							velocity: -event.velocityX,
						});
					}
					break;
				case "right":
					if (event.translationX > THRESHOLD) {
						translateX.value = withSpring(SCREEN_WIDTH, {
							damping: 15,
							velocity: event.velocityX,
						});
						runOnJS(router.back)();
					} else {
						translateX.value = withSpring(0, {
							damping: 15,
							velocity: event.velocityX,
						});
					}
					break;
				case "top":
					if (-event.translationY > THRESHOLD_VERTICAL) {
						translateY.value = withSpring(SCREEN_HEIGHT, {
							damping: 15,
							velocity: -event.velocityY,
						});
						runOnJS(router.back)();
					} else {
						translateY.value = withSpring(0, {
							damping: 15,
							velocity: -event.velocityY,
						});
					}
					break;
				case "bottom":
					if (event.translationY > THRESHOLD_VERTICAL) {
						translateY.value = withSpring(SCREEN_HEIGHT, {
							damping: 15,
							velocity: event.velocityY,
						});
						runOnJS(router.back)();
					} else {
						translateY.value = withSpring(0, {
							damping: 15,
							velocity: event.velocityY,
						});
					}
					break;
			}
		});

	// Create animated style based on direction
	const animatedStyle = useAnimatedStyle(() => {
		switch (direction) {
			case "left":
				return {
					flex: 1,
					transform: [{ translateX: -translateX.value }],
				};
			case "right":
				return {
					flex: 1,
					transform: [{ translateX: translateX.value }],
				};
			case "top":
				return {
					flex: 1,
					transform: [{ translateY: -translateY.value }],
				};
			case "bottom":
				return {
					flex: 1,
					transform: [{ translateY: translateY.value }],
				};
			default:
				return {
					flex: 1,
					transform: [{ translateY: translateY.value }],
				};
		}
	});

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: false,
					presentation: "transparentModal",
					animation:
						direction === "left"
							? "slide_from_right"
							: direction === "right"
								? "slide_from_left"
								: direction === "top"
									? "slide_from_bottom"
									: "slide_from_bottom",
				}}
			/>

			<GestureDetector gesture={backGesture}>
				<Animated.View style={animatedStyle}>
					<View className="flex-1 bg-background">
						<View className="px-4 border-b border-border">
							<View className="h-14 flex-row items-center">
								<Text className="text-lg font-semibold">Activities</Text>
							</View>
							<HistorySection />
						</View>
						<View className="flex-1">
							{loaded ? (
								// NOTE: if `listTopics` === `undefined`, `loaded` will be `false`
								getTopicPanel(
									params as ActivityScreenParams & {
										listTopics: TopicMethods;
									},
								)
							) : (
								<TopicSkeleton />
							)}
						</View>
					</View>
				</Animated.View>
			</GestureDetector>
		</>
	);
}

function getTopicPanel(
	params: ActivityScreenParams & {
		listTopics: TopicMethods;
	},
) {
	let props = null;
	if ("id" in params) props = { ...params, id: Number.parseInt(params.id) };
	props ??= params;

	return <TopicPanel {...(props as TopicPanelProps)} />;
}
