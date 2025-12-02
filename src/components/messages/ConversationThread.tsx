'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
	Conversation,
	Message,
	formatMessageDate,
	getConversationDisplayName,
	fetchMessages,
	sendMessage,
	markConversationAsRead,
} from '@/lib/messages';
import { MessageBubble } from './MessageBubble';
import { MessageDateGroup } from './MessageDateGroup';
import { MessageInput } from './MessageInput';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	MoreHorizontal,
	Users,
	UserPlus,
	ArrowLeft,
	Loader2,
	MessageSquare,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationThreadProps {
	conversation: Conversation;
	currentUserId: number;
	onBack?: () => void;
	onAddParticipants?: () => void;
}

// Group messages by date
function groupMessagesByDate(messages: Message[]): Array<{ date: string; messages: Message[] }> {
	const groups: Map<string, Message[]> = new Map();

	for (const message of messages) {
		const date = formatMessageDate(message.createdAt);
		if (!groups.has(date)) {
			groups.set(date, []);
		}
		groups.get(date)!.push(message);
	}

	return Array.from(groups.entries()).map(([date, msgs]) => ({
		date,
		messages: msgs,
	}));
}

export function ConversationThread({
	conversation,
	currentUserId,
	onBack,
	onAddParticipants,
}: ConversationThreadProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [oldestId, setOldestId] = useState<number | null>(null);
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);

	const displayName = getConversationDisplayName(conversation, currentUserId);
	const otherParticipants = conversation.participants.filter(p => p.id !== currentUserId);

	// Load messages
	const loadMessages = useCallback(async (before?: number) => {
		try {
			const data = await fetchMessages(conversation.id, { before, limit: 50 });
			if (before) {
				setMessages(prev => [...data.messages, ...prev]);
			} else {
				setMessages(data.messages);
			}
			setHasMore(data.hasMore);
			setOldestId(data.oldestId);
		} catch (error) {
			console.error('Failed to load messages:', error);
		}
	}, [conversation.id]);

	// Initial load
	useEffect(() => {
		setIsLoading(true);
		setMessages([]);
		loadMessages().finally(() => setIsLoading(false));
	}, [conversation.id, loadMessages]);

	// Mark as read when viewing
	useEffect(() => {
		if (conversation.unreadCount > 0) {
			markConversationAsRead(conversation.id).catch(console.error);
		}
	}, [conversation.id, conversation.unreadCount]);

	// Poll for new messages every 3 seconds
	useEffect(() => {
		if (isLoading) return;

		const pollNewMessages = async () => {
			try {
				// Get messages newer than the most recent one we have
				const latestMessageId = messages.length > 0 ? messages[messages.length - 1].id : undefined;
				const data = await fetchMessages(conversation.id, { after: latestMessageId, limit: 50 });

				if (data.messages.length > 0) {
					setMessages(prev => {
						// Filter out any messages we already have (by ID)
						const existingIds = new Set(prev.map(m => m.id));
						const newMessages = data.messages.filter(m => !existingIds.has(m.id));
						if (newMessages.length > 0) {
							return [...prev, ...newMessages];
						}
						return prev;
					});

					// Mark as read since we're viewing
					markConversationAsRead(conversation.id).catch(console.error);
				}
			} catch (error) {
				console.error('Failed to poll for new messages:', error);
			}
		};

		const intervalId = setInterval(pollNewMessages, 3000);

		return () => clearInterval(intervalId);
	}, [conversation.id, isLoading, messages]);

	// Scroll to bottom on new messages
	useEffect(() => {
		if (!isLoading) {
			bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages.length, isLoading]);

	// Load more messages
	const handleLoadMore = async () => {
		if (!hasMore || isLoadingMore || !oldestId) return;
		setIsLoadingMore(true);
		await loadMessages(oldestId);
		setIsLoadingMore(false);
	};

	// Send message
	const handleSend = async (content: string) => {
		const newMessage = await sendMessage(conversation.id, content, 'html');
		setMessages(prev => [...prev, newMessage]);
	};

	const messageGroups = groupMessagesByDate(messages);

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center gap-3 p-4 border-b">
				{onBack && (
					<Button
						variant="ghost"
						size="icon"
						onClick={onBack}
						className="md:hidden"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
				)}

				{/* Avatar */}
				{conversation.isGroup ? (
					<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
						<Users className="h-5 w-5 text-primary" />
					</div>
				) : otherParticipants[0]?.avatarUrl ? (
					<img
						src={otherParticipants[0].avatarUrl}
						alt={otherParticipants[0].displayName}
						className="w-10 h-10 rounded-full object-cover"
					/>
				) : (
					<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
						<span className="text-lg font-medium text-primary">
							{displayName.charAt(0).toUpperCase()}
						</span>
					</div>
				)}

				<div className="flex-1 min-w-0">
					<h3 className="font-semibold truncate">{displayName}</h3>
					<p className="text-xs text-muted-foreground">
						{conversation.isGroup
							? `${conversation.participants.length} participants`
							: 'Direct message'}
					</p>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="h-5 w-5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{onAddParticipants && (
							<DropdownMenuItem onClick={onAddParticipants}>
								<UserPlus className="h-4 w-4 mr-2" />
								Add participants
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Messages */}
			<ScrollArea className="flex-1" ref={scrollAreaRef}>
				<div className="p-4 space-y-4">
					{/* Load more button */}
					{hasMore && (
						<div className="flex justify-center">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleLoadMore}
								disabled={isLoadingMore}
							>
								{isLoadingMore ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Loading...
									</>
								) : (
									'Load older messages'
								)}
							</Button>
						</div>
					)}

					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
								<MessageSquare className="h-6 w-6 text-muted-foreground" />
							</div>
							<p className="text-sm font-medium">No messages yet</p>
							<p className="text-xs text-muted-foreground mt-1">
								Send a message to start the conversation
							</p>
						</div>
					) : (
						messageGroups.map((group, groupIndex) => (
							<div key={group.date}>
								<MessageDateGroup date={group.date} />
								<div className="space-y-3">
									{group.messages.map((message, messageIndex) => (
										<MessageBubble
											key={message.id}
											message={message}
											showSender={conversation.isGroup}
										/>
									))}
								</div>
							</div>
						))
					)}

					<div ref={bottomRef} />
				</div>
			</ScrollArea>

			{/* Message Input */}
			<MessageInput onSend={handleSend} />
		</div>
	);
}
