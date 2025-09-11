"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import ActivityProvider from "@/components/providers/ActivityProvider";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <ActivityProvider />
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
}