'use client';

import { useEffect, useCallback, useRef } from 'react';
import { sendHeartbeat } from '@/lib/presence';

interface UsePresenceOptions {
	interval?: number;  // Heartbeat interval in ms (default: 30000)
	enabled?: boolean;  // Enable/disable heartbeat
}

/**
 * Hook to send presence heartbeats
 * Sends heartbeat every 30 seconds while tab is visible
 * Pauses when tab is hidden, resumes immediately when visible
 */
export function usePresence({
	interval = 30000,  // 30 seconds
	enabled = true,
}: UsePresenceOptions = {}) {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const errorCountRef = useRef(0);
	const maxErrorCount = 5;

	const sendHeartbeatSafe = useCallback(async () => {
		try {
			await sendHeartbeat();
			errorCountRef.current = 0; // Reset error count on success
		} catch (error) {
			console.error('Heartbeat error:', error);
			errorCountRef.current += 1;
		}
	}, []);

	useEffect(() => {
		if (!enabled) {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			return;
		}

		// Send initial heartbeat immediately
		sendHeartbeatSafe();

		const scheduleHeartbeat = () => {
			// Exponential backoff on errors
			const backoffMultiplier = Math.min(Math.pow(2, errorCountRef.current), 8);
			const actualInterval = errorCountRef.current > 0
				? Math.min(interval * backoffMultiplier, 120000) // Max 2 minutes
				: interval;

			// Stop heartbeats if too many consecutive errors
			if (errorCountRef.current >= maxErrorCount) {
				console.warn('Presence heartbeat disabled due to too many errors');
				return;
			}

			timeoutRef.current = setTimeout(async () => {
				// Only send heartbeat if tab is visible
				if (document.visibilityState === 'visible') {
					await sendHeartbeatSafe();
				}
				scheduleHeartbeat();
			}, actualInterval);
		};

		scheduleHeartbeat();

		// Handle visibility change
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				// Send heartbeat immediately when tab becomes visible
				sendHeartbeatSafe();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [enabled, interval, sendHeartbeatSafe]);

	return {
		sendHeartbeat: sendHeartbeatSafe,
	};
}
