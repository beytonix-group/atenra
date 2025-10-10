"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

export function SplashScreen({ children }: { children: React.ReactNode }) {
	const [showSplash, setShowSplash] = useState(true);
	const [fadeOut, setFadeOut] = useState(false);
	const [showContent, setShowContent] = useState(false);
	const pathname = usePathname();
	const { status } = useSession();

	useEffect(() => {
		// Check if user is logged in or on dashboard pages
		const isDashboardPage = pathname?.startsWith("/dashboard") ||
			pathname?.startsWith("/admindashboard") ||
			pathname?.startsWith("/profile");
		const isLoggedIn = status === "authenticated";

		// Don't show splash screen on dashboard pages or when logged in
		if (isDashboardPage || isLoggedIn) {
			setShowSplash(false);
			setShowContent(true);
			return;
		}

		// Show splash screen for 1 second on all other pages
		setShowSplash(true);
		setFadeOut(false);
		setShowContent(false);

		const fadeTimer = setTimeout(() => {
			setFadeOut(true);
		}, 1000);

		const hideTimer = setTimeout(() => {
			setShowSplash(false);
			setShowContent(true);
		}, 1300); // 1s display + 300ms fade

		return () => {
			clearTimeout(fadeTimer);
			clearTimeout(hideTimer);
		};
	}, [pathname, status]);

	if (showSplash) {
		return (
			<div
				className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FF9100] transition-opacity duration-300 ${
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

					<div className="relative w-12 h-12">
						<div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
						<div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
					</div>
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
