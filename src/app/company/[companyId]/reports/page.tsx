import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { companyInvoices } from "@/server/db/schema";
import { eq, and, sql, gte, lte, lt } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard, RevenueChart } from "@/components/company-dashboard";
import { DollarSign, TrendingUp, TrendingDown, FileText, MapPin } from "lucide-react";

interface ReportsPageProps {
	params: Promise<{ companyId: string }>;
}

function formatCurrency(cents: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(cents / 100);
}

async function getRevenueStats(companyId: number) {
	const now = Math.floor(Date.now() / 1000);

	// Current month
	const currentMonthStart = new Date();
	currentMonthStart.setDate(1);
	currentMonthStart.setHours(0, 0, 0, 0);
	const currentMonthStartTs = Math.floor(currentMonthStart.getTime() / 1000);

	// Previous month
	const prevMonthStart = new Date(currentMonthStart);
	prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
	const prevMonthStartTs = Math.floor(prevMonthStart.getTime() / 1000);

	// Last 12 months
	const yearAgoTs = now - (365 * 24 * 60 * 60);

	const [currentMonth, prevMonth, yearTotal] = await Promise.all([
		// Current month revenue
		db
			.select({
				revenue: sql<number>`COALESCE(SUM(${companyInvoices.totalCents}), 0)`,
				collected: sql<number>`COALESCE(SUM(${companyInvoices.amountPaidCents}), 0)`,
				count: sql<number>`COUNT(*)`,
			})
			.from(companyInvoices)
			.where(
				and(
					eq(companyInvoices.companyId, companyId),
					gte(companyInvoices.invoiceDate, currentMonthStartTs),
					sql`${companyInvoices.status} IN ('paid', 'partial')`
				)
			)
			.get(),

		// Previous month revenue
		db
			.select({
				revenue: sql<number>`COALESCE(SUM(${companyInvoices.totalCents}), 0)`,
			})
			.from(companyInvoices)
			.where(
				and(
					eq(companyInvoices.companyId, companyId),
					gte(companyInvoices.invoiceDate, prevMonthStartTs),
					lt(companyInvoices.invoiceDate, currentMonthStartTs),
					sql`${companyInvoices.status} IN ('paid', 'partial')`
				)
			)
			.get(),

		// Last 12 months revenue
		db
			.select({
				revenue: sql<number>`COALESCE(SUM(${companyInvoices.totalCents}), 0)`,
				collected: sql<number>`COALESCE(SUM(${companyInvoices.amountPaidCents}), 0)`,
				count: sql<number>`COUNT(*)`,
			})
			.from(companyInvoices)
			.where(
				and(
					eq(companyInvoices.companyId, companyId),
					gte(companyInvoices.invoiceDate, yearAgoTs),
					sql`${companyInvoices.status} IN ('paid', 'partial')`
				)
			)
			.get(),
	]);

	const currentMonthRevenue = currentMonth?.revenue || 0;
	const prevMonthRevenue = prevMonth?.revenue || 0;
	const growthPercentage = prevMonthRevenue > 0
		? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
		: currentMonthRevenue > 0 ? 100 : 0;

	return {
		currentMonth: {
			revenue: currentMonthRevenue,
			collected: currentMonth?.collected || 0,
			count: currentMonth?.count || 0,
		},
		prevMonth: {
			revenue: prevMonthRevenue,
		},
		year: {
			revenue: yearTotal?.revenue || 0,
			collected: yearTotal?.collected || 0,
			count: yearTotal?.count || 0,
		},
		growthPercentage: Math.round(growthPercentage * 100) / 100,
	};
}

async function getRevenueByState(companyId: number) {
	const yearAgoTs = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60);

	return await db
		.select({
			state: companyInvoices.customerState,
			revenue: sql<number>`COALESCE(SUM(${companyInvoices.totalCents}), 0)`,
			count: sql<number>`COUNT(*)`,
		})
		.from(companyInvoices)
		.where(
			and(
				eq(companyInvoices.companyId, companyId),
				gte(companyInvoices.invoiceDate, yearAgoTs),
				sql`${companyInvoices.status} IN ('paid', 'partial')`
			)
		)
		.groupBy(companyInvoices.customerState)
		.orderBy(sql`SUM(${companyInvoices.totalCents}) DESC`)
		.limit(10)
		.all();
}

