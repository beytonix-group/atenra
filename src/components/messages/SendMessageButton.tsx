'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { createConversation } from '@/lib/messages';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SendMessageButtonProps {
	userId: number;
	userName?: string;
	variant?: 'default' | 'outline' | 'ghost' | 'secondary';
	size?: 'default' | 'sm' | 'lg' | 'icon';
	className?: string;
	showText?: boolean;
}

export function SendMessageButton({
	userId,
	userName,
	variant = 'outline',
	size = 'sm',
	className,
	showText = true,
}: SendMessageButtonProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = async () => {
		setIsLoading(true);
		try {
			const result = await createConversation([userId]);
			router.push(`/messages?conversation=${result.conversation.id}`);
		} catch (error) {
			console.error('Failed to start conversation:', error);
			toast.error('Failed to start conversation');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			onClick={handleClick}
			disabled={isLoading}
			className={cn(className)}
			title={userName ? `Send message to ${userName}` : 'Send message'}
		>
			{isLoading ? (
				<Loader2 className={cn('h-4 w-4 animate-spin', showText && 'mr-1')} />
			) : (
				<MessageSquare className={cn('h-4 w-4', showText && 'mr-1')} />
			)}
			{showText && (isLoading ? 'Opening...' : 'Message')}
		</Button>
	);
}
