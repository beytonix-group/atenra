import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { paymentMethods, users } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";


export async function POST(request: NextRequest) {
	try {
		const stripe = getStripe();
		const session = await auth();

		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Get user ID from email
		const user = await db
			.select({ id: users.id, stripeCustomerId: users.stripeCustomerId })
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

		// Parse request body
		const body = await request.json() as {
			paymentMethodId: number;
		};

		const { paymentMethodId } = body;

		if (!paymentMethodId) {
			return NextResponse.json(
				{ error: "Missing payment method ID" },
				{ status: 400 }
			);
		}

		// Get the payment method from database
		const paymentMethod = await db
			.select({
				id: paymentMethods.id,
				stripePaymentMethodId: paymentMethods.stripePaymentMethodId,
			})
			.from(paymentMethods)
			.where(
				and(
					eq(paymentMethods.id, paymentMethodId),
					eq(paymentMethods.userId, user.id),
					eq(paymentMethods.status, "valid")
				)
			)
			.limit(1)
			.then((rows) => rows[0]);

		if (!paymentMethod) {
			return NextResponse.json(
				{ error: "Payment method not found" },
				{ status: 404 }
			);
		}

		// Update default in Stripe
		if (user.stripeCustomerId) {
			await stripe.customers.update(user.stripeCustomerId, {
				invoice_settings: {
					default_payment_method: paymentMethod.stripePaymentMethodId,
				},
			});
		}

		// Mark all existing payment methods as non-default
		await db
			.update(paymentMethods)
			.set({ isDefault: 0 })
			.where(eq(paymentMethods.userId, user.id));

		// Set the selected payment method as default
		await db
			.update(paymentMethods)
			.set({ isDefault: 1 })
			.where(eq(paymentMethods.id, paymentMethodId));

		return NextResponse.json({
			success: true,
			message: "Default payment method updated successfully",
		});
	} catch (error) {
		console.error("Error setting default payment method:", error);
		return NextResponse.json(
			{ error: "Failed to set default payment method" },
			{ status: 500 }
		);
	}
}
