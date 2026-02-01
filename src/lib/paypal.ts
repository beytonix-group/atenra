/**
 * PayPal API Helper Functions
 *
 * This module provides utilities for interacting with PayPal's REST APIs,
 * including OAuth token management, subscription verification, and webhook validation.
 *
 * All functions use native fetch for Cloudflare Worker compatibility.
 *
 * Environment Variables Required (server-side only):
 * - PAYPAL_CLIENT_ID: PayPal application client ID
 * - PAYPAL_CLIENT_SECRET: PayPal application client secret
 * - PAYPAL_API_BASE: API base URL (sandbox: https://api-m.sandbox.paypal.com, live: https://api-m.paypal.com)
 * - PAYPAL_WEBHOOK_ID: Webhook ID from PayPal Developer Dashboard
 * - PAYPAL_SUBSCRIPTION_PLAN_ID: Subscription plan ID (format: P-XXXXXX)
 *
 * Client-side (public):
 * - NEXT_PUBLIC_PAYPAL_CLIENT_ID: PayPal client ID for frontend SDK
 */

/**
 * PayPal OAuth 2.0 Access Token Response
 */
interface PayPalTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
}

/**
 * PayPal Subscription Status
 * Maps to our database subscription status enum
 */
export type PayPalSubscriptionStatus =
	| "APPROVAL_PENDING"
	| "APPROVED"
	| "ACTIVE"
	| "SUSPENDED"
	| "CANCELLED"
	| "EXPIRED";

/**
 * PayPal Subscription Details
 */
export interface PayPalSubscription {
	id: string;
	plan_id: string;
	status: PayPalSubscriptionStatus;
	status_update_time: string;
	start_time?: string;
	create_time: string;
	subscriber: {
		email_address?: string;
		payer_id?: string;
		name?: {
			given_name?: string;
			surname?: string;
		};
	};
	billing_info?: {
		outstanding_balance?: {
			currency_code: string;
			value: string;
		};
		cycle_executions?: Array<{
			tenure_type: string;
			sequence: number;
			cycles_completed: number;
			cycles_remaining?: number;
			current_pricing_scheme_version: number;
		}>;
		next_billing_time?: string;
		last_payment?: {
			amount: {
				currency_code: string;
				value: string;
			};
			time: string;
		};
	};
}

/**
 * PayPal Webhook Verification Request
 */
interface PayPalWebhookVerificationRequest {
	auth_algo: string;
	cert_url: string;
	transmission_id: string;
	transmission_sig: string;
	transmission_time: string;
	webhook_id: string;
	webhook_event: any;
}

/**
 * PayPal Webhook Verification Response
 */
interface PayPalWebhookVerificationResponse {
	verification_status: "SUCCESS" | "FAILURE";
}

/**
 * Cached PayPal OAuth Token
 */
interface CachedPayPalToken {
	accessToken: string;
	expiresAt: number;
}

// Module-level token cache
let paypalTokenCache: CachedPayPalToken | null = null;

/**
 * Get PayPal OAuth 2.0 Access Token
 *
 * Uses client credentials flow to obtain an access token for server-to-server API calls.
 * Tokens are cached and reused until 5 minutes before expiration to reduce API calls.
 *
 * @param env - Server environment variables (from Cloudflare Pages or process.env)
 * @returns Access token string
 * @throws Error if credentials are missing or API call fails
 */
export async function getPayPalAccessToken(env?: {
	PAYPAL_CLIENT_ID?: string;
	PAYPAL_CLIENT_SECRET?: string;
	PAYPAL_API_BASE?: string;
}): Promise<string> {
	const now = Date.now();

	// Return cached token if valid (with 5-minute buffer before expiry)
	if (paypalTokenCache && paypalTokenCache.expiresAt > now + 5 * 60 * 1000) {
		return paypalTokenCache.accessToken;
	}

	const clientId = env?.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
	const clientSecret = env?.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET;
	const apiBase = env?.PAYPAL_API_BASE || process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

	if (!clientId || !clientSecret) {
		throw new Error("PayPal credentials not configured: PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are required");
	}

	// Create Basic Auth header
	const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

	const response = await fetch(`${apiBase}/v1/oauth2/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${auth}`,
		},
		body: "grant_type=client_credentials",
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`PayPal OAuth failed (${response.status}): ${errorText}`);
	}

	const data = (await response.json()) as PayPalTokenResponse;

	// Cache the token with expiration
	paypalTokenCache = {
		accessToken: data.access_token,
		expiresAt: now + data.expires_in * 1000,
	};

	return data.access_token;
}

