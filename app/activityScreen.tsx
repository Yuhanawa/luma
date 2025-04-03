import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	SlideInRight,
	SlideInLeft,
	SlideInUp,
	SlideInDown,
} from "react-native-reanimated";
import { HistorySection } from "~/components/history/HistorySection";
import type { TopicCardItem } from "~/components/topic/TopicCard";
import {
	CategoryTopicPanel,
	type CategoryTopicPanelProps,
	type FlattenParams,
	type FlattenedTopicPanelProps,
	TagTopicPanel,
	type TagTopicPanelProps,
	type TopicMethods,
	TopicPanel,
	type TopicPanelComponentProps,
	type WithTopicPanelComponentProps,
} from "~/components/topic/TopicPanel";
import { TopicSkeleton } from "~/components/topic/TopicSkeleton";
import { Text } from "~/components/ui/text";
// Import only what's needed
import "~/lib/cacheStore";
import { getIdFromParams, useActivityHistoryStore } from "~/store/activityHistoryStore";
import { useTopicsCache } from "~/store/cacheStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const THRESHOLD = SCREEN_WIDTH * 0.3;
const THRESHOLD_VERTICAL = SCREEN_HEIGHT * 0.2;

export type Direction = "up" | "down" | "left" | "right";

export type NumberToString<T> = {
	[K in keyof T]: T[K] extends number ? string : T[K] extends object ? NumberToString<T[K]> : T[K];
};
export type ActivityScreenBaseParams = NumberToString<FlattenedTopicPanelProps>;
export type ActivityScreenParams =
	| {
			direction?: Direction;
			title?: string;
	  }
	| ({
			direction?: Direction;
			title?: string;
	  } & ActivityScreenBaseParams);

export function useActivityNavigation() {
	const router = useRouter();

	return {
		navigate: (params?: ActivityScreenParams) => {
			if (params?.title) {
				const historyStore = useActivityHistoryStore.getState();
				historyStore.addToHistory(params.title, params as ActivityScreenBaseParams);
			}

			const urlParams = new URLSearchParams({ direction: "down", ...params, auth: "useActivityNavigation" }).toString();
			router.navigate(`/activityScreen?${urlParams}`);
		},
	};
}

export default function ActivityScreen() {
	const router = useRouter();
	const { navigate } = useActivityNavigation();
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
		if (localSearchparams.auth !== "useActivityNavigation")
			throw Error(
				"Do not use router to navigate to this screen(ActivityScreen), use `useActivityNavigation().navigate()` instead to ensure correct parameters and type safety",
			);

		setLoaded(listTopics !== undefined);
		return () => setLoaded(false);
	}, [localSearchparams]);

	// Configure gesture based on direction
	const backGesture = Gesture.Pan()
		.activeOffsetX(direction === "left" || direction === "right" ? [-20, 20] : [-100, 100])
		.activeOffsetY(direction === "up" || direction === "down" ? [-20, 20] : [-100, 100])
		.onUpdate((event) => {
			switch (direction) {
				case "left":
					translateX.value = Math.max(0, -event.translationX);
					break;
				case "right":
					translateX.value = Math.max(0, event.translationX);
					break;
				case "up":
					translateY.value = Math.max(0, -event.translationY);
					break;
				case "down":
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
				case "up":
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
				case "down":
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
			case "up":
				return {
					flex: 1,
					transform: [{ translateY: -translateY.value }],
				};
			case "down":
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

	const panel = useMemo(() => {
		return <ActivityScreenTopicPanel params={params as ActivityScreenParams & { listTopics: TopicMethods }} />;
	}, [params]);

	const getEnteringAnimation = () => {
		switch (direction) {
			case "left":
				return SlideInLeft;
			case "right":
				return SlideInRight;
			case "up":
				return SlideInUp;
			case "down":
				return SlideInDown;
			default:
				return SlideInDown;
		}
	};

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: false,
					presentation: "transparentModal",
				}}
			/>
			<GestureDetector gesture={backGesture}>
				<Animated.View entering={getEnteringAnimation()} style={animatedStyle}>
					<View className="flex-1 bg-background">
						<View className="px-4 border-b border-border">
							<View className="h-14 flex-row items-center">
								<Text className="text-lg font-semibold">Activities</Text>
							</View>
							<HistorySection
								onPress={(i) => {
									navigate({ ...i.params, title: i.title });
								}}
							/>
						</View>
						<View className="flex-1">{loaded ? panel : <TopicSkeleton />}</View>
					</View>
				</Animated.View>
			</GestureDetector>
		</>
	);
}

function ActivityScreenTopicPanel({
	params,
}: {
	params: ActivityScreenParams & {
		listTopics: TopicMethods;
	};
}) {
	let props = null;
	if ("id" in params) props = { ...params, id: Number.parseInt(params.id) };
	props ??= params;

	const state = useTopicsCache();
	const { get, set } = state;
	const id = getIdFromParams(params as ActivityScreenBaseParams);
	const initialItems = get(id) ?? undefined;

	const handleItemsChange = useCallback(
		(items: TopicCardItem[]) => {
			set(id, items);
		},
		[id, set],
	);

	const commonProps = {
		disablePull2Refresh: true,
		initialItems,
		onItemsChange: handleItemsChange,
		title: params.title,
	};

	if (props.listTopics === "listLatestTopics" || props.listTopics === "listUnreadTopics")
		return <TopicPanel {...(props as TopicPanelComponentProps)} {...commonProps} />;

	if (props.listTopics === "listCategoryTopics")
		return <CategoryTopicPanel {...(props as WithTopicPanelComponentProps<FlattenParams<CategoryTopicPanelProps>>)} {...commonProps} />;

	if (props.listTopics === "getTag")
		return <TagTopicPanel {...(props as WithTopicPanelComponentProps<FlattenParams<TagTopicPanelProps>>)} {...commonProps} />;

	throw Error("ActivityScreen(getTopicPanel): Invalid params");
}
