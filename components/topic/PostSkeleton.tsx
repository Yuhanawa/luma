import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Skeleton } from "~/components/ui/skeleton";

export const PostSkeleton = () => {
	return (
		<Animated.View entering={FadeIn} className="flex-1 p-4">
			{Array.from({ length: 4 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<View key={i} className="p-4 mb-2 bg-card rounded-md">
					<View className="flex-row justify-between items-center mb-3">
						<View className="flex-row items-center">
							<Skeleton className="h-8 w-8 rounded-full" />
							<View className="ml-2">
								<Skeleton className="h-4 w-24 mb-1" />
								<Skeleton className="h-3 w-16" />
							</View>
						</View>
						<Skeleton className="h-3 w-6" />
					</View>
					<Skeleton className="h-20 w-full mb-3" />
					<View className="flex-row justify-end">
						<Skeleton className="h-4 w-16 mr-4" />
						<Skeleton className="h-4 w-16 mr-4" />
						<Skeleton className="h-4 w-4" />
					</View>
				</View>
			))}
		</Animated.View>
	);
};
