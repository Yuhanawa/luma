import { History } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { type ActivityHistoryItem, useActivityHistoryStore } from "~/store/activityHistoryStore";

export function HistorySection({ onPress }: { onPress: (item: ActivityHistoryItem) => void }) {
	const { history } = useActivityHistoryStore();

	if (history.length <= 1) {
		return null;
	}

	return (
		<View className="mb-4">
			<View className="flex-row items-center mb-2">
				<History size={16} className="text-muted-foreground mr-2" />
				<Text className="text-sm font-medium text-muted-foreground">Recent History</Text>
			</View>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
				{history.slice(1).map((item) => (
					<Button key={item.id} variant="outline" size="sm" className="mr-2 min-w-[120px]" onPress={() => onPress(item)}>
						<Text className="text-xs" numberOfLines={1}>
							{item.title}
						</Text>
					</Button>
				))}
			</ScrollView>
		</View>
	);
}
