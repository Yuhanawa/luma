import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

interface UserInfoProps {
	username: string;
	userId: string;
	level: number;
	bio: string;
}

export function UserInfo({ username, userId, level, bio }: UserInfoProps) {
	return (
		<Animated.View entering={FadeIn.delay(100)} className="flex-1">
			<View className="flex-row items-center justify-between">
				<View>
					<Text className="text-xl font-bold">{username}</Text>
					<Text className="text-sm text-muted-foreground">@{userId}</Text>
					<Text className="text-sm text-primary">Level {level}</Text>
				</View>
				<Button variant="outline" size="sm">
					<Text>Edit</Text>
				</Button>
			</View>
			<Text className="mt-2 text-muted-foreground">{bio}</Text>
		</Animated.View>
	);
}
