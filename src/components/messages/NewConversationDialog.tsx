'use client';

import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { searchUsers, createConversation, SearchUser, Conversation } from '@/lib/messages';
import { Search, X, Loader2, User } from 'lucide-react';

interface NewConversationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConversationCreated: (conversation: Conversation, isExisting: boolean) => void;
}

export function NewConversationDialog({
	open,
	onOpenChange,
	onConversationCreated,
}: NewConversationDialogProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);
	const [initialMessage, setInitialMessage] = useState('');
	const [groupTitle, setGroupTitle] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	const isGroup = selectedUsers.length > 1;

	// Debounced search
	const debouncedSearch = useDebouncedCallback(async (query: string) => {
		if (query.length < 2) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		try {
			const results = await searchUsers(query);
			// Filter out already selected users
			const filtered = results.filter(
				u => !selectedUsers.some(s => s.id === u.id)
			);
			setSearchResults(filtered);
		} catch (error) {
			console.error('Search failed:', error);
		} finally {
			setIsSearching(false);
		}
	}, 300);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setSearchQuery(query);
		debouncedSearch(query);
	};

	const handleSelectUser = (user: SearchUser) => {
		setSelectedUsers(prev => [...prev, user]);
		setSearchQuery('');
		setSearchResults([]);
	};

	const handleRemoveUser = (userId: number) => {
		setSelectedUsers(prev => prev.filter(u => u.id !== userId));
	};

	const handleCreate = async () => {
		if (selectedUsers.length === 0) return;

		setIsCreating(true);
		try {
			const result = await createConversation(
				selectedUsers.map(u => u.id),
				{
					title: isGroup ? groupTitle || undefined : undefined,
					isGroup,
					initialMessage: initialMessage.trim() || undefined,
				}
			);
			onConversationCreated(result.conversation as Conversation, result.existing);
			handleClose();
		} catch (error) {
			console.error('Failed to create conversation:', error);
		} finally {
			setIsCreating(false);
		}
	};

	const handleClose = () => {
		setSearchQuery('');
		setSearchResults([]);
		setSelectedUsers([]);
		setInitialMessage('');
		setGroupTitle('');
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>New conversation</DialogTitle>
					<DialogDescription>
						Search for users to start a conversation
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Selected users */}
					{selectedUsers.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{selectedUsers.map(user => (
								<Badge
									key={user.id}
									variant="secondary"
									className="pl-2 pr-1 py-1 flex items-center gap-1"
								>
									{user.displayName}
									<button
										onClick={() => handleRemoveUser(user.id)}
										className="ml-1 hover:bg-muted rounded-full p-0.5"
									>
										<X className="h-3 w-3" />
									</button>
								</Badge>
							))}
						</div>
					)}

					{/* Search input */}
					<div className="space-y-2">
						<Label htmlFor="user-search">Search users</Label>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								id="user-search"
								placeholder="Search by name or email..."
								value={searchQuery}
								onChange={handleSearchChange}
								className="pl-9"
							/>
							{isSearching && (
								<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
							)}
						</div>
					</div>

					{/* Search results */}
					{searchResults.length > 0 && (
						<ScrollArea className="h-[200px] border rounded-lg">
							<div className="p-2 space-y-1">
								{searchResults.map(user => (
									<button
										key={user.id}
										onClick={() => handleSelectUser(user)}
										className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent text-left transition-colors"
									>
										{user.avatarUrl ? (
											<img
												src={user.avatarUrl}
												alt={user.displayName}
												className="w-10 h-10 rounded-full object-cover"
											/>
										) : (
											<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
												<User className="h-5 w-5 text-primary" />
											</div>
										)}
										<div className="flex-1 min-w-0">
											<p className="font-medium truncate">{user.displayName}</p>
											<p className="text-sm text-muted-foreground truncate">
												{user.email}
											</p>
										</div>
									</button>
								))}
							</div>
						</ScrollArea>
					)}

					{/* Group title (only for groups) */}
					{isGroup && (
						<div className="space-y-2">
							<Label htmlFor="group-title">Group name (optional)</Label>
							<Input
								id="group-title"
								placeholder="Enter a name for this group..."
								value={groupTitle}
								onChange={(e) => setGroupTitle(e.target.value)}
								maxLength={100}
							/>
						</div>
					)}

					{/* Initial message */}
					{selectedUsers.length > 0 && (
						<div className="space-y-2">
							<Label htmlFor="initial-message">Message (optional)</Label>
							<Textarea
								id="initial-message"
								placeholder="Write your first message..."
								value={initialMessage}
								onChange={(e) => setInitialMessage(e.target.value)}
								rows={3}
								maxLength={10000}
							/>
						</div>
					)}

					{/* Actions */}
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={handleClose}>
							Cancel
						</Button>
						<Button
							onClick={handleCreate}
							disabled={selectedUsers.length === 0 || isCreating}
						>
							{isCreating ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								'Start conversation'
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
