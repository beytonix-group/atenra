"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { fetchUnreadCount } from "@/lib/messages";
import { usePolling } from "@/hooks/use-polling";

interface MessagesBadgeProps {
  className?: string;
}

// Shared hook for unread message count with polling
function useUnreadMessageCountInternal(options: { enabled: boolean; interval: number }) {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const unreadCount = await fetchUnreadCount();
      setCount(unreadCount);
    } catch (error) {
      console.error("Failed to fetch unread message count:", error);
      // Don't reset count to 0 on error - keep the last known value
      throw error; // Re-throw to trigger backoff in usePolling
    }
  }, []);

  const { poll } = usePolling(fetchCount, {
    interval: options.interval,
    enabled: options.enabled,
    pollOnMount: true,
  });

  return { count, refreshCount: poll };
}

export function MessagesBadge({ className }: MessagesBadgeProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Determine if we're on the messages page for faster polling
  const isMessagesPage = pathname?.startsWith("/messages");
  const interval = isMessagesPage ? 5000 : 30000;

  const { count } = useUnreadMessageCountInternal({
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

  const isMessagesPage = pathname?.startsWith("/messages");
  const interval = isMessagesPage ? 5000 : 30000;

  const { count, refreshCount } = useUnreadMessageCountInternal({
    enabled: mounted,
    interval,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return { count: mounted ? count : 0, refreshCount };
}
