"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const socialLinks = [
	{ name: "X", href: "https://x.com/atenra" },
	{ name: "TikTok", href: "https://tiktok.com/@atenra" },
	{ name: "Instagram", href: "https://instagram.com/atenra" },
	{ name: "LinkedIn", href: "https://linkedin.com/company/atenra" },
	{ name: "Facebook", href: "https://facebook.com/atenra" }
];

const contactInfo = [
	{ label: "General", email: "info@atenra.com" },
	{ label: "Support", email: "support@atenra.com" },
	{ label: "Media", email: "media@atenra.com" }
];

export function FooterSection() {
	const { t } = useLanguage();
	return (
		<footer className="py-20 border-t">
			<div className="max-w-4xl mx-auto">
				<div className="w-full h-px bg-border/20 mb-16" />
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
					<div className="space-y-6">
						<h4 className="text-xl font-light">{t.footer.contact}</h4>
						<div className="space-y-3 text-muted-foreground font-light">
							{contactInfo.map((item) => (
								<div key={item.label} className="transition-opacity hover:opacity-80">
									{item.label}:{" "}
									<a
										href={`mailto:${item.email}`}
										className="text-primary hover:opacity-70 transition-opacity"
									>
										{item.email}
									</a>
								</div>
							))}
						</div>
					</div>

					<div className="space-y-6 text-center md:text-right">
						<h4 className="text-xl font-light">{t.footer.connect}</h4>
						<div className="flex flex-wrap justify-center md:justify-end gap-6">
							{socialLinks.map((link) => (
								<a
									key={link.name}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-primary transition-colors font-light hover:scale-105"
								>
									{link.name}
								</a>
							))}
						</div>
					</div>
				</div>

				<div className="w-full h-px bg-border/20 mb-8" />

				<div className="text-center text-sm text-muted-foreground">
					<p className="font-light opacity-70">{t.footer.copyright}</p>
				</div>
			</div>
		</footer>
	);
}