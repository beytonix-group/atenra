import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { hasCompanyAccess } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { userCompanyJobs, companyInvoices } from "@/server/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function GET(
	_request: NextRequest,
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

		// Get job stats
		const jobStatsResult = await db
			.select({
				total: sql<number>`COUNT(*)`,
				active: sql<number>`SUM(CASE WHEN ${userCompanyJobs.status} = 'active' THEN 1 ELSE 0 END)`,
				completed: sql<number>`SUM(CASE WHEN ${userCompanyJobs.status} = 'completed' THEN 1 ELSE 0 END)`,
				cancelled: sql<number>`SUM(CASE WHEN ${userCompanyJobs.status} = 'cancelled' THEN 1 ELSE 0 END)`,
			})
			.from(userCompanyJobs)
			.where(eq(userCompanyJobs.companyId, companyIdNum))
			.get();

		// Calculate current month timestamps
		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);
		const startOfMonthTs = Math.floor(startOfMonth.getTime() / 1000);

		// Get revenue stats for current month
		const revenueStatsResult = await db
			.select({
				totalRevenue: sql<number>`COALESCE(SUM(${companyInvoices.totalCents}), 0)`,
				collectedRevenue: sql<number>`COALESCE(SUM(${companyInvoices.amountPaidCents}), 0)`,
				invoiceCount: sql<number>`COUNT(*)`,
			})
			.from(companyInvoices)
			.where(
				and(
					eq(companyInvoices.companyId, companyIdNum),
					gte(companyInvoices.invoiceDate, startOfMonthTs)
				)
			)
			.get();

		// Get pending invoices count
		const pendingInvoicesResult = await db
			.select({
				count: sql<number>`COUNT(*)`,
				totalDue: sql<number>`COALESCE(SUM(${companyInvoices.totalCents} - ${companyInvoices.amountPaidCents}), 0)`,
			})
			.from(companyInvoices)
			.where(
				and(
					eq(companyInvoices.companyId, companyIdNum),
					sql`${companyInvoices.status} IN ('sent', 'viewed', 'partial', 'overdue')`
				)
			)
			.get();

		return NextResponse.json({
			jobs: {
				total: jobStatsResult?.total || 0,
				active: jobStatsResult?.active || 0,
				completed: jobStatsResult?.completed || 0,
				cancelled: jobStatsResult?.cancelled || 0,
			},
			revenue: {
				currentMonth: {
					totalCents: revenueStatsResult?.totalRevenue || 0,
					collectedCents: revenueStatsResult?.collectedRevenue || 0,
					invoiceCount: revenueStatsResult?.invoiceCount || 0,
				},
			},
			pendingInvoices: {
				count: pendingInvoicesResult?.count || 0,
				totalDueCents: pendingInvoicesResult?.totalDue || 0,
			},
		});
	} catch (error) {
		console.error("Error fetching company dashboard:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
