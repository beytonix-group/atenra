import type { ChatFunction, FunctionContext } from './types';
import { db } from '@/server/db';
import { users, roles, userRoles } from '@/server/db/schema';
import { eq, desc } from 'drizzle-orm';

const ONLINE_THRESHOLD_SECONDS = 60;

async function handler(
  _args: Record<string, unknown>,
  context: FunctionContext
): Promise<Record<string, unknown>> {
  try {
    if (!context.authUserId) {
      return { error: 'Authentication required' };
    }

    const now = Math.floor(Date.now() / 1000);

    // Query all users with internal_employee role, ordered by lastActiveAt
    const employees = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        displayName: users.displayName,
        email: users.email,
        lastActiveAt: users.lastActiveAt,
      })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(roles.name, 'internal_employee'))
      .orderBy(desc(users.lastActiveAt))
      .all();

    if (employees.length === 0) {
      return { message: 'No internal employees found in the system.' };
    }

    // Calculate online status and format response
    const formatted = employees.map(emp => {
      const isOnline = emp.lastActiveAt !== null &&
        (now - emp.lastActiveAt) < ONLINE_THRESHOLD_SECONDS;

      const name = emp.displayName ||
        [emp.firstName, emp.lastName].filter(Boolean).join(' ') ||
        emp.email ||
        'Unknown';

      let lastSeenText = 'Never';
      if (emp.lastActiveAt) {
        if (isOnline) {
          lastSeenText = 'Online now';
        } else {
          const minutesAgo = Math.floor((now - emp.lastActiveAt) / 60);
          if (minutesAgo < 60) {
            lastSeenText = `${minutesAgo} min ago`;
          } else if (minutesAgo < 1440) {
            lastSeenText = `${Math.floor(minutesAgo / 60)} hours ago`;
          } else {
            lastSeenText = new Date(emp.lastActiveAt * 1000).toLocaleDateString();
          }
        }
      }

      return {
        name,
        email: emp.email,
        status: isOnline ? 'Online' : 'Offline',
        lastSeen: lastSeenText,
      };
    });

    const onlineCount = formatted.filter(e => e.status === 'Online').length;

    return {
      summary: `${onlineCount} of ${formatted.length} internal employees online`,
      employees: formatted,
    };
  } catch (error) {
    console.error('Error fetching online employees:', error);
    return { error: 'Failed to fetch employee status' };
  }
}

export const getOnlineEmployees: ChatFunction = {
  definition: {
    name: 'get_online_employees',
    description: 'Get a list of all internal employee accounts showing their online/offline status, sorted by most recently active. Use when the user asks who is online, which employees are available, or wants to see staff availability.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  handler,
};
