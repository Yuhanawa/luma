import { View } from "react-native";
import { HTMLContent } from "~/components/ui/html-content";

interface PostContentProps {
	html: string;
}

export const PostContent = ({ html }: PostContentProps) => {
	return (
		<View className="mb-3">
			<HTMLContent html={html} />
		</View>
	);
};
