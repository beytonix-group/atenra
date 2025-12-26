"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	maxLength?: number;
	disabled?: boolean;
	className?: string;
}

export function RichTextEditor({
	value,
	onChange,
	placeholder = "Enter description...",
	maxLength = 5000,
	disabled = false,
	className,
}: RichTextEditorProps) {
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
		content: value,
		editable: !disabled,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			// Only update if within limit
			const textLength = editor.state.doc.textContent.length;
			if (textLength <= maxLength) {
				onChange(html);
			}
		},
		editorProps: {
			attributes: {
				class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-3 py-2",
			},
		},
	});

	// Sync external value changes
	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value);
		}
	}, [editor, value]);

	// Sync disabled state
	useEffect(() => {
		if (editor) {
			editor.setEditable(!disabled);
		}
	}, [editor, disabled]);

	if (!editor) {
		return null;
	}

	const charCount = editor.state.doc.textContent.length;
	const isOverLimit = charCount > maxLength;
	const isNearLimit = charCount > maxLength * 0.9;

	return (
		<div className={cn("border rounded-md", className)}>
			{/* Toolbar */}
			<div className="flex items-center gap-1 border-b px-2 py-1 bg-muted/50">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBold().run()}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("bold") && "bg-accent"
					)}
				>
					<Bold className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("italic") && "bg-accent"
					)}
				>
					<Italic className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("bulletList") && "bg-accent"
					)}
				>
					<List className="h-4 w-4" />
				</Button>
			</div>

			{/* Editor content */}
			<EditorContent editor={editor} />

			{/* Character counter */}
			<div className="flex justify-end px-3 py-1 border-t bg-muted/30">
				<span
					className={cn(
						"text-xs",
						isOverLimit && "text-destructive font-medium",
						isNearLimit && !isOverLimit && "text-yellow-600 dark:text-yellow-500",
						!isNearLimit && "text-muted-foreground"
					)}
				>
					{charCount.toLocaleString()} / {maxLength.toLocaleString()}
				</span>
			</div>
		</div>
	);
}
