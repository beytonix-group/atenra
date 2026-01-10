"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import ActivityProvider from "@/components/providers/ActivityProvider";
import { PresenceProvider } from "@/components/presence/PresenceProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { RolesProvider } from "@/components/providers/RolesProvider";
import ChatWidgetProvider from "@/components/providers/ChatWidgetProvider";
import CartManagerProvider from "@/components/providers/CartManagerProvider";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="theme"
      >
        <LanguageProvider>
          <RolesProvider>
            <ActivityProvider />
            <PresenceProvider />
            <ChatWidgetProvider />
            <CartManagerProvider />
            {children}
          </RolesProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}