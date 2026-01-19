// API client functions for messaging

export interface Participant {
	id: number;
	displayName: string;
	email: string;
	avatarUrl: string | null;
	isAdmin?: boolean;
}

export interface LastMessage {
	id: number;
	content: string;
	createdAt: number;
	senderName: string;
}

export interface Conversation {
	id: number;
	title: string | null;
	isGroup: boolean;
	updatedAt: number;
	participants: Participant[];
	lastMessage: LastMessage | null;
	unreadCount: number;
}

export interface Message {
	id: number;
	content: string;
	contentType: string;
	createdAt: number;
	editedAt: number | null;
	isDeleted: boolean;
	sender: {
		id: number;
		displayName: string;
		avatarUrl: string | null;
	};
	isOwn: boolean;
}

export interface SearchUser {
	id: number;
	email: string;
	displayName: string;
	avatarUrl: string | null;
}

// Fetch all conversations for current user
export async function fetchConversations(): Promise<Conversation[]> {
	const response = await fetch('/api/messages/conversations');
	if (!response.ok) {
		throw new Error('Failed to fetch conversations');
	}
	const data = await response.json() as { conversations: Conversation[] };
	return data.conversations;
}

// Create a new conversation
export async function createConversation(
	participantIds: number[],
	options?: {
		title?: string;
		isGroup?: boolean;
		initialMessage?: string;
	}
): Promise<{ conversation: Conversation; existing: boolean }> {
	const response = await fetch('/api/messages/conversations', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			participantIds,
			...options,
		}),
	});
	if (!response.ok) {
		const errorData = await response.json() as { error?: string };
		throw new Error(errorData.error || 'Failed to create conversation');
	}
	return response.json() as Promise<{ conversation: Conversation; existing: boolean }>;
}

// Get conversation details
export async function fetchConversation(conversationId: number): Promise<Conversation> {
	const response = await fetch(`/api/messages/conversations/${conversationId}`);
	if (!response.ok) {
		throw new Error('Failed to fetch conversation');
	}
	const data = await response.json() as { conversation: Conversation };
	return data.conversation;
}

// Fetch messages for a conversation
export async function fetchMessages(
	conversationId: number,
	options?: { limit?: number; before?: number; after?: number }
): Promise<{ messages: Message[]; hasMore: boolean; oldestId: number | null }> {
	const params = new URLSearchParams();
	if (options?.limit) params.set('limit', options.limit.toString());
	if (options?.before) params.set('before', options.before.toString());
	if (options?.after) params.set('after', options.after.toString());

	const response = await fetch(
		`/api/messages/conversations/${conversationId}/messages?${params.toString()}`
	);
	if (!response.ok) {
		throw new Error('Failed to fetch messages');
	}
	return response.json();
}

// Send a message
export async function sendMessage(
	conversationId: number,
	content: string,
	contentType: 'html' | 'json' = 'html'
): Promise<Message> {
	const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ content, contentType }),
	});
	if (!response.ok) {
		const errorData = await response.json() as { error?: string };
		throw new Error(errorData.error || 'Failed to send message');
	}
	const data = await response.json() as { message: Message };
	return data.message;
}

// Mark conversation as read
export async function markConversationAsRead(conversationId: number): Promise<void> {
	const response = await fetch(`/api/messages/conversations/${conversationId}/read`, {
		method: 'POST',
	});
	if (!response.ok) {
		throw new Error('Failed to mark as read');
	}
}

// Add participants to a conversation
export async function addParticipants(
	conversationId: number,
	userIds: number[]
): Promise<{ success: boolean; participants: Participant[] }> {
	const response = await fetch(`/api/messages/conversations/${conversationId}/participants`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userIds }),
	});
	if (!response.ok) {
		const errorData = await response.json() as { error?: string };
		throw new Error(errorData.error || 'Failed to add participants');
	}
	return response.json() as Promise<{ success: boolean; participants: Participant[] }>;
}

// Poll for updates
export async function pollForUpdates(since: number): Promise<{
	conversations: Array<{
		id: number;
		newMessageCount: number;
		lastMessage: LastMessage | null;
	}>;
	serverTime: number;
}> {
	const response = await fetch(`/api/messages/poll?since=${since}`);
	if (!response.ok) {
		throw new Error('Failed to poll for updates');
	}
	return response.json();
}

// Search users
export async function searchUsers(query: string, limit?: number): Promise<SearchUser[]> {
	const params = new URLSearchParams({ q: query });
	if (limit) params.set('limit', limit.toString());

	const response = await fetch(`/api/messages/users/search?${params.toString()}`);
	if (!response.ok) {
		throw new Error('Failed to search users');
	}
	const data = await response.json() as { users: SearchUser[] };
	return data.users;
}

// Helper to format message date
export function formatMessageDate(timestamp: number): string {
	const date = new Date(timestamp * 1000);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
	const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

	if (messageDate.getTime() === today.getTime()) {
		return 'Today';
	} else if (messageDate.getTime() === yesterday.getTime()) {
		return 'Yesterday';
	} else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
		return date.toLocaleDateString('en-US', { weekday: 'long' });
	} else {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
		});
	}
}

// Helper to format message time
export function formatMessageTime(timestamp: number): string {
	const date = new Date(timestamp * 1000);
	return date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
}

// Helper to get conversation display name
export function getConversationDisplayName(
	conversation: Conversation,
	currentUserId: number
): string {
	if (conversation.title) {
		return conversation.title;
	}

	// For 1-on-1 conversations, show the other person's name
	const otherParticipants = conversation.participants.filter(p => p.id !== currentUserId);
	if (otherParticipants.length === 1) {
		return otherParticipants[0].displayName;
	}

	// For groups without title, show participant names
	return otherParticipants.map(p => p.displayName.split(' ')[0]).join(', ');
}

// Helper to truncate content for preview
export function truncateContent(content: string, maxLength: number = 50): string {
	// Strip HTML tags for preview
	const text = content.replace(/<[^>]*>/g, '').trim();
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength).trim() + '...';
}

// Fetch count of conversations with unread messages
export async function fetchUnreadCount(): Promise<number> {
	const response = await fetch('/api/messages/unread-count');
	if (!response.ok) {
		throw new Error('Failed to fetch unread count');
	}
	const data = await response.json() as { count: number };
	return data.count;
}
