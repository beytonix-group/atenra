"use client";

import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RevenueDataPoint {
	period: string;
	revenueCents: number;
	collectedCents: number;
	invoiceCount: number;
}

interface RevenueChartProps {
	data: RevenueDataPoint[];
	title?: string;
	description?: string;
}

function formatCurrency(cents: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(cents / 100);
}

function formatPeriod(period: string): string {
	// Handle monthly format (YYYY-MM)
	if (period.match(/^\d{4}-\d{2}$/)) {
		const [year, month] = period.split('-');
		return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1)).toLocaleDateString('en-US', {
			month: 'short',
			year: '2-digit',
			timeZone: 'UTC',
		});
	}
	// Handle weekly format (YYYY-Www)
	if (period.match(/^\d{4}-W\d{2}$/)) {
		return period.replace(/(\d{4})-W(\d{2})/, 'W$2 \'$1');
	}
	// Handle daily format (YYYY-MM-DD)
	if (period.match(/^\d{4}-\d{2}-\d{2}$/)) {
		const [year, month, day] = period.split('-');
		return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day))).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			timeZone: 'UTC',
		});
	}
	return period;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{
		value: number;
		dataKey: string;
		color: string;
	}>;
	label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
	if (!active || !payload || !payload.length) {
		return null;
	}

	return (
		<div className="bg-popover border rounded-lg shadow-lg p-3">
			<p className="font-medium mb-2">{formatPeriod(label || '')}</p>
			{payload.map((entry, index) => (
				<div key={index} className="flex items-center gap-2 text-sm">
					<div
						className="w-3 h-3 rounded-full"
						style={{ backgroundColor: entry.color }}
					/>
					<span className="text-muted-foreground">
						{entry.dataKey === 'revenueCents' ? 'Revenue' : 'Collected'}:
					</span>
					<span className="font-medium">{formatCurrency(entry.value)}</span>
				</div>
			))}
		</div>
	);
}

export function RevenueChart({
	data,
	title = "Revenue Over Time",
	description = "Monthly revenue and collections",
}: RevenueChartProps) {
	// Transform data for the chart
	const chartData = data.map((item) => ({
		...item,
		periodLabel: formatPeriod(item.period),
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				{chartData.length === 0 ? (
					<div className="h-[300px] flex items-center justify-center text-muted-foreground">
						No revenue data available
					</div>
				) : (
					<div className="h-[300px]">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={chartData}
								margin={{
									top: 10,
									right: 10,
									left: 0,
									bottom: 0,
								}}
							>
								<defs>
									<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
										<stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
										<stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
								<XAxis
									dataKey="periodLabel"
									className="text-xs"
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									className="text-xs"
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => formatCurrency(value)}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Area
									type="monotone"
									dataKey="revenueCents"
									stroke="hsl(var(--primary))"
									fillOpacity={1}
									fill="url(#colorRevenue)"
									strokeWidth={2}
								/>
								<Area
									type="monotone"
									dataKey="collectedCents"
									stroke="hsl(142, 76%, 36%)"
									fillOpacity={1}
									fill="url(#colorCollected)"
									strokeWidth={2}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				)}
				{chartData.length > 0 && (
					<div className="flex items-center justify-center gap-6 mt-4 text-sm">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-primary" />
							<span className="text-muted-foreground">Revenue</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
							<span className="text-muted-foreground">Collected</span>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
