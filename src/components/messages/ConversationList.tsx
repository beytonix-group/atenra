'use client';

import { useState, useMemo } from 'react';
import { Conversation } from '@/lib/messages';
import { ConversationItem } from './ConversationItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MessageSquare, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUsersPresence } from '@/hooks/use-user-presence';

interface ConversationListProps {
	conversations: Conversation[];
	currentUserId: number;
	selectedConversationId: number | null;
	onSelectConversation: (id: number) => void;
	onNewConversation: () => void;
	isLoading?: boolean;
}

export function ConversationList({
	conversations,
	currentUserId,
	selectedConversationId,
	onSelectConversation,
	onNewConversation,
	isLoading = false,
}: ConversationListProps) {
	const [searchQuery, setSearchQuery] = useState('');

	// Batch presence fetching: collect all user IDs from 1-on-1 conversations
	// This replaces N individual useUserPresence calls with a single batch request
	const presenceUserIds = useMemo(() => {
		const ids: number[] = [];
		for (const conv of conversations) {
			if (!conv.isGroup) {
				const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
				if (otherParticipant) {
					ids.push(otherParticipant.id);
				}
			}
		}
		return ids;
	}, [conversations, currentUserId]);

	// Single batch fetch for all users' presence status
	const { statuses: presenceStatuses } = useUsersPresence(presenceUserIds);

	const filteredConversations = conversations.filter(conv => {
		if (!searchQuery.trim()) return true;
		const query = searchQuery.toLowerCase();

		// Search in title
		if (conv.title?.toLowerCase().includes(query)) return true;

		// Search in participant names
		return conv.participants.some(p =>
			p.displayName.toLowerCase().includes(query)
		);
	});

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="p-4 border-b">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">Messages</h2>
					<Button size="sm" onClick={onNewConversation}>
						<Plus className="h-4 w-4 mr-1" />
						New
					</Button>
				</div>

				{/* Search */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search conversations..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Conversation List */}
			<ScrollArea className="flex-1">
				<div className="p-2">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : filteredConversations.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center px-4">
							<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
								<MessageSquare className="h-6 w-6 text-muted-foreground" />
							</div>
							{searchQuery ? (
								<>
									<p className="text-sm font-medium">No conversations found</p>
									<p className="text-xs text-muted-foreground mt-1">
										Try a different search term
									</p>
								</>
							) : (
								<>
									<p className="text-sm font-medium">No conversations yet</p>
									<p className="text-xs text-muted-foreground mt-1">
										Start a new conversation to begin messaging
									</p>
									<Button
										size="sm"
										className="mt-3"
										onClick={onNewConversation}
									>
										<Plus className="h-4 w-4 mr-1" />
										Start conversation
									</Button>
								</>
							)}
						</div>
					) : (
						<div className="space-y-1">
							{filteredConversations.map((conversation) => {
								// Get pre-fetched presence status for 1-on-1 conversations
								let presenceStatus: boolean | undefined;
								if (!conversation.isGroup) {
									const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
									if (otherParticipant) {
										presenceStatus = presenceStatuses.get(otherParticipant.id)?.isOnline;
									}
								}
								return (
									<ConversationItem
										key={conversation.id}
										conversation={conversation}
										currentUserId={currentUserId}
										isSelected={selectedConversationId === conversation.id}
										onClick={() => onSelectConversation(conversation.id)}
										presenceStatus={presenceStatus}
									/>
								);
							})}
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
