import { format } from "date-fns";
import { AlertCircle, ChevronRight, Cookie as CookieIcon, Info, Key, LogIn, Send, User } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Animated, Keyboard, Pressable, ScrollView, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LanguageSwitcher } from "~/components/LanguageSwitcher";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Text } from "~/components/ui/text";
import LinuxDoClient from "~/lib/linuxDoClient";
import { useAuthStore } from "~/store/authStore";

export default function LoginScreen() {
	const { t } = useTranslation();
	const [_t, set_t] = useState("");
	const [username, setUsername] = useState("");
	const [loginLink, setLoginLink] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("email");
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const [emailSendCooldown, setEmailSendCooldown] = useState(0);
	const [isSendingEmail, setIsSendingEmail] = useState(false);
	const [isEmailLoginProcessing, setIsEmailLoginProcessing] = useState(false);
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

	// Cooldown timer effect
	useEffect(() => {
		if (emailSendCooldown <= 0) return;

		const timer = setInterval(() => {
			setEmailSendCooldown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [emailSendCooldown]);

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

	const handleSendLoginEmail = useCallback(() => {
		// Don't proceed if already sending or in cooldown
		if (isSendingEmail || emailSendCooldown > 0) return;

		if (!username.trim()) {
			setError(t("login.emptyUsernameOrEmailError"));
			return;
		}

		setError(null);
		Keyboard.dismiss();
		setIsSendingEmail(true);

		cookieManager.switchNewCookieBox();
		// one-time-client
		LinuxDoClient.create({ cookieManager })
			.then((client) => {
				client.get_session_csrf().then(() => {
					client
						.sendLoginEmail(username)
						.then((result) => {
							setIsSendingEmail(false);
							if (result.success === "OK") {
								Alert.alert(t("login.sendSuccess"));
								// Start 60s cooldown
								setEmailSendCooldown(60);
							} else {
								Alert.alert(t("login.sendFailed"));
							}
						})
						.catch((error) => {
							console.error(error);
							setIsSendingEmail(false);
							Alert.alert(t("login.sendFailed"));
						});
				});
			})
			.catch((error) => {
				console.error(error);
				setIsSendingEmail(false);
				Alert.alert(t("login.sendFailed"));
			});
	}, [username, t, cookieManager, isSendingEmail, emailSendCooldown]);

	const handleEmailLogin = useCallback(() => {
		// Don't proceed if already processing
		if (isEmailLoginProcessing) return;

		if (!loginLink.trim()) {
			setError(t("login.emptyLinkError"));
			return;
		}
		// https://linux.do/session/email-login/{token}
		if (!loginLink.trim().startsWith("https://linux.do/session/email-login/")) {
			setError(t("login.invalidLinkError"));
			return;
		}
		const token = loginLink.trim().split("/").pop();
		if (!token) {
			setError(t("login.invalidLinkError"));
			return;
		}

		setError(null);
		Keyboard.dismiss();
		setIsEmailLoginProcessing(true);

		cookieManager.switchNewCookieBox();
		// one-time-client
		LinuxDoClient.create({ cookieManager })
			.then((client) => {
				client.get_session_csrf().then(() => {
					client
						.emailLogin(token)
						.then((result) => {
							checkLoginStatus().then((isLoggedIn) => {
								setIsEmailLoginProcessing(false);
								if (isLoggedIn) {
									setAuthStore({ isLoggedIn: true, isLoading: false, error: null });
									Alert.alert(t("login.loginSuccess"));
								} else {
									setError(String(result));
									Alert.alert(t("login.loginFailedReason"), String(result));
								}
							});
						})
						.catch((error) => {
							setIsEmailLoginProcessing(false);
							setError(error instanceof Error ? error.message : String(error));
							Alert.alert(t("login.loginFailed"));
						});
				});
			})
			.catch((error) => {
				setIsEmailLoginProcessing(false);
				setError(error instanceof Error ? error.message : String(error));
				Alert.alert(t("login.loginFailed"));
			});
	}, [loginLink, t, cookieManager, checkLoginStatus, setAuthStore, isEmailLoginProcessing]);

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
										<TabsTrigger value="email" className="flex-1">
											<Text>
												<User size={14} className="mr-2 text-foreground" />
												{t("login.tabEmail")}
											</Text>
										</TabsTrigger>
										<TabsTrigger value="cookie" className="flex-1">
											<Text>
												<CookieIcon size={14} className="mr-2 text-foreground" />
												{t("login.tabCookie")}
											</Text>
										</TabsTrigger>
									</TabsList>

									<TabsContent value="email" className="space-y-4">
										<View className="space-y-2">
											<Label htmlFor="username" className="flex-row items-center">
												<User size={14} className="mr-1 text-muted-foreground" />
												<Text>{t("login.usernameOrEmail")}</Text>
											</Label>
											<Input
												id="username"
												value={username}
												onChangeText={setUsername}
												placeholder={t("login.enterUsernameOrEmail")}
												autoCapitalize="none"
												autoCorrect={false}
											/>
										</View>

										<Button
											disabled={isLoading || isSendingEmail || emailSendCooldown > 0}
											onPress={handleSendLoginEmail}
											className="min-w-24 relative overflow-hidden"
										>
											{isLoading || isSendingEmail ? (
												<ActivityIndicator size="small" color="white" />
											) : emailSendCooldown > 0 ? (
												<View className="flex-row items-center">
													<Send size={16} className="mr-2 text-background" />
													<Text>{t("login.cooldownMessage").replace("{seconds}", emailSendCooldown.toString())}</Text>
												</View>
											) : (
												<View className="flex-row items-center">
													<Send size={16} className="mr-2 text-background" />
													<Text>{t("login.sendLoginEmail")}</Text>
												</View>
											)}
											{emailSendCooldown > 0 && (
												<View className="absolute bottom-0 left-0 right-0 h-1">
													<Progress value={(emailSendCooldown / 60) * 100} className="h-1" indicatorClassName="bg-background/30" />
												</View>
											)}
										</Button>

										<Text className="text-sm text-muted-foreground text-center">{t("login.tryWebsiteIfNotReceived")}</Text>

										<View className="space-y-2">
											<Label htmlFor="password" className="flex-row items-center">
												<Key size={14} className="mr-1 text-muted-foreground" />
												<Text>{t("login.emailLinkPrompt")}</Text>
											</Label>
											<Input
												id="password"
												value={loginLink}
												onChangeText={setLoginLink}
												placeholder={t("login.pasteLink")}
												autoCapitalize="none"
												autoCorrect={false}
											/>
										</View>
									</TabsContent>
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
									onPress={activeTab === "cookie" ? handleCookieLogin : handleEmailLogin}
									disabled={isLoading || (activeTab === "email" && (isEmailLoginProcessing || isSendingEmail))}
									className="min-w-24"
								>
									{isLoading || (activeTab === "email" && isEmailLoginProcessing) ? (
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
