"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageCode } from "@/lib/i18n/translations";

interface Language {
	code: LanguageCode;
	name: string;
	flag: string;
}

const languages: Language[] = [
	{ code: "en", name: "English", flag: "🇺🇸" },
	{ code: "es", name: "Español", flag: "🇪🇸" },
	{ code: "fr", name: "Français", flag: "🇫🇷" },
	{ code: "de", name: "Deutsch", flag: "🇩🇪" },
	{ code: "zh", name: "中文", flag: "🇨🇳" }
];

export function LanguageSelector() {
	const [isOpen, setIsOpen] = useState(false);
	const { language, setLanguage } = useLanguage();

	const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

	const handleLanguageChange = (newLanguage: Language) => {
		setLanguage(newLanguage.code);
		setIsOpen(false);
	};

	return (
		<div className="relative">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center space-x-2 px-3"
			>
				<Globe className="h-4 w-4" />
				<span className="text-sm">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
				<ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
			</Button>

			{isOpen && (
				<div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-lg shadow-lg z-50 py-2">
					{languages.map((lang) => (
						<button
							key={lang.code}
							onClick={() => handleLanguageChange(lang)}
							className={cn(
								"w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-muted transition-colors text-left",
								currentLanguage.code === lang.code && "bg-muted"
							)}
						>
							<span className="text-lg">{lang.flag}</span>
							<span>{lang.name}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}