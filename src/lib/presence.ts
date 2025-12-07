// Presence API client - reusable functions for checking user online/offline status

export interface PresenceStatus {
	isOnline: boolean;
	lastActiveAt: number | null;
}

// Online threshold in seconds (must match server-side)
const ONLINE_THRESHOLD_SECONDS = 60;

/**
 * Send heartbeat to update current user's last active timestamp
 * Called by PresenceProvider every 30 seconds
 */
export async function sendHeartbeat(): Promise<void> {
	const response = await fetch('/api/presence/heartbeat', {
		method: 'POST',
	});
	if (!response.ok) {
		throw new Error('Failed to send heartbeat');
	}
}

/**
 * Get presence status for a single user
 * Primary reusable function - can be used by any feature
 *
 * @example
 * const status = await getUserPresence(userId);
 * if (status.isOnline) { ... }
 */
export async function getUserPresence(userId: number): Promise<PresenceStatus> {
	const statuses = await getUsersPresence([userId]);
	return statuses.get(userId) || { isOnline: false, lastActiveAt: null };
}

/**
 * Get presence status for multiple users (batch query)
 * More efficient when checking multiple users at once
 *
 * @example
 * const statuses = await getUsersPresence([1, 2, 3]);
 * const isUser1Online = statuses.get(1)?.isOnline;
 */
export async function getUsersPresence(userIds: number[]): Promise<Map<number, PresenceStatus>> {
	if (userIds.length === 0) {
		return new Map();
	}

	const response = await fetch(`/api/presence/status?userIds=${userIds.join(',')}`);
	if (!response.ok) {
		throw new Error('Failed to fetch presence status');
	}

	const data = await response.json() as { statuses: Record<number, PresenceStatus> };

	const statusMap = new Map<number, PresenceStatus>();
	for (const [id, status] of Object.entries(data.statuses)) {
		statusMap.set(parseInt(id), status);
	}

	return statusMap;
}

/**
 * Pure helper function to check if a timestamp indicates online status
 * Useful for client-side calculations without API call
 *
 * @param lastActiveAt - Unix timestamp (seconds) of last activity
 * @returns true if user is considered online (active within threshold)
 */
export function isUserOnline(lastActiveAt: number | null): boolean {
	if (!lastActiveAt) return false;
	const now = Math.floor(Date.now() / 1000);
	return (now - lastActiveAt) < ONLINE_THRESHOLD_SECONDS;
}
