"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from "react";
import {
  CookieConsent,
  getDefaultConsent,
  loadConsent,
  saveConsent,
} from "@/lib/cookie-consent";

interface CookieConsentContextType {
  consent: CookieConsent;
  hasConsented: boolean;
  isSettingsOpen: boolean;
  acceptAll: () => void;
  declineAll: () => void;
  updateConsent: (consent: Partial<Omit<CookieConsent, 'essential' | 'timestamp'>>) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(getDefaultConsent);
  const [hasConsented, setHasConsented] = useState(true); // Default to true to avoid flash
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const stored = loadConsent();
    if (stored) {
      setConsent(stored);
      setHasConsented(true);
    } else {
      setHasConsented(false);
    }
    setIsHydrated(true);
  }, []);

  const acceptAll = useCallback(() => {
    const newConsent: CookieConsent = {
      essential: true,
      functional: true,
      analytics: true,
      timestamp: Date.now(),
    };
    setConsent(newConsent);
    saveConsent(newConsent);
    setHasConsented(true);
    setIsSettingsOpen(false);
  }, []);

  const declineAll = useCallback(() => {
    const newConsent: CookieConsent = {
      essential: true,
      functional: false,
      analytics: false,
      timestamp: Date.now(),
    };
    setConsent(newConsent);
    saveConsent(newConsent);
    setHasConsented(true);
    setIsSettingsOpen(false);
  }, []);

  const updateConsent = useCallback((updates: Partial<Omit<CookieConsent, 'essential' | 'timestamp'>>) => {
    setConsent(prev => {
      const newConsent: CookieConsent = {
        ...prev,
        ...updates,
        essential: true, // Always true
        timestamp: Date.now(),
      };
      saveConsent(newConsent);
      setHasConsented(true);
      return newConsent;
    });
    setIsSettingsOpen(false);
  }, []);

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const contextValue = useMemo(() => ({
    consent,
    hasConsented: isHydrated ? hasConsented : true, // Avoid flash during hydration
    isSettingsOpen,
    acceptAll,
    declineAll,
    updateConsent,
    openSettings,
    closeSettings,
  }), [consent, hasConsented, isHydrated, isSettingsOpen, acceptAll, declineAll, updateConsent, openSettings, closeSettings]);

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
    </CookieConsentContext.Provider>
  );
}

/**
 * Hook to access cookie consent state and actions
 *
 * Usage:
 * const { consent, hasConsented, acceptAll, declineAll, openSettings } = useCookieConsent();
 *
 * // Check if user consented to analytics
 * if (consent.analytics) { loadAnalytics(); }
 *
 * // Open settings dialog from footer link
 * <button onClick={openSettings}>Cookie Preferences</button>
 */
export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
