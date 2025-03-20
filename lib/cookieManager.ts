import * as FileSystem from "expo-file-system";
import { type Cookie, CookieJar, type SerializedCookieJar } from "tough-cookie";

const cookieJarFileUri = `${FileSystem.documentDirectory}discourse_cookies.json`;

export async function loadCookieJar(): Promise<CookieJar> {
	const info = await FileSystem.getInfoAsync(cookieJarFileUri);
	if (info.exists) {
		const cookieJarJsonStr = await FileSystem.readAsStringAsync(cookieJarFileUri);
		if (cookieJarJsonStr) {
			try {
				const cookieJar = await CookieJar.deserialize(cookieJarJsonStr);
				return cookieJar;
			} catch (error) {
				console.error("Error deserialize cookie jar, return new:", error);
			}
		}
	}

	return new CookieJar();
}

export function saveCookieJar(serializedCookieJar: SerializedCookieJar) {
	serializedCookieJar.cookies = serializedCookieJar.cookies.filter((c) => c.key !== "_forum_session");
	FileSystem.writeAsStringAsync(cookieJarFileUri, JSON.stringify(serializedCookieJar));
}

export async function checkCookie(cookieJar: CookieJar): Promise<boolean> {
	const cookies = await cookieJar.getCookies("https://linux.do");
	return cookies.findIndex((c: Cookie) => c.key === "_t") !== -1;
}