/**
 * Get PayPal Subscription Details
 *
 * Fetches complete subscription information from PayPal API.
 *
 * @param subscriptionId - PayPal subscription ID (e.g., "I-XXXXXXXXX")
 * @param accessToken - OAuth access token (from getPayPalAccessToken)
 * @param env - Server environment variables
 * @returns Subscription details
 * @throws Error if subscription not found or API call fails
 */
export async function getPayPalSubscription(
	subscriptionId: string,
	accessToken: string,
	env?: { PAYPAL_API_BASE?: string }
): Promise<PayPalSubscription> {
	const apiBase = env?.PAYPAL_API_BASE || process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

	const response = await fetch(`${apiBase}/v1/billing/subscriptions/${subscriptionId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to fetch PayPal subscription ${subscriptionId} (${response.status}): ${errorText}`);
	}

	return (await response.json()) as PayPalSubscription;
}

/**
 * Verify PayPal Webhook Signature
 *
 * Validates that a webhook event was actually sent by PayPal using their verification API.
 * This prevents webhook spoofing and ensures data integrity.
 *
 * @param headers - Webhook request headers (must include PayPal signature headers)
 * @param body - Raw webhook request body (exactly as received)
 * @param accessToken - OAuth access token
 * @param env - Server environment variables (must include PAYPAL_WEBHOOK_ID)
 * @returns true if verification succeeds
 * @throws Error if verification fails or required headers/config missing
 */
export async function verifyPayPalWebhook(
	headers: {
		"paypal-transmission-id"?: string | null;
		"paypal-transmission-time"?: string | null;
		"paypal-transmission-sig"?: string | null;
		"paypal-cert-url"?: string | null;
		"paypal-auth-algo"?: string | null;
	},
	body: any,
	accessToken: string,
	env?: { PAYPAL_WEBHOOK_ID?: string; PAYPAL_API_BASE?: string }
): Promise<boolean> {
	const webhookId = env?.PAYPAL_WEBHOOK_ID || process.env.PAYPAL_WEBHOOK_ID;
	const apiBase = env?.PAYPAL_API_BASE || process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

	if (!webhookId) {
		throw new Error("PAYPAL_WEBHOOK_ID not configured");
	}

	// Extract PayPal headers (case-insensitive)
	const transmissionId = headers["paypal-transmission-id"];
	const transmissionTime = headers["paypal-transmission-time"];
	const transmissionSig = headers["paypal-transmission-sig"];
	const certUrl = headers["paypal-cert-url"];
	const authAlgo = headers["paypal-auth-algo"];

	if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
		throw new Error("Missing required PayPal webhook headers");
	}

	const verificationRequest: PayPalWebhookVerificationRequest = {
		auth_algo: authAlgo,
		cert_url: certUrl,
		transmission_id: transmissionId,
		transmission_sig: transmissionSig,
		transmission_time: transmissionTime,
		webhook_id: webhookId,
		webhook_event: body,
	};

	const response = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(verificationRequest),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`PayPal webhook verification request failed (${response.status}): ${errorText}`);
	}

	const result = (await response.json()) as PayPalWebhookVerificationResponse;
	return result.verification_status === "SUCCESS";
}

/**
 * Map PayPal subscription status to our internal status enum
 *
 * PayPal statuses: APPROVAL_PENDING, APPROVED, ACTIVE, SUSPENDED, CANCELLED, EXPIRED
 * Our statuses: active, past_due, canceled, incomplete, trialing, suspended
 */
export function mapPayPalStatus(paypalStatus: PayPalSubscriptionStatus): string {
	switch (paypalStatus) {
		case "ACTIVE":
			return "active";
		case "SUSPENDED":
			return "suspended";
		case "CANCELLED":
		case "EXPIRED":
			return "canceled";
		case "APPROVAL_PENDING":
		case "APPROVED":
			return "incomplete";
		default:
			return "incomplete";
	}
}

