import { getCloudflareContext } from '@opennextjs/cloudflare';
import type {
	CartWSMessage,
	CartItemData,
	TriggeredBy,
	CartBroadcastPayload,
} from './cart-websocket-types';

/**
 * Broadcast a cart event to all connected WebSocket clients.
 * This is called from cart API routes after a successful database mutation.
 *
 * @param cartUserId - The user whose cart was modified
 * @param event - The cart event to broadcast
 * @returns true if broadcast was delivered, false otherwise (non-blocking)
 */
export async function broadcastCartEvent(
	cartUserId: number,
	event: CartWSMessage
): Promise<boolean> {
	try {
		const { env } = getCloudflareContext();
		const cartWs = env.CART_WS as DurableObjectNamespace | undefined;

		if (!cartWs) {
			console.error('CART_WS Durable Object namespace not configured - WebSocket broadcasts disabled', {
				cartUserId,
				eventType: event.type,
			});
			return false;
		}

		const internalSecret = env.INTERNAL_BROADCAST_SECRET;
		if (!internalSecret) {
			console.error('INTERNAL_BROADCAST_SECRET not configured - WebSocket broadcasts disabled', {
				cartUserId,
				eventType: event.type,
			});
			return false;
		}

		const doId = cartWs.idFromName(`cart-${cartUserId}`);
		const stub = cartWs.get(doId);

		const broadcastPayload: CartBroadcastPayload = {
			action: 'broadcast',
			event,
		};

		const response = await stub.fetch('https://do-internal/broadcast', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Internal-Secret': internalSecret,
			},
			body: JSON.stringify(broadcastPayload),
		});

		if (response.ok) {
			return true;
		}

		console.error('Cart DO broadcast returned non-OK status:', {
			status: response.status,
			cartUserId,
			eventType: event.type,
		});
		return false;
	} catch (error) {
		console.error('Failed to broadcast cart event:', {
			error: error instanceof Error ? error.message : String(error),
			cartUserId,
			eventType: event.type,
		});
		return false;
	}
}

/**
 * Broadcast that an item was added to the cart
 */
export async function broadcastItemAdded(
	cartUserId: number,
	item: CartItemData,
	triggeredBy: TriggeredBy
): Promise<boolean> {
	return broadcastCartEvent(cartUserId, {
		type: 'cart_item_added',
		item,
		triggeredBy,
		timestamp: Date.now(),
	});
}

/**
 * Broadcast that an item was removed from the cart
 */
export async function broadcastItemRemoved(
	cartUserId: number,
	itemId: number,
	triggeredBy: TriggeredBy
): Promise<boolean> {
	return broadcastCartEvent(cartUserId, {
		type: 'cart_item_removed',
		itemId,
		triggeredBy,
		timestamp: Date.now(),
	});
}

/**
 * Broadcast that an item was updated in the cart
 */
export async function broadcastItemUpdated(
	cartUserId: number,
	item: CartItemData,
	triggeredBy: TriggeredBy
): Promise<boolean> {
	return broadcastCartEvent(cartUserId, {
		type: 'cart_item_updated',
		itemId: item.id,
		item,
		triggeredBy,
		timestamp: Date.now(),
	});
}

/**
 * Broadcast that the cart was cleared
 */
export async function broadcastCartCleared(
	cartUserId: number,
	triggeredBy: TriggeredBy
): Promise<boolean> {
	return broadcastCartEvent(cartUserId, {
		type: 'cart_cleared',
		triggeredBy,
		timestamp: Date.now(),
	});
}
