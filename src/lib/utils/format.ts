/**
 * Converts snake_case or lowercase strings to Title Case
 * Examples:
 * - "super_admin" -> "Super Admin"
 * - "user" -> "User"
 * - "email_verified" -> "Email Verified"
 * - "active" -> "Active"
 */
export function formatDisplayText(text: string): string {
  if (!text) return '';
  
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format role name for display
 */
export function formatRoleName(role: string): string {
  return formatDisplayText(role);
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  return formatDisplayText(status);
}

/**
 * Get role badge color based on role name
 */
export function getRoleBadgeVariant(role: string): "default" | "destructive" | "secondary" | "outline" {
  const roleColors: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    super_admin: "destructive",
    manager: "default",
    employee: "secondary",
    user: "outline"
  };
  return roleColors[role] || "outline";
}

/**
 * Get status badge color based on status
 */
export function getStatusBadgeVariant(status: string): "default" | "destructive" | "secondary" | "outline" | "success" {
  const statusColors: Record<string, "default" | "destructive" | "secondary" | "outline" | "success"> = {
    active: "success",
    suspended: "destructive",
    deleted: "secondary",
    inactive: "outline"
  };
  return statusColors[status] || "outline";
}