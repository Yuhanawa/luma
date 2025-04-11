import { router } from "expo-router";
import { ChevronLeft, RefreshCw, Share2 } from "lucide-react-native";
import type { ReactElement, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";

type NavBarProps = {
	content?: string | ReactElement | false | ReactNode | undefined;
	onShare?: () => void;
	onRefresh?: () => void;
};

export const NavBar = ({ content, onShare, onRefresh }: NavBarProps) => {
	return (
		<View className="flex-row items-center justify-between px-4 py-3 bg-card rounded-b-md">
			<Pressable onPress={() => router.back()} className="flex-row items-center">
				<ChevronLeft size={24} className="text-foreground" />
				{typeof content === "string" ? (
					<Text className="ml-2 text-base font-medium text-foreground" numberOfLines={1} style={{ maxWidth: "80%" }}>
						{content}
					</Text>
				) : (
					content
				)}
			</Pressable>

			<View className="flex-row items-center gap-6">
				<Pressable onPress={onRefresh}>
					<RefreshCw size={20} className="text-foreground" />
				</Pressable>

				<Pressable onPress={onShare}>
					<Share2 size={20} className="text-foreground" />
				</Pressable>
			</View>
		</View>
	);
};
