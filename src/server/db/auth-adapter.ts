import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { Adapter } from "next-auth/adapters";
import { eq, and } from "drizzle-orm";
import { db } from "./index";
import { authUsers, accounts, sessions, verificationTokens } from "./schema";

function createD1Adapter(): Adapter {
  // Check if db is valid before creating adapter
  if (!db || typeof db === 'object' && Object.keys(db).length === 0) {
    console.warn('Database not available, using in-memory adapter');
    // Return a minimal adapter that won't crash but won't persist data
    return {
      createUser: async (user) => user as any,
      getUser: async (id) => null,
      getUserByEmail: async (email) => null,
      getUserByAccount: async (account) => null,
      updateUser: async (user) => user as any,
      deleteUser: async (userId) => null,
      linkAccount: async (account) => account as any,
      unlinkAccount: async (account) => undefined,
      createSession: async (session) => session as any,
      getSessionAndUser: async (sessionToken) => null,
      updateSession: async (session) => session as any,
      deleteSession: async (sessionToken) => null,
      createVerificationToken: async (token) => token as any,
      useVerificationToken: async (token) => null,
    };
  }

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
          ? session.expires 
          : session.expires ? new Date(session.expires) : new Date()
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
          ? session.expires 
          : session.expires ? new Date(session.expires) : new Date()
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
        .select()
        .from(sessions)
        .innerJoin(authUsers, eq(authUsers.id, sessions.userId))
        .where(eq(sessions.sessionToken, sessionToken))
        .get();
      
      if (!result) return null;
      
      return {
        session: {
          ...result.sessions,
          expires: new Date(result.sessions.expires)
        },
        user: result.auth_users
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
          ? verificationToken.expires 
          : verificationToken.expires ? new Date(verificationToken.expires) : new Date()
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