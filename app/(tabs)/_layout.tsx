import { Tabs } from "expo-router";
import { BedIcon, HomeIcon, Menu } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import { useLinuxDoClientStore } from "~/store/linuxDoClientStore";

export default function TabLayout() {
	const [loading, setLoading] = useState(true);
	const linuxDoClientState = useLinuxDoClientStore();

	// biome-ignore lint/correctness/useExhaustiveDependencies: only run once
	useEffect(() => {
		if (linuxDoClientState.client !== null) {
			setLoading(false);
		} else {
			linuxDoClientState.init().then(() => {
				setLoading(false);
			});
		}
	}, []);

	if (loading)
		return (
			<View className="flex-1 bg-cyan-400/20">
				{Array.from({ length: 30 }).map((_, i) => (
					<Animated.View
						className="text-foreground text-nowrap flex-nowrap flex-1"
						entering={FadeIn.duration(i * 20).delay(i * 20)}
						key={i as number}
					>
						<Animated.Text className="text-foreground text-nowrap flex-nowrap flex-1" entering={FadeInRight.duration(i * 25).delay(i * 25)}>
							{Array.from({ length: 30 }).map(() => "Loading LinuxDoClient...")}
						</Animated.Text>
					</Animated.View>
				))}
			</View>
		);

	return (
		<Tabs
			screenOptions={{
				// tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: false,
				// tabBarBackground: () => <BlurView tint="dark" intensity={100} style={{ flex: 1 }}/>,
				tabBarStyle: Platform.select({
					ios: {
						// Use a transparent background on iOS to show the blur effect
						position: "absolute",
					},
					default: {
						// position: 'absolute',
					},
				}),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					// tabBarIconStyle: { display: 'none' },
					tabBarIcon: ({ color }) => <HomeIcon color={color} />,
				}}
			/>
			<Tabs.Screen
				name="navigation"
				options={{
					title: "Navigation",
					tabBarIcon: ({ color }) => <Menu color={color} />,
				}}
			/>
			<Tabs.Screen
				name="user"
				options={{
					title: "User",
					tabBarIcon: ({ color }) => <BedIcon color={color} />,
				}}
			/>
		</Tabs>
	);
}
