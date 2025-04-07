import { Copy, Edit, Flower, Trash } from "lucide-react-native";
import React, { type ComponentProps, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useTheme } from "~/components/providers/ThemeProvider";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";
import colorSchemes, { builtInThemeNames } from "~/lib/initialColorScheme";

interface ThemeCardProps extends ComponentProps<typeof Pressable> {
	name: string;
	showToolbar?: boolean;
	onEditTheme?: (theme: string) => void;
	onDuplicateTheme?: (theme: string) => void;
	onDeleteTheme?: (theme: string) => void;
}

export function ThemeCard({ name, showToolbar, onEditTheme, onDuplicateTheme, onDeleteTheme, ...props }: ThemeCardProps) {
	const { theme, setTheme, customThemes, updateCustomTheme } = useTheme();
	const colorScheme = useMemo(() => (builtInThemeNames.includes(name) ? colorSchemes[name] : customThemes[name]), [name, customThemes]);
	if (!colorScheme) return null;

	const { t } = useTranslation();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const selected = useMemo(() => name === theme, [name, theme]);

	const handleThemeChange = useCallback(() => setTheme(name), [setTheme, name]);
	const handleDuplicateTheme = useCallback(
		(name: string) => {
			let newName = `${name} Copy`;

			let counter = 1;
			while (customThemes[newName]) {
				newName = `${name} Copy ${counter}`;
				counter++;
			}

			updateCustomTheme(newName, { ...colorScheme });
		},
		[customThemes, updateCustomTheme, colorScheme],
	);
	const handleConfirmDelete = useCallback(() => {
		updateCustomTheme(name, null);
		setShowDeleteConfirm(false);
	}, [name, updateCustomTheme]);

	return (
		<>
			<View className="flex-1  p-4" style={{ backgroundColor: colorScheme.background }}>
				<Pressable
					className={"flex-1 border rounded-md border-border"}
					onPress={handleThemeChange}
					style={{ backgroundColor: colorScheme.card, borderColor: colorScheme.border }}
					accessibilityState={{ selected }}
					{...props}
				>
					<View className="flex-1 space-y-2">
						<View className="flex-row justify-between items-center px-2" style={{ backgroundColor: colorScheme.card }}>
							<View className="p-2 bolder rounded-sm" style={{ backgroundColor: colorScheme.popover }}>
								<Text className={selected ? "font-bold" : ""} style={{ color: colorScheme.popoverForeground }}>
									{selected && <Flower size={14} className="text-accent" />}
									{t(`settings.theme.${name}`, name)}
								</Text>
							</View>
							<View className="w-4 h-4 rounded-full bg-transparent" style={{ backgroundColor: colorScheme.primary }} />
							<View className="w-4 h-4 rounded-full bg-transparent" style={{ backgroundColor: colorScheme.secondary }} />
							<View className="w-4 h-4 rounded-full bg-transparent" style={{ backgroundColor: colorScheme.muted }} />
							<View className="w-4 h-4 rounded-full bg-transparent" style={{ backgroundColor: colorScheme.accent }} />
							<View className="w-4 h-4 rounded-full bg-transparent" style={{ backgroundColor: colorScheme.destructive }} />
							<View className="w-4 h-4 rounded-full bg-transparent" style={{ backgroundColor: colorScheme.border }} />
						</View>
						{showToolbar && (
							<View className="flex-row justify-between gap-4 mt-2">
								{onEditTheme && (
									<Button
										className="flex-row items-center p-2 rounded-sm"
										style={{ backgroundColor: colorScheme.popover }}
										onPress={() => onEditTheme(name)}
									>
										<Edit size={16} className="mr-1" color={colorScheme.primary} />
										<Text style={{ color: colorScheme.primary }}>{t("settings.theme.edit")}</Text>
									</Button>
								)}
								<Button
									className="flex-row items-center p-2 rounded-sm"
									style={{ backgroundColor: colorScheme.popover }}
									onPress={() => (onDuplicateTheme ?? handleDuplicateTheme)(name)}
								>
									<Copy size={16} className="mr-1" color={colorScheme.primary} />
									<Text style={{ color: colorScheme.primary }}>{t("settings.theme.duplicate")}</Text>
								</Button>
								<Button
									className="flex-row items-center p-2 rounded-sm"
									style={{ backgroundColor: colorScheme.popover }}
									onPress={() => (onDeleteTheme ? onDeleteTheme(name) : setShowDeleteConfirm(true))}
								>
									<Trash size={16} className="mr-1" color={colorScheme.primary} />
									<Text style={{ color: colorScheme.primary }}>{t("settings.theme.delete")}</Text>
								</Button>
							</View>
						)}
					</View>
				</Pressable>
			</View>
			{/* Delete Theme Confirmation Dialog */}
			<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<Text>{t("settings.theme.deleteTheme")}</Text>
						</DialogTitle>
						<DialogDescription>
							<Text>{t("settings.theme.deleteConfirmation")}</Text>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline" accessibilityLabel={t("common.cancel")}>
								<Text>{t("common.cancel")}</Text>
							</Button>
						</DialogClose>
						<Button variant="destructive" className="flex-row" onPress={handleConfirmDelete} accessibilityLabel={t("common.delete")}>
							<Trash size={16} className="mr-2 text-destructive-foreground" />
							<Text>{t("common.delete")}</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
