'use client';

import { useSession, signOut } from 'next-auth/react';
import { useCallback, useRef, useState } from 'react';
import {
  useInactivityTimeout,
  INACTIVITY_STORAGE_KEY,
} from '@/hooks/use-inactivity-timeout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Format seconds as MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Provider that handles inactivity timeout for authenticated users.
 *
 * - Shows a warning dialog 1 minute before timeout
 * - Auto-logs out user after 30 minutes of inactivity
 * - "Stay Logged In" button resets the timer
 * - Closing the dialog (X or Escape) = Stay Logged In
 */
export default function InactivityTimeoutProvider() {
  const { status } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Guard to prevent logout if user just clicked "Stay Logged In"
  const isStayingLoggedInRef = useRef(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return; // Prevent double-clicks
    setIsLoggingOut(true);

    try {
      // Clear the activity storage before signing out
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(INACTIVITY_STORAGE_KEY);
        } catch {
          // Non-critical: localStorage cleanup failed, continue with logout
        }
      }

      await signOut({ callbackUrl: '/login?error=SessionExpired' });
    } catch {
      // signOut failed - force navigation to login page as fallback
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=LogoutFailed';
      }
    }
    // Note: don't reset isLoggingOut on success - we're navigating away
  }, [isLoggingOut]);

  const handleWarning = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleTimeout = useCallback(() => {
    // Don't logout if user just clicked "Stay Logged In"
    if (isStayingLoggedInRef.current) {
      return;
    }
    handleLogout();
  }, [handleLogout]);

  const { remainingSeconds, resetActivity } = useInactivityTimeout({
    onWarning: handleWarning,
    onTimeout: handleTimeout,
    enabled: status === 'authenticated',
  });

  const handleStayLoggedIn = useCallback(() => {
    isStayingLoggedInRef.current = true;
    resetActivity();
    setIsDialogOpen(false);

    // Reset the guard after a short delay
    setTimeout(() => {
      isStayingLoggedInRef.current = false;
    }, 1000);
  }, [resetActivity]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        // Closing dialog = Stay Logged In
        handleStayLoggedIn();
      }
    },
    [handleStayLoggedIn]
  );

  // Only render dialog when authenticated
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Timeout Warning</DialogTitle>
          <DialogDescription>
            Your session will expire due to inactivity in{' '}
            <span className="font-semibold text-foreground">
              {formatTime(remainingSeconds)}
            </span>
            . Would you like to stay logged in?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Log Out Now'}
          </Button>
          <Button onClick={handleStayLoggedIn} disabled={isLoggingOut}>
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