async function getMonthlyRevenue(companyId: number) {
	const yearAgoTs = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60);

	return await db
		.select({
			period: sql<string>`strftime('%Y-%m', datetime(${companyInvoices.invoiceDate}, 'unixepoch'))`,
			revenueCents: sql<number>`COALESCE(SUM(${companyInvoices.totalCents}), 0)`,
			collectedCents: sql<number>`COALESCE(SUM(${companyInvoices.amountPaidCents}), 0)`,
			invoiceCount: sql<number>`COUNT(*)`,
		})
		.from(companyInvoices)
		.where(
			and(
				eq(companyInvoices.companyId, companyId),
				gte(companyInvoices.invoiceDate, yearAgoTs),
				sql`${companyInvoices.status} IN ('paid', 'partial')`
			)
		)
		.groupBy(sql`strftime('%Y-%m', datetime(${companyInvoices.invoiceDate}, 'unixepoch'))`)
		.orderBy(sql`strftime('%Y-%m', datetime(${companyInvoices.invoiceDate}, 'unixepoch'))`)
		.all();
}

export default async function ReportsPage({ params }: ReportsPageProps) {
	const { companyId } = await params;
	const companyIdNum = parseInt(companyId, 10);

	if (isNaN(companyIdNum) || companyIdNum <= 0) {
		notFound();
	}

	const [stats, revenueByState, monthlyRevenue] = await Promise.all([
		getRevenueStats(companyIdNum),
		getRevenueByState(companyIdNum),
		getMonthlyRevenue(companyIdNum),
	]);

	const isPositiveGrowth = stats.growthPercentage >= 0;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Reports</h1>
				<p className="text-muted-foreground">
					Revenue analytics and performance insights
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatsCard
					title="Revenue This Month"
					value={formatCurrency(stats.currentMonth.revenue)}
					subtitle={`${stats.currentMonth.count} invoices`}
					icon={DollarSign}
					trend={{
						value: stats.growthPercentage,
						label: "vs last month",
					}}
				/>
				<StatsCard
					title="Collected This Month"
					value={formatCurrency(stats.currentMonth.collected)}
					subtitle="Amount received"
					icon={DollarSign}
				/>
				<StatsCard
					title="Annual Revenue"
					value={formatCurrency(stats.year.revenue)}
					subtitle={`${stats.year.count} invoices (12 months)`}
					icon={TrendingUp}
				/>
				<StatsCard
					title="Annual Collected"
					value={formatCurrency(stats.year.collected)}
					subtitle="Total received (12 months)"
					icon={FileText}
				/>
			</div>

			{/* Revenue Chart */}
			<RevenueChart
				data={monthlyRevenue}
				title="Revenue Trend"
				description="Monthly revenue and collections (last 12 months)"
			/>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Monthly Revenue Table */}
				<Card>
					<CardHeader>
						<CardTitle>Monthly Revenue</CardTitle>
						<CardDescription>Revenue breakdown by month (last 12 months)</CardDescription>
					</CardHeader>
					<CardContent>
						{monthlyRevenue.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-8">
								No revenue data available
							</p>
						) : (
							<div className="space-y-3">
								{monthlyRevenue.slice().reverse().map((month) => (
									<div
										key={month.period}
										className="flex items-center justify-between py-2 border-b last:border-0"
									>
										<div>
											<p className="font-medium">
												{(() => {
													const [year, monthNum] = month.period.split('-');
													return new Date(Date.UTC(parseInt(year), parseInt(monthNum) - 1, 1)).toLocaleDateString('en-US', {
														month: 'long',
														year: 'numeric',
														timeZone: 'UTC',
													});
												})()}
											</p>
											<p className="text-sm text-muted-foreground">
												{month.invoiceCount} invoices
											</p>
										</div>
										<p className="font-medium">
											{formatCurrency(month.revenueCents)}
										</p>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Revenue by State */}
				<Card>
					<CardHeader>
						<CardTitle>Revenue by Location</CardTitle>
						<CardDescription>Top states by revenue (last 12 months)</CardDescription>
					</CardHeader>
					<CardContent>
						{revenueByState.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-8">
								No geographic data available
							</p>
						) : (
							<div className="space-y-3">
								{revenueByState.map((item, index) => {
									const maxRevenue = revenueByState[0]?.revenue || 1;
									const percentage = (item.revenue / maxRevenue) * 100;

									return (
										<div key={item.state || `unknown-${index}`} className="space-y-1">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<MapPin className="h-4 w-4 text-muted-foreground" />
													<span className="font-medium">
														{item.state || 'Unknown'}
													</span>
													<span className="text-sm text-muted-foreground">
														({item.count} invoices)
													</span>
												</div>
												<span className="font-medium">
													{formatCurrency(item.revenue)}
												</span>
											</div>
											<div className="h-2 bg-muted rounded-full overflow-hidden">
												<div
													className="h-full bg-primary rounded-full transition-all"
													style={{ width: `${percentage}%` }}
												/>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
