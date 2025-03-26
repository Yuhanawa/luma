// import { RefreshCw } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { RefreshCw } from "~/lib/icons";

export const ErrorRetry = ({ onRetry }: { onRetry: () => void }) => {
	return (
		<View className="flex-1 items-center justify-center p-4">
			<Text className="text-foreground mb-4">Failed to load topics</Text>
			<Pressable onPress={onRetry} className="flex-row items-center bg-primary px-4 py-2 rounded-md">
				<RefreshCw size={16} className="mr-2 text-primary-foreground" />
				<Text className="text-primary-foreground">Retry</Text>
			</Pressable>
		</View>
	);
};
