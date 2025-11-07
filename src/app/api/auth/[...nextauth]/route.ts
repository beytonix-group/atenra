import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { D1Adapter } from "@/server/db/auth-adapter";
import { db } from "@/server/db";
import { users, roles, userRoles, authUsers } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { verifyPasswordPBKDF2 } from "@/lib/password-utils";
import { getEnv } from "@/lib/env-edge";

export const runtime = "edge";

const auth = NextAuth({
    secret: getEnv("AUTH_SECRET"),
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
        // Add user id and email from token to session
        if (token) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
        }
        return session;
      },
      async jwt({ token, user }) {
        // On sign in, store user info in token
        if (user) {
          token.id = user.id;
          token.email = user.email;
        }
        return token;
      }
    },
    providers: [
      Google({
        clientId: getEnv("AUTH_GOOGLE_ID"),
        clientSecret: getEnv("AUTH_GOOGLE_SECRET"),
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
      async signIn({ user, account, profile }) {
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
              const superUserEmails = 
                (getEnv("SUPER_USER_EMAIL") ?? "")
                  .split(",")
                  .map((email: string) => email.trim())
                  .filter(Boolean);
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

export const { GET, POST } = auth.handlers;