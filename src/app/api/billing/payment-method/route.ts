import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { paymentMethods, users } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const runtime = "edge";

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

		// Get default payment method
		const paymentMethod = await db
			.select({
				brand: paymentMethods.cardBrand,
				last4: paymentMethods.cardLast4,
				expMonth: paymentMethods.cardExpMonth,
				expYear: paymentMethods.cardExpYear,
			})
			.from(paymentMethods)
			.where(
				and(
					eq(paymentMethods.userId, user.id),
					eq(paymentMethods.isDefault, 1),
					eq(paymentMethods.status, "valid")
				)
			)
			.orderBy(desc(paymentMethods.createdAt))
			.limit(1)
			.then((rows) => rows[0]);

		if (!paymentMethod) {
			return NextResponse.json(
				{ paymentMethod: null },
				{ status: 200 }
			);
		}

		return NextResponse.json({
			paymentMethod: {
				brand: paymentMethod.brand,
				last4: paymentMethod.last4,
			},
		});
	} catch (error) {
		console.error("Error fetching payment method:", error);
		return NextResponse.json(
			{ error: "Failed to fetch payment method" },
			{ status: 500 }
		);
	}
}
