import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export const TopicSkeleton = () => {
	return (
		<Animated.View entering={FadeIn} className="flex-1 p-4 bg-background">
			{Array.from({ length: 5 }).map((_, i) => (
				<View
					key={`TopicSkeleton-${
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						i
					}`}
					className="h-24 mb-4 rounded-lg bg-muted/10 animate-pulse"
				/>
			))}
		</Animated.View>
	);
};