/**
 * Get PayPal subscription plan ID from environment
 * Useful for validation when creating/updating subscriptions
 */
export function getPayPalPlanId(env?: { PAYPAL_SUBSCRIPTION_PLAN_ID?: string }): string {
	const planId = env?.PAYPAL_SUBSCRIPTION_PLAN_ID || process.env.PAYPAL_SUBSCRIPTION_PLAN_ID;

	if (!planId) {
		throw new Error("PAYPAL_SUBSCRIPTION_PLAN_ID not configured");
	}

	return planId;
}

/**
 * Get app URL for PayPal redirects
 * Reuses the same logic as Stripe integration
 */
export function getAppUrl(): string {
	if (process.env.NEXT_PUBLIC_APP_URL) {
		return process.env.NEXT_PUBLIC_APP_URL;
	}

	// Fallback for local development
	if (process.env.NODE_ENV === "development") {
		return "http://localhost:3000";
	}

	// Production fallback
	return "https://atenra.com";
}

/**
 * PayPal Plan Creation/Update Types
 */

/**
 * Arguments for creating a PayPal billing plan
 */
export interface CreatePayPalPlanArgs {
	name: string;
	description?: string;
	priceCents: number;
	currency: string;
	interval: "month" | "year";
	productId?: string;
}

/**
 * PayPal Product Response
 */
export interface PayPalProduct {
	id: string;
	name: string;
	description?: string;
	type: string;
	category?: string;
	create_time: string;
	update_time: string;
	links: Array<{ href: string; rel: string; method: string }>;
}

/**
 * PayPal Plan Response
 */
export interface PayPalPlan {
	id: string;
	product_id: string;
	name: string;
	description?: string;
	status: "CREATED" | "INACTIVE" | "ACTIVE";
	billing_cycles: Array<{
		tenure_type: "REGULAR" | "TRIAL";
		sequence: number;
		total_cycles: number;
		pricing_scheme: {
			fixed_price: {
				value: string;
				currency_code: string;
			};
		};
		frequency: {
			interval_unit: "DAY" | "WEEK" | "MONTH" | "YEAR";
			interval_count: number;
		};
	}>;
	payment_preferences: {
		auto_bill_outstanding: boolean;
		setup_fee_failure_action: "CONTINUE" | "CANCEL";
		payment_failure_threshold: number;
	};
	taxes?: {
		percentage: string;
		inclusive: boolean;
	};
	create_time: string;
	update_time: string;
	links: Array<{
		href: string;
		rel: string;
		method: string;
	}>;
}

/**
 * Create PayPal Product
 *
 * Creates a new product in PayPal. Products are required before creating billing plans.
 * This is typically called once to create a base product, then multiple plans can be created under it.
 *
 * @param env - Environment variables (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE)
 * @param name - Product name
 * @param description - Product description (optional)
 * @returns PayPal Product object with product ID
 * @throws Error if product creation fails
 */
