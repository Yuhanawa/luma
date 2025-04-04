import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Cookie, CookieJar } from "tough-cookie";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { LINUXDO_CONST } from "~/constants/linuxDo";
import CookieManager from "~/lib/cookieManager";

export default function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
	const { t } = useTranslation();
	const [_t, set_t] = useState("");

	const handlePress = useCallback(() => {
		const cookieJar = new CookieJar();
		cookieJar.setCookie(
			new Cookie({
				key: "_t",
				value: _t,
				domain: LINUXDO_CONST.DOMAIN,
				path: "/",
			}),
			LINUXDO_CONST.HTTPS_URL,
		);
		const serializedCookieJar = cookieJar.serializeSync();
		if (serializedCookieJar !== undefined) {
			const cookieManager = new CookieManager();
			cookieManager.switchNewCookieBox();
			cookieManager
				.setCurrentCookieJar(serializedCookieJar)
				.then(() => {
					onSuccess();
				})
				.catch((error) => {
					throw Error("Failed to save cookie jar", error);
				});
		} else {
			console.error("Unknown Error: serializedCookieJar is undefined");
		}
	}, [_t, onSuccess]);

	return (
		<View className="flex-1 flex-col justify-center items-center bg-background text-foreground">
			<Text>{t("login.title")}</Text>
			<Text>{t("login.cookiePrompt")}</Text>
			<Input value={_t} onChangeText={set_t} />
			<Button onPress={handlePress}>
				<Text>{t("login.confirm")}</Text>
			</Button>
		</View>
	);
}
