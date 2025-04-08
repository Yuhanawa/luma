import { format } from "date-fns";
import { AlertCircle, ChevronRight, Cookie as CookieIcon, Info, Key, LogIn, User } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Animated, Keyboard, Pressable, ScrollView, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LanguageSwitcher } from "~/components/LanguageSwitcher";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Text } from "~/components/ui/text";
import LinuxDoClient from "~/lib/linuxDoClient";
import { useAuthStore } from "~/store/authStore";

export default function LoginScreen() {
	const { t } = useTranslation();
	const [_t, set_t] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("cookie");
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const { cookieManager, login, switchAccount, checkLoginStatus, isLoading } = useAuthStore();
	const setAuthStore = useAuthStore.setState;

	// Animation effect when component mounts
	useEffect(() => {
		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 500,
			useNativeDriver: true,
		}).start();
	}, [fadeAnim]);

	const accountsView = useMemo(() => {
		const truck = cookieManager.getTruck();
		if (truck.size === 0) return null;

		return (
			<Card className="w-full mb-6">
				<CardHeader>
					<CardTitle className="flex-row items-center">
						<User size={16} className="mr-2 text-primary" />
						<Text>{t("login.savedAccounts")}</Text>
					</CardTitle>
					<CardDescription>{t("login.savedAccountsDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="px-0">
					{Array.from(truck.entries()).map(([uuid, cookieBox]) => {
						const username = cookieBox.username || t("login.unknownUser");
						const updatedDate = new Date(cookieBox.updatedAt);
						const formattedDate = format(updatedDate, "MMM d, yyyy");

						return (
							<Pressable
								key={uuid}
								className="flex-row items-center justify-between px-6 py-3 border-b border-border active:bg-muted"
								onPress={() => handleAccountSelect(uuid)}
							>
								<View className="flex-1">
									<Text className="font-medium text-foreground">{username}</Text>
									<Text className="text-sm text-muted-foreground">{formattedDate}</Text>
								</View>
								<ChevronRight size={18} className="text-muted-foreground" />
							</Pressable>
						);
					})}
				</CardContent>
				<CardFooter className="flex-col">
					<Text className="text-muted-foreground text-sm">{t("login.securityNote")}</Text>
					<Text className="text-muted-foreground text-sm">Android: keystore system / ios: keychain services</Text>
				</CardFooter>
			</Card>
		);
	}, [cookieManager, t]);

	const handleAccountSelect = useCallback(
		(uuid: string) => {
			try {
				switchAccount(uuid).catch((error) => {
					setError(error instanceof Error ? error.message : String(error));
					Alert.alert(t("login.error"), t("login.accountSwitchError"));
				});
			} catch (error) {
				setError(error instanceof Error ? error.message : String(error));
				Alert.alert(t("login.error"), t("login.accountSwitchError"));
			}
		},
		[switchAccount, t],
	);

	const handleCookieLogin = useCallback(() => {
		if (!_t.trim()) {
			setError(t("login.emptyCookieError"));
			return;
		}

		setError(null);
		Keyboard.dismiss();

		login(_t).catch((error) => {
			setError(error instanceof Error ? error.message : String(error));
			Alert.alert(t("login.error"), t("login.generalError"));
		});
	}, [_t, login, t]);

	const handleCredentialsLogin = useCallback(() => {
		if (!username.trim()) {
			setError(t("login.emptyUsernameError"));
			return;
		}
		if (!password.trim()) {
			setError(t("login.emptyPasswordError"));
			return;
		}

		setError(null);
		Keyboard.dismiss();

		cookieManager.switchNewCookieBox();
		// one-time-client
		LinuxDoClient.create({ cookieManager })
			.then((client) => {
				client.get_session_csrf().then(() => {
					client
						.login(username, password)
						.then((result) => {
							if (result.error) {
								setError(result.error);
								Alert.alert(t("login.loginFailedReason"), result.error);
								Alert.alert(t("login.tryUseCookie"));
							} else {
								checkLoginStatus().then((isLoggedIn) => {
									if (isLoggedIn) {
										setAuthStore({ isLoggedIn: true, isLoading: false, error: null });
									} else {
										Alert.alert(t("login.loginFailed"));
										Alert.alert(t("login.tryUseCookie"));
									}
									setError(null);
								});
							}
						})
						.catch((error) => {
							setError(error instanceof Error ? error.message : String(error));
							Alert.alert(t("login.loginFailed"));
							Alert.alert(t("login.tryUseCookie"));
						});
				});
			})
			.catch((error) => {
				setError(error instanceof Error ? error.message : String(error));
				Alert.alert(t("login.loginFailed"));
				Alert.alert(t("login.tryUseCookie"));
			});
	}, [username, password, t, cookieManager, checkLoginStatus, setAuthStore]);

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<Animated.View className="flex-1 bg-background" style={{ opacity: fadeAnim }}>
				<ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" className="flex-1 px-4 py-6">
					<View className="flex-1 items-center justify-center">
						{/* App Logo */}
						<View className="items-center mb-8">
							<Text className="text-3xl font-bold text-primary">{t("home.appName")}</Text>
							<Text className="text-muted-foreground text-center mt-1">{t("login.appDescription")}</Text>
						</View>

						{/* Saved Accounts Section */}
						{accountsView}

						{/* Login Form */}
						<Card className="w-full">
							<CardHeader>
								<CardTitle className="flex-row items-center">
									<LogIn size={16} className="mr-2 text-primary" />
									<Text>{t("login.title")}</Text>
								</CardTitle>
								<CardDescription>{t("login.formDescription")}</CardDescription>
							</CardHeader>
							<CardContent>
								<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
									<TabsList className="w-full mb-4 px-1 py-2 flex-row">
										<TabsTrigger value="cookie" className="flex-1">
											<Text>
												<CookieIcon size={14} className="mr-2 text-foreground" />
												{t("login.tabCookie")}
											</Text>
										</TabsTrigger>
										<TabsTrigger value="credentials" className="flex-1">
											<Text>
												<User size={14} className="mr-2 text-foreground" />
												{t("login.tabCredentials")}
											</Text>
										</TabsTrigger>
									</TabsList>

									<TabsContent value="cookie" className="space-y-4">
										<View className="space-y-2">
											<Label htmlFor="cookie" className="flex-row items-center">
												<CookieIcon size={14} className="mr-1 text-muted-foreground" />
												<Text>{t("login.cookiePrompt")}</Text>
											</Label>
											<Input
												id="cookie"
												value={_t}
												onChangeText={set_t}
												placeholder="_t cookie value"
												autoCapitalize="none"
												autoCorrect={false}
												className="font-mono"
											/>
										</View>

										{/* Help text */}
										<View className="flex-row items-start p-3 rounded-md bg-muted">
											<Info size={14} className="mr-2 mt-0.5 text-muted-foreground" />
											<Text className="text-sm text-muted-foreground flex-1">{t("login.helpText")}</Text>
										</View>
									</TabsContent>

									<TabsContent value="credentials" className="space-y-4">
										<View className="space-y-2">
											<Label htmlFor="username" className="flex-row items-center">
												<User size={14} className="mr-1 text-muted-foreground" />
												<Text>{t("login.username")}</Text>
											</Label>
											<Input
												id="username"
												value={username}
												onChangeText={setUsername}
												placeholder={t("login.usernamePrompt")}
												autoCapitalize="none"
												autoCorrect={false}
											/>
										</View>

										<View className="space-y-2">
											<Label htmlFor="password" className="flex-row items-center">
												<Key size={14} className="mr-1 text-muted-foreground" />
												<Text>{t("login.password")}</Text>
											</Label>
											<Input
												id="password"
												value={password}
												onChangeText={setPassword}
												placeholder={t("login.passwordPrompt")}
												autoCapitalize="none"
												autoCorrect={false}
												secureTextEntry
											/>
										</View>

										{/* Experimental feature note */}
										<View className="flex-row items-start p-3 rounded-md bg-muted">
											<Info size={14} className="mr-2 mt-0.5 text-muted-foreground" />
											<Text className="text-sm text-muted-foreground flex-1">{t("login.credentialsDescription")}</Text>
										</View>
									</TabsContent>
								</Tabs>

								{/* Error message */}
								{error && (
									<View className="flex-row items-center p-3 rounded-md bg-destructive/10 mt-4">
										<AlertCircle size={14} className="mr-2 text-destructive" />
										<Text className="text-sm text-destructive">{error}</Text>
									</View>
								)}

								{/* Security note */}
								<View className="flex-row items-center p-2 mt-4">
									<Text className="text-xs text-muted-foreground">{t("login.securityNote")}</Text>
								</View>
							</CardContent>
							<CardFooter className="flex-row justify-between">
								<LanguageSwitcher />
								<Button
									onPress={activeTab === "cookie" ? handleCookieLogin : handleCredentialsLogin}
									disabled={isLoading}
									className="min-w-24"
								>
									{isLoading ? (
										<ActivityIndicator size="small" color="white" />
									) : (
										<View className="flex-row items-center">
											<Key size={16} className="mr-2 text-background" />
											<Text>{t("login.confirm")}</Text>
										</View>
									)}
								</Button>
							</CardFooter>
						</Card>
					</View>
				</ScrollView>
			</Animated.View>
		</GestureHandlerRootView>
	);
}
