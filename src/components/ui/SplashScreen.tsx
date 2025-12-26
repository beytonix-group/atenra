"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export function SplashScreen({ children }: { children: React.ReactNode }) {
	const [showSplash, setShowSplash] = useState(true);
	const [fadeOut, setFadeOut] = useState(false);
	const [showContent, setShowContent] = useState(false);
	const pathname = usePathname();
	const { status } = useSession();

	useEffect(() => {
		// Check if splash has already been shown in this session
		const splashShown = sessionStorage.getItem('splashShown');

		// Check if user is logged in or on dashboard pages
		const isDashboardPage = pathname?.startsWith("/dashboard") ||
			pathname?.startsWith("/admindashboard") ||
			pathname?.startsWith("/profile");
		const isLoggedIn = status === "authenticated";

		// Don't show splash screen if already shown, on dashboard pages, or when logged in
		if (splashShown || isDashboardPage || isLoggedIn) {
			setShowSplash(false);
			setShowContent(true);
			return;
		}

		// Show splash screen for 1.5 seconds on first page load
		setShowSplash(true);
		setFadeOut(false);
		setShowContent(false);

		const fadeTimer = setTimeout(() => {
			setFadeOut(true);
		}, 1500);

		const hideTimer = setTimeout(() => {
			setShowSplash(false);
			setShowContent(true);
			// Mark splash as shown for this session
			sessionStorage.setItem('splashShown', 'true');
		}, 1800); // 1.5s display + 300ms fade

		return () => {
			clearTimeout(fadeTimer);
			clearTimeout(hideTimer);
		};
	}, [pathname, status]);

	if (showSplash) {
		return (
			<div
				className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#7C8EA3] transition-opacity duration-300 ${
					fadeOut ? "opacity-0" : "opacity-100"
				}`}
			>
				<div className="flex flex-col items-center gap-8">
					<Image
						src="/logos/Horizontal_FullWhite.png"
						alt="Atenra"
						width={200}
						height={80}
						priority
						className="object-contain"
					/>

					<Loader2 className="h-12 w-12 text-white animate-spin" />
				</div>
			</div>
		);
	}

	return (
		<div
			className={`transition-opacity duration-500 ${
				showContent ? "opacity-100" : "opacity-0"
			}`}
		>
			{children}
		</div>
	);
}
