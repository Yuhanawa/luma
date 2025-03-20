import { useCallback, useState } from "react";
import { Cookie, CookieJar } from "tough-cookie";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { LINUXDO_CONST } from "~/constants/linuxDo";
import { saveCookieJar } from "~/lib/cookieManager";

export default function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
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
			saveCookieJar(serializedCookieJar);
			onSuccess();
		} else {
			console.error("Unknown Error: serializedCookieJar is undefined");
		}
	}, [_t, onSuccess]);

	return (
		<>
			<Text>Login</Text>
			<Text>输入 `_t` Cookie 进行登录喵</Text>
			<Input value={_t} onChangeText={set_t} />
			<Button onPress={handlePress}>
				<Text>Confirm</Text>
			</Button>
		</>
	);
}
