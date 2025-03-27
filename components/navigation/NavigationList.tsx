import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

interface NavigationItem {
	id: string;
	text: string;
	description?: string;
	count?: number;
	icon?: React.ReactNode;
}

interface NavigationListProps {
	items: NavigationItem[];
	onItemPress?: (id: string) => void;
}

export function NavigationList({ items, onItemPress }: NavigationListProps) {
	const renderItem = ({ item, index }: { item: NavigationItem; index: number }) => (
		<Animated.View entering={FadeInDown.delay(index * 50).springify()} className="mb-3">
			<Button variant="outline" className="p-4 flex-row items-center justify-between" onPress={() => onItemPress?.(item.id)}>
				<View className="flex-row items-center flex-1">
					{item.icon && <View className="mr-3">{item.icon}</View>}
					<View className="flex-1">
						<Text className="text-lg font-semibold mb-1">{item.text}</Text>
						{item.description && <Text className="text-sm text-muted-foreground">{item.description}</Text>}
					</View>
				</View>
				{item.count !== undefined && (
					<View className="ml-4 px-2 py-1 bg-primary/10 rounded-full">
						<Text className="text-xs font-medium text-primary">{item.count}</Text>
					</View>
				)}
			</Button>
		</Animated.View>
	);

	return (
		<FlashList
			data={items}
			renderItem={renderItem}
			estimatedItemSize={80}
			contentContainerStyle={{ padding: 16 }}
			showsVerticalScrollIndicator={false}
		/>
	);
}
