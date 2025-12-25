"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Loader2 } from "lucide-react";

interface DashboardChartsProps {
	companyId: number;
}

interface JobDataPoint {
	month: string;
	count: number;
}

interface RevenueDataPoint {
	month: string;
	revenueCents: number;
	collectedCents: number;
}

function formatMonth(month: string): string {
	if (month.match(/^\d{4}-\d{2}$/)) {
		const [year, m] = month.split('-');
		return new Date(Date.UTC(parseInt(year), parseInt(m) - 1, 1)).toLocaleDateString('en-US', {
			month: 'short',
			timeZone: 'UTC',
		});
	}
	return month;
}

function formatCurrency(cents: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(cents / 100);
}

function getDefaultDateRange(): DateRange {
	return {
		from: startOfMonth(subMonths(new Date(), 5)),
		to: endOfMonth(new Date()),
	};
}

/**
 * Generate all months in a date range and fill with data or defaults
 */
function fillMonthsInRange<T extends { month: string }>(
	data: T[],
	dateRange: DateRange | undefined,
	defaultValues: Omit<T, 'month'>
): T[] {
	if (!dateRange?.from || !dateRange?.to) return data;

	// Generate all months in range
	const months = eachMonthOfInterval({
		start: dateRange.from,
		end: dateRange.to,
	});

	// Create a map of existing data by month
	const dataMap = new Map(data.map(item => [item.month, item]));

	// Fill in all months
	return months.map(date => {
		const monthKey = format(date, 'yyyy-MM');
		const existing = dataMap.get(monthKey);
		if (existing) return existing;
		return { month: monthKey, ...defaultValues } as T;
	});
}

function JobsTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
	if (!active || !payload || !payload.length) return null;
	return (
		<div className="bg-popover border rounded-lg shadow-lg p-3">
			<p className="font-medium mb-1">{formatMonth(label || '')}</p>
			<p className="text-sm">
				<span className="text-muted-foreground">Jobs: </span>
				<span className="font-medium">{payload[0].value}</span>
			</p>
		</div>
	);
}

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
	if (!active || !payload || !payload.length) return null;
	return (
		<div className="bg-popover border rounded-lg shadow-lg p-3">
			<p className="font-medium mb-2">{formatMonth(label || '')}</p>
			{payload.map((entry, index) => (
				<div key={index} className="flex items-center gap-2 text-sm">
					<div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
					<span className="text-muted-foreground">
						{entry.dataKey === 'revenueCents' ? 'Revenue' : 'Collected'}:
					</span>
					<span className="font-medium">{formatCurrency(entry.value)}</span>
				</div>
			))}
		</div>
	);
}

