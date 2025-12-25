import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { hasCompanyAccess } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { companyInvoices, userCompanyJobs } from "@/server/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { companyId } = await params;
		const companyIdNum = parseInt(companyId);

		if (isNaN(companyIdNum)) {
			return NextResponse.json(
				{ error: "Invalid company ID" },
				{ status: 400 }
			);
		}

		// Check access
		const hasAccess = await hasCompanyAccess(companyIdNum);
		if (!hasAccess) {
			return NextResponse.json(
				{ error: "Forbidden" },
				{ status: 403 }
			);
		}

		// Parse query params
		const { searchParams } = new URL(request.url);
		const chartType = searchParams.get('type'); // 'jobs' or 'revenue'
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		// Default date range: last 6 months
		const now = Math.floor(Date.now() / 1000);
		const sixMonthsAgo = now - (180 * 24 * 60 * 60);

		const startTs = startDate ? parseInt(startDate) : sixMonthsAgo;
		const endTs = endDate ? parseInt(endDate) : now;

		if (isNaN(startTs) || isNaN(endTs)) {
			return NextResponse.json(
				{ error: "Invalid date parameters" },
				{ status: 400 }
			);
		}

		const dateFormat = '%Y-%m';

		if (chartType === 'jobs') {
			// Get jobs by month
			const jobsByMonth = await db
				.select({
					month: sql<string>`strftime('${sql.raw(dateFormat)}', datetime(${userCompanyJobs.createdAt}, 'unixepoch'))`,
					count: sql<number>`COUNT(*)`,
				})
				.from(userCompanyJobs)
				.where(
					and(
						eq(userCompanyJobs.companyId, companyIdNum),
						gte(userCompanyJobs.createdAt, startTs),
						lte(userCompanyJobs.createdAt, endTs)
					)
				)
				.groupBy(sql`strftime('${sql.raw(dateFormat)}', datetime(${userCompanyJobs.createdAt}, 'unixepoch'))`)
				.orderBy(sql`strftime('${sql.raw(dateFormat)}', datetime(${userCompanyJobs.createdAt}, 'unixepoch'))`)
				.all();

			return NextResponse.json({
				type: 'jobs',
				dateRange: { start: startTs, end: endTs },
				data: jobsByMonth,
			});
		} else if (chartType === 'revenue') {
			// Get revenue by month from paid invoices
			const revenueByMonth = await db
				.select({
					month: sql<string>`strftime('${sql.raw(dateFormat)}', datetime(${companyInvoices.invoiceDate}, 'unixepoch'))`,
					revenueCents: sql<number>`COALESCE(SUM(${companyInvoices.totalCents}), 0)`,
					collectedCents: sql<number>`COALESCE(SUM(${companyInvoices.amountPaidCents}), 0)`,
				})
				.from(companyInvoices)
				.where(
					and(
						eq(companyInvoices.companyId, companyIdNum),
						gte(companyInvoices.invoiceDate, startTs),
						lte(companyInvoices.invoiceDate, endTs),
						sql`${companyInvoices.status} IN ('paid', 'partial')`
					)
				)
				.groupBy(sql`strftime('${sql.raw(dateFormat)}', datetime(${companyInvoices.invoiceDate}, 'unixepoch'))`)
				.orderBy(sql`strftime('${sql.raw(dateFormat)}', datetime(${companyInvoices.invoiceDate}, 'unixepoch'))`)
				.all();

			return NextResponse.json({
				type: 'revenue',
				dateRange: { start: startTs, end: endTs },
				data: revenueByMonth,
			});
		} else {
			return NextResponse.json(
				{ error: "Invalid chart type. Use 'jobs' or 'revenue'" },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Error fetching chart data:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
