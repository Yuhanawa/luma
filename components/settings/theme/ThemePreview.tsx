import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import type { colors } from "~/lib/initialColorScheme";

interface ThemePreviewProps {
	colors: colors;
	className?: string;
}

export function ThemePreview({ colors, className }: ThemePreviewProps) {
	const { t } = useTranslation();

	// Memoize styles to prevent recalculation on each render
	const styles = useMemo(
		() => ({
			background: { backgroundColor: colors.background },
			foreground: { color: colors.foreground },
			primary: { backgroundColor: colors.primary },
			primaryForeground: { color: colors.primaryForeground },
			secondary: { backgroundColor: colors.secondary },
			secondaryForeground: { color: colors.secondaryForeground },
			accent: { backgroundColor: colors.accent },
			accentForeground: { color: colors.accentForeground },
			destructive: { backgroundColor: colors.destructive },
			destructiveForeground: { color: colors.destructiveForeground },
			muted: { backgroundColor: colors.muted },
			mutedForeground: { color: colors.mutedForeground },
			card: { backgroundColor: colors.card },
			cardForeground: { color: colors.cardForeground },
		}),
		[colors],
	);

	// Memoize translations to prevent recalculation on each render
	const translations = useMemo(
		() => ({
			preview: t("settings.theme.preview"),
			textSample: t("settings.theme.textSample"),
			primary: t("settings.theme.primary"),
			secondary: t("settings.theme.secondary"),
			accent: t("settings.theme.accent"),
			destructive: t("settings.theme.destructive"),
			muted: t("settings.theme.muted"),
			card: t("settings.theme.card"),
		}),
		[t],
	);

	return (
		<View className={`p-4 border border-border rounded-lg ${className || ""}`} accessible={true} accessibilityLabel={translations.preview}>
			<Text className="font-medium mb-3">{translations.preview}</Text>

			{/* Background & Text */}
			<View className="p-3 rounded-lg mb-3" style={styles.background}>
				<Text style={styles.foreground}>{translations.textSample}</Text>
			</View>

			{/* Primary & Secondary */}
			<View className="flex-row space-x-2 mb-3">
				<View className="flex-1 p-2 rounded-lg" style={styles.primary}>
					<Text style={styles.primaryForeground}>{translations.primary}</Text>
				</View>
				<View className="flex-1 p-2 rounded-lg" style={styles.secondary}>
					<Text style={styles.secondaryForeground}>{translations.secondary}</Text>
				</View>
			</View>

			{/* Accent & Destructive */}
			<View className="flex-row space-x-2 mb-3">
				<View className="flex-1 p-2 rounded-lg" style={styles.accent}>
					<Text style={styles.accentForeground}>{translations.accent}</Text>
				</View>
				<View className="flex-1 p-2 rounded-lg" style={styles.destructive}>
					<Text style={styles.destructiveForeground}>{translations.destructive}</Text>
				</View>
			</View>

			{/* Muted & Card */}
			<View className="flex-row space-x-2">
				<View className="flex-1 p-2 rounded-lg" style={styles.muted}>
					<Text style={styles.mutedForeground}>{translations.muted}</Text>
				</View>
				<View className="flex-1 p-2 rounded-lg" style={styles.card}>
					<Text style={styles.cardForeground}>{translations.card}</Text>
				</View>
			</View>
		</View>
	);
}
