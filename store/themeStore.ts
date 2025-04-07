import AsyncStorage from "@react-native-async-storage/async-storage";
import { vars } from "nativewind";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import colorSchemes, { builtInThemeNames, type ThemeName, type colors } from "~/lib/initialColorScheme";

export const toCssVarName = (name: string): string => {
	return `--${name
		.replace(/([A-Z])/g, "-$1")
		.replace(/([0-9])/g, "-$1")
		.replace(/-+/, "-")
		.toLowerCase()}`;
};

const createCssVarsObject = (colors: colors): Record<string, string> => {
	const cssVars: Record<string, string> = {};

	// biome-ignore lint/complexity/noForEach: <explanation>
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	Object.entries(colors).forEach(([key, value]) => (cssVars[toCssVarName(key)] = value.replace(/hsl\(((\s*?\d+\.?\d*?%?){3})\)/g, "$1")));

	return cssVars;
};

export const getThemeVars = (colors: colors) => {
	return vars(createCssVarsObject(colors));
};

export interface ColorThemeState {
	theme: ThemeName;
	colors: colors;
	followSystem: boolean;
	customThemes: Record<ThemeName, colors>;

	inited: boolean;
	init: () => void;

	setTheme: (scheme: ThemeName) => void;
	setFollowSystem: (follow: boolean) => void;

	updateColorScheme: (themeKey: ThemeName, colorKey: keyof colors, value: string) => void;
	updateCustomTheme: (name: string, colors: colors | null) => void;
}

export const useThemeStore = create<ColorThemeState>()(
	devtools(
		persist(
			(set, get) => ({
				theme: "light",
				colors: { ...colorSchemes.light },
				followSystem: true,
				customThemes: {},
				inited: false,

				init: () => {
					const { inited, theme, customThemes, setTheme } = get();
					if (inited) return;
					if (builtInThemeNames.includes(theme) || customThemes[theme]) setTheme(theme);
					else setTheme("light");
					set({ inited: true });
				},

				setTheme: (name: ThemeName) => {
					set({
						theme: name,
						colors: builtInThemeNames.includes(name) ? { ...colorSchemes[name] } : { ...(get().customThemes[name] ?? colorSchemes.light) },
					});
				},

				setFollowSystem: (followSystem: boolean) => {
					set({ followSystem });
				},

				updateColorScheme: (themeName: ThemeName, colorKey: keyof colors, value: string) => {
					if (builtInThemeNames.includes(themeName)) throw Error("Cannot update built-in theme");
					const newColors = { ...get().customThemes[themeName], [colorKey]: value };
					get().updateCustomTheme(themeName, newColors);
				},

				updateCustomTheme: (name: string, colors: colors | null) => {
					if (colors === null) {
						const { customThemes, theme, setTheme } = get();
						if (!customThemes[name]) return;
						if (theme === name) setTheme("light");
						const { [name]: _, ...newCustomThemes } = customThemes;
						set(() => ({ customThemes: newCustomThemes }));
					} else
						set((state) => ({
							customThemes: {
								...state.customThemes,
								[name]: colors,
							},
						}));
					if (name === get().theme) get().setTheme(name);
				},
			}),
			{
				name: "theme-storage",
				storage: createJSONStorage(() => AsyncStorage),
				partialize: (state) => ({
					theme: state.theme,
					followSystem: state.followSystem,
					customThemes: state.customThemes,
				}),
			},
		),
		{
			name: "color-theme-store",
		},
	),
);
