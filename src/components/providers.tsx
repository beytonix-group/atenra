"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
}