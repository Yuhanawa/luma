import * as NavigationBar from "expo-navigation-bar";
import { Platform } from "react-native";

export async function setAndroidNavigationBar(theme: "light" | "dark") {
	if (Platform.OS !== "android") return;
	await NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");
	await NavigationBar.setBackgroundColorAsync(theme === "dark" ? "hsl(240 10% 3.9%)" : "hsl(0 0% 100%)");
}
