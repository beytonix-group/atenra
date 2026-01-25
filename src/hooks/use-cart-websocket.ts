'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type {
	CartWSMessage,
	CartWSItemAdded,
	CartWSItemRemoved,
	CartWSItemUpdated,
	CartWSCleared,
	CartWSError,
	CartItemData,
	TriggeredBy,
} from '@/lib/cart-websocket-types';

interface UseCartWebSocketOptions {
	/**
	 * The cart user ID to connect to.
	 * - null or undefined: connects to current user's own cart
	 * - number: connects to that user's cart (requires agent permissions)
	 */
	cartUserId?: number | null;
	/**
	 * Whether to enable the WebSocket connection
	 */
	enabled?: boolean;
	/**
	 * Called when an item is added to the cart
	 */
	onItemAdded?: (item: CartItemData, triggeredBy: TriggeredBy) => void;
	/**
	 * Called when an item is removed from the cart
	 */
	onItemRemoved?: (itemId: number, triggeredBy: TriggeredBy) => void;
	/**
	 * Called when an item is updated in the cart
	 */
	onItemUpdated?: (item: CartItemData, triggeredBy: TriggeredBy) => void;
	/**
	 * Called when the cart is cleared
	 */
	onCartCleared?: (triggeredBy: TriggeredBy) => void;
	/**
	 * Called when connection state changes
	 */
	onConnectionChange?: (connected: boolean) => void;
	/**
	 * Called when a transient error occurs (e.g., message handling failure).
	 * Useful for surfacing errors to the user via toast notifications.
	 */
	onError?: (error: Error) => void;
}

interface UseCartWebSocketResult {
	isConnected: boolean;
	error: Error | null;
}

interface FetchTokenResult {
	token?: string;
	error?: string;
}

/**
 * Fetch a WebSocket auth token for cart from the server.
 * Returns specific error messages based on response status.
 */
async function fetchCartToken(cartUserId?: number | null): Promise<FetchTokenResult> {
	try {
		const url = cartUserId
			? `/api/ws/cart-token?cartUserId=${cartUserId}`
			: '/api/ws/cart-token';

		const response = await fetch(url);
		if (!response.ok) {
			console.error('Failed to fetch cart WebSocket token:', response.status);
			if (response.status === 401) {
				return { error: 'Please sign in to view cart updates' };
			}
			if (response.status === 403) {
				return { error: 'You are not authorized to view this cart' };
			}
			if (response.status === 404) {
				return { error: 'Cart not found' };
			}
			return { error: `Server error (${response.status})` };
		}
		const data = (await response.json()) as { token?: string };
		if (!data.token) {
			return { error: 'No token received from server' };
		}
		return { token: data.token };
	} catch (error) {
		console.error('Error fetching cart WebSocket token:', error);
		return { error: 'Network error - please check your connection' };
	}
}

/**
 * Hook for managing WebSocket connections to cart Durable Objects.
 * Handles connection, reconnection with exponential backoff, and message parsing.
 *
 * Usage:
 * ```tsx
 * const { isConnected, error } = useCartWebSocket({
 *   cartUserId: null, // null = own cart
 *   onItemAdded: (item, triggeredBy) => {
 *     setItems(prev => [...prev, item]);
 *     if (triggeredBy.role === 'agent') {
 *       toast.info('An agent added an item to your cart');
 *     }
 *   },
 *   onCartCleared: () => setItems([]),
 * });
 * ```
 */
