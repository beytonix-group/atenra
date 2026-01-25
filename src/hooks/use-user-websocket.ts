'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { UserWSMessage } from '@/lib/user-websocket-types';

interface UseUserWebSocketOptions {
	enabled?: boolean;
	onUnreadCountChanged?: (count: number) => void;
	onConnectionChange?: (connected: boolean) => void;
}

interface UseUserWebSocketResult {
	isConnected: boolean;
	error: Error | null;
}

/**
 * Fetch a WebSocket auth token for user-level WebSocket connection.
 */
async function fetchUserWsToken(): Promise<string | null> {
	try {
		const response = await fetch('/api/ws/token?type=user');
		if (!response.ok) {
			console.error('Failed to fetch User WebSocket token:', response.status);
			return null;
		}
		const data = (await response.json()) as { token?: string };
		return data.token || null;
	} catch (error) {
		console.error('Error fetching User WebSocket token:', error);
		return null;
	}
}

/**
 * Hook for managing user-level WebSocket connections.
 * Provides real-time updates for global notifications like unread message count.
 *
 * Usage:
 * ```tsx
 * const { isConnected, error } = useUserWebSocket({
 *   onUnreadCountChanged: (count) => setUnreadCount(count),
 * });
 * ```
 */
export function useUserWebSocket({
	enabled = true,
	onUnreadCountChanged,
	onConnectionChange,
}: UseUserWebSocketOptions = {}): UseUserWebSocketResult {
	const wsRef = useRef<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const reconnectAttemptsRef = useRef(0);
	const maxReconnectAttempts = 5;
	const isConnectingRef = useRef(false);

	// Use refs for callbacks to avoid reconnection loops
	const onUnreadCountChangedRef = useRef(onUnreadCountChanged);
	const onConnectionChangeRef = useRef(onConnectionChange);

	useEffect(() => {
		onUnreadCountChangedRef.current = onUnreadCountChanged;
		onConnectionChangeRef.current = onConnectionChange;
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
			const token = await fetchUserWsToken();
			if (!token) {
				setError(new Error('Failed to get User WebSocket token'));
				isConnectingRef.current = false;
				return;
			}

			// Construct WebSocket URL
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const wsUrl = `${protocol}//${window.location.host}/api/ws/user-connect?token=${encodeURIComponent(token)}`;

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
				let data: UserWSMessage;
				try {
					data = JSON.parse(event.data);
				} catch (parseError) {
					console.error('Error parsing User WebSocket message:', parseError, 'Raw:', event.data);
					return;
				}

				try {
					switch (data.type) {
						case 'unread_count_changed':
							if ('count' in data && typeof data.count === 'number') {
								onUnreadCountChangedRef.current?.(data.count);
							}
							break;
						case 'pong':
							// Keep-alive response, no action needed
							break;
						case 'error':
							console.error('User WebSocket error from server:', data);
							break;
					}
				} catch (handlingError) {
					console.error('Error handling User WebSocket message:', handlingError, 'Type:', data.type);
				}
			};

			ws.onerror = () => {
				console.error('User WebSocket connection error:', {
					readyState: ws.readyState,
					url: wsUrl,
				});
				setError(new Error('User WebSocket connection error'));
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
					setError(new Error('User WebSocket connection lost. Will retry on next page load.'));
				}
			};
		} catch (e) {
			setError(e as Error);
			setIsConnected(false);
			isConnectingRef.current = false;
		}
	}, [enabled]);

	// Connect/disconnect on enabled change
	useEffect(() => {
		if (enabled) {
			// Reset reconnect attempts
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
	}, [enabled, connect]);

	return {
		isConnected,
		error,
	};
}
