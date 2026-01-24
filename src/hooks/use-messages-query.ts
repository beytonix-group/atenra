'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pollForUpdates, fetchUnreadCount, LastMessage } from '@/lib/messages';
import { useRef, useCallback } from 'react';

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
	interval?: number;
	enabled?: boolean;
}

export function useUnreadMessageCount(options: UseUnreadMessageCountOptions = {}) {
	const { interval = 30000, enabled = true } = options;

	return useQuery({
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
		refetchInterval: interval,
		refetchIntervalInBackground: false,
	});
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
