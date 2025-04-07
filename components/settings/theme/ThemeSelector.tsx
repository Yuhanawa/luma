import { Plus } from "lucide-react-native";
import type React from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import { type ThemeName, builtInThemeNames, type colors } from "~/lib/initialColorScheme";
import { ThemeCard } from "./ThemeCard";

interface ThemeSelectorProps {
	followSystem: boolean;
	customThemes: Record<ThemeName, colors>;
	onCreateTheme: () => void;
	onEditTheme: (theme: string) => void;
}

export function ThemeSelector({ followSystem, customThemes, onCreateTheme, onEditTheme }: ThemeSelectorProps) {
	const { t } = useTranslation();

	const handleCreateTheme = useCallback(() => onCreateTheme(), [onCreateTheme]);

	const customThemeCards = useMemo(() => {
		const names = Object.keys(customThemes);
		return names.length === 0 ? (
			<Text className="text-muted-foreground text-center py-4">{t("settings.theme.noCustomThemes")}</Text>
		) : (
			names.map((name) => <ThemeCard key={name} name={name} showToolbar onEditTheme={onEditTheme} />)
		);
	}, [customThemes, t, onEditTheme]);

	if (followSystem) return null;

	return (
		<View className="space-y-6">
			{/* Basic Themes */}
			<View className="space-y-2">
				<Text className="font-medium">{t("settings.theme.basic")}</Text>
				<View className="flex w-full mb-4 border-2 border-border">
					{builtInThemeNames.map((name) => (
						<ThemeCard key={name} name={name} />
					))}
				</View>
			</View>

			{/* Custom Themes */}
			<View className="space-y-2">
				<View className="flex-row justify-between items-center mb-2">
					<Text className="font-medium">{t("settings.theme.custom")}</Text>
					<Pressable className="flex-row items-center" onPress={handleCreateTheme} accessibilityLabel={t("settings.theme.create")}>
						<Plus size={16} className="mr-1 text-primary" />
						<Text className="text-primary">{t("settings.theme.create")}</Text>
					</Pressable>
				</View>

				<View className="flex w-full border-2 border-border">{customThemeCards}</View>
			</View>
		</View>
	);
}
