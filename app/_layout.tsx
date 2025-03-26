import "../lib/i18n";
import "../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ReanimatedLogLevel, configureReanimatedLogger } from "react-native-reanimated";
import { ImageViewerProvider } from "~/components/provider/ImageViewerProvider";
import { Text } from "~/components/ui/text";
import { checkCookie, loadCookieJar } from "~/lib/cookieManager";
import i18n from "../lib/i18n";
import LoginScreen from "./loginScreen";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	const [loading, setLoading] = useState(true);
	const [isLogin, setIsLogin] = useState<boolean | undefined>(undefined);

	console.log(`loading: ${loading}, isLogin: ${isLogin}`);

	useEffect(() => {
		loadCookieJar().then((cookieJar) => {
			checkCookie(cookieJar).then((checked) => {
				setIsLogin(checked);
				setLoading(false);
			});
		});

		configureReanimatedLogger({
			level: ReanimatedLogLevel.warn,
			strict: false, // disable strict mode, because react-native-gesture-handler/ReanimatedSwipeable will output a lot of warning
		});
	}, []);

	if (loading) {
		return (
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				{Array.from({ length: 20 }).map((_, i) => (
					<Text key={i as number}>Loading</Text>
				))}
			</ThemeProvider>
		);
	}
	if (isLogin === false) {
		return (
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<I18nextProvider i18n={i18n}>
					<LoginScreen onSuccess={() => setIsLogin(true)} />
				</I18nextProvider>
			</ThemeProvider>
		);
	}
	if (isLogin === true) {
		return (
			<>
				<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
					<I18nextProvider i18n={i18n}>
						<ImageViewerProvider>
							<GestureHandlerRootView style={{ flex: 1 }}>
								<Stack>
									<Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: "Luma" }} />
									<Stack.Screen name="+not-found" />
								</Stack>
								<StatusBar style="auto" />
							</GestureHandlerRootView>
						</ImageViewerProvider>
					</I18nextProvider>
				</ThemeProvider>
			</>
		);
	}
	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			{Array.from({ length: 20 }).map((_, i) => (
				<Text key={i as number}>Failed to load</Text>
			))}
		</ThemeProvider>
	);
}
