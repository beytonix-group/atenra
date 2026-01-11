"use client";

import { useSession } from "next-auth/react";
import { FloatingChatWidget } from "@/components/chat/FloatingChatWidget";
import { useEffect, useState } from "react";

export default function ChatWidgetProvider() {
  const { data: session, status } = useSession();
  const [canAccessChat, setCanAccessChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        // Check if user has super_admin or agent role
        // Roles are stored in session from JWT
        const roles = (session?.user as { roles?: string[] | null })?.roles;

        if (roles && (roles.includes('super_admin') || roles.includes('agent'))) {
          setCanAccessChat(true);
        } else {
          setCanAccessChat(false);
        }
      } catch (error) {
        console.error("Failed to check chat access:", error);
        setCanAccessChat(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated" && session?.user) {
      checkAccess();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [session, status]);

  // Don't render if not authenticated or not authorized
  if (status !== "authenticated" || isLoading || !canAccessChat) {
    return null;
  }

  return <FloatingChatWidget />;
}
