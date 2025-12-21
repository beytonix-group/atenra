"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'void' | 'refunded';

interface InvoiceStatusBadgeProps {
	status: InvoiceStatus;
	className?: string;
}

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
	draft: {
		label: 'Draft',
		className: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-transparent',
	},
	sent: {
		label: 'Sent',
		className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent',
	},
	viewed: {
		label: 'Viewed',
		className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-transparent',
	},
	paid: {
		label: 'Paid',
		className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent',
	},
	partial: {
		label: 'Partial',
		className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-transparent',
	},
	overdue: {
		label: 'Overdue',
		className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-transparent',
	},
	void: {
		label: 'Void',
		className: 'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500 border-transparent',
	},
	refunded: {
		label: 'Refunded',
		className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-transparent',
	},
};

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
	const config = statusConfig[status];

	if (!config) {
		// Fallback for invalid status values
		return (
			<Badge className={cn('bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500 border-transparent', className)}>
				Unknown
			</Badge>
		);
	}

	return (
		<Badge className={cn(config.className, className)}>
			{config.label}
		</Badge>
	);
}
