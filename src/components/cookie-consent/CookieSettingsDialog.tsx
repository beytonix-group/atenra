"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCookieConsent } from "@/components/providers/CookieConsentProvider";
import { useState, useEffect } from "react";

export function CookieSettingsDialog() {
  const { consent, isSettingsOpen, closeSettings, updateConsent, declineAll } = useCookieConsent();

  // Local state for pending changes
  const [functional, setFunctional] = useState(consent.functional);
  const [analytics, setAnalytics] = useState(consent.analytics);

  // Sync local state when dialog opens or consent changes
  useEffect(() => {
    if (isSettingsOpen) {
      setFunctional(consent.functional);
      setAnalytics(consent.analytics);
    }
  }, [isSettingsOpen, consent.functional, consent.analytics]);

  const handleSave = () => {
    updateConsent({ functional, analytics });
  };

  const handleDeclineOptional = () => {
    declineAll();
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. Essential cookies cannot be disabled as they are required for the site to function.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Essential Cookies - Always on */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="essential"
              checked={true}
              disabled
              className="mt-0.5"
            />
            <div className="space-y-1">
              <label
                htmlFor="essential"
                className="text-sm font-medium leading-none cursor-not-allowed opacity-70"
              >
                Essential Cookies (Required)
              </label>
              <p className="text-sm text-muted-foreground">
                Authentication and security. Cannot be disabled.
              </p>
            </div>
          </div>

          {/* Functional Cookies */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="functional"
              checked={functional}
              onCheckedChange={(checked) => setFunctional(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <label
                htmlFor="functional"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Functional Cookies
              </label>
              <p className="text-sm text-muted-foreground">
                Remember your preferences (theme, language, filters).
              </p>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="analytics"
              checked={analytics}
              onCheckedChange={(checked) => setAnalytics(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <label
                htmlFor="analytics"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Analytics Cookies
              </label>
              <p className="text-sm text-muted-foreground">
                Help us understand how you use our site.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDeclineOptional}>
            Decline Optional
          </Button>
          <Button onClick={handleSave}>
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
