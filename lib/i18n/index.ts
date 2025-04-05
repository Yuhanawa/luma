import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { getLocales } from "expo-localization";

import { useLanguageStore } from "~/store/languageStore";
import en from "./locales/en.json";
import zh_cn from "./locales/zh-cn.json";

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;
export const SUPPORTED_LANGUAGES = {
	en: "English",
	"zh-CN": "简体中文",
};
export function initializeLanguage() {
	i18n.use(initReactI18next).init({
		resources: {
			en: {
				translation: en,
			},
			"zh-CN": {
				translation: zh_cn,
			},
		},
		lng: getCurrentLanguage(),
		fallbackLng: "en",
	});
}

function getCurrentLanguage(): SupportedLanguage | undefined {
	const selectedLanguage = useLanguageStore.getState().selectedLanguage;
	if (selectedLanguage !== null) return selectedLanguage;
	const locale = getLocales()[0];
	const SupportedLanguages = Object.keys(SUPPORTED_LANGUAGES);

	if (SupportedLanguages.includes(locale.languageTag)) return locale.languageTag as SupportedLanguage;

	const code = locale.languageCode ?? locale.languageTag.substring(0, 2);
	if (SupportedLanguages.includes(code)) return code as SupportedLanguage;

	const lang = SupportedLanguages.find((lang) => lang.startsWith(code));
	if (lang) return lang as SupportedLanguage;

	return undefined;
}

export default i18n;
