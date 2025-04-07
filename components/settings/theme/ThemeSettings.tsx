import { Palette } from "lucide-react-native";
import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Text } from "~/components/ui/text";
import { ThemeEditor } from "./ThemeEditor";
import { ThemeSelector } from "./ThemeSelector";
import { useTheme } from "~/components/providers/ThemeProvider";

export function ThemeSettings() {
	const { t } = useTranslation();
	const { followSystem, setFollowSystem, customThemes } = useTheme();

	const [editingTheme, setEditingTheme] = useState<string | null>(null);

	const handleEditorClosed = useCallback(() => {
		setEditingTheme(null);
	}, []);

	const handleCreateNewTheme = useCallback(() => {
		const name = "New Theme";
		let counter = 1;
		while (customThemes[`${name} ${counter}`]) counter++;
		setEditingTheme(`${name} ${counter}`);
	}, [customThemes]);

	return (
		<>
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>{t("settings.theme.title", "Theme")}</CardTitle>
					<CardDescription>{t("settings.theme.description", "Customize the app appearance")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<View className={"space-y-4"}>
						{/* System Theme Toggle */}
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Palette size={20} className="mr-2 text-foreground" />
								<Label>
									<Text>{t("settings.theme.systemDefault", "Use system theme")}</Text>
								</Label>
							</View>
							<Switch checked={followSystem} onCheckedChange={setFollowSystem} />
						</View>
						<ThemeSelector
							followSystem={followSystem}
							customThemes={customThemes}
							onCreateTheme={handleCreateNewTheme}
							onEditTheme={setEditingTheme}
						/>
					</View>
				</CardContent>
				<CardFooter className="bg-transparent" />
			</Card>

			{editingTheme && <ThemeEditor theme={editingTheme} onClosed={handleEditorClosed} />}
		</>
	);
}
