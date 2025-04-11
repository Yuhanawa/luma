import { Globe } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "~/lib/i18n";
import { useLanguageStore } from "~/store/languageStore";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const LANGUAGES = Object.entries(SUPPORTED_LANGUAGES).map(([key, value]) => ({
	value: key,
	label: value,
}));

export function LanguageSwitcher() {
	const { i18n } = useTranslation();
	const { setLanguage } = useLanguageStore();
	const currentLang = LANGUAGES.find((lang) => lang.value === i18n.language) ?? LANGUAGES[0];

	return (
		<Select
			value={currentLang}
			onValueChange={(option) => {
				if (option?.value) {
					i18n.changeLanguage(option.value);
					setLanguage(option.value as SupportedLanguage);
				}
			}}
		>
			<SelectTrigger className="w-[120px]">
				<Globe size={16} className="mr-2 text-foreground" />
				<SelectValue placeholder="Select language" className="text-foreground" />
			</SelectTrigger>
			<SelectContent className="w-[120px]">
				<SelectGroup>
					{LANGUAGES.map((lang) => (
						<SelectItem key={lang.value} value={lang.value} label={lang.label}>
							{lang.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
