import * as LucideIcons from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

// Apply iconWithClassName to all icons and re-export them
for (const [name, icon] of Object.entries(LucideIcons)) {
	if (typeof icon === "function" && name !== "createLucideIcon" && name !== "icons") {
		iconWithClassName(icon as LucideIcon);
	}
}

// Re-export all icons
export * from "lucide-react-native";
