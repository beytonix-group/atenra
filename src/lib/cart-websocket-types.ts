/**
 * WebSocket message types for cart real-time updates.
 * Used for type-safe WebSocket communication between cart DO and clients.
 */

export type CartEventType =
	| 'cart_item_added'
	| 'cart_item_removed'
	| 'cart_item_updated'
	| 'cart_cleared'
	| 'ping'
	| 'pong'
	| 'error';

/** Cart item data sent in WebSocket messages */
export interface CartItemData {
	id: number;
	title: string;
	description?: string | null;
	quantity: number;
	unitPriceCents?: number | null;
}

/** Who triggered the cart action */
export interface TriggeredBy {
	userId: number;
	role: 'owner' | 'agent';
}

/** Base message structure */
export interface CartWSBaseMessage {
	type: CartEventType;
	timestamp: number;
}

/** Server -> Client: Item was added to cart */
export interface CartWSItemAdded extends CartWSBaseMessage {
	type: 'cart_item_added';
	item: CartItemData;
	triggeredBy: TriggeredBy;
}

/** Server -> Client: Item was removed from cart */
export interface CartWSItemRemoved extends CartWSBaseMessage {
	type: 'cart_item_removed';
	itemId: number;
	triggeredBy: TriggeredBy;
}

/** Server -> Client: Item was updated */
export interface CartWSItemUpdated extends CartWSBaseMessage {
	type: 'cart_item_updated';
	itemId: number;
	item: CartItemData;
	triggeredBy: TriggeredBy;
}

/** Server -> Client: Cart was cleared */
export interface CartWSCleared extends CartWSBaseMessage {
	type: 'cart_cleared';
	triggeredBy: TriggeredBy;
}

/** Keep-alive ping/pong */
export interface CartWSPingPong extends CartWSBaseMessage {
	type: 'ping' | 'pong';
}

/** Server -> Client: Error notification */
export interface CartWSError extends CartWSBaseMessage {
	type: 'error';
	error: string;
	code?: string;
}

/** Union type for all cart WebSocket messages */
export type CartWSMessage =
	| CartWSItemAdded
	| CartWSItemRemoved
	| CartWSItemUpdated
	| CartWSCleared
	| CartWSPingPong
	| CartWSError;

/** Type guard for item added */
export function isCartItemAdded(msg: CartWSMessage): msg is CartWSItemAdded {
	return msg.type === 'cart_item_added';
}

/** Type guard for item removed */
export function isCartItemRemoved(msg: CartWSMessage): msg is CartWSItemRemoved {
	return msg.type === 'cart_item_removed';
}

/** Type guard for item updated */
export function isCartItemUpdated(msg: CartWSMessage): msg is CartWSItemUpdated {
	return msg.type === 'cart_item_updated';
}

/** Type guard for cart cleared */
export function isCartCleared(msg: CartWSMessage): msg is CartWSCleared {
	return msg.type === 'cart_cleared';
}

/** Broadcast payload sent from API routes to the Durable Object */
export interface CartBroadcastPayload {
	action: 'broadcast';
	event: CartWSMessage;
}

/** Token data for cart WebSocket authentication */
export interface CartTokenData {
	userId: number;
	cartUserId: number;
	role: 'owner' | 'agent';
	exp: number;
}
