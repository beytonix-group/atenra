import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getRequestContext } from "@cloudflare/next-on-pages";

/**
 * Get the role of a user by their email
 */
export async function getUserRole(email: string): Promise<string | null> {
  try {
    // Get the D1 database instance
    const context = getRequestContext();
    const d1 = (context.env as any).DB as D1Database;
    
    // Find the user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (!user || user.length === 0) {
      return null;
    }
    
    // Get the user's role
    const userRole = await db
      .select({
        roleName: roles.name
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user[0].id))
      .limit(1);
    
    if (!userRole || userRole.length === 0) {
      return null;
    }
    
    return userRole[0].roleName;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}