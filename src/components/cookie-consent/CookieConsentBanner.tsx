"use client";

import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/components/providers/CookieConsentProvider";
import { CookieSettingsDialog } from "./CookieSettingsDialog";

export function CookieConsentBanner() {
  const { hasConsented, acceptAll, openSettings } = useCookieConsent();

  // Don't render if user has already consented
  if (hasConsented) {
    return <CookieSettingsDialog />;
  }

  return (
    <>
      <CookieSettingsDialog />
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-foreground">
                We use cookies to enhance your experience. Essential cookies are required for the site to function. You can customize other cookies.
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <Button variant="outline" onClick={openSettings}>
                Manage Preferences
              </Button>
              <Button onClick={acceptAll}>
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
