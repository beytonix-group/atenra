'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Message } from '@/lib/messages';
import type { WSMessage, WSNewMessage } from '@/lib/websocket-types';

interface UseConversationWebSocketOptions {
	conversationId: number | null;
	enabled?: boolean;
	onMessage?: (message: Message) => void;
	onTyping?: (userId: number) => void;
	onRead?: (userId: number, timestamp: number) => void;
	onConnectionChange?: (connected: boolean) => void;
}

interface UseConversationWebSocketResult {
	isConnected: boolean;
	sendTyping: () => void;
	sendRead: () => void;
	error: Error | null;
}

/**
 * Fetch a WebSocket auth token from the server.
 */
async function fetchWsToken(conversationId: number): Promise<string | null> {
	try {
		const response = await fetch(`/api/ws/token?conversationId=${conversationId}`);
		if (!response.ok) {
			console.error('Failed to fetch WebSocket token:', response.status);
			return null;
		}
		const data = (await response.json()) as { token?: string };
		return data.token || null;
	} catch (error) {
		console.error('Error fetching WebSocket token:', error);
		return null;
	}
}

/**
 * Hook for managing WebSocket connections to conversation Durable Objects.
 * Handles connection, reconnection with exponential backoff, and message parsing.
 *
 * Usage:
 * ```tsx
 * const { isConnected, sendTyping, sendRead, error } = useConversationWebSocket({
 *   conversationId: 123,
 *   onMessage: (message) => setMessages(prev => [...prev, message]),
 *   onTyping: (userId) => setTypingUsers(prev => [...prev, userId]),
 * });
 * ```
 */
export function useConversationWebSocket({
	conversationId,
	enabled = true,
	onMessage,
	onTyping,
	onRead,
	onConnectionChange,
}: UseConversationWebSocketOptions): UseConversationWebSocketResult {
	const wsRef = useRef<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const reconnectAttemptsRef = useRef(0);
	const maxReconnectAttempts = 5;
	const isConnectingRef = useRef(false);

	// Use refs for callbacks to avoid reconnection loops
	const onMessageRef = useRef(onMessage);
	const onTypingRef = useRef(onTyping);
	const onReadRef = useRef(onRead);
	const onConnectionChangeRef = useRef(onConnectionChange);

	useEffect(() => {
		onMessageRef.current = onMessage;
		onTypingRef.current = onTyping;
		onReadRef.current = onRead;
		onConnectionChangeRef.current = onConnectionChange;
	});

	const connect = useCallback(async () => {
		if (!conversationId || !enabled || isConnectingRef.current) return;

		isConnectingRef.current = true;

		// Close existing connection
		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		try {
			// Get auth token first
			const token = await fetchWsToken(conversationId);
			if (!token) {
				setError(new Error('Failed to get WebSocket token'));
				isConnectingRef.current = false;
				return;
			}

			// Construct WebSocket URL
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const wsUrl = `${protocol}//${window.location.host}/api/ws/connect?token=${encodeURIComponent(token)}`;

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
				let data: WSMessage;
				try {
					data = JSON.parse(event.data);
				} catch (parseError) {
					console.error('Error parsing WebSocket message:', parseError, 'Raw:', event.data);
					// Don't set error state for individual message parse failures
					// as it could be a one-off malformed message
					return;
				}

				try {
					switch (data.type) {
						case 'message': {
							const newMsg = data as WSNewMessage;
							const message: Message = {
								id: newMsg.payload.id,
								content: newMsg.payload.content,
								contentType: newMsg.payload.contentType,
								createdAt: newMsg.payload.createdAt,
								editedAt: null,
								isDeleted: false,
								sender: newMsg.payload.sender,
								isOwn: false, // Will be updated by the component based on current user
							};
							onMessageRef.current?.(message);
							break;
						}
						case 'typing':
							if ('userId' in data && data.userId) {
								onTypingRef.current?.(data.userId);
							}
							break;
						case 'read':
							if ('userId' in data && 'timestamp' in data && data.userId && data.timestamp) {
								onReadRef.current?.(data.userId, data.timestamp);
							}
							break;
						case 'pong':
							// Keep-alive response, no action needed
							break;
					}
				} catch (handlingError) {
					console.error('Error handling WebSocket message:', handlingError, 'Type:', data.type);
				}
			};

			ws.onerror = () => {
				console.error('WebSocket connection error:', {
					conversationId,
					readyState: ws.readyState,
					url: wsUrl,
				});
				setError(new Error('WebSocket connection error'));
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
					// Max reconnect attempts reached - notify user
					setError(new Error('Connection lost. Please refresh the page to reconnect.'));
				}
			};
		} catch (e) {
			setError(e as Error);
			setIsConnected(false);
			isConnectingRef.current = false;
		}
	}, [conversationId, enabled]);

	// Connect/disconnect on conversation change
	useEffect(() => {
		if (conversationId && enabled) {
			// Reset reconnect attempts when conversation changes
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
	}, [conversationId, enabled, connect]);

	// Send typing indicator
	const sendTyping = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN && conversationId) {
			try {
				wsRef.current.send(
					JSON.stringify({
						type: 'typing',
						conversationId,
					})
				);
			} catch (e) {
				console.error('Failed to send typing indicator:', e);
			}
		}
	}, [conversationId]);

	// Send read receipt
	const sendRead = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN && conversationId) {
			try {
				wsRef.current.send(
					JSON.stringify({
						type: 'read',
						conversationId,
					})
				);
			} catch (e) {
				console.error('Failed to send read receipt:', e);
			}
		}
	}, [conversationId]);

	return {
		isConnected,
		sendTyping,
		sendRead,
		error,
	};
}
