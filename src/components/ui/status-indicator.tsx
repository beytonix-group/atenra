import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
	isOnline: boolean;
	size?: 'sm' | 'md' | 'lg';
	showLabel?: boolean;
	className?: string;
}

const sizeClasses = {
	sm: "w-2 h-2",      // 8px - for conversation list items
	md: "w-2.5 h-2.5",  // 10px - for message headers
	lg: "w-3 h-3",      // 12px - for profile views
};

/**
 * Status indicator component (green/grey bubble)
 * Shows online (green) or offline (grey) status
 *
 * @example
 * <div className="relative">
 *   <Avatar ... />
 *   <StatusIndicator
 *     isOnline={isOnline}
 *     size="sm"
 *     className="absolute bottom-0 right-0"
 *   />
 * </div>
 */
export function StatusIndicator({
	isOnline,
	size = 'sm',
	showLabel = false,
	className,
}: StatusIndicatorProps) {
	return (
		<span className={cn("inline-flex items-center gap-1.5", className)}>
			<span
				className={cn(
					"rounded-full border-2 border-background",
					isOnline ? "bg-green-500" : "bg-gray-400",
					sizeClasses[size]
				)}
				aria-label={isOnline ? "Online" : "Offline"}
			/>
			{showLabel && (
				<span className="text-xs text-muted-foreground">
					{isOnline ? "Online" : "Offline"}
				</span>
			)}
		</span>
	);
}
