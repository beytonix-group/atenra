'use client';

import { memo } from 'react';
import { Conversation, formatMessageTime, getConversationDisplayName, truncateContent } from '@/lib/messages';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { useUserPresence } from '@/hooks/use-user-presence';

interface ConversationItemProps {
	conversation: Conversation;
	currentUserId: number;
	isSelected: boolean;
	onClick: () => void;
}

export const ConversationItem = memo(function ConversationItem({
	conversation,
	currentUserId,
	isSelected,
	onClick,
}: ConversationItemProps) {
	const displayName = getConversationDisplayName(conversation, currentUserId);
	const otherParticipants = conversation.participants.filter(p => p.id !== currentUserId);
	const firstParticipant = otherParticipants[0];

	// Only show status indicator for 1-on-1 conversations
	const showStatusIndicator = !conversation.isGroup && firstParticipant;
	const { isOnline } = useUserPresence(showStatusIndicator ? firstParticipant.id : null);

	return (
		<button
			onClick={onClick}
			className={cn(
				'w-full flex items-start gap-3 p-3 text-left transition-colors rounded-lg',
				'hover:bg-accent',
				isSelected && 'bg-accent'
			)}
		>
			{/* Avatar */}
			<div className="relative flex-shrink-0">
				{conversation.isGroup ? (
					<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
						<Users className="h-6 w-6 text-primary" />
					</div>
				) : firstParticipant?.avatarUrl ? (
					<img
						src={firstParticipant.avatarUrl}
						alt={firstParticipant.displayName}
						className="w-12 h-12 rounded-full object-cover"
					/>
				) : (
					<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
						<span className="text-lg font-medium text-primary">
							{displayName.charAt(0).toUpperCase()}
						</span>
					</div>
				)}
				{/* Unread count badge */}
				{conversation.unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
						{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
					</span>
				)}
				{/* Online status indicator */}
				{showStatusIndicator && (
					<StatusIndicator
						isOnline={isOnline}
						size="sm"
						className="absolute bottom-0 right-0"
					/>
				)}
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between gap-2">
					<span className={cn(
						'font-medium truncate',
						conversation.unreadCount > 0 && 'font-semibold'
					)}>
						{displayName}
					</span>
					{conversation.lastMessage && (
						<span className="text-xs text-muted-foreground flex-shrink-0">
							{formatMessageTime(conversation.lastMessage.createdAt)}
						</span>
					)}
				</div>

				{conversation.lastMessage && (
					<p className={cn(
						'text-sm truncate mt-0.5',
						conversation.unreadCount > 0
							? 'text-foreground'
							: 'text-muted-foreground'
					)}>
						{conversation.isGroup && (
							<span className="font-medium">
								{conversation.lastMessage.senderName.split(' ')[0]}:{' '}
							</span>
						)}
						{truncateContent(conversation.lastMessage.content)}
					</p>
				)}

				{conversation.isGroup && otherParticipants.length > 1 && (
					<p className="text-xs text-muted-foreground mt-1">
						{otherParticipants.length + 1} participants
					</p>
				)}
			</div>
		</button>
	);
});
