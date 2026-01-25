import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Broadcast unread count change to a user via their User WebSocket DO.
 * This is called from message/read API routes when the unread count changes.
 *
 * @param userId - The user ID to broadcast to
 * @param count - The new unread count
 * @returns true if broadcast was successful, false otherwise
 */
export async function broadcastUnreadCountChange(
	userId: number,
	count: number
): Promise<boolean> {
	try {
		const { env } = getCloudflareContext();
		const userWs = env.USER_WS as DurableObjectNamespace | undefined;

		if (!userWs) {
			console.warn('USER_WS not available in environment');
			return false;
		}

		const doId = userWs.idFromName(`user-${userId}`);
		const stub = userWs.get(doId);

		const broadcastPayload = {
			action: 'broadcast',
			type: 'unread_count_changed',
			count,
		};

		const response = await stub.fetch('https://do-internal/broadcast', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(broadcastPayload),
		});

		if (response.ok) {
			return true;
		}

		console.error('User DO broadcast returned non-OK status:', {
			status: response.status,
			userId,
			count,
		});
		return false;
	} catch (error) {
		console.error('Failed to broadcast unread count via User WebSocket:', {
			error: error instanceof Error ? error.message : String(error),
			userId,
			count,
		});
		return false;
	}
}
