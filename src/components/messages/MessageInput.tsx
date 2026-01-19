'use client';

import { useCallback, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	Bold,
	Italic,
	List,
	Send,
	Smile,
	Loader2,
} from 'lucide-react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

interface MessageInputProps {
	onSend: (content: string) => Promise<void>;
	disabled?: boolean;
	placeholder?: string;
}

// Common emojis for quick access
const QUICK_EMOJIS = [
	'😀', '😂', '😍', '🥰', '😊', '🙂', '😎', '🤔',
	'👍', '👎', '❤️', '🔥', '✨', '🎉', '👏', '🙏',
	'😢', '😭', '😤', '🤯', '😱', '🥳', '😴', '🤮',
	'💯', '⭐', '💡', '📌', '✅', '❌', '⚠️', '📝',
];

export function MessageInput({
	onSend,
	disabled = false,
	placeholder = 'Type a message...',
}: MessageInputProps) {
	const [isSending, setIsSending] = useState(false);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const editorRef = useRef<HTMLDivElement>(null);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: false,
				codeBlock: false,
				blockquote: false,
				horizontalRule: false,
			}),
			Placeholder.configure({
				placeholder,
			}),
		],
		editorProps: {
			attributes: {
				class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[40px] max-h-[200px] overflow-y-auto px-3 py-2',
			},
			handleKeyDown: (view, event) => {
				// Send on Enter (without Shift)
				if (event.key === 'Enter' && !event.shiftKey) {
					event.preventDefault();
					handleSend();
					return true;
				}
				return false;
			},
		},
		immediatelyRender: false, // Disable SSR to avoid hydration mismatches
	});

	const handleSend = useCallback(async () => {
		if (!editor || isSending || disabled) return;

		const content = editor.getHTML();
		const text = editor.getText().trim();

		if (!text) return;

		setIsSending(true);
		try {
			await onSend(content);
			editor.commands.clearContent();
		} catch (error) {
			console.error('Failed to send message:', error);
		} finally {
			setIsSending(false);
		}
	}, [editor, isSending, disabled, onSend]);

	const insertEmoji = useCallback((emoji: string) => {
		if (!editor) return;
		editor.chain().focus().insertContent(emoji).run();
		setShowEmojiPicker(false);
	}, [editor]);

	if (!editor) {
		return (
			<div className="border-t bg-background p-4">
				<div className="h-[80px] bg-muted animate-pulse rounded-lg" />
			</div>
		);
	}

	return (
		<div className="border-t bg-background p-4">
			{/* Toolbar */}
			<div className="flex items-center gap-1 mb-2">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('bold') && 'bg-accent'
					)}
					disabled={disabled}
				>
					<Bold className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('italic') && 'bg-accent'
					)}
					disabled={disabled}
				>
					<Italic className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('bulletList') && 'bg-accent'
					)}
					disabled={disabled}
				>
					<List className="h-4 w-4" />
				</Button>
				<Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
							disabled={disabled}
						>
							<Smile className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-2" align="start">
						<div className="grid grid-cols-8 gap-1">
							{QUICK_EMOJIS.map((emoji) => (
								<button
									key={emoji}
									onClick={() => insertEmoji(emoji)}
									className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded transition-colors text-lg"
								>
									{emoji}
								</button>
							))}
						</div>
					</PopoverContent>
				</Popover>
			</div>

			{/* Editor */}
			<div className="flex items-end gap-2">
				<div
					ref={editorRef}
					className="flex-1 rounded-lg bg-muted/50 border border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
				>
					<EditorContent editor={editor} />
				</div>
				<Button
					type="button"
					size="icon"
					onClick={handleSend}
					disabled={disabled || isSending || !editor.getText().trim()}
				>
					{isSending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Send className="h-4 w-4" />
					)}
				</Button>
			</div>

			<p className="text-xs text-muted-foreground mt-2">
				Press Enter to send, Shift+Enter for new line
			</p>
		</div>
	);
}
