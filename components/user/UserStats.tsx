import { Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import { ChevronRight } from "~/lib/icons/ChevronRight";

interface StatItemProps {
	value: number;
	label: string;
}

function StatItem({ value, label }: StatItemProps) {
	return (
		<View className="items-center">
			<Text className="text-2xl font-bold">{value}</Text>
			<Text className="text-sm text-muted-foreground">{label}</Text>
		</View>
	);
}

export function UserStats() {
	return (
		<Animated.View entering={FadeIn.delay(200)} className="mt-4 mb-4">
			<Pressable
				className="p-4 bg-muted/50 rounded-lg"
				onPress={() => {
					// Handle stats press
				}}
			>
				<View className="flex-row items-center justify-between mb-4">
					<Text className="text-lg">User's some stats</Text>
					<ChevronRight className="text-muted-foreground" size={20} />
				</View>

				<View className="flex-row justify-between">
					<StatItem value={42} label="Days visited" />
					<StatItem value={128} label="Time read" />
					<StatItem value={256} label="Topics read" />
					<StatItem value={512} label="Likes received" />
				</View>
			</Pressable>
		</Animated.View>
	);
}
