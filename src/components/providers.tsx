"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import ActivityProvider from "@/components/providers/ActivityProvider";
import { PresenceProvider } from "@/components/presence/PresenceProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { RolesProvider } from "@/components/providers/RolesProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import ChatWidgetProvider from "@/components/providers/ChatWidgetProvider";
import CartManagerProvider from "@/components/providers/CartManagerProvider";
import InactivityTimeoutProvider from "@/components/providers/InactivityTimeoutProvider";
import { CookieConsentProvider } from "@/components/providers/CookieConsentProvider";
import { CookieConsentBanner } from "@/components/cookie-consent/CookieConsentBanner";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CookieConsentProvider>
        <QueryProvider>
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
                <InactivityTimeoutProvider />
                <ChatWidgetProvider />
                <CartManagerProvider />
                <CookieConsentBanner />
                {children}
              </RolesProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
      </CookieConsentProvider>
    </SessionProvider>
  );
}