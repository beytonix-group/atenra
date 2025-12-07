import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { invoices, users } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";


export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Get user ID from email
		const user = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, session.user.email))
			.limit(1)
			.then((rows) => rows[0]);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Get user's invoices
		const userInvoices = await db
			.select({
				id: invoices.stripeInvoiceId,
				date: invoices.paidAt,
				amount: invoices.amountPaid,
				status: invoices.status,
				invoiceUrl: invoices.hostedInvoiceUrl,
			})
			.from(invoices)
			.where(eq(invoices.userId, user.id))
			.orderBy(desc(invoices.paidAt))
			.limit(50);

		// Convert from cents to dollars and format dates
		const formattedInvoices = userInvoices.map((invoice) => ({
			id: invoice.id,
			date: invoice.date
				? new Date(invoice.date * 1000).toISOString().split('T')[0]
				: new Date().toISOString().split('T')[0],
			amount: invoice.amount / 100, // Convert cents to dollars
			status: invoice.status,
			invoiceUrl: invoice.invoiceUrl || "",
		}));

		return NextResponse.json({
			invoices: formattedInvoices,
		});
	} catch (error) {
		console.error("Error fetching invoices:", error);
		return NextResponse.json(
			{ error: "Failed to fetch invoices" },
			{ status: 500 }
		);
	}
}
