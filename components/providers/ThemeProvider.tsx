import { DarkTheme, DefaultTheme, ThemeProvider as NativeThemeProvider } from "@react-navigation/native";
import { createContext, useContext, useEffect } from "react";
import { View, useColorScheme as useNativeColorScheme } from "react-native";
import type { ColorScheme } from "~/lib/initialColorShame";
import { type ColorThemeState, getThemeVars, useColorThemeStore } from "~/store/colorThemeStore";

type ThemeContextType = ColorThemeState;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ColorThemeProviderProps = {
	children: React.ReactNode;
	nativeThemeProviderValue?: ReactNavigation.Theme;
};

export function ThemeProvider({ children, nativeThemeProviderValue, ...rest }: ColorThemeProviderProps) {
	const nativeColorScheme = useNativeColorScheme();
	const colorThemeStore = useColorThemeStore();
	const { followSystem, setColorScheme } = colorThemeStore;
	const themeStyle = getThemeVars(colorThemeStore.colors);

	useEffect(() => {
		if (followSystem && nativeColorScheme) setColorScheme(nativeColorScheme as ColorScheme);
	}, [nativeColorScheme, followSystem, setColorScheme]);

	return (
		<NativeThemeProvider value={nativeThemeProviderValue ?? (nativeColorScheme === "dark" ? DarkTheme : DefaultTheme)}>
			<ThemeContext.Provider value={colorThemeStore}>
				<View style={themeStyle} className="flex-1" {...rest}>
					{children}
				</View>
			</ThemeContext.Provider>
		</NativeThemeProvider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) throw new Error("useColorTheme must be used within a ColorThemeProvider");

	return context;
}
