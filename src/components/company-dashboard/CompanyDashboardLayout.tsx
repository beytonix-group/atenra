"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	ChevronLeft,
	Menu,
	Moon,
	Sun,
	LogOut,
	User,
	CreditCard,
	FileText,
	Briefcase,
	BarChart3,
	ArrowLeft,
	Building2,
	HelpCircle,
	Settings,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/ui/logo";

interface Company {
	id: number;
	name: string;
	city?: string | null;
	state?: string | null;
}

interface CompanyDashboardLayoutProps {
	children: React.ReactNode;
	company: Company;
	user?: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
}

const getNavigationItems = (companyId: number) => [
	{
		title: "Dashboard",
		href: `/company/${companyId}`,
		icon: LayoutDashboard,
		badge: null,
	},
	{
		title: "Jobs",
		href: `/company/${companyId}/jobs`,
		icon: Briefcase,
		badge: null,
	},
	{
		title: "Invoices",
		href: `/company/${companyId}/invoices`,
		icon: FileText,
		badge: null,
	},
	{
		title: "Reports",
		href: `/company/${companyId}/reports`,
		icon: BarChart3,
		badge: null,
	},
];

const settingsMenuItems = [
	{
		title: "Profile",
		href: "/profile",
		icon: User,
	},
	{
		title: "Billing",
		href: "/subscription",
		icon: CreditCard,
	},
];

