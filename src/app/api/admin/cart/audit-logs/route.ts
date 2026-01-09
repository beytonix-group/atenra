import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { cartAuditLogs, users } from "@/server/db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { getCurrentUser, canManageUserCarts } from "@/lib/auth-helpers";

function safeJsonParse(str: string | null): unknown {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// GET - Get audit logs with optional filters
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await canManageUserCarts();
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');
    const employeeUserId = searchParams.get('employeeUserId');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const limit = limitParam ? Math.min(parseInt(limitParam) || 50, 100) : 50;
    const offset = offsetParam ? (parseInt(offsetParam) || 0) : 0;

    // Build conditions array
    const conditions = [];

    if (targetUserId) {
      const parsedId = parseInt(targetUserId);
      if (!isNaN(parsedId)) {
        conditions.push(eq(cartAuditLogs.targetUserId, parsedId));
      }
    }

    if (employeeUserId) {
      const parsedId = parseInt(employeeUserId);
      if (!isNaN(parsedId)) {
        conditions.push(eq(cartAuditLogs.employeeUserId, parsedId));
      }
    }

    if (action) {
      conditions.push(eq(cartAuditLogs.action, action));
    }

    if (startDate) {
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      conditions.push(gte(cartAuditLogs.createdAt, startTimestamp));
    }

    if (endDate) {
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000) + 86400; // Include full day
      conditions.push(lte(cartAuditLogs.createdAt, endTimestamp));
    }

    // Create aliases for the joined user tables
    const targetUserAlias = db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .as('targetUser');

    const employeeUserAlias = db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .as('employeeUser');

    // Query logs with user info
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db
      .select({
        id: cartAuditLogs.id,
        action: cartAuditLogs.action,
        itemId: cartAuditLogs.itemId,
        itemTitle: cartAuditLogs.itemTitle,
        itemDescription: cartAuditLogs.itemDescription,
        metadata: cartAuditLogs.metadata,
        ipAddress: cartAuditLogs.ipAddress,
        createdAt: cartAuditLogs.createdAt,
        targetUserId: cartAuditLogs.targetUserId,
        employeeUserId: cartAuditLogs.employeeUserId,
      })
      .from(cartAuditLogs)
      .where(whereClause)
      .orderBy(desc(cartAuditLogs.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(cartAuditLogs)
      .where(whereClause)
      .get();

    // Get user info for each log entry
    const userIds = new Set<number>();
    logs.forEach(log => {
      userIds.add(log.targetUserId);
      userIds.add(log.employeeUserId);
    });

    const userInfo = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(sql`${users.id} IN (${[...userIds].join(',')})`)
      .all();

    const userMap = new Map(userInfo.map(u => [
      u.id,
      {
        id: u.id,
        email: u.email,
        displayName: u.displayName ||
          `${u.firstName || ''} ${u.lastName || ''}`.trim() ||
          u.email,
      }
    ]));

    // Format logs with user info
    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      itemId: log.itemId,
      itemTitle: log.itemTitle,
      itemDescription: log.itemDescription,
      metadata: safeJsonParse(log.metadata),
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
      targetUser: userMap.get(log.targetUserId) || { id: log.targetUserId, email: 'Unknown', displayName: 'Unknown' },
      employee: userMap.get(log.employeeUserId) || { id: log.employeeUserId, email: 'Unknown', displayName: 'Unknown' },
    }));

    return NextResponse.json({
      logs: formattedLogs,
      total: countResult?.count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error getting audit logs:", error);
    return NextResponse.json({ error: "Failed to get audit logs" }, { status: 500 });
  }
}
