'use client';

import { memo, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Message, formatMessageTime } from '@/lib/messages';
import { cn } from '@/lib/utils';
import { StatusIndicator } from '@/components/ui/status-indicator';

// Configure DOMPurify to allow only safe formatting tags
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'span', 'div'];
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

function sanitizeMessageContent(content: string): string {
	return DOMPurify.sanitize(content, {
		ALLOWED_TAGS,
		ALLOWED_ATTR,
		ALLOW_DATA_ATTR: false,
	});
}

interface MessageBubbleProps {
	message: Message;
	showSender?: boolean;
	senderIsOnline?: boolean;  // For group chats - show sender's online status
}

export const MessageBubble = memo(function MessageBubble({ message, senderIsOnline }: MessageBubbleProps) {
	// Sanitize message content to prevent XSS attacks
	const sanitizedContent = useMemo(() =>
		sanitizeMessageContent(message.content),
		[message.content]
	);

	if (message.isDeleted) {
		return (
			<div className={cn(
				'flex',
				message.isOwn ? 'justify-end' : 'justify-start'
			)}>
				<div className="px-4 py-2 text-sm text-muted-foreground italic">
					This message was deleted
				</div>
			</div>
		);
	}

	// Own messages - right aligned with name
	if (message.isOwn) {
		return (
			<div className="flex flex-col items-end">
				{/* Name and timestamp row */}
				<div className="flex items-center gap-2 mb-1">
					<span className="text-xs text-muted-foreground">
						{formatMessageTime(message.createdAt)}
					</span>
					{message.editedAt && (
						<span className="text-xs text-muted-foreground">(edited)</span>
					)}
					<span className="font-semibold text-sm text-foreground">
						{message.sender.displayName}
					</span>
				</div>

				{/* Message content */}
				<div className="rounded-2xl px-4 py-2 bg-primary text-primary-foreground rounded-br-md max-w-[70%]">
					<div
						className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-em:text-primary-foreground"
						dangerouslySetInnerHTML={{ __html: sanitizedContent }}
					/>
				</div>
			</div>
		);
	}

	// Other users' messages - name and timestamp on same row, no avatar
	return (
		<div className="flex flex-col items-start">
			{/* Name and timestamp row */}
			<div className="flex items-center gap-2 mb-1">
				<span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
					{message.sender.displayName}
					{senderIsOnline !== undefined && (
						<StatusIndicator isOnline={senderIsOnline} size="sm" />
					)}
				</span>
				<span className="text-xs text-muted-foreground">
					{formatMessageTime(message.createdAt)}
				</span>
				{message.editedAt && (
					<span className="text-xs text-muted-foreground">(edited)</span>
				)}
			</div>

			{/* Message content */}
			<div
				className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0"
				dangerouslySetInnerHTML={{ __html: sanitizedContent }}
			/>
		</div>
	);
});
