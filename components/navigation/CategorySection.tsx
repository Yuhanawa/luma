import { ChevronRight } from "lucide-react-native";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import { Button } from "../ui/button";

interface CategorySectionProps {
	title: string;
	items: Array<{
		id: string;
		text: string;
	}>;
	onItemPress?: (id: string) => void;
	onViewMore?: () => void;
	delay?: number;
}

export function NavigationSection({ title, items, onItemPress, onViewMore, delay = 0 }: CategorySectionProps) {
	return (
		<Animated.View entering={FadeIn.delay(delay)} className="mb-4 mx-4 p-4 bg-muted/50 rounded-lg">
			<View className="flex-row items-center justify-between mb-3">
				<Text className="text-lg font-semibold">{title}</Text>
				<Button variant="ghost" size="sm" onPress={onViewMore} className="flex-row items-center">
					<Text className="text-sm text-muted-foreground mr-1">view more</Text>
					<ChevronRight size={16} className="text-muted-foreground" />
				</Button>
			</View>

			<View className="flex-row flex-wrap gap-3">
				{items.map((item) => (
					<Button key={item.id} variant="outline" size="sm" className="flex-1 min-w-[45%]" onPress={() => onItemPress?.(item.id)}>
						<Text className="text-sm">{item.text}</Text>
					</Button>
				))}
			</View>
		</Animated.View>
	);
}
