import type { ReactNode } from "react";
import { Animated, Pressable, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import type { SwipeableProps } from "react-native-gesture-handler/lib/typescript/components/Swipeable";
import { Text } from "~/components/ui/text";

export type SwipeAction<T> = {
	text: string;
	onPress: (item?: T) => void;
	backgroundColor?: string;
	icon?: ReactNode;
};

type SwipeableWrapperProps<T> = {
	children: ReactNode;
	enableSwipe?: boolean;
	swipe?: SwipeAction<T>[];
	item?: T;
} & Omit<SwipeableProps, "children">;

export const SwipeableWrapper = <T,>({ children, enableSwipe = true, swipe, item, ...swipeableProps }: SwipeableWrapperProps<T>) => {
	// If swipe is undefined and enableSwipe is false, or swipe is an empty array, don't enable swipe
	const shouldEnableSwipe = swipe && swipe.length > 0 && enableSwipe;

	if (!shouldEnableSwipe) {
		return <>{children}</>;
	}

	const renderRightActions = (
		progress: Animated.AnimatedInterpolation<number>,
		dragX: Animated.AnimatedInterpolation<number>,
		swipeable: Swipeable,
	) => {
		if (!swipe || swipe.length === 0) {
			return null;
		}

		const translateX = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [100, 0],
		});

		return (
			<View className="flex-row pt-3 pb-6">
				{swipe.map((action) => (
					<Animated.View key={action.text} style={{ transform: [{ translateX }] }}>
						<Pressable
							className={`justify-center items-center w-20 h-full${action.backgroundColor ? "" : "bg-popover"}`}
							style={action.backgroundColor && { backgroundColor: action.backgroundColor }}
							onPress={() => {
								action.onPress(item);
								swipeable.close();
							}}
						>
							{action.icon}
							<Text className="text-popover-foreground text-xs mt-1">{action.text}</Text>
						</Pressable>
					</Animated.View>
				))}
			</View>
		);
	};

	return (
		<GestureHandlerRootView>
			{/*
      			Why use the deprecated version:
				the reanimated version has bugs, it cost my many time, fuck you!
				1. renderRightActions not firing
				similar issue: Swipeable renderLeftActions button not firing: https://github.com/software-mansion/react-native-gesture-handler/issues/3223
				2. ReanimatedSwipeable generating warnings: https://github.com/software-mansion/react-native-gesture-handler/issues/3170
				issue closed and fixed, but it still happens on me
      		*/}
			<Swipeable
				friction={2}
				overshootRight={false}
				renderRightActions={swipe ? renderRightActions : swipeableProps.renderRightActions}
				{...swipeableProps}
			>
				{children}
			</Swipeable>
		</GestureHandlerRootView>
	);
};
