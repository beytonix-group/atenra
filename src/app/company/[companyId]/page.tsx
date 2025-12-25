import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { userCompanyJobs, companyInvoices, users, serviceCategories } from "@/server/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	StatsCard,
	JobStatusBadge,
	JobPriorityBadge,
	InvoiceStatusBadge,
	NewJobButton,
	NewInvoiceButton,
} from "@/components/company-dashboard";
import { ArrowRight } from "lucide-react";

interface DashboardPageProps {
	params: Promise<{ companyId: string }>;
}

function formatCurrency(cents: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(cents / 100);
}

function formatDate(timestamp: number): string {
	return new Date(timestamp * 1000).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

async function getCompanyStats(companyId: number) {
	// Get job stats
	const jobStatsResult = await db
		.select({
			total: sql<number>`COUNT(*)`,
			active: sql<number>`SUM(CASE WHEN ${userCompanyJobs.status} = 'active' THEN 1 ELSE 0 END)`,
			completed: sql<number>`SUM(CASE WHEN ${userCompanyJobs.status} = 'completed' THEN 1 ELSE 0 END)`,
		})
		.from(userCompanyJobs)
		.where(eq(userCompanyJobs.companyId, companyId))
		.get();

	// Calculate current month timestamps (using UTC for consistency)
	const now = new Date();
	const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
	const startOfMonthTs = Math.floor(startOfMonth.getTime() / 1000);

	// Get revenue stats for current month
	const revenueStatsResult = await db
		.select({
			totalRevenue: sql<number>`COALESCE(SUM(${companyInvoices.totalCents}), 0)`,
			collectedRevenue: sql<number>`COALESCE(SUM(${companyInvoices.amountPaidCents}), 0)`,
		})
		.from(companyInvoices)
		.where(
			and(
				eq(companyInvoices.companyId, companyId),
				sql`${companyInvoices.invoiceDate} >= ${startOfMonthTs}`,
				sql`${companyInvoices.status} IN ('paid', 'partial')`
			)
		)
		.get();

	// Get pending invoices
	const pendingInvoicesResult = await db
		.select({
			count: sql<number>`COUNT(*)`,
			totalDue: sql<number>`COALESCE(SUM(${companyInvoices.totalCents} - ${companyInvoices.amountPaidCents}), 0)`,
		})
		.from(companyInvoices)
		.where(
			and(
				eq(companyInvoices.companyId, companyId),
				sql`${companyInvoices.status} IN ('sent', 'viewed', 'partial', 'overdue')`
			)
		)
		.get();

	return {
		jobs: {
			total: jobStatsResult?.total || 0,
			active: jobStatsResult?.active || 0,
			completed: jobStatsResult?.completed || 0,
		},
		revenue: {
			currentMonth: revenueStatsResult?.totalRevenue || 0,
			collected: revenueStatsResult?.collectedRevenue || 0,
		},
		pendingInvoices: {
			count: pendingInvoicesResult?.count || 0,
			totalDue: pendingInvoicesResult?.totalDue || 0,
		},
	};
}

async function getRecentJobs(companyId: number) {
	return await db
		.select({
			id: userCompanyJobs.id,
			description: userCompanyJobs.description,
			status: userCompanyJobs.status,
			priority: userCompanyJobs.priority,
			createdAt: userCompanyJobs.createdAt,
			customerFirstName: users.firstName,
			customerLastName: users.lastName,
			categoryName: serviceCategories.name,
		})
		.from(userCompanyJobs)
		.leftJoin(users, eq(userCompanyJobs.userId, users.id))
		.leftJoin(serviceCategories, eq(userCompanyJobs.categoryId, serviceCategories.id))
		.where(eq(userCompanyJobs.companyId, companyId))
		.orderBy(desc(userCompanyJobs.createdAt))
		.limit(5)
		.all();
}

async function getRecentInvoices(companyId: number) {
	return await db
		.select({
			id: companyInvoices.id,
			invoiceNumber: companyInvoices.invoiceNumber,
			customerName: companyInvoices.customerName,
			totalCents: companyInvoices.totalCents,
			amountPaidCents: companyInvoices.amountPaidCents,
			status: companyInvoices.status,
			invoiceDate: companyInvoices.invoiceDate,
		})
		.from(companyInvoices)
		.where(eq(companyInvoices.companyId, companyId))
		.orderBy(desc(companyInvoices.createdAt))
		.limit(5)
		.all();
}

export default async function CompanyDashboardPage({ params }: DashboardPageProps) {
	const { companyId } = await params;
	const companyIdNum = parseInt(companyId, 10);

	if (isNaN(companyIdNum) || companyIdNum <= 0) {
		notFound();
	}

	const [stats, recentJobs, recentInvoices] = await Promise.all([
		getCompanyStats(companyIdNum),
		getRecentJobs(companyIdNum),
		getRecentInvoices(companyIdNum),
	]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Overview of your company performance
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatsCard
					title="Total Jobs"
					value={stats.jobs.total}
					subtitle={`${stats.jobs.active} active`}
					icon="briefcase"
				/>
				<StatsCard
					title="Completed Jobs"
					value={stats.jobs.completed}
					subtitle="All time"
					icon="briefcase"
				/>
				<StatsCard
					title="Revenue This Month"
					value={formatCurrency(stats.revenue.currentMonth)}
					subtitle={`${formatCurrency(stats.revenue.collected)} collected`}
					icon="dollarSign"
				/>
				<StatsCard
					title="Pending Invoices"
					value={stats.pendingInvoices.count}
					subtitle={`${formatCurrency(stats.pendingInvoices.totalDue)} outstanding`}
					icon="clock"
				/>
			</div>

			{/* Recent Activity */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Recent Jobs */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg">Recent Jobs</CardTitle>
						<div className="flex items-center gap-2">
							<NewJobButton companyId={companyIdNum} />
							<Button variant="ghost" size="sm" asChild>
								<Link href={`/company/${companyId}/jobs`}>
									View all
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{recentJobs.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-8">
								No jobs yet
							</p>
						) : (
							<div className="space-y-4">
								{recentJobs.map((job) => (
									<div
										key={job.id}
										className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0"
									>
										<div className="min-w-0 flex-1">
											<p className="font-medium truncate">
												{job.description}
											</p>
											<p className="text-sm text-muted-foreground">
												{[job.customerFirstName, job.customerLastName].filter(Boolean).join(' ') || 'Unknown customer'}
												{job.categoryName && ` - ${job.categoryName}`}
											</p>
										</div>
										<div className="flex items-center gap-2 flex-shrink-0">
											<JobPriorityBadge priority={job.priority as 'low' | 'medium' | 'high' | 'urgent'} />
											<JobStatusBadge status={job.status as 'active' | 'completed' | 'cancelled'} />
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Recent Invoices */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg">Recent Invoices</CardTitle>
						<div className="flex items-center gap-2">
							<NewInvoiceButton companyId={companyIdNum} />
							<Button variant="ghost" size="sm" asChild>
								<Link href={`/company/${companyId}/invoices`}>
									View all
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{recentInvoices.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-8">
								No invoices yet
							</p>
						) : (
							<div className="space-y-4">
								{recentInvoices.map((invoice) => (
									<div
										key={invoice.id}
										className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0"
									>
										<div className="min-w-0 flex-1">
											<p className="font-medium">
												#{invoice.invoiceNumber}
											</p>
											<p className="text-sm text-muted-foreground truncate">
												{invoice.customerName}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatDate(invoice.invoiceDate)}
											</p>
										</div>
										<div className="text-right flex-shrink-0">
											<p className="font-medium">
												{formatCurrency(invoice.totalCents)}
											</p>
											<InvoiceStatusBadge
												status={invoice.status as 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'void' | 'refunded'}
											/>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
