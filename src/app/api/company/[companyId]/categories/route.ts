import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { hasCompanyAccess } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { serviceCategories, companyServiceCategories } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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

		// Fetch categories that the company offers
		const categories = await db
			.select({
				id: serviceCategories.id,
				name: serviceCategories.name,
				description: serviceCategories.description,
			})
			.from(serviceCategories)
			.innerJoin(
				companyServiceCategories,
				eq(serviceCategories.id, companyServiceCategories.categoryId)
			)
			.where(eq(companyServiceCategories.companyId, companyIdNum))
			.all();

		return NextResponse.json({ categories });
	} catch (error) {
		console.error("Error fetching categories:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
