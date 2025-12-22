"use client";

import { useSession } from "next-auth/react";
import { FloatingChatWidget } from "@/components/chat/FloatingChatWidget";
import { useEffect, useState } from "react";

export default function ChatWidgetProvider() {
  const { data: session, status } = useSession();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const res = await fetch("/api/user/subscription-status");
        if (!res.ok) {
          throw new Error(`Subscription check failed: ${res.status}`);
        }
        const data: unknown = await res.json();
        if (typeof data !== "object" || data === null) {
          throw new Error("Invalid response format");
        }
        const responseData = data as Record<string, unknown>;
        const hasActive = Boolean(responseData.hasActiveSubscription);
        const isAdmin = Boolean(responseData.isAdmin);
        setHasSubscription(hasActive || isAdmin);
      } catch (error) {
        console.error("Failed to check subscription status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated" && session?.user) {
      checkSubscription();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [session, status]);

  // Don't render if not authenticated or no subscription
  if (status !== "authenticated" || isLoading || !hasSubscription) {
    return null;
  }

  return <FloatingChatWidget />;
}
