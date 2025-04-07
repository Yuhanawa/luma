import { Save, Trash } from "lucide-react-native";
import React, { useCallback, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import ColorPicker, { Panel1, HueSlider, OpacitySlider, Preview, InputWidget, type ColorFormatsObject } from "reanimated-color-picker";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import colorSchemes, { builtInThemeNames, type colors } from "~/lib/initialColorScheme";
import { useTheme } from "../../providers/ThemeProvider";
import { ThemePreview } from "./ThemePreview";

interface ThemeEditorProps {
	theme: string;
	onClosed: () => void;
}

export function ThemeEditor({ theme, onClosed }: ThemeEditorProps) {
	const { t } = useTranslation();
	const { customThemes, updateCustomTheme } = useTheme();
	const [colorScheme, setColorScheme] = useState<colors>(
		builtInThemeNames.includes(theme) ? { ...colorSchemes[theme] } : { ...(customThemes[theme] ?? colorSchemes.light) },
	);
	const [selectedColorKey, setSelectedColorKey] = useState<keyof colors | null>(null);
	const [open, onOpenChange] = useState(true);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [newThemeName, setNewThemeName] = useState(theme);

	const handleConfirmDelete = useCallback(() => {
		updateCustomTheme(theme, null);
		setShowDeleteConfirm(false);
		onOpenChange(false);
		onClosed();
	}, [theme, onClosed, updateCustomTheme]);

	const handleSaveTheme = useCallback(() => {
		const newName = newThemeName.trim();
		updateCustomTheme(newName, { ...colorScheme });
		if (theme !== newName) updateCustomTheme(theme, null);
		onOpenChange(false);
		onClosed();
	}, [newThemeName, theme, updateCustomTheme, onClosed, colorScheme]);

	const translations = useMemo(
		() => ({
			editTheme: t("settings.theme.editTheme", "Edit Theme"),
			createTheme: t("settings.theme.createTheme", "Create Theme"),
			editDescription: t("settings.theme.editDescription", "Customize colors for your theme"),
			themeName: t("settings.theme.themeName", "Theme name"),
			selectColor: t("settings.theme.selectColor", "Select Color to Edit"),
			deleteTheme: t("settings.theme.deleteTheme", "Delete Theme"),
			deleteConfirmation: t(
				"settings.theme.deleteConfirmation",
				"Are you sure you want to delete this theme? This action cannot be undone.",
			),
			cancel: t("common.cancel", "Cancel"),
			save: t("common.save", "Save"),
			delete: t("common.delete", "Delete"),
		}),
		[t],
	);

	const handleColorChange = useCallback(
		({ hsl }: ColorFormatsObject) => selectedColorKey && setColorScheme((prev) => ({ ...prev, [selectedColorKey]: hsl })),
		[selectedColorKey],
	);

	const selectedColor = useMemo(() => {
		if (!selectedColorKey) return "#FFFFFF";
		return colorScheme[selectedColorKey];
	}, [selectedColorKey, colorScheme]);

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>
							<Text>{translations.editTheme}</Text>
						</DialogTitle>
						<DialogDescription>
							<Text>{translations.editDescription}</Text>
						</DialogDescription>
					</DialogHeader>

					<ScrollView className="max-h-[500px]">
						<View className="space-y-4 py-2">
							<Input
								placeholder={translations.themeName}
								value={newThemeName}
								onChangeText={setNewThemeName}
								accessibilityLabel={translations.themeName}
							/>

							{/* Color selection tabs */}
							<View>
								<Text className="font-medium mb-2">{translations.selectColor}</Text>
								<View className="flex-row flex-wrap">
									{Object.keys(colorScheme).map((colorKey) => (
										<TouchableOpacity
											key={colorKey}
											className={`mr-2 mb-2 px-3 py-1 rounded-full ${selectedColorKey === colorKey ? "bg-primary" : "bg-secondary"}`}
											onPress={() => setSelectedColorKey(colorKey as keyof colors)}
											accessibilityLabel={colorKey}
											accessibilityState={{ selected: selectedColorKey === colorKey }}
										>
											<View className="flex-row items-center">
												<View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: colorScheme[colorKey as keyof colors] }} />
												<Text className={selectedColorKey === colorKey ? "text-primary-foreground" : "text-secondary-foreground"}>
													{colorKey}
												</Text>
											</View>
										</TouchableOpacity>
									))}
								</View>
							</View>

							{/* Color picker */}
							{selectedColorKey && (
								<View className="border border-border rounded-lg p-4">
									<Text className="font-medium mb-2">{selectedColorKey}</Text>
									<ColorPicker value={selectedColor} onCompleteJS={handleColorChange} style={{ width: "100%" }}>
										<Preview hideText />
										<Panel1 />
										<HueSlider />
										<OpacitySlider />
										<InputWidget inputStyle={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 8 }} />
									</ColorPicker>
								</View>
							)}

							{/* Theme preview */}
							<ThemePreview colors={colorScheme} />
						</View>
					</ScrollView>

					<DialogFooter>
						<Button variant="destructive" onPress={() => setShowDeleteConfirm(true)} accessibilityLabel={translations.delete}>
							<Trash size={16} className="mr-2" />
							<Text>{translations.delete}</Text>
						</Button>

						<View className="flex-row space-x-2">
							<DialogClose asChild>
								<Button variant="outline" accessibilityLabel={translations.cancel}>
									<Text>{translations.cancel}</Text>
								</Button>
							</DialogClose>
							<Button disabled={!newThemeName.trim()} onPress={handleSaveTheme} accessibilityLabel={translations.save}>
								<Save size={16} className="mr-2" />
								<Text>{translations.save}</Text>
							</Button>
						</View>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Theme Confirmation Dialog */}
			<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<Text>{translations.deleteTheme}</Text>
						</DialogTitle>
						<DialogDescription>
							<Text>{translations.deleteConfirmation}</Text>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline" accessibilityLabel={translations.cancel}>
								<Text>{translations.cancel}</Text>
							</Button>
						</DialogClose>
						<Button variant="destructive" onPress={handleConfirmDelete} accessibilityLabel={translations.delete}>
							<Trash size={16} className="mr-2" />
							<Text>{translations.delete}</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
