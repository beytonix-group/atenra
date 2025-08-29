import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { Adapter } from "next-auth/adapters";
import { eq, and } from "drizzle-orm";
import { db } from "./index";
import { authUsers, accounts, sessions, verificationTokens } from "./schema";

function createD1Adapter(): Adapter {
  const baseAdapter = DrizzleAdapter(db, {
    usersTable: authUsers,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  });

  return {
    ...baseAdapter,
    createSession: async (session) => {
      const sessionData = {
        ...session,
        expires: session.expires instanceof Date 
          ? session.expires.toISOString() 
          : session.expires
      };
      
      const result = await db
        .insert(sessions)
        .values(sessionData)
        .returning()
        .get();
      
      return {
        ...result,
        expires: new Date(result.expires)
      };
    },
    updateSession: async (session) => {
      const sessionData = {
        ...session,
        expires: session.expires instanceof Date 
          ? session.expires.toISOString() 
          : session.expires
      };
      
      const result = await db
        .update(sessions)
        .set(sessionData)
        .where(eq(sessions.sessionToken, session.sessionToken))
        .returning()
        .get();
      
      if (!result) return null;
      
      return {
        ...result,
        expires: new Date(result.expires)
      };
    },
    getSessionAndUser: async (sessionToken) => {
      const result = await db
        .select({
          session: sessions,
          user: authUsers,
        })
        .from(sessions)
        .innerJoin(authUsers, eq(authUsers.id, sessions.userId))
        .where(eq(sessions.sessionToken, sessionToken))
        .get();
      
      if (!result) return null;
      
      return {
        session: {
          ...result.session,
          expires: new Date(result.session.expires)
        },
        user: result.user
      };
    },
    deleteSession: async (sessionToken) => {
      const result = await db
        .delete(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .returning()
        .get();
      
      if (!result) return null;
      
      return {
        ...result,
        expires: new Date(result.expires)
      };
    },
    createVerificationToken: async (verificationToken) => {
      const tokenData = {
        ...verificationToken,
        expires: verificationToken.expires instanceof Date 
          ? verificationToken.expires.toISOString() 
          : verificationToken.expires
      };
      
      const result = await db
        .insert(verificationTokens)
        .values(tokenData)
        .returning()
        .get();
      
      return {
        ...result,
        expires: new Date(result.expires)
      };
    },
    useVerificationToken: async (verificationToken) => {
      const result = await db
        .delete(verificationTokens)
        .where(and(
          eq(verificationTokens.identifier, verificationToken.identifier),
          eq(verificationTokens.token, verificationToken.token)
        ))
        .returning()
        .get();
      
      if (!result) return null;
      
      return {
        ...result,
        expires: new Date(result.expires)
      };
    }
  };
}

export const D1Adapter = createD1Adapter();