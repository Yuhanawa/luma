import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { LanguageSwitcher } from "~/components/LanguageSwitcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

import { Text } from "~/components/ui/text";

export function LanguageSettings() {
	const { t } = useTranslation();

	return (
		<>
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>{t("settings.language.title", "Language")}</CardTitle>
					<CardDescription>{t("settings.language.description", "Choose your preferred language")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<View className="flex-row items-center justify-between">
						<Text>{t("settings.language.select", "Select language")}</Text>
						<LanguageSwitcher />
					</View>
				</CardContent>
			</Card>
		</>
	);
}
