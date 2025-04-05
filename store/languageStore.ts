import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type { SupportedLanguage } from "~/lib/i18n";

interface LanguageState {
	// null means auto-detect using system locale
	selectedLanguage: SupportedLanguage | null;
	setLanguage: (language: SupportedLanguage | null) => void;
}

export const useLanguageStore = create<LanguageState>()(
	devtools(
		persist(
			(set) => ({
				selectedLanguage: null,
				setLanguage: (lang) => set({ selectedLanguage: lang }),
			}),
			{
				name: "language-storage",
				storage: createJSONStorage(() => AsyncStorage),
				partialize: (state) => ({ selectedLanguage: state.selectedLanguage }),
			},
		),
		{
			name: "language-store",
		},
	),
);
