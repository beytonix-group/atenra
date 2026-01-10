"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { fetchUnreadCount } from "@/lib/messages";

interface MessagesBadgeProps {
  className?: string;
}

export function MessagesBadge({ className }: MessagesBadgeProps) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Determine if we're on the messages page for faster polling
  const isMessagesPage = pathname?.startsWith("/messages");

  const refreshCount = useCallback(async () => {
    try {
      const unreadCount = await fetchUnreadCount();
      setCount(unreadCount);
    } catch (error) {
      console.error("Failed to fetch unread message count:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Initial fetch
    refreshCount();

    // Determine polling interval: 5s on messages page, 30s otherwise
    const interval = isMessagesPage ? 5000 : 30000;

    // Set up polling with visibility check
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      intervalId = setInterval(() => {
        // Only poll if document is visible
        if (document.visibilityState === "visible") {
          refreshCount();
        }
      }, interval);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Refresh immediately when tab becomes visible
        refreshCount();
        // Restart polling
        if (intervalId) clearInterval(intervalId);
        startPolling();
      } else {
        // Stop polling when tab is hidden
        if (intervalId) clearInterval(intervalId);
      }
    };

    // Start polling
    startPolling();

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mounted, isMessagesPage, refreshCount]);

  if (!mounted || count === 0) {
    return null;
  }

  return (
    <span
      className={`rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground ${className || ""}`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

// Hook for use in navigation where we need the count directly
export function useUnreadMessageCount() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isMessagesPage = pathname?.startsWith("/messages");

  const refreshCount = useCallback(async () => {
    try {
      const unreadCount = await fetchUnreadCount();
      setCount(unreadCount);
    } catch (error) {
      console.error("Failed to fetch unread message count:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    refreshCount();

    const interval = isMessagesPage ? 5000 : 30000;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") {
          refreshCount();
        }
      }, interval);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshCount();
        if (intervalId) clearInterval(intervalId);
        startPolling();
      } else {
        if (intervalId) clearInterval(intervalId);
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mounted, isMessagesPage, refreshCount]);

  return { count: mounted ? count : 0, refreshCount };
}
