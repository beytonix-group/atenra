import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { D1Adapter } from "./db/auth-adapter";
import { db } from "./db";
import { users, roles, userRoles } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { ROLES } from "@/lib/auth/roles";

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
					const existingUser = await db
						.select()
						.from(users)
						.where(eq(users.authUserId, user.id))
						.get();

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

						if (newUser) {
							// Check if user should be assigned super admin role
							const superUserEmails = process.env.SUPER_USER_EMAIL?.split(',').map(email => email.trim()) || [];
							const isSuperUser = user.email && superUserEmails.includes(user.email);
							
							// Determine which role to assign
							const roleName = isSuperUser ? ROLES.SUPER_ADMIN : ROLES.USER;
							
							// Get the role from database
							const role = await db
								.select()
								.from(roles)
								.where(eq(roles.name, roleName))
								.get();
								
							if (role) {
								// Assign the role to the new user
								await db.insert(userRoles).values({
									userId: newUser.id,
									roleId: role.id,
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