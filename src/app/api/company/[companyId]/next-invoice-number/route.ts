import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { hasCompanyManagementAccess } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { companyInvoices } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
	_request: Request,
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

		// Check management access
		const canManage = await hasCompanyManagementAccess(companyIdNum);
		if (!canManage) {
			return NextResponse.json(
				{ error: "Forbidden" },
				{ status: 403 }
			);
		}

		// Get the latest invoice number for this company
		const latestInvoice = await db
			.select({ invoiceNumber: companyInvoices.invoiceNumber })
			.from(companyInvoices)
			.where(eq(companyInvoices.companyId, companyIdNum))
			.orderBy(desc(companyInvoices.id))
			.limit(1)
			.get();

		let nextNumber = 1;

		if (latestInvoice?.invoiceNumber) {
			// Extract the number from the invoice number pattern INV-{companyId}-{number}
			const match = latestInvoice.invoiceNumber.match(/INV-\d+-(\d+)/);
			if (match) {
				nextNumber = parseInt(match[1], 10) + 1;
			}
		}

		// Format: INV-{companyId}-{4-digit-padded-number}
		const invoiceNumber = `INV-${companyIdNum}-${nextNumber.toString().padStart(4, '0')}`;

		return NextResponse.json({ invoiceNumber });
	} catch (error) {
		console.error("Error generating invoice number:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
