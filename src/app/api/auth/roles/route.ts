import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, roles, userRoles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// GET - Fetch current user's roles
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ roles: null }, { status: 401 });
    }

    // Get user from database
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, session.user.id))
      .get();

    if (!user) {
      return NextResponse.json({ roles: null });
    }

    // Get user roles
    const userRolesList = await db
      .select({ roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id))
      .all();

    const roleNames = userRolesList.map(r => r.roleName);

    return NextResponse.json({ roles: roleNames.length > 0 ? roleNames : null });
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json({ roles: null }, { status: 500 });
  }
}
