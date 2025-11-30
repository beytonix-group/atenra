'use client';

import { Message, formatMessageTime } from '@/lib/messages';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
	message: Message;
	showSender?: boolean;
}

export function MessageBubble({ message, showSender = false }: MessageBubbleProps) {
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

	return (
		<div className={cn(
			'flex gap-2',
			message.isOwn ? 'justify-end' : 'justify-start'
		)}>
			{/* Avatar for other users */}
			{!message.isOwn && (
				<div className="flex-shrink-0">
					{message.sender.avatarUrl ? (
						<img
							src={message.sender.avatarUrl}
							alt={message.sender.displayName}
							className="w-8 h-8 rounded-full object-cover"
						/>
					) : (
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
							<span className="text-sm font-medium text-primary">
								{message.sender.displayName.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
				</div>
			)}

			{/* Message content */}
			<div className={cn(
				'max-w-[70%] flex flex-col',
				message.isOwn ? 'items-end' : 'items-start'
			)}>
				{/* Sender name for group messages */}
				{showSender && !message.isOwn && (
					<span className="text-xs text-muted-foreground mb-1 px-1">
						{message.sender.displayName}
					</span>
				)}

				<div className={cn(
					'rounded-2xl px-4 py-2',
					message.isOwn
						? 'bg-primary text-primary-foreground rounded-br-md'
						: 'bg-muted rounded-bl-md'
				)}>
					{/* Render HTML content safely */}
					<div
						className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0"
						dangerouslySetInnerHTML={{ __html: message.content }}
					/>
				</div>

				{/* Timestamp and edited indicator */}
				<div className="flex items-center gap-1 mt-1 px-1">
					<span className="text-xs text-muted-foreground">
						{formatMessageTime(message.createdAt)}
					</span>
					{message.editedAt && (
						<span className="text-xs text-muted-foreground">(edited)</span>
					)}
				</div>
			</div>
		</div>
	);
}
