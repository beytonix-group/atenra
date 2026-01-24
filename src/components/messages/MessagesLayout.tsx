'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
	Conversation,
	fetchConversations,
	fetchConversation,
	LastMessage,
} from '@/lib/messages';
import { useMessagesPoll } from '@/hooks/use-messages-query';
import { ConversationList } from './ConversationList';
import { ConversationThread } from './ConversationThread';
import { NewConversationDialog } from './NewConversationDialog';
import { AddParticipantsDialog } from './AddParticipantsDialog';
import { MessageSquare } from 'lucide-react';

interface MessagesLayoutProps {
	currentUserId: number;
}

export function MessagesLayout({ currentUserId }: MessagesLayoutProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const conversationIdParam = searchParams.get('conversation');

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [showNewDialog, setShowNewDialog] = useState(false);
	const [showAddParticipants, setShowAddParticipants] = useState(false);
	const [showMobileThread, setShowMobileThread] = useState(false);

	// Load conversations
	const loadConversations = useCallback(async () => {
		try {
			const data = await fetchConversations();
			setConversations(data);
			return data;
		} catch (error) {
			console.error('Failed to load conversations:', error);
			return [];
		}
	}, []);

	// Initial load
	useEffect(() => {
		const init = async () => {
			setIsLoading(true);
			const data = await loadConversations();

			// Handle conversation param from URL
			if (conversationIdParam) {
				const id = parseInt(conversationIdParam);
				const existingConv = data.find(c => c.id === id);
				if (existingConv) {
					setSelectedConversation(existingConv);
					setShowMobileThread(true);
				} else {
					// Try to fetch the conversation
					try {
						const conv = await fetchConversation(id);
						setSelectedConversation(conv);
						setShowMobileThread(true);
						// Refresh conversations list to include this one
						await loadConversations();
					} catch {
						// Conversation not found or not accessible
						router.replace('/messages');
					}
				}
			}

			setIsLoading(false);
		};

		init();
	}, [conversationIdParam, loadConversations, router]);

	// Polling for updates using React Query for deduplication
	const handleNewMessages = useCallback(
		(updates: Array<{ id: number; newMessageCount: number; lastMessage: LastMessage | null }>) => {
			// Update conversation list with new message counts
			setConversations(prev => {
				const updated = [...prev];
				for (const update of updates) {
					const index = updated.findIndex(c => c.id === update.id);
					if (index >= 0) {
						updated[index] = {
							...updated[index],
							unreadCount: updated[index].unreadCount + update.newMessageCount,
							lastMessage: update.lastMessage || updated[index].lastMessage,
							updatedAt: Math.floor(Date.now() / 1000),
						};
					}
				}
				// Re-sort by updatedAt
				return updated.sort((a, b) => b.updatedAt - a.updatedAt);
			});
		},
		[]
	);

	useMessagesPoll({
		interval: 5000,
		enabled: true,
		onNewMessages: handleNewMessages,
	});

	const handleSelectConversation = useCallback((id: number) => {
		const conversation = conversations.find(c => c.id === id);
		if (conversation) {
			setSelectedConversation(conversation);
			setShowMobileThread(true);
			router.push(`/messages?conversation=${id}`, { scroll: false });
		}
	}, [conversations, router]);

	const handleConversationCreated = useCallback((conversation: Conversation, isExisting: boolean) => {
		if (!isExisting) {
			setConversations(prev => [conversation, ...prev]);
		}
		setSelectedConversation(conversation);
		setShowMobileThread(true);
		router.push(`/messages?conversation=${conversation.id}`, { scroll: false });
	}, [router]);

	const handleBack = useCallback(() => {
		setShowMobileThread(false);
		setSelectedConversation(null);
		router.push('/messages', { scroll: false });
	}, [router]);

	const handleParticipantsAdded = useCallback(async () => {
		// Refresh conversation data
		if (selectedConversation) {
			const updated = await fetchConversation(selectedConversation.id);
			setSelectedConversation(updated);
			await loadConversations();
		}
	}, [selectedConversation, loadConversations]);

	return (
		<div className="h-[calc(100vh-4rem-2rem)] lg:h-[calc(100vh-4rem-3rem)] -m-4 lg:-m-6 flex">
			{/* Conversation List - hidden on mobile when thread is open */}
			<div className={`
				w-full md:w-80 lg:w-96 border-r flex-shrink-0
				${showMobileThread ? 'hidden md:flex' : 'flex'}
				flex-col
			`}>
				<ConversationList
					conversations={conversations}
					currentUserId={currentUserId}
					selectedConversationId={selectedConversation?.id || null}
					onSelectConversation={handleSelectConversation}
					onNewConversation={() => setShowNewDialog(true)}
					isLoading={isLoading}
				/>
			</div>

			{/* Conversation Thread */}
			<div className={`
				flex-1 flex flex-col
				${showMobileThread ? 'flex' : 'hidden md:flex'}
			`}>
				{selectedConversation ? (
					<ConversationThread
						conversation={selectedConversation}
						currentUserId={currentUserId}
						onBack={handleBack}
						onAddParticipants={() => setShowAddParticipants(true)}
					/>
				) : (
					<div className="flex-1 flex items-center justify-center">
						<div className="text-center">
							<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
								<MessageSquare className="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 className="text-lg font-medium mb-1">Select a conversation</h3>
							<p className="text-sm text-muted-foreground">
								Choose from your existing conversations or start a new one
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Dialogs */}
			<NewConversationDialog
				open={showNewDialog}
				onOpenChange={setShowNewDialog}
				onConversationCreated={handleConversationCreated}
			/>

			{selectedConversation && (
				<AddParticipantsDialog
					open={showAddParticipants}
					onOpenChange={setShowAddParticipants}
					conversationId={selectedConversation.id}
					existingParticipantIds={selectedConversation.participants.map(p => p.id)}
					onParticipantsAdded={handleParticipantsAdded}
				/>
			)}
		</div>
	);
}
