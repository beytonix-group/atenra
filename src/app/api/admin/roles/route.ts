import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/server/db";
import { roles } from "@/server/db/schema";
import { ROLES } from "@/lib/auth/roles";

// Only use edge runtime in production
export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List all available roles
export async function GET() {
	try {
		// Ensure user is super_admin
		await requireRole(ROLES.SUPER_ADMIN);

		const allRoles = await db.select().from(roles).all();

		return NextResponse.json(allRoles);
	} catch (error) {
		console.error("Error fetching roles:", error);
		return NextResponse.json(
			{ error: "Failed to fetch roles" },
			{ status: 500 }
		);
	}
}