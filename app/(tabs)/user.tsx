import { View } from "react-native";
import { LanguageSwitcher } from "~/components/languageSwitcher";
import { Text } from "~/components/ui/text";

export default function UserScreen() {
	return (
		<View>
			<Text>User Settings</Text>
			<LanguageSwitcher />
		</View>
	);
}
