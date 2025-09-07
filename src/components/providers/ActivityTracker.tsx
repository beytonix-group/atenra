"use client";

import { useActivityTracker } from '@/hooks/use-activity-tracker';

export function ActivityTracker({ children }: { children: React.ReactNode }) {
  // This will automatically track page views for all pages
  useActivityTracker();
  
  return <>{children}</>;
}