"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { trackPageView, trackUserAction, trackFormSubmit } from '@/lib/activity-tracker';

/**
 * Hook to automatically track page views
 */
export function useActivityTracker() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    // Track page view when pathname changes and user is authenticated
    if (status === 'authenticated' && session?.user?.email) {
      console.log('Tracking page view:', pathname, 'for user:', session.user.email);
      // We'll let the API handle finding the user ID from the email
      trackPageView(pathname);
    }
  }, [pathname, session?.user?.email, status]);
  
  // Return helper functions for manual tracking
  return {
    trackAction: (actionName: string, details?: string) => {
      if (session?.user?.email) {
        trackUserAction(actionName, details);
      }
    },
    trackForm: (formName: string, success: boolean) => {
      if (session?.user?.email) {
        trackFormSubmit(formName, success);
      }
    },
  };
}