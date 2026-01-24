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
	const abortControllerRef = useRef<AbortController | null>(null);
	const maxErrorCount = 5;

	const clearScheduledPoll = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	const poll = useCallback(async () => {
		// Don't poll if offline
		if (typeof navigator !== 'undefined' && !navigator.onLine) return;

		if (!enabled || isPolling) return;

		// Cancel any in-flight request
		abortControllerRef.current?.abort();
		abortControllerRef.current = new AbortController();

		setIsPolling(true);
		try {
			const data = await pollForUpdates(lastPollTime, abortControllerRef.current.signal);
			setLastPollTime(data.serverTime);
			errorCountRef.current = 0; // Reset error count on success

			if (data.conversations.length > 0) {
				onNewMessages?.(data.conversations);
			}
		} catch (error) {
			// Ignore abort errors - we caused them intentionally
			if (error instanceof Error && error.name === 'AbortError') {
				return;
			}
			console.error('Polling error:', error);
			errorCountRef.current += 1;
		} finally {
			setIsPolling(false);
		}
	}, [enabled, isPolling, lastPollTime, onNewMessages]);

	useEffect(() => {
		if (!enabled) {
			clearScheduledPoll();
			return;
		}

		const schedulePoll = () => {
			// Exponential backoff on errors with jitter
			const backoffMultiplier = Math.min(Math.pow(2, errorCountRef.current), 32);
			const baseInterval = errorCountRef.current > 0
				? Math.min(interval * backoffMultiplier, 60000) // Max 1 minute
				: interval;
			// Add ±10% jitter to prevent thundering herd
			const jitter = baseInterval * 0.1 * (Math.random() * 2 - 1);
			const actualInterval = Math.max(baseInterval + jitter, 1000); // Min 1 second

			// Stop polling if too many consecutive errors
			if (errorCountRef.current >= maxErrorCount) {
				console.warn('Polling disabled due to too many errors');
				return;
			}

			timeoutRef.current = setTimeout(async () => {
				// Check if tab is visible and online before polling
				if (document.visibilityState === 'visible' && (typeof navigator === 'undefined' || navigator.onLine)) {
					await poll();
				}
				schedulePoll();
			}, actualInterval);
		};

		// Handle online/offline
		const handleOnline = () => {
			errorCountRef.current = 0; // Reset errors on reconnect
			clearScheduledPoll(); // Clear existing schedule first to prevent duplicate chains
			poll(); // Poll immediately
			schedulePoll(); // Resume scheduling
		};

		const handleOffline = () => {
			clearScheduledPoll(); // Stop polling while offline
			abortControllerRef.current?.abort(); // Cancel any in-flight request
		};

		// Handle visibility change
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				// Poll immediately when tab becomes visible (if online)
				if (typeof navigator === 'undefined' || navigator.onLine) {
					poll();
				}
			}
		};

		// Check if already online before starting
		const isOnline = typeof navigator === 'undefined' || navigator.onLine;
		if (isOnline) {
			schedulePoll();
		}

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			clearScheduledPoll();
			abortControllerRef.current?.abort();
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [enabled, interval, poll, clearScheduledPoll]);

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
