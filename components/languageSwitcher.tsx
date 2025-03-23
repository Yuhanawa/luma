import { Globe } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Text } from "./ui/text";

const LANGUAGES = [
	{ value: "unknown", label: "Unknown" },
	{ value: "en", label: "English" },
	{ value: "zh", label: "中文" },
] as const;

export function LanguageSwitcher() {
	const { i18n } = useTranslation();

	return (
		<Select
			value={LANGUAGES.find((lang) => lang.value === i18n.language) ?? LANGUAGES[0]}
			onValueChange={(value) => {
				i18n.changeLanguage(value?.value);
			}}
		>
			<SelectTrigger className="w-[120px]">
				<Globe size={16} className="mr-2" />
				<SelectValue placeholder="Select language" />
			</SelectTrigger>
			<SelectContent>
				{LANGUAGES.map((lang) => (
					<SelectItem key={lang.value} value={lang.value} label={lang.label}>
						<Text>{lang.label}</Text>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
