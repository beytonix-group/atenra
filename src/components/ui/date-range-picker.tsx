"use client";

import * as React from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface DateRangePickerProps {
	value: DateRange | undefined;
	onChange: (range: DateRange | undefined) => void;
	className?: string;
}

export function DateRangePicker({
	value,
	onChange,
	className,
}: DateRangePickerProps) {
	const [isOpen, setIsOpen] = React.useState(false);

	const presets = [
		{
			label: "Last 3 months",
			value: "3m",
			getRange: () => ({
				from: startOfMonth(subMonths(new Date(), 2)),
				to: endOfMonth(new Date()),
			}),
		},
		{
			label: "Last 6 months",
			value: "6m",
			getRange: () => ({
				from: startOfMonth(subMonths(new Date(), 5)),
				to: endOfMonth(new Date()),
			}),
		},
		{
			label: "Last 12 months",
			value: "12m",
			getRange: () => ({
				from: startOfMonth(subMonths(new Date(), 11)),
				to: endOfMonth(new Date()),
			}),
		},
	];

	const handlePresetChange = (presetValue: string) => {
		const preset = presets.find((p) => p.value === presetValue);
		if (preset) {
			onChange(preset.getRange());
		}
	};

	const formatDateRange = () => {
		if (!value?.from) {
			return "Select date range";
		}
		if (!value.to) {
			return format(value.from, "MMM d, yyyy");
		}
		return `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`;
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className={cn(
						"justify-start text-left font-normal h-8",
						!value && "text-muted-foreground",
						className
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					<span className="text-xs">{formatDateRange()}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="end">
				<div className="p-3 border-b">
					<Select onValueChange={handlePresetChange}>
						<SelectTrigger className="h-8">
							<SelectValue placeholder="Quick select..." />
						</SelectTrigger>
						<SelectContent>
							{presets.map((preset) => (
								<SelectItem key={preset.value} value={preset.value}>
									{preset.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<DayPicker
					mode="range"
					selected={value}
					onSelect={onChange}
					numberOfMonths={2}
					defaultMonth={value?.from || subMonths(new Date(), 1)}
					className="p-3"
				/>
			</PopoverContent>
		</Popover>
	);
}
