/**
 * Discount Calculation Helpers
 *
 * Placeholder module for discount calculation logic.
 * This will be implemented in a future phase to support:
 * - Membership tier discounts (automatic based on subscription plan)
 * - Agent discounts (custom amounts entered by agents)
 * - Coupon codes (user-entered codes at checkout)
 */

/**
 * Discount type
 */
export type DiscountType = 'membership' | 'agent' | 'coupon';

/**
 * Discount calculation result
 */
export interface DiscountResult {
	discountCents: number;
	discountType: DiscountType | null;
	discountReason: string | null;
	couponCodeId: number | null;
}

/**
 * Calculate membership tier discount based on user's subscription
 *
 * PLACEHOLDER: Returns 0 discount until membership tier logic is implemented.
 *
 * Future implementation will:
 * - Check user's active subscription
 * - Apply discount based on plan tier (e.g., Premium = 10% off, Executive = 15% off)
 */
export async function calculateMembershipDiscount(
	_userId: number,
	_subtotalCents: number
): Promise<{
	discountCents: number;
	discountReason: string | null;
}> {
	// Placeholder: No membership discount implemented yet
	return {
		discountCents: 0,
		discountReason: null,
	};
}

/**
 * Get agent discount for a user's cart
 *
 * PLACEHOLDER: Returns 0 discount until agent discount feature is implemented.
 *
 * Future implementation will:
 * - Check if agent has set a custom discount for this user's cart
 * - Return the agent-specified discount amount
 */
export async function getAgentDiscount(
	_userId: number
): Promise<{
	discountCents: number;
	discountReason: string | null;
}> {
	// Placeholder: No agent discount implemented yet
	return {
		discountCents: 0,
		discountReason: null,
	};
}

/**
 * Validate and apply a coupon code
 *
 * PLACEHOLDER: Returns error until coupon code feature is implemented.
 *
 * Future implementation will:
 * - Validate the coupon code exists and is active
 * - Check validity dates
 * - Check usage limits
 * - Calculate discount based on discount_type (percentage or fixed_amount)
 * - Apply max_discount_cents cap for percentage discounts
 * - Check min_order_cents requirement
 */
export async function validateCouponCode(
	_code: string,
	_userId: number,
	_subtotalCents: number
): Promise<{
	valid: boolean;
	discountCents: number;
	discountReason: string | null;
	couponCodeId: number | null;
	error: string | null;
}> {
	// Placeholder: Coupon codes not implemented yet
	return {
		valid: false,
		discountCents: 0,
		discountReason: null,
		couponCodeId: null,
		error: 'Coupon codes are not yet available',
	};
}

/**
 * Calculate total discount for an order
 *
 * Combines membership discount, agent discount, and coupon code.
 * Only one discount type can be applied per order (highest value wins).
 *
 * PLACEHOLDER: Currently returns zero discount.
 */
export async function calculateOrderDiscount(
	userId: number,
	subtotalCents: number,
	couponCode?: string | null
): Promise<DiscountResult> {
	// Get all potential discounts
	const membershipDiscount = await calculateMembershipDiscount(userId, subtotalCents);
	const agentDiscount = await getAgentDiscount(userId);

	let couponDiscount = { discountCents: 0, discountReason: null as string | null, couponCodeId: null as number | null };
	if (couponCode) {
		const result = await validateCouponCode(couponCode, userId, subtotalCents);
		if (result.valid) {
			couponDiscount = {
				discountCents: result.discountCents,
				discountReason: result.discountReason,
				couponCodeId: result.couponCodeId,
			};
		}
	}

	// Apply highest discount (membership > agent > coupon priority if equal)
	const discounts = [
		{ type: 'membership' as DiscountType, ...membershipDiscount, couponCodeId: null },
		{ type: 'agent' as DiscountType, ...agentDiscount, couponCodeId: null },
		{ type: 'coupon' as DiscountType, ...couponDiscount },
	];

	// Sort by discount amount (highest first)
	discounts.sort((a, b) => b.discountCents - a.discountCents);

	const bestDiscount = discounts[0];

	if (bestDiscount.discountCents > 0) {
		return {
			discountCents: bestDiscount.discountCents,
			discountType: bestDiscount.type,
			discountReason: bestDiscount.discountReason,
			couponCodeId: bestDiscount.couponCodeId,
		};
	}

	return {
		discountCents: 0,
		discountType: null,
		discountReason: null,
		couponCodeId: null,
	};
}
