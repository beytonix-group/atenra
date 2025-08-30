import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { D1Adapter } from "@/server/db/auth-adapter";
import { db } from "@/server/db";
import { users, roles, userRoles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getEnv } from "@/lib/env-edge";

export const runtime = "edge";

const handler = async (req: Request) => {
  
  const authHandler = NextAuth({
    secret: getEnv("AUTH_SECRET"),
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

              // Check if user should be assigned super admin role
              const superUserEmails = getEnv("SUPER_USER_EMAIL")?.split(',').map(email => email.trim()) || [];
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

  return authHandler.handlers;
};

export async function GET(req: Request) {
  const { GET } = await handler(req);
  return GET(req);
}

export async function POST(req: Request) {
  const { POST } = await handler(req);
  return POST(req);
}