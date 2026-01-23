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
	pollFn: () => Promise<void>,
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

	// Keep pollFn ref up to date without causing re-renders
	pollFnRef.current = pollFn;

	const clearScheduledPoll = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	const poll = useCallback(async () => {
		if (isPollingRef.current) return;

		isPollingRef.current = true;
		try {
			await pollFnRef.current();
			errorCountRef.current = 0;
		} catch (error) {
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

			// Exponential backoff on errors
			const backoffMultiplier = Math.min(Math.pow(2, errorCountRef.current), maxBackoff);
			const actualInterval = errorCountRef.current > 0
				? Math.min(interval * backoffMultiplier, 60000) // Max 1 minute
				: interval;

			timeoutRef.current = setTimeout(async () => {
				// Only poll if tab is visible
				if (document.visibilityState === 'visible') {
					await poll();
				}
				schedulePoll();
			}, actualInterval);
		};

		// Poll immediately on mount if enabled
		if (pollOnMount) {
			poll();
		}

		schedulePoll();

		// Handle visibility change
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible' && pollOnVisible) {
				// Poll immediately when tab becomes visible
				poll();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			clearScheduledPoll();
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [enabled, interval, maxErrors, maxBackoff, pollOnMount, pollOnVisible, poll, clearScheduledPoll]);

	return {
		poll: manualPoll,
		resetErrors,
		errorCount: errorCountRef.current,
	};
}
