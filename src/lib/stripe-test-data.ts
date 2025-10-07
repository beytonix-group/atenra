/**
 * Stripe test card numbers for development and testing
 * Source: https://stripe.com/docs/testing
 *
 * These test cards are publicly available and safe to commit.
 * They only work in Stripe's test mode.
 */

export interface TestCard {
	brand: string;
	number: string;
	cvc?: string;
	expiry?: string;
	notes?: string;
}

export interface CountryCard {
	country: string;
	brand: string;
	number: string;
}

export interface DeclineCard {
	scenario: string;
	number: string;
	error: string;
}

export interface FraudCard {
	scenario: string;
	number: string;
	risk: string;
}

export interface RefundCard {
	scenario: string;
	number: string;
	behavior: string;
}

export interface ThreeDSecureCard {
	scenario: string;
	number: string;
}

export const STRIPE_TEST_DATA = {
	/**
	 * Standard success cards - these will process successfully
	 */
	success_cards: [
		{ brand: "Visa", number: "4242424242424242", cvc: "Any 3 digits", expiry: "Any future date", notes: "Standard Visa" },
		{ brand: "Visa (debit)", number: "4000056655665556", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "Mastercard", number: "5555555555554444", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "Mastercard (2-series)", number: "2223003122003222", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "Mastercard (debit)", number: "5200828282828210", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "Mastercard (prepaid)", number: "5105105105105100", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "American Express", number: "378282246310005", cvc: "Any 4 digits", expiry: "Any future date" },
		{ brand: "American Express (alt)", number: "371449635398431", cvc: "Any 4 digits", expiry: "Any future date" },
		{ brand: "Discover", number: "6011111111111117", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "Discover (alt)", number: "6011000990139424", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "Discover (debit)", number: "6011981111111113", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "Diners Club", number: "3056930009020004", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "Diners Club (14-digit)", number: "36227206271667", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "BCcard / DinaCard", number: "6555900000604105", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "JCB", number: "3566002020360505", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "UnionPay", number: "6200000000000005", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "UnionPay (debit)", number: "6200000000000047", cvc: "Any 3 digits", expiry: "Any future date" },
		{ brand: "UnionPay (19-digit)", number: "6205500000000000004", cvc: "Any 3 digits", expiry: "Any future date" }
	] as TestCard[],

	/**
	 * Country-specific cards for testing different regions
	 */
	country_cards: [
		{ country: "US", brand: "Visa", number: "4242424242424242" },
		{ country: "AR", brand: "Visa", number: "4000000320000021" },
		{ country: "BR", brand: "Visa", number: "4000000760000002" },
		{ country: "CA", brand: "Visa", number: "4000001240000000" },
		{ country: "MX", brand: "Visa", number: "4000004840008001" },
		{ country: "GB", brand: "Visa", number: "4000008260000000" },
		{ country: "AU", brand: "Visa", number: "4000000360000006" },
		{ country: "JP", brand: "Visa", number: "4000003920000003" }
	] as CountryCard[],

	/**
	 * Decline cards - these will fail with specific error codes
	 */
	decline_cards: [
		{ scenario: "Generic decline", number: "4000000000000002", error: "card_declined (generic_decline)" },
		{ scenario: "Insufficient funds", number: "4000000000009995", error: "card_declined (insufficient_funds)" },
		{ scenario: "Lost card", number: "4000000000009987", error: "card_declined (lost_card)" },
		{ scenario: "Stolen card", number: "4000000000009979", error: "card_declined (stolen_card)" },
		{ scenario: "Expired card", number: "4000000000000069", error: "expired_card" },
		{ scenario: "Incorrect CVC", number: "4000000000000127", error: "incorrect_cvc" },
		{ scenario: "Processing error", number: "4000000000000119", error: "processing_error" },
		{ scenario: "Incorrect number", number: "4242424242424241", error: "incorrect_number" },
		{ scenario: "Velocity exceeded", number: "4000000000006975", error: "card_velocity_exceeded" },
		{ scenario: "Attach succeeds, later fails", number: "4000000000000341", error: "later_charge_fail" }
	] as DeclineCard[],

	/**
	 * Fraud prevention cards - test different risk levels and checks
	 */
	fraud_cards: [
		{ scenario: "Always blocked", number: "4100000000000019", risk: "highest" },
		{ scenario: "High risk", number: "4000000000004954", risk: "highest" },
		{ scenario: "Elevated risk", number: "4000000000009235", risk: "elevated" },
		{ scenario: "CVC check fails", number: "4000000000000101", risk: "cvc_check_fail" },
		{ scenario: "Postal code fails", number: "4000000000000036", risk: "postal_check_fail" },
		{ scenario: "CVC fail + elevated risk", number: "4000058400307872", risk: "elevated_cvc_fail" },
		{ scenario: "Postal fail + elevated risk", number: "4000058400306072", risk: "elevated_postal_fail" },
		{ scenario: "Address line 1 fail", number: "4000000000000028", risk: "address_line1_fail" },
		{ scenario: "Address + postal fail", number: "4000000000000010", risk: "address_postal_fail" },
		{ scenario: "Address unavailable", number: "4000000000000044", risk: "address_unavailable" }
	] as FraudCard[],

	/**
	 * Refund cards - test different refund scenarios
	 */
	refund_cards: [
		{ scenario: "Refund async success", number: "4000000000007726", behavior: "pending → succeeded" },
		{ scenario: "Refund async failure", number: "4000000000005126", behavior: "succeeded → failed" },
		{ scenario: "Bypass pending (US)", number: "4000000000000077", behavior: "goes directly to available balance" },
		{ scenario: "Bypass pending (intl)", number: "4000003720000278", behavior: "intl charge goes directly to available balance" }
	] as RefundCard[],

	/**
	 * 3D Secure cards - test authentication flows
	 */
	threeDSecure_cards: [
		{ scenario: "Authenticate unless setup", number: "4000002500003155" },
		{ scenario: "Always authenticate", number: "4000002760003184" },
		{ scenario: "Already set up", number: "4000003800000446" },
		{ scenario: "Insufficient funds after auth", number: "4000008260003178" },
		{ scenario: "3DS Required – OK", number: "4000000000003220" },
		{ scenario: "3DS Required – Decline after auth", number: "4000008400001629" },
		{ scenario: "3DS Required – Lookup error", number: "4000008400001280" },
		{ scenario: "3DS Supported – OK", number: "4000000000003055" },
		{ scenario: "3DS Supported – Processing error", number: "4000000000003097" },
		{ scenario: "3DS Supported – Unenrolled", number: "4242424242424242" },
		{ scenario: "3DS not supported", number: "378282246310005" }
	] as ThreeDSecureCard[]
} as const;

/**
 * Helper function to get a test card by brand
 */
export function getTestCardByBrand(brand: string): TestCard | undefined {
	return STRIPE_TEST_DATA.success_cards.find(
		card => card.brand.toLowerCase().includes(brand.toLowerCase())
	);
}

/**
 * Helper function to get a test card by country
 */
export function getTestCardByCountry(countryCode: string): CountryCard | undefined {
	return STRIPE_TEST_DATA.country_cards.find(
		card => card.country === countryCode.toUpperCase()
	);
}

/**
 * Default test card for quick testing
 */
export const DEFAULT_TEST_CARD = STRIPE_TEST_DATA.success_cards[0];
