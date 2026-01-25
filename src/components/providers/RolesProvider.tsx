"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface RolesContextType {
  roles: string[] | null;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  refetchRoles: () => Promise<void>;
}

const RolesContext = createContext<RolesContextType>({
  roles: null,
  isLoading: true,
  hasRole: () => false,
  hasAnyRole: () => false,
  refetchRoles: async () => {},
});

export function RolesProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract stable values for dependency tracking
  const userId = session?.user?.id;
  const sessionUser = session?.user as { roles?: string[] | null } | undefined;
  // Check if 'roles' key exists in session (even if null) vs missing entirely
  const hasRolesKey = sessionUser ? 'roles' in sessionUser : false;
  const sessionRoles = sessionUser?.roles;
  // Serialize roles array for stable dependency comparison (arrays are compared by reference)
  const sessionRolesKey = sessionRoles ? JSON.stringify(sessionRoles) : null;

  // Fallback to API only when JWT session doesn't have roles key (old token migration)
  const fetchRolesFromApi = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/roles');
      if (response.ok) {
        const data = await response.json() as { roles: string[] | null };
        setRoles(data.roles);
        console.log('[RolesProvider] Fetched roles from API (fallback):', data.roles);
      } else {
        setRoles(null);
      }
    } catch (error) {
      console.error('[RolesProvider] Failed to fetch roles from API:', error);
      setRoles(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && userId) {
      if (hasRolesKey) {
        // Roles key exists in JWT session - use it (even if null for users with no roles)
        setRoles(sessionRoles ?? null);
        setIsLoading(false);
        console.log('[RolesProvider] Using roles from JWT session:', sessionRoles);
      } else {
        // Roles key missing - old token format, fetch from API (one-time migration)
        console.log('[RolesProvider] No roles key in JWT session, fetching from API (migration)');
        fetchRolesFromApi();
      }
    } else if (status === "unauthenticated") {
      setRoles(null);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, userId, hasRolesKey, sessionRolesKey]);

  // Refetch forces an API call (for manual refresh if needed)
  const refetchRoles = useCallback(async () => {
    setIsLoading(true);
    await fetchRolesFromApi();
  }, [fetchRolesFromApi]);

  // Memoize callback functions to prevent unnecessary re-renders
  const hasRole = useCallback((role: string): boolean => {
    return roles?.includes(role) ?? false;
  }, [roles]);

  const hasAnyRole = useCallback((checkRoles: string[]): boolean => {
    return checkRoles.some(role => roles?.includes(role));
  }, [roles]);

  // Memoize the context value to prevent cascading re-renders
  const contextValue = useMemo(() => ({
    roles,
    isLoading,
    hasRole,
    hasAnyRole,
    refetchRoles
  }), [roles, isLoading, hasRole, hasAnyRole, refetchRoles]);

  return (
    <RolesContext.Provider value={contextValue}>
      {children}
    </RolesContext.Provider>
  );
}

/**
 * Hook to access user roles
 *
 * Usage:
 * const { roles, hasRole, hasAnyRole, isLoading } = useUserRoles();
 *
 * if (hasRole('super_admin')) { ... }
 * if (hasAnyRole(['super_admin', 'agent'])) { ... }
 */
export function useUserRoles() {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error('useUserRoles must be used within a RolesProvider');
  }
  return context;
}
