import { Globe } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const LANGUAGES = [
	{ value: "unknown", label: "Unknown" },
	{ value: "en", label: "English" },
	{ value: "zh", label: "中文" },
];

export function LanguageSwitcher() {
	const { i18n } = useTranslation();
	const currentLang = LANGUAGES.find((lang) => lang.value === i18n.language) ?? LANGUAGES[1];

	return (
		<Select
			value={currentLang}
			onValueChange={(option) => {
				if (option?.value) {
					i18n.changeLanguage(option.value);
				}
			}}
		>
			<SelectTrigger className="w-[120px]">
				<Globe size={16} className="mr-2 text-foreground" />
				<SelectValue placeholder="Select language" className="text-foreground" />
			</SelectTrigger>
			<SelectContent className="w-[120px]">
				<SelectGroup>
					{LANGUAGES.slice(1).map((lang) => (
						<SelectItem key={lang.value} value={lang.value} label={lang.label}>
							{lang.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
