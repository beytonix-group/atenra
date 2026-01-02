"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Menu,
  Moon,
  Sun,
  LogOut,
  User,
  HelpCircle,
  MessageSquare,
  Settings,
  CreditCard,
  MessageCircle,
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
import { CartIcon } from "@/components/cart/CartIcon";

interface ChatLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Navigation items for regular users
const navigationItems = [
  {
    title: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageSquare,
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
    href: "/billing",
    icon: CreditCard,
  },
];

const bottomNavigationItems = [
  {
    title: "Help & Support",
    href: "/support",
    icon: HelpCircle,
  },
];

export function ChatLayout({ children, user }: ChatLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

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
        .filter((n) => n.length > 0)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : "U";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-sidebar transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
            <Link href="/chat" className="flex items-center gap-2">
              {!sidebarCollapsed ? (
                <>
                  <Logo className="h-8 w-auto" />
                  <span className="text-xl font-semibold text-sidebar-foreground">Atenra</span>
                </>
              ) : (
                <Logo className="h-8 w-8" />
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden lg:flex hover:bg-secondary"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform text-muted-foreground",
                  sidebarCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 p-2">
            <TooltipProvider delayDuration={0}>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const linkContent = (
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      isActive && "bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary",
                      sidebarCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                    {!sidebarCollapsed && <span className="flex-1">{item.title}</span>}
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

          {/* Bottom Navigation */}
          <div className="border-t border-border/50 p-2 space-y-1">
            <TooltipProvider delayDuration={0}>
              {/* Settings Dropdown */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
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

              {/* Other Bottom Navigation Items */}
              {bottomNavigationItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const linkContent = (
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      isActive && "bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary",
                      sidebarCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                    {!sidebarCollapsed && <span>{item.title}</span>}
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
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <CartIcon />

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
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
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.name || "User menu"}
                    />
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

        {/* Page Content - Full height for chat */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
