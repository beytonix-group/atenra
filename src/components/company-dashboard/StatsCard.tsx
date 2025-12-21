"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Briefcase, DollarSign, Clock, FileText, Users, Building2 } from "lucide-react";

// Map of icon names to Lucide components
const iconMap = {
	briefcase: Briefcase,
	dollarSign: DollarSign,
	clock: Clock,
	fileText: FileText,
	users: Users,
	building: Building2,
	trendingUp: TrendingUp,
} as const;

type IconName = keyof typeof iconMap;

interface StatsCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: IconName;
	trend?: {
		value: number;
		label?: string;
	};
	className?: string;
}

export function StatsCard({
	title,
	value,
	subtitle,
	icon,
	trend,
	className,
}: StatsCardProps) {
	const isPositiveTrend = trend && trend.value >= 0;
	const Icon = icon ? iconMap[icon] : null;

	return (
		<Card className={cn("relative overflow-hidden", className)}>
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							{title}
						</p>
						<p className="text-2xl font-bold tracking-tight">
							{value}
						</p>
						{subtitle && (
							<p className="text-xs text-muted-foreground">
								{subtitle}
							</p>
						)}
						{trend && (
							<div className="flex items-center gap-1 mt-2">
								{isPositiveTrend ? (
									<TrendingUp className="h-3 w-3 text-green-600" />
								) : (
									<TrendingDown className="h-3 w-3 text-red-600" />
								)}
								<span
									className={cn(
										"text-xs font-medium",
										isPositiveTrend ? "text-green-600" : "text-red-600"
									)}
								>
									{isPositiveTrend ? "+" : ""}
									{trend.value.toFixed(1)}%
								</span>
								{trend.label && (
									<span className="text-xs text-muted-foreground">
										{trend.label}
									</span>
								)}
							</div>
						)}
					</div>
					{Icon && (
						<div className="rounded-full bg-muted p-3">
							<Icon className="h-5 w-5 text-muted-foreground" />
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
