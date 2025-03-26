import { useCallback, useEffect, useState } from "react";
import {} from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useLinuxDoClientStore } from "~/store/linuxDoClientStore";

export default function TabTwoScreen() {
	const [output, setOutput] = useState<string>("output");

	const client = useLinuxDoClientStore().client!;

	const handlePress = useCallback(() => {
		try {
			client.getNotifications().then((data) => setOutput(JSON.stringify(data)));
		} catch (error) {
			setOutput(`Error: ${error}`);
		}
	}, [client]);

	return (
		<>
			<Button onPress={handlePress}>
				<Text>Test Button</Text>
			</Button>
			<Text>{output}</Text>
		</>
	);
}
