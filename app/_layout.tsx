import "../lib/i18n";
import "../global.css";
import "react-native-get-random-values";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeInRight, ReanimatedLogLevel, configureReanimatedLogger } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ImageViewerProvider } from "~/components/providers/ImageViewerProvider";
import { ThemeProvider } from "~/components/providers/ThemeProvider";
import { initializeLanguage } from "~/lib/i18n";
import { initIconWithClassName } from "~/lib/icons";
import { useAuthStore } from "~/store/authStore";
import i18n from "../lib/i18n";
import LoginScreen from "./loginScreen";

function init() {
	configureReanimatedLogger({
		level: ReanimatedLogLevel.warn,
		strict: false,
	});

	initializeLanguage();
	initIconWithClassName();
}

export default function RootLayout() {
	const [loading, setLoading] = useState(true);
	const { isLoggedIn, isLoading: authLoading, init: initAuth } = useAuthStore();

	// biome-ignore lint/correctness/useExhaustiveDependencies: only run once
	useEffect(() => {
		// Initialize the app
		init();

		// Initialize the auth store
		initAuth().then(() => {
			setLoading(false);
		});
	}, []);

	if (loading || authLoading) {
		return (
			<ThemeProvider>
				<SimpleText>Loading... </SimpleText>
			</ThemeProvider>
		);
	}

	if (isLoggedIn === false) {
		return (
			<Providers>
				<LoginScreen />
			</Providers>
		);
	}

	if (isLoggedIn === true) {
		return (
			<Providers>
				<Stack>
					<Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: "Luma" }} />
					<Stack.Screen
						options={{
							headerShown: false,
							presentation: "transparentModal",
						}}
						name="activityScreen"
					/>
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
						<GestureHandlerRootView style={{ flex: 1 }}>
							{children}
							<PortalHost />
							<Toast />
						</GestureHandlerRootView>
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
