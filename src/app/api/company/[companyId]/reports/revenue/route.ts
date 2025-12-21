import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { hasCompanyAccess } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { companyInvoices } from "@/server/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

interface RevenueDataPoint {
	period: string;
	revenueCents: number;
	collectedCents: number;
	invoiceCount: number;
}

interface GeographicDataPoint {
	state: string | null;
	revenueCents: number;
	invoiceCount: number;
}

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
		const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const includeGeographic = searchParams.get('geographic') === 'true';

		// Default date range: last 12 months
		const now = Math.floor(Date.now() / 1000);
		const defaultStart = now - (365 * 24 * 60 * 60); // 1 year ago

		const startTs = startDate ? parseInt(startDate) : defaultStart;
		const endTs = endDate ? parseInt(endDate) : now;

		// Validate parsed date parameters
		if (isNaN(startTs) || isNaN(endTs)) {
			return NextResponse.json(
				{ error: "Invalid date parameters" },
				{ status: 400 }
			);
		}

		if (startTs > endTs) {
			return NextResponse.json(
				{ error: "startDate must be before endDate" },
				{ status: 400 }
			);
		}

		// Build base conditions
		const conditions = [
			eq(companyInvoices.companyId, companyIdNum),
			gte(companyInvoices.invoiceDate, startTs),
			lte(companyInvoices.invoiceDate, endTs),
			sql`${companyInvoices.status} IN ('paid', 'partial')`,
		];

		// Get revenue by period
		let dateFormat: string;
		switch (period) {
			case 'daily':
				dateFormat = '%Y-%m-%d';
				break;
			case 'weekly':
				dateFormat = '%Y-W%W';
				break;
			case 'monthly':
			default:
				dateFormat = '%Y-%m';
				break;
		}

		const revenueByPeriod = await db
			.select({
				period: sql<string>`strftime('${sql.raw(dateFormat)}', datetime(${companyInvoices.invoiceDate}, 'unixepoch'))`,
				revenueCents: sql<number>`COALESCE(SUM(${companyInvoices.totalCents}), 0)`,
				collectedCents: sql<number>`COALESCE(SUM(${companyInvoices.amountPaidCents}), 0)`,
				invoiceCount: sql<number>`COUNT(*)`,
			})
			.from(companyInvoices)
			.where(and(...conditions))
			.groupBy(sql`strftime('${sql.raw(dateFormat)}', datetime(${companyInvoices.invoiceDate}, 'unixepoch'))`)
			.orderBy(sql`strftime('${sql.raw(dateFormat)}', datetime(${companyInvoices.invoiceDate}, 'unixepoch'))`)
			.all();

		// Calculate totals
		const totals = revenueByPeriod.reduce(
			(acc, row) => ({
				totalRevenueCents: acc.totalRevenueCents + row.revenueCents,
				totalCollectedCents: acc.totalCollectedCents + row.collectedCents,
				totalInvoiceCount: acc.totalInvoiceCount + row.invoiceCount,
			}),
			{ totalRevenueCents: 0, totalCollectedCents: 0, totalInvoiceCount: 0 }
		);

		// Get geographic breakdown if requested
		let geographic: GeographicDataPoint[] = [];
		if (includeGeographic) {
			geographic = await db
				.select({
					state: companyInvoices.customerState,
					revenueCents: sql<number>`COALESCE(SUM(${companyInvoices.totalCents}), 0)`,
					invoiceCount: sql<number>`COUNT(*)`,
				})
				.from(companyInvoices)
				.where(and(...conditions))
				.groupBy(companyInvoices.customerState)
				.orderBy(sql`SUM(${companyInvoices.totalCents}) DESC`)
				.all();
		}

		// Calculate comparison with previous period
		const periodDuration = endTs - startTs;
		const prevStartTs = startTs - periodDuration;
		const prevEndTs = startTs;

		const prevConditions = [
			eq(companyInvoices.companyId, companyIdNum),
			gte(companyInvoices.invoiceDate, prevStartTs),
			sql`${companyInvoices.invoiceDate} < ${prevEndTs}`, // Exclusive end to avoid counting boundary invoices twice
			sql`${companyInvoices.status} IN ('paid', 'partial')`,
		];

		const prevPeriodResult = await db
			.select({
				totalRevenue: sql<number>`COALESCE(SUM(${companyInvoices.totalCents}), 0)`,
				invoiceCount: sql<number>`COUNT(*)`,
			})
			.from(companyInvoices)
			.where(and(...prevConditions))
			.get();

		const prevRevenue = prevPeriodResult?.totalRevenue || 0;
		const revenueGrowth = prevRevenue > 0
			? ((totals.totalRevenueCents - prevRevenue) / prevRevenue) * 100
			: totals.totalRevenueCents > 0 ? 100 : 0;

		return NextResponse.json({
			period,
			dateRange: {
				start: startTs,
				end: endTs,
			},
			data: revenueByPeriod,
			totals: {
				revenueCents: totals.totalRevenueCents,
				collectedCents: totals.totalCollectedCents,
				invoiceCount: totals.totalInvoiceCount,
				outstandingCents: totals.totalRevenueCents - totals.totalCollectedCents,
			},
			comparison: {
				previousPeriodRevenueCents: prevRevenue,
				growthPercentage: Math.round(revenueGrowth * 100) / 100,
			},
			...(includeGeographic && { geographic }),
		});
	} catch (error) {
		console.error("Error fetching revenue report:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
