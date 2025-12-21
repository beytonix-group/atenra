import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getUserOwnedCompanies } from "@/lib/auth-helpers";

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const companies = await getUserOwnedCompanies();

		// Validate result is an array
		if (!companies || !Array.isArray(companies)) {
			return NextResponse.json({ companies: [] });
		}

		// Return minimal data needed for navigation
		const companyList = companies.map(c => ({
			id: c.id,
			name: c.name,
			city: c.city,
			state: c.state,
		}));

		return NextResponse.json({ companies: companyList });
	} catch (error) {
		console.error("Error fetching owned companies:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
