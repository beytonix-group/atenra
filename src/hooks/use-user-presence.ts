'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { getUserPresence, getUsersPresence, PresenceStatus } from '@/lib/presence';
import { usePolling } from '@/hooks/use-polling';

interface UseUserPresenceResult {
	isOnline: boolean;
	isLoading: boolean;
	refetch: () => void;
}

interface UseUsersPresenceResult {
	statuses: Map<number, PresenceStatus>;
	isLoading: boolean;
	refetch: () => void;
}

/**
 * Hook to get a single user's online status
 * Refreshes automatically every 30 seconds with visibility API and backoff
 *
 * @example
 * const { isOnline, isLoading } = useUserPresence(userId);
 */
export function useUserPresence(userId: number | null | undefined): UseUserPresenceResult {
	const [isOnline, setIsOnline] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const fetchPresence = useCallback(async () => {
		if (!userId) {
			setIsOnline(false);
			setIsLoading(false);
			return;
		}

		try {
			const status = await getUserPresence(userId);
			setIsOnline(status.isOnline);
		} catch (error) {
			console.error('Error fetching user presence:', error);
			// Don't reset isOnline on error - keep the last known value
			throw error; // Re-throw to trigger backoff
		} finally {
			setIsLoading(false);
		}
	}, [userId]);

	const { poll } = usePolling(fetchPresence, {
		interval: 30000, // 30 seconds
		enabled: userId != null,
		pollOnMount: true,
	});

	return {
		isOnline,
		isLoading,
		refetch: poll,
	};
}

/**
 * Hook to get multiple users' online status
 * More efficient than calling useUserPresence multiple times
 * Refreshes automatically every 30 seconds with visibility API and backoff
 *
 * @example
 * const { statuses, isLoading } = useUsersPresence([1, 2, 3]);
 * const isUser1Online = statuses.get(1)?.isOnline;
 */
export function useUsersPresence(userIds: number[]): UseUsersPresenceResult {
	const [statuses, setStatuses] = useState<Map<number, PresenceStatus>>(new Map());
	const [isLoading, setIsLoading] = useState(true);

	// Create a stable key from userIds to avoid infinite loops
	const userIdsKey = userIds.slice().sort((a, b) => a - b).join(',');
	const userIdsRef = useRef<number[]>(userIds);

	// Update ref when key changes
	useEffect(() => {
		if (userIdsKey !== userIdsRef.current.slice().sort((a, b) => a - b).join(',')) {
			userIdsRef.current = userIds;
			setIsLoading(true);
		}
	}, [userIdsKey, userIds]);

	const fetchPresences = useCallback(async () => {
		const ids = userIdsRef.current;
		if (ids.length === 0) {
			setStatuses(new Map());
			setIsLoading(false);
			return;
		}

		try {
			const statusMap = await getUsersPresence(ids);
			setStatuses(statusMap);
		} catch (error) {
			console.error('Error fetching users presence:', error);
			// Don't clear statuses on error - keep the last known values
			throw error; // Re-throw to trigger backoff
		} finally {
			setIsLoading(false);
		}
		// userIdsKey is needed to recreate callback when IDs change (ref is updated before this runs)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userIdsKey]);

	const { poll } = usePolling(fetchPresences, {
		interval: 30000, // 30 seconds
		enabled: userIds.length > 0,
		pollOnMount: true,
	});

	return {
		statuses,
		isLoading,
		refetch: poll,
	};
}
