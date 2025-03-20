import "../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ReanimatedLogLevel, configureReanimatedLogger } from "react-native-reanimated";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { checkCookie, loadCookieJar } from "~/lib/cookieManager";
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
				<LoginScreen onSuccess={() => setIsLogin(true)} />
			</ThemeProvider>
		);
	}
	if (isLogin === true) {
		return (
			<>
				<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
					<GestureHandlerRootView style={{ flex: 1 }}>
						<Stack>
							<Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: "Luma" }} />
							<Stack.Screen name="+not-found" />
						</Stack>
						<StatusBar style="auto" />
					</GestureHandlerRootView>
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
