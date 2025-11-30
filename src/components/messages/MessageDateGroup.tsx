'use client';

interface MessageDateGroupProps {
	date: string;
}

export function MessageDateGroup({ date }: MessageDateGroupProps) {
	return (
		<div className="flex items-center justify-center my-4">
			<div className="flex-1 border-t border-border" />
			<span className="px-4 text-xs text-muted-foreground font-medium">
				{date}
			</span>
			<div className="flex-1 border-t border-border" />
		</div>
	);
}
