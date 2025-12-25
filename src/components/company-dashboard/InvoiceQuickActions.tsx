'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { MoreHorizontal, CheckCircle, XCircle, Send, Clock, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'void' | 'refunded';

interface InvoiceQuickActionsProps {
	companyId: number;
	invoiceId: number;
	currentStatus: InvoiceStatus;
	invoiceNumber: string;
}

export function InvoiceQuickActions({
	companyId,
	invoiceId,
	currentStatus,
	invoiceNumber,
}: InvoiceQuickActionsProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [confirmAction, setConfirmAction] = useState<{
		status: InvoiceStatus;
		title: string;
		description: string;
	} | null>(null);

	const updateStatus = async (newStatus: InvoiceStatus) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/company/${companyId}/invoices/${invoiceId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				let errorMessage = 'Failed to update invoice';
				try {
					const data = await response.json() as { error?: string };
					errorMessage = data.error || errorMessage;
				} catch {
					// Response body is not valid JSON
				}
				throw new Error(errorMessage);
			}

			toast.success(`Invoice ${invoiceNumber} marked as ${newStatus}`);
			router.refresh();
		} catch (error) {
			console.error('Error updating invoice:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to update invoice');
		} finally {
			setIsLoading(false);
			setConfirmAction(null);
		}
	};

	const handleAction = (status: InvoiceStatus, requireConfirm: boolean, title: string, description: string) => {
		if (requireConfirm) {
			setConfirmAction({ status, title, description });
		} else {
			updateStatus(status);
		}
	};

	// Determine which actions are available based on current status
	const getAvailableActions = () => {
		const actions: Array<{
			status: InvoiceStatus;
			label: string;
			icon: React.ReactNode;
			requireConfirm: boolean;
			confirmTitle?: string;
			confirmDescription?: string;
		}> = [];

		switch (currentStatus) {
			case 'draft':
				actions.push({
					status: 'sent',
					label: 'Mark as Sent',
					icon: <Send className="h-4 w-4" />,
					requireConfirm: false,
				});
				break;
			case 'sent':
			case 'viewed':
				actions.push({
					status: 'paid',
					label: 'Mark as Paid',
					icon: <CheckCircle className="h-4 w-4" />,
					requireConfirm: true,
					confirmTitle: 'Mark Invoice as Paid',
					confirmDescription: `Are you sure you want to mark invoice ${invoiceNumber} as fully paid?`,
				});
				actions.push({
					status: 'overdue',
					label: 'Mark as Overdue',
					icon: <Clock className="h-4 w-4" />,
					requireConfirm: false,
				});
				break;
			case 'overdue':
				actions.push({
					status: 'paid',
					label: 'Mark as Paid',
					icon: <CheckCircle className="h-4 w-4" />,
					requireConfirm: true,
					confirmTitle: 'Mark Invoice as Paid',
					confirmDescription: `Are you sure you want to mark invoice ${invoiceNumber} as fully paid?`,
				});
				break;
			case 'partial':
				actions.push({
					status: 'paid',
					label: 'Mark as Fully Paid',
					icon: <CheckCircle className="h-4 w-4" />,
					requireConfirm: true,
					confirmTitle: 'Mark Invoice as Fully Paid',
					confirmDescription: `Are you sure you want to mark invoice ${invoiceNumber} as fully paid?`,
				});
				break;
		}

		// Void action available for non-paid, non-void, non-refunded invoices
		if (!['paid', 'void', 'refunded'].includes(currentStatus)) {
			actions.push({
				status: 'void',
				label: 'Void Invoice',
				icon: <XCircle className="h-4 w-4" />,
				requireConfirm: true,
				confirmTitle: 'Void Invoice',
				confirmDescription: `Are you sure you want to void invoice ${invoiceNumber}?`,
			});
		}

		// Restore options for voided invoices
		if (currentStatus === 'void') {
			actions.push({
				status: 'draft',
				label: 'Restore as Draft',
				icon: <RotateCcw className="h-4 w-4" />,
				requireConfirm: true,
				confirmTitle: 'Restore Invoice',
				confirmDescription: `Restore invoice ${invoiceNumber} as a draft?`,
			});
			actions.push({
				status: 'sent',
				label: 'Restore as Sent',
				icon: <RotateCcw className="h-4 w-4" />,
				requireConfirm: true,
				confirmTitle: 'Restore Invoice',
				confirmDescription: `Restore invoice ${invoiceNumber} as sent?`,
			});
		}

		return actions;
	};

	const availableActions = getAvailableActions();

	if (availableActions.length === 0) {
		return null;
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" disabled={isLoading}>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<MoreHorizontal className="h-4 w-4" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{availableActions.map((action, index) => (
						<div key={action.status}>
							{index > 0 && action.status === 'void' && <DropdownMenuSeparator />}
							<DropdownMenuItem
								onClick={() =>
									handleAction(
										action.status,
										action.requireConfirm,
										action.confirmTitle || '',
										action.confirmDescription || ''
									)
								}
								className={action.status === 'void' ? 'text-destructive' : ''}
							>
								{action.icon}
								<span className="ml-2">{action.label}</span>
							</DropdownMenuItem>
						</div>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={!!confirmAction} onOpenChange={(open) => !isLoading && !open && setConfirmAction(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{confirmAction?.title}</DialogTitle>
						<DialogDescription>
							{confirmAction?.description}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isLoading}>
							Cancel
						</Button>
						<Button
							onClick={() => confirmAction && updateStatus(confirmAction.status)}
							variant={confirmAction?.status === 'void' ? 'destructive' : 'default'}
							disabled={isLoading}
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : null}
							Confirm
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
