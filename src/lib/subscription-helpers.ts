import { db } from "@/server/db";
import { subscriptions, userRoles, roles, userServicePreferences } from "@/server/db/schema";
import { eq, inArray } from "drizzle-orm";

/**
 * Check if a user has an active paid subscription (monthly or yearly)
 * Returns true if user has status 'active' or 'trialing'
 */
export async function hasActivePaidPlan(userId: number): Promise<boolean> {
	try {
		const activeSubscription = await db
			.select({ id: subscriptions.id })
			.from(subscriptions)
			.where(eq(subscriptions.userId, userId))
			.get();

		if (!activeSubscription) {
			return false;
		}

		// Check if any subscription has active or trialing status
		const subscription = await db
			.select({ status: subscriptions.status })
			.from(subscriptions)
			.where(eq(subscriptions.userId, userId))
			.all();

		return subscription.some(s => s.status === 'active' || s.status === 'trialing');
	} catch (error) {
		console.error("Error checking active paid plan:", error);
		return false;
	}
}

/**
 * Check if a user is exempt from the paywall
 * Exempt roles: super_admin, employee
 */
export async function isPaywallExempt(userId: number): Promise<boolean> {
	try {
		const userRole = await db
			.select({ roleName: roles.name })
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, userId))
			.get();

		if (!userRole) {
			return false;
		}

		// super_admin and employee bypass the paywall
		return userRole.roleName === 'super_admin' || userRole.roleName === 'employee';
	} catch (error) {
		console.error("Error checking paywall exemption:", error);
		return false;
	}
}

/**
 * Check if a user has set any service preferences
 */
export async function hasUserPreferences(userId: number): Promise<boolean> {
	try {
		const preference = await db
			.select({ categoryId: userServicePreferences.categoryId })
			.from(userServicePreferences)
			.where(eq(userServicePreferences.userId, userId))
			.limit(1)
			.get();

		return !!preference;
	} catch (error) {
		console.error("Error checking user preferences:", error);
		return false;
	}
}

/**
 * Get the paywall status for a user
 * Returns: 'exempt' | 'has_plan' | 'needs_preferences' | 'needs_plan'
 */
export async function getPaywallStatus(userId: number): Promise<'exempt' | 'has_plan' | 'needs_preferences' | 'needs_plan'> {
	// Check exemption first (super_admin, employee)
	if (await isPaywallExempt(userId)) {
		return 'exempt';
	}

	// Check if user has an active subscription
	if (await hasActivePaidPlan(userId)) {
		return 'has_plan';
	}

	// Check if user has preferences set
	if (!await hasUserPreferences(userId)) {
		return 'needs_preferences';
	}

	// User has preferences but no active plan
	return 'needs_plan';
}
