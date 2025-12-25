import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { hasCompanyManagementAccess } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { companyInvoices } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateStatusSchema = z.object({
	status: z.enum(['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'void', 'refunded']),
	amountPaidCents: z.number().optional(),
});

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ companyId: string; invoiceId: string }> }
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { companyId, invoiceId } = await params;
		const companyIdNum = parseInt(companyId);
		const invoiceIdNum = parseInt(invoiceId);

		if (isNaN(companyIdNum) || isNaN(invoiceIdNum)) {
			return NextResponse.json(
				{ error: "Invalid ID" },
				{ status: 400 }
			);
		}

		// Check management access
		const canManage = await hasCompanyManagementAccess(companyIdNum);
		if (!canManage) {
			return NextResponse.json(
				{ error: "Forbidden - Management access required" },
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { status, amountPaidCents } = updateStatusSchema.parse(body);

		// Get the current invoice
		const existingInvoice = await db
			.select()
			.from(companyInvoices)
			.where(
				and(
					eq(companyInvoices.id, invoiceIdNum),
					eq(companyInvoices.companyId, companyIdNum)
				)
			)
			.get();

		if (!existingInvoice) {
			return NextResponse.json(
				{ error: "Invoice not found" },
				{ status: 404 }
			);
		}

		// Build update values
		const updateValues: Record<string, unknown> = {
			status,
			updatedAt: Math.floor(Date.now() / 1000),
		};

		// Handle status-specific updates
		if (status === 'paid') {
			// Only set paidAt if not already paid (preserve original timestamp)
			if (!existingInvoice.paidAt) {
				updateValues.paidAt = Math.floor(Date.now() / 1000);
			}
			updateValues.amountPaidCents = existingInvoice.totalCents;
		} else if (status === 'partial' && amountPaidCents !== undefined) {
			updateValues.amountPaidCents = amountPaidCents;
		} else if (status === 'void' || status === 'refunded') {
			// Keep the paid info for record
		} else if (['draft', 'sent', 'viewed', 'overdue'].includes(status)) {
			// Clear payment info when reverting to non-payment status
			updateValues.paidAt = null;
			updateValues.amountPaidCents = 0;
		}

		// Update the invoice
		const updatedInvoice = await db
			.update(companyInvoices)
			.set(updateValues)
			.where(
				and(
					eq(companyInvoices.id, invoiceIdNum),
					eq(companyInvoices.companyId, companyIdNum)
				)
			)
			.returning()
			.get();

		return NextResponse.json({ invoice: updatedInvoice });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 }
			);
		}
		console.error("Error updating invoice:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ companyId: string; invoiceId: string }> }
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { companyId, invoiceId } = await params;
		const companyIdNum = parseInt(companyId);
		const invoiceIdNum = parseInt(invoiceId);

		if (isNaN(companyIdNum) || isNaN(invoiceIdNum)) {
			return NextResponse.json(
				{ error: "Invalid ID" },
				{ status: 400 }
			);
		}

		// Check management access
		const canManage = await hasCompanyManagementAccess(companyIdNum);
		if (!canManage) {
			return NextResponse.json(
				{ error: "Forbidden" },
				{ status: 403 }
			);
		}

		const invoice = await db
			.select()
			.from(companyInvoices)
			.where(
				and(
					eq(companyInvoices.id, invoiceIdNum),
					eq(companyInvoices.companyId, companyIdNum)
				)
			)
			.get();

		if (!invoice) {
			return NextResponse.json(
				{ error: "Invoice not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ invoice });
	} catch (error) {
		console.error("Error fetching invoice:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
