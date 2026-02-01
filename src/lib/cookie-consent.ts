export type CookieCategory = 'essential' | 'functional' | 'analytics';

export interface CookieConsent {
  essential: boolean;  // Always true
  functional: boolean;
  analytics: boolean;
  timestamp: number;
}

export const COOKIE_CONSENT_KEY = 'atenra-cookie-consent';

export function getDefaultConsent(): CookieConsent {
  return {
    essential: true,
    functional: false,
    analytics: false,
    timestamp: Date.now(),
  };
}

export function loadConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;

    const consent = JSON.parse(stored) as CookieConsent;
    // Ensure essential is always true
    consent.essential = true;
    return consent;
  } catch {
    return null;
  }
}

export function saveConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;

  // Ensure essential is always true before saving
  const toSave: CookieConsent = {
    ...consent,
    essential: true,
    timestamp: Date.now(),
  };

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(toSave));
}

export function hasConsented(): boolean {
  return loadConsent() !== null;
}
