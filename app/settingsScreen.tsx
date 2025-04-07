import { Stack } from "expo-router";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { LanguageSettings } from "~/components/settings/language/LanguageSetings";
import { ThemeSettings } from "~/components/settings/theme/ThemeSettings";

export default function SettingsScreen() {
	return (
		<>
			<Stack.Screen
				options={{
					headerShown: false,
				}}
			/>
			<ScrollView className="flex-1">
				<LanguageSettings />
				<ThemeSettings />
			</ScrollView>
		</>
	);
}
