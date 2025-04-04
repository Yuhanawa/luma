import Constants from "expo-constants";
import { IdCard, Info, LogOut, Settings } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAuthStore } from "~/store/authStore";
import { useUserStore } from "~/store/userStore";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export function UserHeader() {
	const { logout } = useAuthStore();
	const { username, userData } = useUserStore();

	return (
		<View className="flex-row items-center justify-between px-1 mb-4">
			<Text className="text-xl font-semibold">My Profile</Text>

			<View className="flex-row gap-1">
				{/* App Information Popover */}
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="icon">
							<Info size={22} className="text-muted-foreground" />
						</Button>
					</PopoverTrigger>
					<PopoverContent side="bottom" className="w-80">
						<Text className="font-medium leading-none native:text-xl">{Constants.expoConfig?.name}</Text>
						<Text className="text-sm text-muted-foreground mb-4">Linux.do Unofficial Mobile App</Text>

						<View className="bg-muted/30 p-3 rounded-md mb-2">
							<Text className="text-sm mb-1">
								<Text className="font-semibold">Version: </Text>
								{Constants.expoConfig?.version}
							</Text>
							<Text className="text-sm mb-1">
								<Text className="font-semibold">GitHub: </Text>
								{Constants.expoConfig?.githubUrl}
							</Text>
							<Text className="text-sm">
								<Text className="font-semibold">License: </Text>
								GPL-3.0 only
							</Text>
						</View>
					</PopoverContent>
				</Popover>

				{/* User Information Popover */}
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="icon">
							{/* IDCard icon is visually smaller, so use a larger size. */}
							<IdCard size={24} className="text-muted-foreground" />
						</Button>
					</PopoverTrigger>
					<PopoverContent side="bottom" className="w-80">
						<Text className="font-medium leading-none native:text-xl">User Information</Text>
						<Text className="text-sm text-muted-foreground mb-4">Your account details</Text>

						<View className="bg-muted/30 p-3 rounded-md mb-4">
							<Text className="text-sm mb-1">
								<Text className="font-semibold">Username: </Text>
								{username}
							</Text>
							{userData?.user && (
								<Text className="text-sm">
									<Text className="font-semibold">Name: </Text>
									{userData.user.name}
								</Text>
							)}
						</View>

						<Button
							variant="destructive"
							className="w-full"
							onPress={() => {
								console.log("Logout or Switch Account");
								logout();
							}}
						>
							<Text className="flex-row items-center justify-center text-foreground">
								<LogOut size={16} className="px-4 text-foreground" />
								Logout or Switch Account
							</Text>
						</Button>
					</PopoverContent>
				</Popover>

				<Button
					variant="ghost"
					size="icon"
					// onPress={() => router.push("/settings")}
				>
					<Settings size={22} className="text-muted-foreground" />
				</Button>
			</View>
		</View>
	);
}
