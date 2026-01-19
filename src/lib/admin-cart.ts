// Admin Cart API client functions for agents

export interface SearchUser {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface CartItem {
  id: number;
  title: string;
  description: string | null;
  quantity: number;
  unitPriceCents: number | null;
  addedByUserId: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface UserCartInfo {
  id: number;
  email: string;
  displayName: string;
}

export interface UserCart {
  user: UserCartInfo;
  items: CartItem[];
}

export interface AuditLogEntry {
  id: number;
  action: 'add_item' | 'remove_item' | 'clear_all';
  itemId: number | null;
  itemTitle: string | null;
  itemDescription: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: number;
  targetUser: UserCartInfo;
  employee: UserCartInfo;
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

// Search users by email or name
export async function searchUsers(query: string, limit?: number): Promise<SearchUser[]> {
  const params = new URLSearchParams({ q: query });
  if (limit !== undefined) params.set('limit', limit.toString());

  const response = await fetch(`/api/admin/cart/users/search?${params.toString()}`);
  if (!response.ok) {
    let errorMessage = 'Failed to search users';
    try {
      const error = await response.json() as { error?: string };
      errorMessage = error.error || errorMessage;
    } catch {
      // Response was not JSON, use default message
    }
    throw new Error(errorMessage);
  }
  const data = await response.json() as { users: SearchUser[] };
  return data.users;
}

// Get a user's cart
export async function getUserCart(userId: number): Promise<UserCart> {
  const response = await fetch(`/api/admin/cart/${userId}`);
  if (!response.ok) {
    let errorMessage = 'Failed to get user cart';
    try {
      const error = await response.json() as { error?: string };
      errorMessage = error.error || errorMessage;
    } catch {
      // Response was not JSON, use default message
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<UserCart>;
}

// Add an item to a user's cart
export async function addItemToUserCart(
  userId: number,
  item: { title: string; description?: string; unitPriceCents?: number }
): Promise<{ id: number; message: string }> {
  const response = await fetch(`/api/admin/cart/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    let errorMessage = 'Failed to add item';
    try {
      const error = await response.json() as { error?: string };
      errorMessage = error.error || errorMessage;
    } catch {
      // Response was not JSON, use default message
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<{ id: number; message: string }>;
}

// Update an item in a user's cart
export async function updateUserCartItem(
  userId: number,
  itemId: number,
  data: { title?: string; description?: string | null; unitPriceCents?: number | null }
): Promise<void> {
  const response = await fetch(`/api/admin/cart/${userId}/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let errorMessage = 'Failed to update item';
    try {
      const error = await response.json() as { error?: string };
      errorMessage = error.error || errorMessage;
    } catch {
      // Response was not JSON, use default message
    }
    throw new Error(errorMessage);
  }
}

// Remove a specific item from a user's cart
export async function removeItemFromUserCart(
  userId: number,
  itemId: number
): Promise<{ message: string }> {
  const response = await fetch(`/api/admin/cart/${userId}/${itemId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    let errorMessage = 'Failed to remove item';
    try {
      const error = await response.json() as { error?: string };
      errorMessage = error.error || errorMessage;
    } catch {
      // Response was not JSON, use default message
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<{ message: string }>;
}

// Clear all items from a user's cart
export async function clearUserCart(userId: number): Promise<{ message: string; itemsRemoved: number }> {
  const response = await fetch(`/api/admin/cart/${userId}/clear`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    let errorMessage = 'Failed to clear cart';
    try {
      const error = await response.json() as { error?: string };
      errorMessage = error.error || errorMessage;
    } catch {
      // Response was not JSON, use default message
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<{ message: string; itemsRemoved: number }>;
}

// Get audit logs with optional filters
export async function getAuditLogs(filters?: {
  targetUserId?: number;
  employeeUserId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLogsResponse> {
  const params = new URLSearchParams();
  if (filters?.targetUserId) params.set('targetUserId', filters.targetUserId.toString());
  if (filters?.employeeUserId) params.set('employeeUserId', filters.employeeUserId.toString());
  if (filters?.action) params.set('action', filters.action);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);
  if (filters?.limit !== undefined) params.set('limit', filters.limit.toString());
  if (filters?.offset !== undefined) params.set('offset', filters.offset.toString());

  const response = await fetch(`/api/admin/cart/audit-logs?${params.toString()}`);
  if (!response.ok) {
    let errorMessage = 'Failed to get audit logs';
    try {
      const error = await response.json() as { error?: string };
      errorMessage = error.error || errorMessage;
    } catch {
      // Response was not JSON, use default message
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<AuditLogsResponse>;
}
