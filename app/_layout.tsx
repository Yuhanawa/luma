import "../lib/i18n";
import "../global.css";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeInRight, ReanimatedLogLevel, configureReanimatedLogger } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageViewerProvider } from "~/components/providers/ImageViewerProvider";
import { ThemeProvider, useTheme } from "~/components/providers/ThemeProvider";
import { checkCookie, loadCookieJar } from "~/lib/cookieManager";
import { initIconWithClassName } from "~/lib/icons";
import i18n from "../lib/i18n";
import LoginScreen from "./loginScreen";

function init() {
	configureReanimatedLogger({
		level: ReanimatedLogLevel.warn,
		strict: false,
	});

	initIconWithClassName();
}

export default function RootLayout() {
	const [loading, setLoading] = useState(true);
	const [isLogin, setIsLogin] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		loadCookieJar().then((cookieJar) => {
			checkCookie(cookieJar).then((checked) => {
				setIsLogin(checked);
				setLoading(false);
			});
		});
	}, []);

	useEffect(init, []);

	if (loading) {
		return (
			<ThemeProvider>
				<SimpleText>Loading... </SimpleText>
			</ThemeProvider>
		);
	}
	if (isLogin === false) {
		return (
			<Providers>
				<LoginScreen onSuccess={() => setIsLogin(true)} />
			</Providers>
		);
	}
	if (isLogin === true) {
		return (
			<Providers>
				<Stack>
					<Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: "Luma" }} />
					<Stack.Screen name="+not-found" />
				</Stack>
			</Providers>
		);
	}
	return (
		<ThemeProvider>
			<SimpleText>Failed to Load </SimpleText>
		</ThemeProvider>
	);
}

function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<I18nextProvider i18n={i18n}>
				<SafeAreaView style={{ flex: 1 }}>
					<ImageViewerProvider>
						<GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
					</ImageViewerProvider>
				</SafeAreaView>
			</I18nextProvider>
		</ThemeProvider>
	);
}

function SimpleText({ children }: { children: React.ReactNode }) {
	return (
		<View className="flex-1 bg-cyan-900">
			{Array.from({ length: 30 }).map((_, i) => (
				<Animated.View
					className="text-foreground text-nowrap flex-nowrap flex-1"
					entering={FadeIn.duration(i * 50).delay(i * 50)}
					key={i as number}
				>
					<Animated.Text className="text-foreground text-nowrap flex-nowrap flex-1" entering={FadeInRight.duration(i * 100).delay(i * 100)}>
						{Array.from({ length: 30 }).map(() => children)}
					</Animated.Text>
				</Animated.View>
			))}
		</View>
	);
}
