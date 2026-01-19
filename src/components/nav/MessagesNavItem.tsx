"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUnreadMessageCount } from "@/components/messages/MessagesBadge";

interface MessagesNavItemProps {
  sidebarCollapsed: boolean;
  onMobileMenuClose?: () => void;
}

export function MessagesNavItem({
  sidebarCollapsed,
  onMobileMenuClose,
}: MessagesNavItemProps) {
  const pathname = usePathname();
  const { count } = useUnreadMessageCount();
  const isActive = pathname === "/messages" || pathname?.startsWith("/messages/");
  const href = "/messages";

  const linkContent = (
    <Link
      href={href}
      onClick={onMobileMenuClose}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        "text-muted-foreground hover:bg-secondary hover:text-foreground",
        isActive && "bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary",
        sidebarCollapsed && "justify-center"
      )}
    >
      <div className="relative">
        <MessageSquare className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
        {sidebarCollapsed && count > 0 && (
          <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center animate-pulse">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </div>
      {!sidebarCollapsed && (
        <>
          <span className="flex-1">Messages</span>
          {count > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white font-medium animate-pulse">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (sidebarCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          Messages {count > 0 && `(${count} unread)`}
        </TooltipContent>
      </Tooltip>
    );
  }

  return <div>{linkContent}</div>;
}
