import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth-helpers";


export async function GET() {
	try {
		const isAdmin = await isSuperAdmin();
		return NextResponse.json({ isAdmin });
	} catch (error) {
		console.error("Error checking admin status:", error);
		return NextResponse.json({ isAdmin: false });
	}
}