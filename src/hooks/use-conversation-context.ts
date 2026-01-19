'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { fetchConversation, type Participant } from '@/lib/messages';

interface ConversationContext {
	isOnConversationPage: boolean;
	conversationId: number | null;
	participants: Participant[];
	isLoading: boolean;
	error: string | null;
}

export function useConversationContext(): ConversationContext {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [participants, setParticipants] = useState<Participant[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Detect if on messages page with conversation param
	const isOnMessagesPage = pathname === '/messages';
	const conversationIdParam = searchParams.get('conversation');
	const conversationId = conversationIdParam ? parseInt(conversationIdParam) : null;
	const isOnConversationPage = isOnMessagesPage && conversationId !== null && !isNaN(conversationId);

	useEffect(() => {
		if (!isOnConversationPage || conversationId === null) {
			setParticipants([]);
			setError(null);
			return;
		}

		const loadParticipants = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const conversation = await fetchConversation(conversationId);
				setParticipants(conversation.participants);
			} catch (error) {
				console.error('Failed to load conversation participants:', {
					conversationId,
					error: error instanceof Error ? error.message : error,
				});
				setError('Failed to load participants');
				setParticipants([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadParticipants();
	}, [isOnConversationPage, conversationId]);

	return {
		isOnConversationPage,
		conversationId,
		participants,
		isLoading,
		error,
	};
}