export async function createPayPalProduct(
	env: {
		PAYPAL_CLIENT_ID?: string;
		PAYPAL_CLIENT_SECRET?: string;
		PAYPAL_API_BASE?: string;
	},
	name: string,
	description?: string
): Promise<PayPalProduct> {
	const apiBase = env.PAYPAL_API_BASE || process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
	const accessToken = await getPayPalAccessToken(env);

	const productPayload = {
		name: name,
		description: description || `Atenra subscription product`,
		type: "SERVICE", // SERVICE type is appropriate for subscriptions
		category: "SOFTWARE", // Category for software/SaaS subscriptions
	};

	const response = await fetch(`${apiBase}/v1/catalogs/products`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(productPayload),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to create PayPal product (${response.status}): ${errorText}`);
	}

	return (await response.json()) as PayPalProduct;
}

/**
 * Get or Create PayPal Product
 *
 * Gets the PayPal product ID from environment variable, or creates a new product if not set.
 * This ensures a product always exists before creating billing plans.
 *
 * @param env - Environment variables
 * @returns PayPal Product ID
 */
export async function ensurePayPalProduct(env: {
	PAYPAL_CLIENT_ID?: string;
	PAYPAL_CLIENT_SECRET?: string;
	PAYPAL_API_BASE?: string;
	PAYPAL_PRODUCT_ID?: string;
}): Promise<string> {
	// Check if product ID is already configured
	const existingProductId = env.PAYPAL_PRODUCT_ID || process.env.PAYPAL_PRODUCT_ID;

	if (existingProductId) {
		console.log(`[PayPal] Using existing product ID: ${existingProductId}`);
		return existingProductId;
	}

	// Create new product if not configured
	console.log("[PayPal] No product ID configured, creating new PayPal product...");
	const product = await createPayPalProduct(
		env,
		"Atenra Subscription Plans",
		"Subscription plans for Atenra platform services"
	);

	console.log(`[PayPal] Created new product: ${product.id}`);
	console.log(`[PayPal] IMPORTANT: Add this to your .dev.vars file: PAYPAL_PRODUCT_ID="${product.id}"`);

	return product.id;
}

/**
 * Create PayPal Billing Plan
 *
 * Creates a new billing plan in PayPal for recurring subscriptions.
 * The plan is created in ACTIVE status and ready for subscriptions.
 *
 * @param env - Environment variables (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE)
 * @param args - Plan details (name, price, interval, etc.)
 * @returns PayPal Plan object with plan ID
 * @throws Error if plan creation fails
 */
export async function createPayPalPlan(
	env: {
		PAYPAL_CLIENT_ID?: string;
		PAYPAL_CLIENT_SECRET?: string;
		PAYPAL_API_BASE?: string;
		PAYPAL_PRODUCT_ID?: string;
	},
	args: CreatePayPalPlanArgs
): Promise<PayPalPlan> {
	const apiBase = env.PAYPAL_API_BASE || process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

	// Get access token
	const accessToken = await getPayPalAccessToken(env);

	// Ensure product exists (get from env or create new one)
	const productId = args.productId || (await ensurePayPalProduct(env));

	// Map interval to PayPal frequency
	const intervalUnit = args.interval === "month" ? "MONTH" : "YEAR";

	// Convert cents to dollars for PayPal (PayPal expects decimal format like "29.00")
	const priceValue = (args.priceCents / 100).toFixed(2);

	// Create plan payload
	const planPayload = {
		product_id: productId,
		name: args.name,
		description: args.description || `${args.name} subscription plan`,
		status: "ACTIVE",
		billing_cycles: [
			{
				tenure_type: "REGULAR",
				sequence: 1,
				total_cycles: 0, // 0 means infinite/until cancelled
				pricing_scheme: {
					fixed_price: {
						value: priceValue,
						currency_code: args.currency.toUpperCase(),
					},
				},
				frequency: {
					interval_unit: intervalUnit,
					interval_count: 1,
				},
			},
		],
		payment_preferences: {
			auto_bill_outstanding: true,
			setup_fee_failure_action: "CONTINUE",
			payment_failure_threshold: 3,
		},
	};

	const response = await fetch(`${apiBase}/v1/billing/plans`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(planPayload),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to create PayPal plan (${response.status}): ${errorText}`);
	}

	const plan = (await response.json()) as PayPalPlan;
	return plan;
}

/**
 * Get PayPal Plan Details
 *
 * Fetches complete plan information from PayPal API.
 *
 * @param planId - PayPal plan ID (e.g., "P-XXXXXXXXX")
 * @param accessToken - OAuth access token (from getPayPalAccessToken)
 * @param env - Environment variables
 * @returns Plan details
 * @throws Error if plan not found or API call fails
 */
export async function getPayPalPlan(
	planId: string,
	accessToken: string,
	env?: { PAYPAL_API_BASE?: string }
): Promise<PayPalPlan> {
	const apiBase = env?.PAYPAL_API_BASE || process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

	const response = await fetch(`${apiBase}/v1/billing/plans/${planId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to fetch PayPal plan ${planId} (${response.status}): ${errorText}`);
	}

	return (await response.json()) as PayPalPlan;
}

/**
 * Update PayPal Plan Pricing
 *
 * Updates the pricing for an existing PayPal billing plan.
 * WARNING: This will affect ALL existing subscribers on this plan.
 * New subscribers will see the updated price immediately.
 *
 * @param env - Environment variables
 * @param planId - PayPal plan ID to update
 * @param priceCents - New price in cents
 * @param currency - Currency code (e.g., "USD")
 * @throws Error if update fails
 */
