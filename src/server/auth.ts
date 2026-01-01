import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { D1Adapter } from "./db/auth-adapter";
import { db } from "./db";
import { users, roles, userRoles, authUsers } from "./db/schema";
import { eq } from "drizzle-orm";
import { verifyPasswordPBKDF2 } from "@/lib/password-utils";

/**
 * Fetch all user roles from database by authUserId (used during login)
 * This is called once at login and the result is cached in the JWT token
 * Returns an array of role names (e.g., ['super_admin', 'manager'])
 */
async function getUserRolesFromDb(authUserId: string): Promise<string[] | null> {
	try {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, authUserId))
			.get();

		if (!user) return null;

		const userRolesList = await db
			.select({
				roleName: roles.name
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, user.id))
			.all();

		// Return null if no roles, otherwise return array of role names
		if (userRolesList.length === 0) return null;
		return userRolesList.map(r => r.roleName);
	} catch (error) {
		console.error("Error fetching user roles:", error);
		return null;
	}
}

// Helper to get environment variables that works in both local and Cloudflare
function getEnvVar(name: string): string {
	// In Cloudflare Pages, env vars are available via process.env
	// In local dev, they come from .env.local or .dev.vars
	const value = process.env[name] || "";

	// Debug logging for production
	if (name === "AUTH_SECRET" && !value) {
		console.error(`Missing required environment variable: ${name}`);
	}

	return value;
}

// NextAuth URL is set via environment variable NEXTAUTH_URL

export const {
	auth,
	handlers,
	signIn,
	signOut
} = NextAuth({
	secret: getEnvVar("AUTH_SECRET"),
	trustHost: true,
	adapter: D1Adapter,
	debug: true,
	session: {
		strategy: "jwt", // Use JWT for compatibility with both OAuth and Credentials
		maxAge: 15 * 24 * 60 * 60, // 15 days
	},
	pages: {
		signIn: "/login",
		error: "/auth/error",
	},
	callbacks: {
		async session({ session, token }) {
			// Add user id, email, and roles from token to session
			if (token) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;

				// Support both new 'roles' array and old 'role' string for backward compatibility
				if (token.roles) {
					session.user.roles = token.roles as string[];
				} else if ((token as { role?: string }).role) {
					// Convert old single role to array
					session.user.roles = [(token as { role: string }).role];
				} else {
					session.user.roles = null;
				}
			}
			return session;
		},
		async jwt({ token, user }) {
			const now = Math.floor(Date.now() / 1000);
			// Refresh roles from DB if older than 1 hour (3600 seconds)
			const ROLES_REFRESH_INTERVAL = 3600;

			// On sign in, store user info and roles in token
			if (user) {
				token.id = user.id;
				token.email = user.email;
				// Single DB call at login - fetch all roles and cache in token
				const roles = await getUserRolesFromDb(user.id as string);
				token.roles = roles;
				token.rolesRefreshedAt = now;
				console.log('[JWT] Sign-in: fetched roles for', user.email, '->', roles);
			}

			// Refresh roles if:
			// 1. Token has no roles and no old role format (migration case)
			// 2. No rolesRefreshedAt timestamp (old token format)
			// 3. Roles were last refreshed more than ROLES_REFRESH_INTERVAL ago
			const rolesRefreshedAt = token.rolesRefreshedAt;
			const needsRefresh = !token.roles && !(token as { role?: string }).role;
			const noTimestamp = rolesRefreshedAt === undefined;
			const isStale = typeof rolesRefreshedAt === 'number' && (now - rolesRefreshedAt > ROLES_REFRESH_INTERVAL);

			if (token.id && (needsRefresh || noTimestamp || isStale)) {
				const reason = needsRefresh ? 'migration' : (noTimestamp ? 'no-timestamp' : 'stale');
				console.log('[JWT] Refreshing roles for token.id', token.id, `(${reason})`);
				const roles = await getUserRolesFromDb(token.id as string);
				token.roles = roles;
				token.rolesRefreshedAt = now;
				console.log('[JWT] Refreshed roles ->', roles);
			}

			return token;
		}
	},
	providers: [
		Google({
			clientId: getEnvVar("AUTH_GOOGLE_ID"),
			clientSecret: getEnvVar("AUTH_GOOGLE_SECRET"),
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code"
				}
			}
		}),
		Credentials({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const user = await db
						.select()
						.from(users)
						.where(eq(users.email, credentials.email as string))
						.get();

					if (!user || !user.passwordHash) {
						return null;
					}

					// Verify password using PBKDF2 (edge-compatible)
					const isPasswordValid = await verifyPasswordPBKDF2(
						credentials.password as string,
						user.passwordHash
					);

					if (!isPasswordValid) {
						return null;
					}

					if (!user.emailVerified) {
						throw new Error("Please verify your email before signing in");
					}

					// Ensure auth_users record exists for NextAuth adapter compatibility
					if (!user.authUserId) {
						// Create auth_users record for this credentials-based user
						// Generate a proper UUID for NextAuth compatibility
						const authUserId = crypto.randomUUID();

						await db.insert(authUsers).values({
							id: authUserId,
							email: user.email,
							emailVerified: user.emailVerified ? new Date() : null,
							name: user.displayName,
							image: user.avatarUrl,
						}).onConflictDoNothing();

						// Update users table with the authUserId
						await db.update(users)
							.set({ authUserId: authUserId })
							.where(eq(users.id, user.id));

						return {
							id: authUserId,
							email: user.email,
							name: user.displayName,
							image: user.avatarUrl,
						};
					}

					return {
						id: user.authUserId,
						email: user.email,
						name: user.displayName,
						image: user.avatarUrl,
					};
				} catch (error) {
					console.error("Auth error:", error);
					return null;
				}
			}
		})
	],
	events: {
		async signIn({ user, account, profile: _profile }) {
			try {
				// Only run this for OAuth providers (Google), not for credentials login
				if (account?.provider === 'credentials') {
					console.log('SignIn event: Skipping for credentials login');
					return;
				}

				console.log('SignIn event triggered for OAuth user:', user.email);
				if (user.id && user.email) {
					const existingUser = await db
						.select()
						.from(users)
						.where(eq(users.authUserId, user.id))
						.get();

					if (!existingUser) {
						const nameParts = user.name?.split(' ') || [];
						const firstName = nameParts[0] || '';
						const lastName = nameParts.slice(1).join(' ') || '';

						await db.insert(users).values({
							authUserId: user.id,
							email: user.email,
							passwordHash: '',
							firstName,
							lastName,
							displayName: user.name,
							avatarUrl: user.image,
							emailVerified: 1,
						});

						// Check if user should be assigned super admin role
						const superUserEmails = process.env.SUPER_USER_EMAIL?.split(',').map(email => email.trim()) || [];
						const isSuperUser = user.email && superUserEmails.includes(user.email);

						if (isSuperUser) {
							const superAdminRole = await db
								.select()
								.from(roles)
								.where(eq(roles.name, 'super_admin'))
								.get();

							if (superAdminRole) {
								const newUser = await db
									.select()
									.from(users)
									.where(eq(users.authUserId, user.id))
									.get();

								if (newUser) {
									await db.insert(userRoles).values({
										userId: newUser.id,
										roleId: superAdminRole.id,
									});
								}
							}
						}
					}
				}
			} catch (error) {
				console.error('Error in signIn event:', error);
			}
		},
	},
});

export const { GET, POST } = handlers;
