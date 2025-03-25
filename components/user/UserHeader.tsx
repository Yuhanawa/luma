import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { IdCard, Info, Settings } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export function UserHeader() {
	const router = useRouter();
	const { colors } = useTheme();

	return (
		<View className="flex-row items-center justify-between px-1 mb-4">
			<Text className="text-xl font-semibold">My Profile</Text>

			<View className="flex-row gap-1">
				<Button
					variant="ghost"
					size="icon"
					// onPress={() => router.push("/help")}
				>
					<Info size={22} color={colors.text} />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					onPress={() => {
						// Handle logout
					}}
				>
					{/* IDCard icon is visually smaller, so use a larger size. */}
					<IdCard size={24} color={colors.text} />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					// onPress={() => router.push("/settings")}
				>
					<Settings size={22} color={colors.text} />
				</Button>
			</View>
		</View>
	);
}
