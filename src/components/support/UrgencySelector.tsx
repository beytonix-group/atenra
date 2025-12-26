"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type UrgencyLevel = 'minor' | 'urgent' | 'critical';

interface UrgencySelectorProps {
	value: UrgencyLevel;
	onChange: (value: UrgencyLevel) => void;
	disabled?: boolean;
	className?: string;
}

const urgencyOptions: { value: UrgencyLevel; label: string; description: string; color: string }[] = [
	{
		value: 'minor',
		label: 'Minor',
		description: 'Non-blocking, can wait',
		color: 'text-blue-600 dark:text-blue-400',
	},
	{
		value: 'urgent',
		label: 'Urgent',
		description: 'Significant impact, needs attention soon',
		color: 'text-yellow-600 dark:text-yellow-400',
	},
	{
		value: 'critical',
		label: 'Critical',
		description: 'System down, immediate attention required',
		color: 'text-red-600 dark:text-red-400',
	},
];

export function UrgencySelector({
	value,
	onChange,
	disabled = false,
	className,
}: UrgencySelectorProps) {
	const selectedOption = urgencyOptions.find(opt => opt.value === value);

	return (
		<Select value={value} onValueChange={onChange} disabled={disabled}>
			<SelectTrigger className={cn("w-full", className)}>
				<SelectValue>
					{selectedOption && (
						<span className={selectedOption.color}>{selectedOption.label}</span>
					)}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{urgencyOptions.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						<div className="flex flex-col">
							<span className={cn("font-medium", option.color)}>
								{option.label}
							</span>
							<span className="text-xs text-muted-foreground">
								{option.description}
							</span>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export function UrgencyBadge({ urgency, className }: { urgency: UrgencyLevel; className?: string }) {
	const config = {
		minor: {
			label: 'Minor',
			className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		},
		urgent: {
			label: 'Urgent',
			className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		},
		critical: {
			label: 'Critical',
			className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		},
	};

	const { label, className: badgeClass } = config[urgency];

	return (
		<span className={cn(
			"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
			badgeClass,
			className
		)}>
			{label}
		</span>
	);
}
