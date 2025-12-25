import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { hasCompanyAccess } from "@/lib/auth-helpers";

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

		// Check access
		const hasAccess = await hasCompanyAccess(companyIdNum);
		if (!hasAccess) {
			return NextResponse.json(
				{ error: "Forbidden" },
				{ status: 403 }
			);
		}

		// Deprecated: Customer selection replaced with free-text fields
		// Return empty array to prevent PII exposure
		return NextResponse.json({ customers: [] });
	} catch (error) {
		console.error("Error fetching customers:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
