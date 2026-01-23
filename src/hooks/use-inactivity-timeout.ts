'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Constants - exported for use in other components
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const WARNING_BEFORE_MS = 1 * 60 * 1000; // 1 minute warning
export const INACTIVITY_STORAGE_KEY = 'atenra-last-activity';
const CHECK_INTERVAL_MS = 1000; // Check every second
const ACTIVITY_THROTTLE_MS = 5000; // Throttle localStorage writes

interface UseInactivityTimeoutOptions {
  onWarning?: () => void;
  onTimeout?: () => void;
  enabled?: boolean;
}

interface UseInactivityTimeoutResult {
  remainingSeconds: number;
  isWarningShown: boolean;
  resetActivity: () => void;
}

/**
 * Hook to track user inactivity and trigger warnings/timeouts
 *
 * - Listens to activity events (mouse, keyboard, scroll, click, touch)
 * - Stores last activity time in localStorage for cross-tab sync
 * - Throttles localStorage writes to every 5 seconds
 * - Triggers onWarning callback 1 minute before timeout
 * - Triggers onTimeout callback when timeout is reached
 * - Resets timer when user returns to tab (visibility API)
 */
export function useInactivityTimeout(
  options: UseInactivityTimeoutOptions = {}
): UseInactivityTimeoutResult {
  const { onWarning, onTimeout, enabled = true } = options;

  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.floor(INACTIVITY_TIMEOUT_MS / 1000)
  );
  const [isWarningShown, setIsWarningShown] = useState(false);

  // Refs to track state without causing re-renders
  const lastWriteTimeRef = useRef<number>(0);
  const warningTriggeredRef = useRef(false);
  const timeoutTriggeredRef = useRef(false);
  const onWarningRef = useRef(onWarning);
  const onTimeoutRef = useRef(onTimeout);

  // Keep callback refs up to date
  useEffect(() => {
    onWarningRef.current = onWarning;
    onTimeoutRef.current = onTimeout;
  }, [onWarning, onTimeout]);

  // Get last activity time from localStorage with error handling
  const getLastActivityTime = useCallback((): number => {
    if (typeof window === 'undefined') return Date.now();

    try {
      const stored = localStorage.getItem(INACTIVITY_STORAGE_KEY);
      if (stored) {
        const time = parseInt(stored, 10);
        const now = Date.now();

        // Validate: must be a number, positive, not too far in future or past
        if (
          !isNaN(time) &&
          time > 0 &&
          time <= now + 60000 && // Allow 1 minute clock drift
          time >= now - INACTIVITY_TIMEOUT_MS - 60000
        ) {
          return time;
        }
      }
    } catch {
      // localStorage may be unavailable in private browsing or when storage is disabled
      // Fall back to Date.now() - timeout will still work for current tab
    }
    return Date.now();
  }, []);

  // Update last activity time in localStorage (throttled) with error handling
  const updateLastActivityTime = useCallback((force = false) => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    // Throttle writes unless forced
    if (!force && now - lastWriteTimeRef.current < ACTIVITY_THROTTLE_MS) {
      return;
    }

    lastWriteTimeRef.current = now;

    try {
      localStorage.setItem(INACTIVITY_STORAGE_KEY, now.toString());
    } catch {
      // localStorage write failed - continue with in-memory tracking
      // Cross-tab sync will be broken but single-tab timeout still works
    }

    // Reset warning/timeout flags on activity
    warningTriggeredRef.current = false;
    timeoutTriggeredRef.current = false;
    setIsWarningShown(false);
  }, []);

  // Reset activity timer (called by "Stay Logged In" button)
  const resetActivity = useCallback(() => {
    updateLastActivityTime(true);
  }, [updateLastActivityTime]);

  // Set up activity event listeners
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleActivity = () => {
      updateLastActivityTime();
    };

    // Activity events to track
    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'click',
      'touchstart',
      'touchmove',
    ];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize last activity time
    updateLastActivityTime(true);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, updateLastActivityTime]);

  // Handle visibility change - check timeout when user returns to tab
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User returned to tab - check if timeout exceeded while away
        const lastActivity = getLastActivityTime();
        const elapsed = Date.now() - lastActivity;

        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          // Timeout exceeded while tab was hidden - trigger timeout immediately
          if (!timeoutTriggeredRef.current) {
            timeoutTriggeredRef.current = true;
            setRemainingSeconds(0);
            try {
              onTimeoutRef.current?.();
            } catch {
              // Callback error - timeout still triggered
            }
          }
        } else if (elapsed >= INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS) {
          // In warning period - show warning but don't reset
          if (!warningTriggeredRef.current) {
            warningTriggeredRef.current = true;
            setIsWarningShown(true);
            setRemainingSeconds(Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
            try {
              onWarningRef.current?.();
            } catch {
              // Callback error - warning still shown
            }
          }
        }
        // Note: Don't auto-reset on tab return - require actual user activity
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, getLastActivityTime]);

  // Handle cross-tab sync via storage event
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === INACTIVITY_STORAGE_KEY && event.newValue) {
        // Activity in another tab - reset warning state
        warningTriggeredRef.current = false;
        timeoutTriggeredRef.current = false;
        setIsWarningShown(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [enabled]);

  // Check timeout status every second
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const checkTimeout = () => {
      const lastActivity = getLastActivityTime();
      const elapsed = Date.now() - lastActivity;
      const remaining = Math.max(0, INACTIVITY_TIMEOUT_MS - elapsed);
      const remainingSec = Math.ceil(remaining / 1000);

      setRemainingSeconds(remainingSec);

      // Check if we should show warning (1 minute before timeout)
      if (remaining <= WARNING_BEFORE_MS && remaining > 0) {
        if (!warningTriggeredRef.current) {
          warningTriggeredRef.current = true;
          setIsWarningShown(true);
          try {
            onWarningRef.current?.();
          } catch {
            // Callback error - warning still shown
          }
        }
      } else if (remaining > WARNING_BEFORE_MS) {
        // Reset warning state if user became active
        if (warningTriggeredRef.current) {
          warningTriggeredRef.current = false;
          setIsWarningShown(false);
        }
      }

      // Check if timeout reached
      if (remaining === 0 && !timeoutTriggeredRef.current) {
        timeoutTriggeredRef.current = true;
        try {
          onTimeoutRef.current?.();
        } catch {
          // Callback error - timeout still triggered
        }
      }
    };

    // Initial check
    checkTimeout();

    // Set up interval
    const intervalId = setInterval(checkTimeout, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, getLastActivityTime]);

  return {
    remainingSeconds,
    isWarningShown,
    resetActivity,
  };
}