export async function updatePayPalPlanPricing(
	env: {
		PAYPAL_CLIENT_ID?: string;
		PAYPAL_CLIENT_SECRET?: string;
		PAYPAL_API_BASE?: string;
	},
	planId: string,
	priceCents: number,
	currency: string
): Promise<void> {
	const apiBase = env.PAYPAL_API_BASE || process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

	// Get access token
	const accessToken = await getPayPalAccessToken(env);

	// Convert cents to dollars
	const priceValue = (priceCents / 100).toFixed(2);

	// Update plan pricing using PATCH operation
	const updatePayload = [
		{
			op: "replace",
			path: "/billing_cycles/@sequence==1/pricing_scheme/fixed_price",
			value: {
				value: priceValue,
				currency_code: currency.toUpperCase(),
			},
		},
	];

	const response = await fetch(`${apiBase}/v1/billing/plans/${planId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(updatePayload),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to update PayPal plan pricing ${planId} (${response.status}): ${errorText}`);
	}

	// PATCH returns 204 No Content on success
}

/**
 * Deactivate PayPal Plan
 *
 * Deactivates a PayPal billing plan. Deactivated plans cannot accept new subscriptions,
 * but existing subscriptions continue unchanged.
 *
 * @param env - Environment variables
 * @param planId - PayPal plan ID to deactivate
 * @throws Error if deactivation fails
 */
export async function deactivatePayPalPlan(
	env: {
		PAYPAL_CLIENT_ID?: string;
		PAYPAL_CLIENT_SECRET?: string;
		PAYPAL_API_BASE?: string;
	},
	planId: string
): Promise<void> {
	const apiBase = env.PAYPAL_API_BASE || process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

	// Get access token
	const accessToken = await getPayPalAccessToken(env);

	const response = await fetch(`${apiBase}/v1/billing/plans/${planId}/deactivate`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to deactivate PayPal plan ${planId} (${response.status}): ${errorText}`);
	}

	// POST returns 204 No Content on success
}

// ----------------------------------------------------------
// PayPal Orders API (One-Time Payments)
// ----------------------------------------------------------

/**
 * PayPal Order Item
 */
export interface PayPalOrderItem {
	name: string;
	description?: string;
	quantity: string;
	unit_amount: {
		currency_code: string;
		value: string;
	};
}

/**
 * PayPal Order Response
 */
export interface PayPalOrder {
	id: string;
	status: "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED" | "PAYER_ACTION_REQUIRED";
	links: Array<{
		href: string;
		rel: string;
		method: string;
	}>;
}

/**
 * PayPal Capture Response
 */
export interface PayPalCaptureResponse {
	id: string;
	status: "COMPLETED" | "DECLINED" | "PARTIALLY_REFUNDED" | "PENDING" | "REFUNDED" | "FAILED";
	purchase_units: Array<{
		reference_id?: string;
		payments: {
			captures: Array<{
				id: string;
				status: string;
				amount: {
					currency_code: string;
					value: string;
				};
			}>;
		};
	}>;
}

/**
 * Create PayPal Order for One-Time Payment
 *
 * Creates a PayPal order for cart checkout (one-time payment).
 *
 * @param env - Environment variables
 * @param items - Array of items to purchase
 * @param totalCents - Total amount in cents
 * @param metadata - Additional metadata (orderId, userId, etc.)
 * @returns PayPal Order with approval URL
 */
export async function createPayPalOrder(
	env: {
		PAYPAL_CLIENT_ID?: string;
		PAYPAL_CLIENT_SECRET?: string;
		PAYPAL_API_BASE?: string;
	},
	items: Array<{
		name: string;
		description?: string;
		quantity: number;
		unitPriceCents: number;
	}>,
	totalCents: number,
	metadata: {
		orderId: number;
		userId: number;
		orderNumber: string;
	},
	returnUrl: string,
	cancelUrl: string
): Promise<{
	orderId: string;
	approvalUrl: string;
}> {
	const apiBase = env.PAYPAL_API_BASE || process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

	// Get access token
	const accessToken = await getPayPalAccessToken(env);

	// Calculate item total
	const itemTotalCents = items.reduce((sum, item) => sum + (item.unitPriceCents * item.quantity), 0);

	// Convert cents to dollars for PayPal
	const totalValue = (totalCents / 100).toFixed(2);
	const itemTotalValue = (itemTotalCents / 100).toFixed(2);

	// Build order payload
	const orderPayload = {
		intent: "CAPTURE",
		purchase_units: [
			{
				reference_id: metadata.orderNumber,
				description: `Order ${metadata.orderNumber}`,
				custom_id: `${metadata.orderId}`,
				amount: {
					currency_code: "USD",
					value: totalValue,
					breakdown: {
						item_total: {
							currency_code: "USD",
							value: itemTotalValue,
						},
						// Handle discount as difference between item total and order total
						...(itemTotalCents > totalCents ? {
							discount: {
								currency_code: "USD",
								value: ((itemTotalCents - totalCents) / 100).toFixed(2),
							}
						} : {}),
					},
				},
				items: items.map(item => ({
					name: item.name.substring(0, 127), // PayPal limit
					description: item.description?.substring(0, 127) || undefined,
					quantity: item.quantity.toString(),
					unit_amount: {
						currency_code: "USD",
						value: (item.unitPriceCents / 100).toFixed(2),
					},
				})),
			},
		],
		application_context: {
			return_url: returnUrl,
			cancel_url: cancelUrl,
			brand_name: "Atenra",
			user_action: "PAY_NOW",
			shipping_preference: "NO_SHIPPING",
		},
	};

	const response = await fetch(`${apiBase}/v2/checkout/orders`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(orderPayload),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to create PayPal order (${response.status}): ${errorText}`);
	}

	const order = (await response.json()) as PayPalOrder;

	// Find approval URL
	const approvalLink = order.links.find(link => link.rel === "approve");
	if (!approvalLink) {
		throw new Error("PayPal order created but no approval URL found");
	}

	return {
		orderId: order.id,
		approvalUrl: approvalLink.href,
	};
}

