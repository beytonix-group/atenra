import { db } from "@/server/db";
import { cartAuditLogs } from "@/server/db/schema";

export type CartAuditAction = 'add_item' | 'remove_item' | 'edit_item' | 'clear_all';

interface LogCartActionParams {
  targetUserId: number;
  employeeUserId: number;
  action: CartAuditAction;
  itemId?: number;
  itemTitle?: string;
  itemDescription?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log a cart action to the audit log
 * Used by agents when managing user carts
 */
export async function logCartAction(params: LogCartActionParams): Promise<void> {
  const {
    targetUserId,
    employeeUserId,
    action,
    itemId,
    itemTitle,
    itemDescription,
    metadata,
    ipAddress,
  } = params;

  await db.insert(cartAuditLogs).values({
    targetUserId,
    employeeUserId,
    action,
    itemId: itemId ?? null,
    itemTitle: itemTitle ?? null,
    itemDescription: itemDescription ?? null,
    metadata: metadata ? JSON.stringify(metadata) : null,
    ipAddress: ipAddress ?? null,
  });
}

/**
 * Log an "add_item" action
 */
export async function logAddItem(
  targetUserId: number,
  employeeUserId: number,
  item: { id: number; title: string; description?: string | null },
  ipAddress?: string
): Promise<void> {
  await logCartAction({
    targetUserId,
    employeeUserId,
    action: 'add_item',
    itemId: item.id,
    itemTitle: item.title,
    itemDescription: item.description ?? undefined,
    ipAddress,
  });
}

/**
 * Log a "remove_item" action
 */
export async function logRemoveItem(
  targetUserId: number,
  employeeUserId: number,
  item: { id: number; title: string; description?: string | null },
  ipAddress?: string
): Promise<void> {
  await logCartAction({
    targetUserId,
    employeeUserId,
    action: 'remove_item',
    itemId: item.id,
    itemTitle: item.title,
    itemDescription: item.description ?? undefined,
    ipAddress,
  });
}

/**
 * Log an "edit_item" action
 */
export async function logEditItem(
  targetUserId: number,
  employeeUserId: number,
  item: { id: number; title: string; description?: string | null },
  changes: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await logCartAction({
    targetUserId,
    employeeUserId,
    action: 'edit_item',
    itemId: item.id,
    itemTitle: item.title,
    itemDescription: item.description ?? undefined,
    metadata: { changes },
    ipAddress,
  });
}

/**
 * Log a "clear_all" action
 */
export async function logClearAll(
  targetUserId: number,
  employeeUserId: number,
  itemCount: number,
  ipAddress?: string
): Promise<void> {
  await logCartAction({
    targetUserId,
    employeeUserId,
    action: 'clear_all',
    metadata: { itemCount },
    ipAddress,
  });
}

/**
 * Get the client IP address from the request headers
 * Works with Cloudflare Workers and standard proxies
 */
export function getClientIp(request: Request): string | undefined {
  // Cloudflare Workers
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // Standard proxy headers
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // Take the first IP in the chain
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  return undefined;
}
