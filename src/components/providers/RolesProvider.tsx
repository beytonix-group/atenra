"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/auth/roles');
      if (response.ok) {
        const data = await response.json() as { roles: string[] | null };
        setRoles(data.roles);
        console.log('[RolesProvider] Fetched roles:', data.roles);
      } else {
        setRoles(null);
      }
    } catch (error) {
      console.error('[RolesProvider] Failed to fetch roles:', error);
      setRoles(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchRoles();
    } else if (status === "unauthenticated") {
      setRoles(null);
      setIsLoading(false);
    }
  }, [status, session?.user?.id]);

  // Reset roles when user logs out
  useEffect(() => {
    if (status === "unauthenticated") {
      setRoles(null);
    }
  }, [status]);

  const hasRole = (role: string): boolean => {
    return roles?.includes(role) ?? false;
  };

  const hasAnyRole = (checkRoles: string[]): boolean => {
    return checkRoles.some(role => roles?.includes(role));
  };

  return (
    <RolesContext.Provider value={{
      roles,
      isLoading,
      hasRole,
      hasAnyRole,
      refetchRoles: fetchRoles
    }}>
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
 * if (hasAnyRole(['super_admin', 'internal_employee'])) { ... }
 */
export function useUserRoles() {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error('useUserRoles must be used within a RolesProvider');
  }
  return context;
}
