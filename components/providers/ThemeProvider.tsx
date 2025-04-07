import { DefaultTheme, ThemeProvider as NativeThemeProvider } from "@react-navigation/native";
import { createContext, useContext, useEffect, useMemo } from "react";
import { View, useColorScheme as useNativeColorScheme } from "react-native";
import { type ColorThemeState, getThemeVars, useThemeStore } from "~/store/themeStore";

type ThemeContextType = ColorThemeState;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ColorThemeProviderProps = {
	children: React.ReactNode;
	nativeThemeProviderValue?: ReactNavigation.Theme;
	className?: string;
};

export function ThemeProvider({ children, nativeThemeProviderValue, className, ...rest }: ColorThemeProviderProps) {
	const nativeColorScheme = useNativeColorScheme();
	const colorThemeStore = useThemeStore();
	const { init, followSystem, setTheme, colors } = colorThemeStore;
	useEffect(init, []);

	useEffect(() => {
		if (followSystem && nativeColorScheme) setTheme(nativeColorScheme);
	}, [nativeColorScheme, followSystem, setTheme]);

	const themeStyle = useMemo(() => getThemeVars(colors), [colors]);
	const nativeThemeValue = useMemo(() => {
		return {
			...DefaultTheme,
			colors: {
				primary: colors.primary,
				background: colors.background,
				card: colors.card,
				text: colors.foreground,
				border: colors.border,
				notification: colors.popover,
			},
		};
	}, [colors]);

	return (
		<NativeThemeProvider value={nativeThemeValue}>
			<ThemeContext.Provider value={colorThemeStore}>
				<View style={themeStyle} className={`flex-1 bg-transparent ${className ?? ""}`} {...rest}>
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
