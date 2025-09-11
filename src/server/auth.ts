import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { D1Adapter } from "./db/auth-adapter";
import { db } from "./db";
import { users, roles, userRoles } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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

// Get the URL for NextAuth
const url = process.env.NEXTAUTH_URL || "https://atenra.com";

export const {
	auth,
	handlers,
	signIn,
	signOut
} = NextAuth({
	secret: getEnvVar("AUTH_SECRET"),
	trustHost: true,
	adapter: D1Adapter,
	pages: {
		signIn: "/login",
		error: "/auth/error",
	},
	callbacks: {
		async session({ session, token }) {
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
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

					const isPasswordValid = await bcrypt.compare(
						credentials.password as string,
						user.passwordHash
					);

					if (!isPasswordValid) {
						return null;
					}

					if (!user.emailVerified) {
						throw new Error("Please verify your email before signing in");
					}

					return {
						id: user.authUserId || user.id.toString(),
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
		async signIn({ user, account, profile }) {
			try {
				if (user.id && user.email) {
					// First check if user exists by auth_user_id
					let existingUser = await db
						.select()
						.from(users)
						.where(eq(users.authUserId, user.id))
						.get();

					// If not found by auth_user_id, check by email (for migrated users)
					if (!existingUser) {
						existingUser = await db
							.select()
							.from(users)
							.where(eq(users.email, user.email))
							.get();
						
						// If found by email, update the auth_user_id
						if (existingUser) {
							await db
								.update(users)
								.set({ 
									authUserId: user.id,
									updatedAt: Math.floor(Date.now() / 1000) // Unix timestamp
								})
								.where(eq(users.email, user.email));
							return; // User exists and was updated, no need to create
						}
					} else {
						return; // User already exists with correct auth_user_id
					}

					// Only create new user if not found by either auth_user_id or email
					if (!existingUser) {
						const nameParts = user.name?.split(' ') || [];
						const firstName = nameParts[0] || '';
						const lastName = nameParts.slice(1).join(' ') || '';

						const newUser = await db.insert(users).values({
							authUserId: user.id,
							email: user.email,
							passwordHash: '',
							firstName,
							lastName,
							displayName: user.name,
							avatarUrl: user.image,
							emailVerified: 1,
						}).returning().get();

						// Check if user should be assigned super admin role
						const superUserEmails = process.env.SUPER_USER_EMAIL?.split(',').map(email => email.trim()) || [];
						const isSuperUser = user.email && superUserEmails.includes(user.email);

						if (isSuperUser && newUser) {
							const superAdminRole = await db
								.select()
								.from(roles)
								.where(eq(roles.name, 'super_admin'))
								.get();

							if (superAdminRole) {
								await db.insert(userRoles).values({
									userId: newUser.id,
									roleId: superAdminRole.id,
								});
							}
						}
					}
				}
			} catch (error) {
				console.error('Error creating user profile:', error);
			}
		},
	},
});

export const { GET, POST } = handlers;
