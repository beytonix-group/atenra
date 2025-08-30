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

const auth = NextAuth({
    secret: getEnv("AUTH_SECRET"),
    trustHost: true,
    // Temporarily disable adapter to test if it's causing Configuration error
    // adapter: D1Adapter,
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
    // Temporarily disable events to test if they're causing Configuration error
    // events: {
    //   async signIn({ user, account, profile }) {
    //     // User profile creation logic here
    //   },
    // },
  });

export const { GET, POST } = auth.handlers;