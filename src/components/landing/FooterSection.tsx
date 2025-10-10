"use client";

import { Twitter, Instagram, Linkedin } from "lucide-react";

const socialLinks = [
	{ name: "X", href: "https://x.com/atenra", icon: Twitter },
	{ name: "TikTok", href: "https://tiktok.com/@atenra", icon: null },
	{ name: "Instagram", href: "https://instagram.com/atenra", icon: Instagram },
	{ name: "LinkedIn", href: "https://linkedin.com/company/atenra", icon: Linkedin },
];

export function FooterSection() {
	return (
		<footer className="py-16 border-t">
			<div className="max-w-4xl mx-auto px-4">
				<div className="text-center space-y-6">
					<p className="text-sm text-muted-foreground font-light">
						© 2025 Atenra — Built for transparency.
					</p>

					<div className="flex justify-center items-center gap-6">
						{socialLinks.map((link) => (
							<a
								key={link.name}
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-primary transition-colors"
								aria-label={link.name}
							>
								{link.icon ? (
									<link.icon className="h-5 w-5" />
								) : (
									<svg
										className="h-5 w-5"
										viewBox="0 0 24 24"
										fill="currentColor"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
									</svg>
								)}
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}