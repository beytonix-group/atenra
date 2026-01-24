"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUnreadMessageCount as useUnreadMessageCountQuery, useInvalidateMessages } from "@/hooks/use-messages-query";

interface MessagesBadgeProps {
  className?: string;
}

export function MessagesBadge({ className }: MessagesBadgeProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Determine if we're on the messages page for faster polling
  const isMessagesPage = pathname?.startsWith("/messages");
  const interval = isMessagesPage ? 5000 : 30000;

  const { data: count = 0 } = useUnreadMessageCountQuery({
    enabled: mounted,
    interval,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || count === 0) {
    return null;
  }

  return (
    <span
      className={`rounded-full bg-red-500 px-2 py-0.5 text-xs text-white font-medium animate-pulse ${className || ""}`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

// Hook for use in navigation where we need the count directly
export function useUnreadMessageCount() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { invalidateUnreadCount } = useInvalidateMessages();

  const isMessagesPage = pathname?.startsWith("/messages");
  const interval = isMessagesPage ? 5000 : 30000;

  const { data: count = 0 } = useUnreadMessageCountQuery({
    enabled: mounted,
    interval,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return { count: mounted ? count : 0, refreshCount: invalidateUnreadCount };
}
