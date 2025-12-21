"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type JobStatus = 'active' | 'completed' | 'cancelled';

interface JobStatusBadgeProps {
	status: JobStatus;
	className?: string;
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
	active: {
		label: 'In Progress',
		className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent',
	},
	completed: {
		label: 'Completed',
		className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent',
	},
	cancelled: {
		label: 'Cancelled',
		className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-transparent',
	},
};

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
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
