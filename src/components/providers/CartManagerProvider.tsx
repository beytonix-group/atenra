"use client";

import { FloatingCartManager } from "@/components/cart/FloatingCartManager";
import { useUserRoles } from "@/components/providers/RolesProvider";

export default function CartManagerProvider() {
  const { hasAnyRole, isLoading } = useUserRoles();

  // Check if user has cart management access
  const canManageCarts = hasAnyRole(['super_admin', 'internal_employee']);

  // Don't render if loading or not authorized
  if (isLoading || !canManageCarts) {
    return null;
  }

  return <FloatingCartManager />;
}
