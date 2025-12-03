'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { getUserPresence, getUsersPresence, PresenceStatus } from '@/lib/presence';

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
 * Refreshes automatically every 30 seconds
 *
 * @example
 * const { isOnline, isLoading } = useUserPresence(userId);
 */
export function useUserPresence(userId: number | null | undefined): UseUserPresenceResult {
	const [isOnline, setIsOnline] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
			setIsOnline(false);
		} finally {
			setIsLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		fetchPresence();

		// Refresh every 30 seconds
		intervalRef.current = setInterval(fetchPresence, 30000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [fetchPresence]);

	return {
		isOnline,
		isLoading,
		refetch: fetchPresence,
	};
}

/**
 * Hook to get multiple users' online status
 * More efficient than calling useUserPresence multiple times
 * Refreshes automatically every 30 seconds
 *
 * @example
 * const { statuses, isLoading } = useUsersPresence([1, 2, 3]);
 * const isUser1Online = statuses.get(1)?.isOnline;
 */
export function useUsersPresence(userIds: number[]): UseUsersPresenceResult {
	const [statuses, setStatuses] = useState<Map<number, PresenceStatus>>(new Map());
	const [isLoading, setIsLoading] = useState(true);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Create a stable key from userIds to avoid infinite loops
	const userIdsKey = userIds.slice().sort((a, b) => a - b).join(',');
	const userIdsRef = useRef<number[]>(userIds);

	// Update ref when key changes
	if (userIdsKey !== userIdsRef.current.slice().sort((a, b) => a - b).join(',')) {
		userIdsRef.current = userIds;
	}

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
			setStatuses(new Map());
		} finally {
			setIsLoading(false);
		}
	}, [userIdsKey]);

	useEffect(() => {
		setIsLoading(true);
		fetchPresences();

		// Refresh every 30 seconds
		intervalRef.current = setInterval(fetchPresences, 30000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [fetchPresences]);

	return {
		statuses,
		isLoading,
		refetch: fetchPresences,
	};
}
