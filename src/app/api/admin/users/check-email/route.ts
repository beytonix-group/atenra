import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { isSuperAdmin, hasCompanyManagementAccess } from "@/lib/auth-helpers";


export async function POST(request: NextRequest) {
	try {
		const body: unknown = await request.json();

		if (!body || typeof body !== 'object' || !('email' in body)) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		const { email, companyId } = body as { email: string; companyId?: number };

		if (!email || typeof email !== "string") {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		if (companyId !== undefined && (typeof companyId !== "number" || !Number.isInteger(companyId) || companyId <= 0)) {
			return NextResponse.json({ error: "Invalid companyId" }, { status: 400 });
		}

		// Authorization: super admin OR company manager/owner
		const isAdmin = await isSuperAdmin();
		let hasAccess = isAdmin;

		if (!hasAccess && companyId) {
			hasAccess = await hasCompanyManagementAccess(companyId);
		}

		if (!hasAccess) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		// Check if user with email exists - return all profile fields for pre-population
		const existingUser = await db
			.select({
				id: users.id,
				email: users.email,
				displayName: users.displayName,
				firstName: users.firstName,
				lastName: users.lastName,
				phone: users.phone,
				addressLine1: users.addressLine1,
				addressLine2: users.addressLine2,
				city: users.city,
				state: users.state,
				zipCode: users.zipCode,
				country: users.country,
			})
			.from(users)
			.where(eq(users.email, email.toLowerCase()))
			.get();

		if (existingUser) {
			return NextResponse.json({
				exists: true,
				user: existingUser,
			});
		}

		return NextResponse.json({
			exists: false,
		});
	} catch (error) {
		console.error("Error checking email:", error);
		return NextResponse.json({ error: "Failed to check email" }, { status: 500 });
	}
}