export function useCartWebSocket({
	cartUserId,
	enabled = true,
	onItemAdded,
	onItemRemoved,
	onItemUpdated,
	onCartCleared,
	onConnectionChange,
	onError,
}: UseCartWebSocketOptions): UseCartWebSocketResult {
	const wsRef = useRef<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const reconnectAttemptsRef = useRef(0);
	const maxReconnectAttempts = 5;
	const isConnectingRef = useRef(false);

	// Use refs for callbacks to avoid reconnection loops
	const onItemAddedRef = useRef(onItemAdded);
	const onItemRemovedRef = useRef(onItemRemoved);
	const onItemUpdatedRef = useRef(onItemUpdated);
	const onCartClearedRef = useRef(onCartCleared);
	const onConnectionChangeRef = useRef(onConnectionChange);
	const onErrorRef = useRef(onError);

	useEffect(() => {
		onItemAddedRef.current = onItemAdded;
		onItemRemovedRef.current = onItemRemoved;
		onItemUpdatedRef.current = onItemUpdated;
		onCartClearedRef.current = onCartCleared;
		onConnectionChangeRef.current = onConnectionChange;
		onErrorRef.current = onError;
	});

	const connect = useCallback(async () => {
		if (!enabled || isConnectingRef.current) return;

		isConnectingRef.current = true;

		// Close existing connection
		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

			try {
			// Get auth token first
			const result = await fetchCartToken(cartUserId);
			if (result.error || !result.token) {
				const errorMsg = result.error || 'Failed to get cart WebSocket token';
				setError(new Error(errorMsg));
				isConnectingRef.current = false;
				return;
			}

			// Construct WebSocket URL
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const wsUrl = `${protocol}//${window.location.host}/api/ws/cart-connect?token=${encodeURIComponent(result.token)}`;

			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				setIsConnected(true);
				setError(null);
				reconnectAttemptsRef.current = 0;
				isConnectingRef.current = false;
				onConnectionChangeRef.current?.(true);
			};

			ws.onmessage = (event) => {
				let data: CartWSMessage;
				try {
					data = JSON.parse(event.data);
				} catch (parseError) {
					console.error('Error parsing cart WebSocket message:', parseError, 'Raw:', event.data);
					onErrorRef.current?.(new Error('Failed to parse cart update'));
					return;
				}

				try {
					switch (data.type) {
						case 'cart_item_added': {
							const msg = data as CartWSItemAdded;
							onItemAddedRef.current?.(msg.item, msg.triggeredBy);
							break;
						}
						case 'cart_item_removed': {
							const msg = data as CartWSItemRemoved;
							onItemRemovedRef.current?.(msg.itemId, msg.triggeredBy);
							break;
						}
						case 'cart_item_updated': {
							const msg = data as CartWSItemUpdated;
							onItemUpdatedRef.current?.(msg.item, msg.triggeredBy);
							break;
						}
						case 'cart_cleared': {
							const msg = data as CartWSCleared;
							onCartClearedRef.current?.(msg.triggeredBy);
							break;
						}
							case 'error': {
							// Server sent an error message
							const errorMsg = data as CartWSError;
							const errorMessage = errorMsg.error || 'Unknown cart error';
							console.error('Cart WebSocket error from server:', { error: errorMsg.error, code: errorMsg.code });
							onErrorRef.current?.(new Error(errorMessage));
							break;
						}
						case 'pong':
							// Keep-alive response, no action needed
							break;
					}
				} catch (handlingError) {
					console.error('Error handling cart WebSocket message:', handlingError, 'Type:', data.type);
					onErrorRef.current?.(new Error(`Failed to handle cart update: ${data.type}`));
				}
			};

				ws.onerror = (event) => {
				console.error('Cart WebSocket connection error:', {
					cartUserId,
					readyState: ws.readyState,
					event, // Log event for debugging (may not contain useful info due to browser security)
				});
				const connectionError = new Error('Cart WebSocket connection error');
				setError(connectionError);
				onErrorRef.current?.(connectionError);
				isConnectingRef.current = false;
			};

			ws.onclose = () => {
				setIsConnected(false);
				onConnectionChangeRef.current?.(false);
				wsRef.current = null;
				isConnectingRef.current = false;

				// Attempt to reconnect with exponential backoff
				if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
					const delay = Math.min(
						1000 * Math.pow(2, reconnectAttemptsRef.current),
						30000
					);
					reconnectAttemptsRef.current++;

					reconnectTimeoutRef.current = setTimeout(() => {
						connect();
					}, delay);
				} else if (enabled && reconnectAttemptsRef.current >= maxReconnectAttempts) {
					// Max reconnect attempts reached
					setError(new Error('Cart connection lost. Please refresh the page.'));
				}
			};
		} catch (e) {
			setError(e as Error);
			setIsConnected(false);
			isConnectingRef.current = false;
		}
	}, [cartUserId, enabled]);

	// Connect/disconnect on cartUserId change or enabled change
	useEffect(() => {
		if (enabled) {
			// Reset reconnect attempts when cartUserId changes
			reconnectAttemptsRef.current = 0;
			connect();
		}

		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
			if (wsRef.current) {
				wsRef.current.close();
				wsRef.current = null;
			}
			isConnectingRef.current = false;
		};
	}, [cartUserId, enabled, connect]);

	return {
		isConnected,
		error,
	};
}
