import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { D1Adapter } from "./db/auth-adapter";
import { db } from "./db";
import { users, roles, userRoles } from "./db/schema";
import { eq } from "drizzle-orm";

export const {
	handlers: { GET, POST },
	signIn,
	signOut,
	auth,
} = NextAuth({
	secret: process.env.AUTH_SECRET,
	trustHost: true,
	adapter: D1Adapter,
	providers: [
		Google
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