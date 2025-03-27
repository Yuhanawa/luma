import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Skeleton } from "~/components/ui/skeleton";

export const TopicDetailSkeleton = () => {
	return (
		<Animated.View entering={FadeIn} className="flex-1">
			{/* Nav Bar Skeleton */}
			<View className="h-12 px-4 flex-row items-center justify-between border-b border-border">
				<Skeleton className="h-6 w-24" />
				<Skeleton className="h-6 w-6" />
			</View>

			{/* Topic Header Skeleton */}
			<View className="p-4 border-b border-border">
				<Skeleton className="h-7 w-3/4 mb-2" />
				<Skeleton className="h-5 w-1/3 mb-4" />
				<View className="flex-row items-center space-x-2">
					<Skeleton className="h-8 w-8 rounded-full" />
					<Skeleton className="h-4 w-24" />
				</View>
			</View>

			{/* Posts Skeleton */}
			<View className="p-4">
				{Array.from({ length: 4 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<View key={i} className="mb-6">
						<View className="flex-row items-center space-x-2 mb-2">
							<Skeleton className="h-10 w-10 rounded-full" />
							<View>
								<Skeleton className="h-4 w-24 mb-1" />
								<Skeleton className="h-3 w-16" />
							</View>
						</View>
						<Skeleton className="h-20 w-full rounded-md" />
					</View>
				))}
			</View>
		</Animated.View>
	);
};

export const TopicSkeleton = () => {
	return (
		<Animated.View entering={FadeIn} className="flex-1 p-4 bg-background">
			{Array.from({ length: 5 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<View key={i} className="h-24 mb-4 rounded-lg bg-muted/10 animate-pulse" />
			))}
		</Animated.View>
	);
};
