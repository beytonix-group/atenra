'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pollForUpdates, fetchUnreadCount, LastMessage } from '@/lib/messages';
import { useRef, useCallback, useState, useEffect } from 'react';
import { useUserWebSocket } from './use-user-websocket';

// Shared query keys for deduplication
export const MESSAGES_POLL_KEY = ['messages', 'poll'] as const;
export const MESSAGES_UNREAD_KEY = ['messages', 'unread-count'] as const;

interface PollResponse {
	conversations: Array<{
		id: number;
		newMessageCount: number;
		lastMessage: LastMessage | null;
	}>;
	serverTime: number;
}

interface UseMessagesPollOptions {
	interval?: number;
	enabled?: boolean;
	onNewMessages?: (updates: PollResponse['conversations']) => void;
}

export function useMessagesPoll(options: UseMessagesPollOptions = {}) {
	const { interval = 5000, enabled = true, onNewMessages } = options;
	const lastPollTimeRef = useRef(Math.floor(Date.now() / 1000));
	const onNewMessagesRef = useRef(onNewMessages);

	// Keep callback ref up to date
	onNewMessagesRef.current = onNewMessages;

	const query = useQuery({
		queryKey: MESSAGES_POLL_KEY,
		queryFn: async ({ signal }) => {
			// Don't poll if offline
			if (typeof navigator !== 'undefined' && !navigator.onLine) {
				throw new Error('Offline');
			}

			const data = await pollForUpdates(lastPollTimeRef.current, signal);
			lastPollTimeRef.current = data.serverTime;

			if (data.conversations.length > 0) {
				onNewMessagesRef.current?.(data.conversations);
			}

			return data;
		},
		enabled,
		refetchInterval: interval,
		refetchIntervalInBackground: false, // Pause when tab hidden
	});

	return query;
}

interface UseUnreadMessageCountOptions {
	/** Polling interval (shorthand for wsDisconnectedInterval, for backward compatibility) */
	interval?: number;
	/** Polling interval when WebSocket is connected (fallback) */
	wsConnectedInterval?: number;
	/** Polling interval when WebSocket is disconnected */
	wsDisconnectedInterval?: number;
	enabled?: boolean;
}

export function useUnreadMessageCount(options: UseUnreadMessageCountOptions = {}) {
	const {
		interval,
		wsConnectedInterval = 60000, // 60s when WS connected (fallback)
		wsDisconnectedInterval = interval ?? 30000, // 30s when WS disconnected (or use interval if provided)
		enabled = true,
	} = options;

	const queryClient = useQueryClient();
	const [wsConnected, setWsConnected] = useState(false);

	// Handle WebSocket unread count updates
	const handleUnreadCountChanged = useCallback(
		(count: number) => {
			// Directly update the query data without refetching
			queryClient.setQueryData(MESSAGES_UNREAD_KEY, count);
		},
		[queryClient]
	);

	// Connect to user WebSocket for real-time updates
	const { isConnected, error: wsError } = useUserWebSocket({
		enabled,
		onUnreadCountChanged: handleUnreadCountChanged,
		onConnectionChange: setWsConnected,
	});

	// Update wsConnected state when isConnected changes
	useEffect(() => {
		setWsConnected(isConnected);
	}, [isConnected]);

	// Use longer polling interval when WebSocket is connected (fallback only)
	const currentInterval = wsConnected ? wsConnectedInterval : wsDisconnectedInterval;

	const query = useQuery({
		queryKey: MESSAGES_UNREAD_KEY,
		queryFn: async ({ signal }) => {
			// Don't fetch if offline
			if (typeof navigator !== 'undefined' && !navigator.onLine) {
				throw new Error('Offline');
			}

			const count = await fetchUnreadCount(signal);
			return count;
		},
		enabled,
		refetchInterval: currentInterval,
		refetchIntervalInBackground: false,
	});

	return {
		...query,
		wsConnected,
		wsError,
	};
}

// Hook to invalidate message-related queries (useful after sending a message)
export function useInvalidateMessages() {
	const queryClient = useQueryClient();

	const invalidatePoll = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: MESSAGES_POLL_KEY });
	}, [queryClient]);

	const invalidateUnreadCount = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: MESSAGES_UNREAD_KEY });
	}, [queryClient]);

	const invalidateAll = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['messages'] });
	}, [queryClient]);

	return { invalidatePoll, invalidateUnreadCount, invalidateAll };
}
