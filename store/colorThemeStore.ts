import { vars } from "nativewind";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import colorSchemes, { type ColorScheme, type colors } from "~/lib/initialColorShame";

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
	colorScheme: ColorScheme;
	colors: colors;
	followSystem: boolean;
	setColorScheme: (scheme: ColorScheme) => void;
	updateColor: (key: keyof colors, value: string) => void;
	setFollowSystem: (follow: boolean) => void;
}

export const useColorThemeStore = create<ColorThemeState>()(
	devtools(
		(set, get) => ({
			colorScheme: "light",
			colors: { ...colorSchemes.light },
			followSystem: true,

			setColorScheme: (scheme: ColorScheme) => {
				const newColors = { ...colorSchemes[scheme] };
				set({ colorScheme: scheme, colors: newColors });
			},

			updateColor: (key: keyof colors, value: string) => {
				const newColors = { ...get().colors, [key]: value };
				set({ colors: newColors });
			},

			setFollowSystem: (follow: boolean) => {
				set({ followSystem: follow });
			},
		}),
		{
			name: "color-theme-store",
		},
	),
);