export function CompanyDashboardLayout({
	children,
	company,
	user,
}: CompanyDashboardLayoutProps) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();

	const navigationItems = getNavigationItems(company.id);

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleSidebar = () => {
		setSidebarCollapsed(!sidebarCollapsed);
	};

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const getUserInitials = (name?: string | null, email?: string | null) => {
		if (name) {
			return name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		}
		return email ? email[0].toUpperCase() : "U";
	};

	const isActive = (href: string) => {
		if (href === `/company/${company.id}`) {
			return pathname === href;
		}
		return pathname.startsWith(href);
	};

	return (
		<div className="flex h-screen bg-background">
			{/* Sidebar */}
			<aside
				className={cn(
					"fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300",
					sidebarCollapsed ? "w-16" : "w-64",
					mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
				)}
			>
				<div className="flex h-full flex-col overflow-hidden">
					{/* Logo Section */}
					<div className="flex h-14 lg:h-16 items-center justify-between border-b px-4 flex-shrink-0">
						<Link href={`/company/${company.id}`} className="flex items-center gap-2">
							{!sidebarCollapsed ? (
								<>
									<Logo className="h-6 lg:h-8 w-auto" />
									<span className="text-lg lg:text-xl font-semibold truncate">
										{company.name}
									</span>
								</>
							) : (
								<Logo className="h-6 lg:h-8 w-6 lg:w-8" />
							)}
						</Link>
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleSidebar}
							className="hidden lg:flex"
						>
							<ChevronLeft
								className={cn(
									"h-4 w-4 transition-transform",
									sidebarCollapsed && "rotate-180"
								)}
							/>
						</Button>
					</div>

					{/* Back to Marketplace Link */}
					<div className="p-2 border-b">
						<TooltipProvider delayDuration={0}>
							{sidebarCollapsed ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<Link
											href="/marketplace"
											className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground justify-center"
										>
											<ArrowLeft className="h-5 w-5 flex-shrink-0" />
										</Link>
									</TooltipTrigger>
									<TooltipContent side="right" sideOffset={10}>
										Back to Marketplace
									</TooltipContent>
								</Tooltip>
							) : (
								<Link
									href="/marketplace"
									className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
								>
									<ArrowLeft className="h-5 w-5 flex-shrink-0" />
									<span>Back to Marketplace</span>
								</Link>
							)}
						</TooltipProvider>
					</div>

					{/* Navigation Items */}
					<nav className="space-y-1 p-2">
						<TooltipProvider delayDuration={0}>
							{navigationItems.map((item) => {
								const active = isActive(item.href);
								const linkContent = (
									<Link
										href={item.href}
										onClick={() => setMobileMenuOpen(false)}
										className={cn(
											"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
											active && "bg-accent text-accent-foreground",
											sidebarCollapsed && "justify-center"
										)}
									>
										<item.icon className="h-5 w-5 flex-shrink-0" />
										{!sidebarCollapsed && (
											<>
												<span className="flex-1">{item.title}</span>
												{item.badge && (
													<span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
														{item.badge}
													</span>
												)}
											</>
										)}
									</Link>
								);

								return sidebarCollapsed ? (
									<Tooltip key={item.href}>
										<TooltipTrigger asChild>{linkContent}</TooltipTrigger>
										<TooltipContent side="right" sideOffset={10}>
											{item.title}
										</TooltipContent>
									</Tooltip>
								) : (
									<div key={item.href}>{linkContent}</div>
								);
							})}
						</TooltipProvider>
					</nav>

					{/* Spacer to push bottom items down */}
					<div className="hidden lg:flex lg:flex-1"></div>

					{/* Bottom Navigation */}
					<div className="border-t p-2 flex-shrink-0 space-y-1">
						<TooltipProvider delayDuration={0}>
							{/* Settings Dropdown */}
							<DropdownMenu>
								<Tooltip>
									<TooltipTrigger asChild>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className={cn(
													"w-full justify-start gap-3 px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
													sidebarCollapsed && "justify-center px-2"
												)}
											>
												<Settings className="h-5 w-5 flex-shrink-0" />
												{!sidebarCollapsed && <span>Settings</span>}
											</Button>
										</DropdownMenuTrigger>
									</TooltipTrigger>
									{sidebarCollapsed && (
										<TooltipContent side="right" sideOffset={10}>
											Settings
										</TooltipContent>
									)}
								</Tooltip>
								<DropdownMenuContent
									align="end"
									side="top"
									className="w-56 mb-2"
									sideOffset={8}
								>
									{settingsMenuItems.map((item) => (
										<DropdownMenuItem key={item.href} asChild>
											<Link
												href={item.href}
												onClick={() => setMobileMenuOpen(false)}
												className="flex items-center gap-2 cursor-pointer"
											>
												<item.icon className="h-4 w-4" />
												<span>{item.title}</span>
											</Link>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Help Link */}
							{sidebarCollapsed ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<Link
											href="/help"
											className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground justify-center"
										>
											<HelpCircle className="h-5 w-5 flex-shrink-0" />
										</Link>
									</TooltipTrigger>
									<TooltipContent side="right" sideOffset={10}>
										Help & Support
									</TooltipContent>
								</Tooltip>
							) : (
								<Link
									href="/help"
									className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
								>
									<HelpCircle className="h-5 w-5 flex-shrink-0" />
									<span>Help & Support</span>
								</Link>
							)}
						</TooltipProvider>
					</div>
				</div>
			</aside>

			{/* Mobile Menu Overlay */}
			{mobileMenuOpen && (
				<div
					className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
					onClick={toggleMobileMenu}
				/>
			)}

			{/* Main Content Area */}
			<div
				className={cn(
					"flex flex-1 flex-col transition-all duration-300",
					sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
				)}
			>
				{/* Top Header */}
				<header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleMobileMenu}
							className="lg:hidden"
						>
							<Menu className="h-5 w-5" />
						</Button>
						<div className="flex items-center gap-2">
							<Building2 className="h-5 w-5 text-muted-foreground" />
							<span className="font-medium">{company.name}</span>
							{company.city && company.state && (
								<span className="text-sm text-muted-foreground hidden sm:inline">
									({company.city}, {company.state})
								</span>
							)}
						</div>
					</div>

					<div className="flex items-center gap-3">
						{/* Theme Toggle */}
						{mounted && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
							>
								<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
								<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
							</Button>
						)}

						{/* User Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="relative h-9 w-9 rounded-full">
									<Avatar className="h-9 w-9">
										<AvatarImage src={user?.image || ""} alt={user?.name || ""} />
										<AvatarFallback>
											{getUserInitials(user?.name, user?.email)}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">{user?.name}</p>
										<p className="text-xs leading-none text-muted-foreground">
											{user?.email}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="cursor-pointer text-red-600"
									onClick={() => signOut({ callbackUrl: "/" })}
								>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto bg-muted/10 p-4 lg:p-6">
					{children}
				</main>
			</div>
		</div>
	);
}
