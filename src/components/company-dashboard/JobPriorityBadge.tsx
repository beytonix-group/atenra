"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

interface JobPriorityBadgeProps {
	priority: JobPriority;
	className?: string;
}

const priorityConfig: Record<JobPriority, { label: string; className: string }> = {
	low: {
		label: 'Low',
		className: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-transparent',
	},
	medium: {
		label: 'Medium',
		className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-transparent',
	},
	high: {
		label: 'High',
		className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-transparent',
	},
	urgent: {
		label: 'Urgent',
		className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-transparent',
	},
};

export function JobPriorityBadge({ priority, className }: JobPriorityBadgeProps) {
	const config = priorityConfig[priority];

	if (!config) {
		// Fallback for invalid priority values
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