export function DashboardCharts({ companyId }: DashboardChartsProps) {
	const [jobsDateRange, setJobsDateRange] = useState<DateRange | undefined>(getDefaultDateRange);
	const [revenueDateRange, setRevenueDateRange] = useState<DateRange | undefined>(getDefaultDateRange);

	const [jobsData, setJobsData] = useState<JobDataPoint[]>([]);
	const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);

	const [jobsLoading, setJobsLoading] = useState(true);
	const [revenueLoading, setRevenueLoading] = useState(true);
	const [jobsError, setJobsError] = useState<string | null>(null);
	const [revenueError, setRevenueError] = useState<string | null>(null);

	const fetchJobsData = useCallback(async () => {
		if (!jobsDateRange?.from || !jobsDateRange?.to) return;

		setJobsLoading(true);
		setJobsError(null);
		try {
			const startTs = Math.floor(jobsDateRange.from.getTime() / 1000);
			const endTs = Math.floor(jobsDateRange.to.getTime() / 1000);

			const response = await fetch(
				`/api/company/${companyId}/dashboard/charts?type=jobs&startDate=${startTs}&endDate=${endTs}`
			);
			if (!response.ok) {
				throw new Error(`Failed to fetch jobs data: ${response.status}`);
			}
			const result = await response.json() as { data: JobDataPoint[] };
			setJobsData(result.data || []);
		} catch (error) {
			console.error("Error fetching jobs chart data:", error);
			setJobsError(error instanceof Error ? error.message : 'Failed to load data');
		} finally {
			setJobsLoading(false);
		}
	}, [companyId, jobsDateRange]);

	const fetchRevenueData = useCallback(async () => {
		if (!revenueDateRange?.from || !revenueDateRange?.to) return;

		setRevenueLoading(true);
		setRevenueError(null);
		try {
			const startTs = Math.floor(revenueDateRange.from.getTime() / 1000);
			const endTs = Math.floor(revenueDateRange.to.getTime() / 1000);

			const response = await fetch(
				`/api/company/${companyId}/dashboard/charts?type=revenue&startDate=${startTs}&endDate=${endTs}`
			);
			if (!response.ok) {
				throw new Error(`Failed to fetch revenue data: ${response.status}`);
			}
			const result = await response.json() as { data: RevenueDataPoint[] };
			setRevenueData(result.data || []);
		} catch (error) {
			console.error("Error fetching revenue chart data:", error);
			setRevenueError(error instanceof Error ? error.message : 'Failed to load data');
		} finally {
			setRevenueLoading(false);
		}
	}, [companyId, revenueDateRange]);

	useEffect(() => {
		fetchJobsData();
	}, [fetchJobsData]);

	useEffect(() => {
		fetchRevenueData();
	}, [fetchRevenueData]);

	// Fill in missing months with zeros and format for display
	const jobsChartData = useMemo(() => {
		const filledData = fillMonthsInRange(jobsData, jobsDateRange, { count: 0 });
		return filledData.map((item) => ({
			...item,
			monthLabel: formatMonth(item.month),
		}));
	}, [jobsData, jobsDateRange]);

	const revenueChartData = useMemo(() => {
		const filledData = fillMonthsInRange(revenueData, revenueDateRange, { revenueCents: 0, collectedCents: 0 });
		return filledData.map((item) => ({
			...item,
			monthLabel: formatMonth(item.month),
		}));
	}, [revenueData, revenueDateRange]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			{/* Jobs by Month - Bar Chart */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-base font-medium">Jobs by Month</CardTitle>
					<DateRangePicker value={jobsDateRange} onChange={setJobsDateRange} />
				</CardHeader>
				<CardContent>
					{jobsLoading ? (
						<div className="h-[250px] flex items-center justify-center">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : jobsError ? (
						<div className="h-[250px] flex items-center justify-center text-destructive">
							{jobsError}
						</div>
					) : jobsData.length === 0 ? (
						<div className="h-[250px] flex items-center justify-center text-muted-foreground">
							No jobs data available
						</div>
					) : (
						<div className="h-[250px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={jobsChartData}
									margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
								>
									<CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
									<XAxis
										dataKey="monthLabel"
										className="text-xs"
										tickLine={false}
										axisLine={false}
									/>
									<YAxis
										className="text-xs"
										tickLine={false}
										axisLine={false}
										allowDecimals={false}
									/>
									<Tooltip content={<JobsTooltip />} />
									<Bar
										dataKey="count"
										fill="hsl(var(--primary))"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Revenue by Month - Area Chart */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-base font-medium">Revenue by Month</CardTitle>
					<DateRangePicker value={revenueDateRange} onChange={setRevenueDateRange} />
				</CardHeader>
				<CardContent>
					{revenueLoading ? (
						<div className="h-[250px] flex items-center justify-center">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : revenueError ? (
						<div className="h-[250px] flex items-center justify-center text-destructive">
							{revenueError}
						</div>
					) : revenueData.length === 0 ? (
						<div className="h-[250px] flex items-center justify-center text-muted-foreground">
							No revenue data available
						</div>
					) : (
						<>
							<div className="h-[250px]">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart
										data={revenueChartData}
										margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
									>
										<CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
										<XAxis
											dataKey="monthLabel"
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
										<Tooltip content={<RevenueTooltip />} />
										<Line
											type="monotone"
											dataKey="revenueCents"
											stroke="hsl(var(--primary))"
											strokeWidth={2}
											dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
											activeDot={{ r: 6 }}
										/>
										<Line
											type="monotone"
											dataKey="collectedCents"
											stroke="hsl(142, 76%, 36%)"
											strokeWidth={2}
											dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: 4 }}
											activeDot={{ r: 6 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
							<div className="flex items-center justify-center gap-6 mt-2 text-xs">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-primary" />
									<span className="text-muted-foreground">Revenue</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
									<span className="text-muted-foreground">Collected</span>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
