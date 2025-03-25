import type { ReactNode } from "react";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import type { SwipeableProps } from "react-native-gesture-handler/lib/typescript/components/Swipeable";

type SwipeableWrapperProps = {
	children: ReactNode;
	enableSwipe?: boolean;
} & Omit<SwipeableProps, "children">;

export const SwipeableWrapper = ({ children, enableSwipe = true, ...swipeableProps }: SwipeableWrapperProps) => {
	if (!enableSwipe) {
		return <>{children}</>;
	}

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
			<Swipeable friction={2} overshootRight={false} {...swipeableProps}>
				{children}
			</Swipeable>
		</GestureHandlerRootView>
	);
};
