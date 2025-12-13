import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { paymentMethods, users } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";


export async function GET(request: NextRequest) {
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

		// Sync payment methods from Stripe if customer exists
		if (user.stripeCustomerId) {
			try {
				// Get all payment methods from Stripe
				const stripePaymentMethods = await stripe.paymentMethods.list({
					customer: user.stripeCustomerId,
					type: 'card',
				});

				// Get customer to check default payment method
				const customer = await stripe.customers.retrieve(user.stripeCustomerId);
				const defaultPaymentMethodId = !customer.deleted && customer.invoice_settings?.default_payment_method
					? (typeof customer.invoice_settings.default_payment_method === 'string'
						? customer.invoice_settings.default_payment_method
						: customer.invoice_settings.default_payment_method.id)
					: null;

				// Sync each payment method from Stripe to database
				for (const pm of stripePaymentMethods.data) {
					// Check if payment method exists in database
					const existing = await db
						.select({ id: paymentMethods.id })
						.from(paymentMethods)
						.where(eq(paymentMethods.stripePaymentMethodId, pm.id))
						.limit(1)
						.then((rows) => rows[0]);

					const isDefault = pm.id === defaultPaymentMethodId ? 1 : 0;

					if (!existing) {
						// Insert new payment method
						await db.insert(paymentMethods).values({
							userId: user.id,
							stripePaymentMethodId: pm.id,
							type: "card",
							cardBrand: pm.card?.brand || null,
							cardLast4: pm.card?.last4 || null,
							cardExpMonth: pm.card?.exp_month || null,
							cardExpYear: pm.card?.exp_year || null,
							isDefault,
							status: "valid",
							fingerprint: pm.card?.fingerprint || null,
						});
					} else {
						// Update existing payment method (in case default status changed)
						await db
							.update(paymentMethods)
							.set({ isDefault })
							.where(eq(paymentMethods.stripePaymentMethodId, pm.id));
					}
				}
			} catch (stripeError) {
				console.error("Error syncing payment methods from Stripe:", stripeError);
				// Continue to return database results even if sync fails
			}
		}

		// Get all payment methods for the user from database
		const allPaymentMethods = await db
			.select({
				id: paymentMethods.id,
				stripePaymentMethodId: paymentMethods.stripePaymentMethodId,
				brand: paymentMethods.cardBrand,
				last4: paymentMethods.cardLast4,
				expMonth: paymentMethods.cardExpMonth,
				expYear: paymentMethods.cardExpYear,
				isDefault: paymentMethods.isDefault,
				createdAt: paymentMethods.createdAt,
			})
			.from(paymentMethods)
			.where(
				and(
					eq(paymentMethods.userId, user.id),
					eq(paymentMethods.status, "valid")
				)
			)
			.orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt));

		return NextResponse.json({
			paymentMethods: allPaymentMethods.map(pm => ({
				id: pm.id,
				stripePaymentMethodId: pm.stripePaymentMethodId,
				brand: pm.brand,
				last4: pm.last4,
				expMonth: pm.expMonth,
				expYear: pm.expYear,
				isDefault: pm.isDefault === 1,
				createdAt: pm.createdAt,
			})),
		});
	} catch (error) {
		console.error("Error fetching payment methods:", error);
		return NextResponse.json(
			{ error: "Failed to fetch payment methods" },
			{ status: 500 }
		);
	}
}

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

			// Parse request body
		const body = await request.json() as {
			paymentMethodId: string;
		};

		const { paymentMethodId } = body;

		// Validate required fields
		if (!paymentMethodId) {
			return NextResponse.json(
				{ error: "Missing payment method ID" },
				{ status: 400 }
			);
		}

		// Get or create Stripe customer
		const customerId = await getOrCreateStripeCustomer(user.id);

		// Retrieve the payment method to get card details
		const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

		// Attach payment method to customer
		await stripe.paymentMethods.attach(paymentMethod.id, {
			customer: customerId,
		});

		// Set as default payment method
		await stripe.customers.update(customerId, {
			invoice_settings: {
				default_payment_method: paymentMethod.id,
			},
		});

		// Mark all existing payment methods as non-default
		await db
			.update(paymentMethods)
			.set({ isDefault: 0 })
			.where(eq(paymentMethods.userId, user.id));

		// Save payment method to database
		await db.insert(paymentMethods).values({
			userId: user.id,
			stripePaymentMethodId: paymentMethod.id,
			type: "card",
			cardBrand: paymentMethod.card?.brand || null,
			cardLast4: paymentMethod.card?.last4 || null,
			cardExpMonth: paymentMethod.card?.exp_month || null,
			cardExpYear: paymentMethod.card?.exp_year || null,
			isDefault: 1,
			status: "valid",
			fingerprint: paymentMethod.card?.fingerprint || null,
		});

		return NextResponse.json({
			success: true,
			paymentMethod: {
				brand: paymentMethod.card?.brand,
				last4: paymentMethod.card?.last4,
			},
		});
	} catch (error) {
		console.error("Error adding payment method:", error);

		// Handle Stripe errors
		if (error && typeof error === 'object' && 'type' in error) {
			const stripeError = error as { type?: string; message?: string };
			return NextResponse.json(
				{ error: stripeError.message || "Failed to add payment method" },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to add payment method" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
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
				isDefault: paymentMethods.isDefault,
			})
			.from(paymentMethods)
			.where(
				and(
					eq(paymentMethods.id, paymentMethodId),
					eq(paymentMethods.userId, user.id)
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

		// Detach from Stripe
		try {
			await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
		} catch (stripeError) {
			console.error("Error detaching from Stripe:", stripeError);
			// Continue even if Stripe detach fails
		}

		// Mark as detached in database
		await db
			.update(paymentMethods)
			.set({ status: "detached" })
			.where(eq(paymentMethods.id, paymentMethodId));

		return NextResponse.json({
			success: true,
			message: "Payment method removed successfully",
		});
	} catch (error) {
		console.error("Error removing payment method:", error);
		return NextResponse.json(
			{ error: "Failed to remove payment method" },
			{ status: 500 }
		);
	}
}
