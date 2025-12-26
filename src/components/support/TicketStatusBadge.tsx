"use client";

import { cn } from "@/lib/utils";

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface TicketStatusBadgeProps {
	status: TicketStatus;
	className?: string;
}

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
	open: {
		label: 'Open',
		className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
	},
	in_progress: {
		label: 'In Progress',
		className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
	},
	resolved: {
		label: 'Resolved',
		className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
	},
	closed: {
		label: 'Closed',
		className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
	},
};

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
	const config = statusConfig[status];

	return (
		<span className={cn(
			"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
			config.className,
			className
		)}>
			{config.label}
		</span>
	);
}
