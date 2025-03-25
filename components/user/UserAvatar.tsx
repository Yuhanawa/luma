import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { cn } from "~/lib/utils";

interface UserAvatarProps {
	size?: number;
	color?: string;
	className?: string;
}

export function UserAvatar({ size = 80, color = "#FFC0CB", className }: UserAvatarProps) {
	return (
		<Animated.View
			entering={FadeIn}
			className={cn("rounded-full", className)}
			style={{
				width: size,
				height: size,
				backgroundColor: color,
			}}
		/>
	);
}
