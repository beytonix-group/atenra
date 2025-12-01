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
						dangerouslySetInnerHTML={{ __html: message.content }}
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
				<span className="font-semibold text-sm text-foreground">
					{message.sender.displayName}
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
				dangerouslySetInnerHTML={{ __html: message.content }}
			/>
		</div>
	);
}
