"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, Sun, Moon, User, LogOut, Settings, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSession, signOut } from "next-auth/react";
import { sanitizeAvatarUrl } from "@/lib/utils/avatar";
import { Logo } from "@/components/ui/logo";

export function Navigation() {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const { theme, toggleTheme } = useTheme();
	const { t } = useLanguage();
	const { data: session, status } = useSession();

	useEffect(() => {
		const checkAdminStatus = async () => {
			if (session?.user?.email) {
				try {
					const response = await fetch('/api/admin/check');
					if (response.ok) {
						const data = await response.json() as { isAdmin: boolean };
						setIsAdmin(data.isAdmin);
					}
				} catch (error) {
					console.error('Failed to check admin status:', error);
				}
			}
		};
		checkAdminStatus();
	}, [session]);

	const navItems = [
		{ name: t.navigation.home, href: "/" },
		{ name: t.navigation.pricing, href: "/pricing" },
		{ name: t.navigation.about, href: "/about" },
		{ name: t.navigation.social, href: "/social" },
		{ name: t.navigation.more, href: "/more" },
		{ name: t.navigation.contact, href: "/contact" }
	];

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<Link href="/" className="flex items-center">
							<Logo size={40} className="h-10 w-10" />
						</Link>
					</div>

					<div className="hidden md:flex items-center space-x-8">
						{navItems.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									"text-sm font-medium transition-colors hover:text-primary",
									pathname === item.href
										? "text-foreground"
										: "text-muted-foreground"
								)}
							>
								{item.name}
							</Link>
						))}
					</div>

					<div className="hidden md:flex items-center space-x-4">
						<button
							onClick={toggleTheme}
							className="p-2 rounded-lg hover:bg-muted transition-colors"
							aria-label="Toggle theme"
						>
							{theme === "dark" ? (
								<Sun className="h-5 w-5" />
							) : (
								<Moon className="h-5 w-5" />
							)}
						</button>
						
						<LanguageSelector />
						
						{session?.user ? (
							<div className="relative">
								<button
									onClick={() => setUserMenuOpen(!userMenuOpen)}
									className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors"
								>
									{sanitizeAvatarUrl(session.user.image) ? (
										<>
											<img 
												src={sanitizeAvatarUrl(session.user.image)!} 
												alt={session.user.name || "User"}
												className="w-8 h-8 rounded-full object-cover"
												onError={(e) => {
													e.currentTarget.style.display = 'none';
													const fallback = e.currentTarget.nextElementSibling as HTMLElement;
													if (fallback) fallback.classList.remove('hidden');
												}}
											/>
											<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hidden">
												<User className="h-4 w-4" />
											</div>
										</>
									) : (
										<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
											<User className="h-4 w-4" />
										</div>
									)}
								</button>
								
								{userMenuOpen && (
									<div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-lg shadow-lg z-50 py-2">
										<div className="px-4 py-2 border-b border-border/50">
											<p className="text-sm font-medium">{session.user.name}</p>
											<p className="text-xs text-muted-foreground">{session.user.email}</p>
										</div>
										<Link href="/profile" onClick={() => setUserMenuOpen(false)}>
											<button className="w-full flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-left">
												<Settings className="h-4 w-4" />
												<span>Profile</span>
											</button>
										</Link>
										{isAdmin && (
											<Link href="/admin" onClick={() => setUserMenuOpen(false)}>
												<button className="w-full flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-left">
													<Shield className="h-4 w-4" />
													<span>Admin Dashboard</span>
												</button>
											</Link>
										)}
										<button 
											onClick={() => {
												signOut({ redirect: true });
												setUserMenuOpen(false);
											}}
											className="w-full flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-left text-red-600"
										>
											<LogOut className="h-4 w-4" />
											<span>Sign Out</span>
										</button>
									</div>
								)}
							</div>
						) : (
							<Link href="/login">
								<Button variant="ghost" size="sm">
									{t.navigation.signIn}
								</Button>
							</Link>
						)}
					</div>

					<div className="md:hidden">
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="text-foreground hover:text-primary transition-colors"
						>
							{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
						</button>
					</div>
				</div>
			</div>

			{mobileMenuOpen && (
				<div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b">
					<div className="px-4 py-4 space-y-3">
						{navItems.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								onClick={() => setMobileMenuOpen(false)}
								className={cn(
									"block px-3 py-2 text-sm font-medium rounded-md transition-colors",
									pathname === item.href
										? "bg-primary/10 text-foreground"
										: "text-muted-foreground hover:bg-muted"
								)}
							>
								{item.name}
							</Link>
						))}
						<div className="pt-3 space-y-2 border-t">
							<div className="flex items-center justify-between px-3 py-2">
								<span className="text-sm font-medium">Theme</span>
								<button
									onClick={toggleTheme}
									className="p-2 rounded-lg hover:bg-muted transition-colors"
									aria-label="Toggle theme"
								>
									{theme === "dark" ? (
										<Sun className="h-4 w-4" />
									) : (
										<Moon className="h-4 w-4" />
									)}
								</button>
							</div>
							<div className="px-3 py-2">
								<span className="text-sm font-medium block mb-2">Language</span>
								<LanguageSelector />
							</div>
							{session?.user ? (
								<div className="px-3 py-2 space-y-2">
									<div className="px-3 py-2 bg-muted/50 rounded-lg">
										<p className="text-sm font-medium">{session.user.name}</p>
										<p className="text-xs text-muted-foreground">{session.user.email}</p>
									</div>
									<Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
										<Button variant="ghost" size="sm" className="w-full justify-start">
											<Settings className="mr-2 h-4 w-4" />
											Profile
										</Button>
									</Link>
									{isAdmin && (
										<Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
											<Button variant="ghost" size="sm" className="w-full justify-start">
												<Shield className="mr-2 h-4 w-4" />
												Admin Dashboard
											</Button>
										</Link>
									)}
									<Button 
										variant="ghost" 
										size="sm" 
										className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
										onClick={() => {
											signOut({ redirect: true });
											setMobileMenuOpen(false);
										}}
									>
										<LogOut className="mr-2 h-4 w-4" />
										Sign Out
									</Button>
								</div>
							) : (
								<Link href="/login" onClick={() => setMobileMenuOpen(false)}>
									<Button variant="ghost" size="sm" className="w-full">
										{t.navigation.signIn}
									</Button>
								</Link>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}