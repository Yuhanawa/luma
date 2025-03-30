import { ChevronRight } from "lucide-react-native";
import { type GestureResponderEvent, Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Text } from "~/components/ui/text";

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

interface UserStatsProps {
	stats: StatItemProps[];
	onPress?: ((event: GestureResponderEvent) => void) | null | undefined;
}

export function UserStats({ stats, onPress }: UserStatsProps) {
	return (
		<Animated.View entering={FadeIn.delay(200)} className="mt-4 mb-4">
			<Pressable className="p-4 bg-muted/50 rounded-lg" onPress={onPress}>
				<View className="flex-row items-center justify-between mb-4">
					<Text className="text-lg">User's some stats</Text>
					<ChevronRight className="text-muted-foreground" size={20} />
				</View>

				<View className="flex-row justify-between">
					{stats.map((stat) => (
						<StatItem key={stat.label} value={stat.value} label={stat.label} />
					))}
				</View>
			</Pressable>
		</Animated.View>
	);
}
