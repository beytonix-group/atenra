'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { pollForUpdates, LastMessage } from '@/lib/messages';

interface PollUpdate {
	id: number;
	newMessageCount: number;
	lastMessage: LastMessage | null;
}

interface UseMessagePollingOptions {
	interval?: number;
	enabled?: boolean;
	onNewMessages?: (updates: PollUpdate[]) => void;
}

export function useMessagePolling({
	interval = 5000,
	enabled = true,
	onNewMessages,
}: UseMessagePollingOptions) {
	const [lastPollTime, setLastPollTime] = useState<number>(() => Math.floor(Date.now() / 1000));
	const [isPolling, setIsPolling] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const errorCountRef = useRef(0);
	const maxErrorCount = 5;

	const poll = useCallback(async () => {
		if (!enabled || isPolling) return;

		setIsPolling(true);
		try {
			const data = await pollForUpdates(lastPollTime);
			setLastPollTime(data.serverTime);
			errorCountRef.current = 0; // Reset error count on success

			if (data.conversations.length > 0) {
				onNewMessages?.(data.conversations);
			}
		} catch (error) {
			console.error('Polling error:', error);
			errorCountRef.current += 1;
		} finally {
			setIsPolling(false);
		}
	}, [enabled, isPolling, lastPollTime, onNewMessages]);

	useEffect(() => {
		if (!enabled) {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			return;
		}

		const schedulePoll = () => {
			// Exponential backoff on errors
			const backoffMultiplier = Math.min(Math.pow(2, errorCountRef.current), 32);
			const actualInterval = errorCountRef.current > 0
				? Math.min(interval * backoffMultiplier, 60000) // Max 1 minute
				: interval;

			// Stop polling if too many consecutive errors
			if (errorCountRef.current >= maxErrorCount) {
				console.warn('Polling disabled due to too many errors');
				return;
			}

			timeoutRef.current = setTimeout(async () => {
				// Check if tab is visible before polling
				if (document.visibilityState === 'visible') {
					await poll();
				}
				schedulePoll();
			}, actualInterval);
		};

		schedulePoll();

		// Handle visibility change
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				// Poll immediately when tab becomes visible
				poll();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [enabled, interval, poll]);

	// Manual poll trigger
	const manualPoll = useCallback(async () => {
		errorCountRef.current = 0; // Reset errors on manual poll
		await poll();
	}, [poll]);

	return {
		poll: manualPoll,
		lastPollTime,
		isPolling,
	};
}
