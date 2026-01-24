'use client';

import { useEffect, useCallback, useRef } from 'react';

interface UsePollingOptions {
	/** Polling interval in milliseconds (default: 5000) */
	interval?: number;
	/** Enable/disable polling (default: true) */
	enabled?: boolean;
	/** Maximum consecutive errors before stopping (default: 5) */
	maxErrors?: number;
	/** Maximum backoff multiplier (default: 32) */
	maxBackoff?: number;
	/** Poll immediately on mount (default: true) */
	pollOnMount?: boolean;
	/** Poll immediately when tab becomes visible (default: true) */
	pollOnVisible?: boolean;
}

/** Poll function that optionally accepts an AbortSignal */
type PollFunction = (options?: { signal?: AbortSignal }) => Promise<void>;

interface UsePollingResult {
	/** Manually trigger a poll (resets error count) */
	poll: () => Promise<void>;
	/** Reset error count without polling */
	resetErrors: () => void;
	/** Current error count */
	errorCount: number;
}

/**
 * Shared polling utility hook with:
 * - setTimeout (not setInterval) with recursive scheduling
 * - Exponential backoff on errors (2^errorCount, capped at maxBackoff)
 * - Visibility API integration (pauses when tab hidden, polls on return)
 * - Configurable interval, max errors, enabled state
 *
 * @example
 * ```tsx
 * const { poll } = usePolling({
 *   interval: 5000,
 *   enabled: true,
 *   pollFn: async () => {
 *     const data = await fetch('/api/data');
 *     setData(await data.json());
 *   },
 * });
 * ```
 */
export function usePolling(
	pollFn: PollFunction,
	options: UsePollingOptions = {}
): UsePollingResult {
	const {
		interval = 5000,
		enabled = true,
		maxErrors = 5,
		maxBackoff = 32,
		pollOnMount = true,
		pollOnVisible = true,
	} = options;

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const errorCountRef = useRef(0);
	const isPollingRef = useRef(false);
	const pollFnRef = useRef(pollFn);
	const abortControllerRef = useRef<AbortController | null>(null);

	// Keep pollFn ref up to date without causing re-renders
	pollFnRef.current = pollFn;

	const clearScheduledPoll = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	const poll = useCallback(async () => {
		// Don't poll if offline
		if (typeof navigator !== 'undefined' && !navigator.onLine) return;

		if (isPollingRef.current) return;

		// Cancel any in-flight request
		abortControllerRef.current?.abort();
		abortControllerRef.current = new AbortController();

		isPollingRef.current = true;
		try {
			await pollFnRef.current({ signal: abortControllerRef.current.signal });
			errorCountRef.current = 0;
		} catch (error) {
			// Ignore abort errors - we caused them intentionally
			if (error instanceof Error && error.name === 'AbortError') {
				return;
			}
			console.error('Polling error:', error);
			errorCountRef.current += 1;
		} finally {
			isPollingRef.current = false;
		}
	}, []);

	const resetErrors = useCallback(() => {
		errorCountRef.current = 0;
	}, []);

	const manualPoll = useCallback(async () => {
		errorCountRef.current = 0;
		await poll();
	}, [poll]);

	useEffect(() => {
		if (!enabled) {
			clearScheduledPoll();
			return;
		}

		const schedulePoll = () => {
			// Stop polling if too many consecutive errors
			if (errorCountRef.current >= maxErrors) {
				console.warn('Polling disabled due to too many errors');
				return;
			}

			// Exponential backoff on errors with jitter
			const backoffMultiplier = Math.min(Math.pow(2, errorCountRef.current), maxBackoff);
			const baseInterval = errorCountRef.current > 0
				? Math.min(interval * backoffMultiplier, 60000) // Max 1 minute
				: interval;
			// Add ±10% jitter to prevent thundering herd
			const jitter = baseInterval * 0.1 * (Math.random() * 2 - 1);
			const actualInterval = Math.max(baseInterval + jitter, 1000); // Min 1 second

			timeoutRef.current = setTimeout(async () => {
				// Only poll if tab is visible and online
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
			if (document.visibilityState === 'visible' && pollOnVisible) {
				// Poll immediately when tab becomes visible (if online)
				if (typeof navigator === 'undefined' || navigator.onLine) {
					poll();
				}
			}
		};

		// Check if already online before starting
		const isOnline = typeof navigator === 'undefined' || navigator.onLine;
		if (isOnline) {
			if (pollOnMount) {
				poll();
			}
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
	}, [enabled, interval, maxErrors, maxBackoff, pollOnMount, pollOnVisible, poll, clearScheduledPoll]);

	return {
		poll: manualPoll,
		resetErrors,
		errorCount: errorCountRef.current,
	};
}
