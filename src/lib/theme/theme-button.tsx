"use client";

import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
	const { theme, toggleTheme, mounted } = useTheme();
	
	if (!mounted) {
		return (
			<button type="button" onClick={toggleTheme}>
				<div className="h-6 w-6" />
			</button>
		);
	}

	const icon = theme === "dark" ? <Sun /> : <Moon />;

	return (
		<button type="button" onClick={toggleTheme}>
			{icon}
		</button>
	);
}
