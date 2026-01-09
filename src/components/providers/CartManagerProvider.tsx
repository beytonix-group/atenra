"use client";

import { useSession } from "next-auth/react";
import { FloatingCartManager } from "@/components/cart/FloatingCartManager";
import { useEffect, useState } from "react";

export default function CartManagerProvider() {
  const { data: session, status } = useSession();
  const [canManageCarts, setCanManageCarts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        // Check if user has super_admin or internal_employee role
        // Roles are stored in session from JWT
        const roles = (session?.user as { roles?: string[] | null })?.roles;

        if (roles && (roles.includes('super_admin') || roles.includes('internal_employee'))) {
          setCanManageCarts(true);
        } else {
          setCanManageCarts(false);
        }
      } catch (error) {
        console.error("Failed to check cart management access:", error);
        setCanManageCarts(false);
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
  if (status !== "authenticated" || isLoading || !canManageCarts) {
    return null;
  }

  return <FloatingCartManager />;
}