/**
 * Capture PayPal Order Payment
 *
 * Captures the payment for an approved PayPal order.
 *
 * @param env - Environment variables
 * @param paypalOrderId - PayPal order ID to capture
 * @returns Capture details
 */
export async function capturePayPalOrder(
	env: {
		PAYPAL_CLIENT_ID?: string;
		PAYPAL_CLIENT_SECRET?: string;
		PAYPAL_API_BASE?: string;
	},
	paypalOrderId: string
): Promise<{
	captureId: string;
	status: string;
	amountCents: number;
}> {
	const apiBase = env.PAYPAL_API_BASE || process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

	// Get access token
	const accessToken = await getPayPalAccessToken(env);

	const response = await fetch(`${apiBase}/v2/checkout/orders/${paypalOrderId}/capture`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to capture PayPal order ${paypalOrderId} (${response.status}): ${errorText}`);
	}

	const capture = (await response.json()) as PayPalCaptureResponse;

	// Get capture details
	const captureInfo = capture.purchase_units[0]?.payments?.captures?.[0];
	if (!captureInfo) {
		throw new Error("PayPal capture succeeded but no capture details found");
	}

	return {
		captureId: captureInfo.id,
		status: captureInfo.status,
		amountCents: Math.round(parseFloat(captureInfo.amount.value) * 100),
	};
}

/**
 * Get PayPal Order Details
 *
 * Fetches the current status of a PayPal order.
 *
 * @param env - Environment variables
 * @param paypalOrderId - PayPal order ID
 * @returns Order details
 */
export async function getPayPalOrderDetails(
	env: {
		PAYPAL_CLIENT_ID?: string;
		PAYPAL_CLIENT_SECRET?: string;
		PAYPAL_API_BASE?: string;
	},
	paypalOrderId: string
): Promise<PayPalOrder> {
	const apiBase = env.PAYPAL_API_BASE || process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

	// Get access token
	const accessToken = await getPayPalAccessToken(env);

	const response = await fetch(`${apiBase}/v2/checkout/orders/${paypalOrderId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to get PayPal order ${paypalOrderId} (${response.status}): ${errorText}`);
	}

	return (await response.json()) as PayPalOrder;
}
