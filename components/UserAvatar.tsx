import { LINUXDO_CONST } from "~/constants/linuxDo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Text } from "./ui/text";

interface UserAvatarProps {
	username: string;
	avatarTemplate?: string;
	size?: number;
	fallbackClassName?: string;
}

export const UserAvatar = ({ username, avatarTemplate, size = 40, fallbackClassName }: UserAvatarProps) => {
	const getAvatarUrl = (template: string, size: number) => {
		return template.startsWith("http")
			? template.replace("{size}", size.toString())
			: `${LINUXDO_CONST.HTTPS_URL}${template.replace("{size}", size.toString())}`;
	};

	const fallbackText = username.charAt(0).toUpperCase();

	return (
		<Avatar style={{ height: size, width: size }} alt={`${username}'s avatar`}>
			{avatarTemplate && <AvatarImage source={{ uri: getAvatarUrl(avatarTemplate, size) }} className="aspect-square h-full w-full" />}{" "}
			<AvatarFallback className={fallbackClassName}>
				<Text className="text-base font-medium uppercase">{fallbackText}</Text>
			</AvatarFallback>
		</Avatar>
	);
};
