"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { logPageView, wireActivityAutoFlush } from "@/lib/activity-tracker";

export default function ActivityProvider() {
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    // Set up lifecycle event handlers once
    wireActivityAutoFlush();
  }, []);

  useEffect(() => {
    // Record page visits
    // The server will look up the database user ID from the session
    if (pathname) {
      // Don't send userId from client - let server determine it from session
      // This ensures we always use the correct database user ID
      logPageView(pathname);
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}