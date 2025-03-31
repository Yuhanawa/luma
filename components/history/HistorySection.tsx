import { History } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { go2ActivityScreen } from "~/app/activityScreen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useActivityHistoryStore } from "~/store/activityHistoryStore";

export function HistorySection() {
	const { history } = useActivityHistoryStore();

	if (history.length === 0) {
		return null;
	}

	return (
		<View className="mb-4">
			<View className="flex-row items-center mb-2">
				<History size={16} className="text-muted-foreground mr-2" />
				<Text className="text-sm font-medium text-muted-foreground">Recent History</Text>
			</View>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
				{history.slice(0, 10).map((item) => (
					<Button
						key={item.id}
						variant="outline"
						size="sm"
						className="mr-2 min-w-[120px]"
						onPress={() => go2ActivityScreen(item.params, item.title)}
					>
						<Text className="text-xs" numberOfLines={1}>
							{item.title}
						</Text>
					</Button>
				))}
			</ScrollView>
		</View>
	);
}
