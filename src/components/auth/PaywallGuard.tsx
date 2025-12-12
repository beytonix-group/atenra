import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, subscriptions, userRoles, roles, userServicePreferences } from "@/server/db/schema";
import { eq } from "drizzle-orm";

interface PaywallGuardProps {
	children: React.ReactNode;
}

/**
 * PaywallGuard - Server component that enforces paywall for regular users
 *
 * Checks:
 * 1. If user is exempt (super_admin or employee) - allows through
 * 2. If user has active subscription - allows through
 * 3. If user has no preferences - redirects to /preferences
 * 4. If user has preferences but no subscription - redirects to /upgrade
 */
export async function PaywallGuard({ children }: PaywallGuardProps) {
	const session = await auth();

	// No session - should be handled by middleware, but just in case
	if (!session?.user?.id) {
		redirect("/login");
	}

	try {
		// Get user from database
		let user = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.authUserId, session.user.id))
			.get();

		// If user doesn't exist in users table, create them
		// This handles cases where the signIn event didn't fire on Cloudflare
		if (!user) {
			const nameParts = session.user.name?.split(' ') || [];
			const firstName = nameParts[0] || '';
			const lastName = nameParts.slice(1).join(' ') || '';

			await db.insert(users).values({
				authUserId: session.user.id,
				email: session.user.email || '',
				passwordHash: '',
				firstName,
				lastName,
				displayName: session.user.name || '',
				avatarUrl: session.user.image || null,
				emailVerified: 1,
			});

			// Fetch the newly created user
			user = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.authUserId, session.user.id))
				.get();

			if (!user) {
				// Still no user - something went wrong, allow through
				console.error("PaywallGuard: Failed to create user");
				return <>{children}</>;
			}
		}

		// Check if user is exempt from paywall (super_admin or employee)
		const userRole = await db
			.select({ roleName: roles.name })
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, user.id))
			.get();

		if (userRole?.roleName === 'super_admin' || userRole?.roleName === 'employee') {
			// Exempt users bypass paywall
			return <>{children}</>;
		}

		// Check if user has active subscription
		const activeSubscription = await db
			.select({ status: subscriptions.status })
			.from(subscriptions)
			.where(eq(subscriptions.userId, user.id))
			.limit(1)
			.get();

		const hasActivePlan = activeSubscription &&
			(activeSubscription.status === 'active' || activeSubscription.status === 'trialing');

		if (hasActivePlan) {
			// User has active plan - allow through
			return <>{children}</>;
		}

		// No active plan - check if user has preferences
		const hasPreferences = await db
			.select({ categoryId: userServicePreferences.categoryId })
			.from(userServicePreferences)
			.where(eq(userServicePreferences.userId, user.id))
			.limit(1)
			.get();

		if (!hasPreferences) {
			// No preferences - redirect to preferences page
			redirect("/preferences");
		}

		// Has preferences but no plan - redirect to upgrade page
		redirect("/upgrade");
	} catch (error) {
		// Re-throw redirect errors - they're expected and handled by Next.js
		if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
			throw error;
		}
		console.error("PaywallGuard error:", error);
		// On error, allow through - better UX than blocking
		return <>{children}</>;
	}
}
