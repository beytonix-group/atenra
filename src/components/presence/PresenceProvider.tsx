'use client';

import { useSession } from 'next-auth/react';
import { usePresence } from '@/hooks/use-presence';

/**
 * Provider component that enables presence heartbeats for authenticated users
 * Only sends heartbeats when user is authenticated
 * Add this to the main providers to enable online/offline status tracking
 */
export function PresenceProvider() {
	const { data: session, status } = useSession();
	const isAuthenticated = status === 'authenticated' && !!session?.user;

	// Start sending heartbeats only when authenticated
	usePresence({ enabled: isAuthenticated });

	return null; // This component doesn't render anything
}
