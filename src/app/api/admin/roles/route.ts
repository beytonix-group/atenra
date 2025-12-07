import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { roles } from "@/server/db/schema";
import { isSuperAdmin } from "@/lib/auth-helpers";


export async function GET() {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const allRoles = await db.select().from(roles).all();
		return NextResponse.json(allRoles);
	} catch (error) {
		console.error("Error fetching roles:", error);
		return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
	}
}