/**
 * Get Current User Info Function
 *
 * Retrieves the current authenticated user's basic profile information
 * including name, address, and role for personalized chat interactions.
 */

import { db } from '@/server/db';
import { users, companyUsers, companies } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { isSuperAdmin } from '@/lib/auth-helpers';
import type { ChatFunction, FunctionContext } from './types';

async function handler(
  _args: Record<string, unknown>,
  context: FunctionContext
): Promise<Record<string, unknown>> {
  try {
    if (!context.authUserId) {
      return { error: 'Authentication required' };
    }

    // Get user profile
    const user = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        displayName: users.displayName,
        email: users.email,
        city: users.city,
        state: users.state,
        country: users.country,
      })
      .from(users)
      .where(eq(users.authUserId, context.authUserId))
      .get();

    if (!user) {
      return { error: 'User not found' };
    }

    // Check if user is super admin
    let isAdmin = false;
    try {
      isAdmin = await isSuperAdmin();
    } catch (error) {
      console.error('Error checking super admin status:', error);
    }

    // Get company roles
    const companyRoles = await db
      .select({
        companyName: companies.name,
        role: companyUsers.role,
      })
      .from(companyUsers)
      .innerJoin(companies, eq(companyUsers.companyId, companies.id))
      .where(eq(companyUsers.userId, user.id))
      .all();

    const name = user.displayName ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      'User';

    const location = [user.city, user.state, user.country]
      .filter(Boolean)
      .join(', ') || 'Not specified';

    let roleDescription = 'Regular user';
    if (isAdmin) {
      roleDescription = 'Platform Administrator';
    } else if (companyRoles.length > 0) {
      roleDescription = companyRoles
        .map(cr => `${cr.role} at ${cr.companyName}`)
        .join(', ');
    }

    return {
      name,
      location,
      role: roleDescription,
      email: user.email,
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return { error: 'Failed to fetch user information' };
  }
}

export const getCurrentUserInfo: ChatFunction = {
  definition: {
    name: 'get_current_user_info',
    description:
      "Get the current authenticated user's basic profile information including name, address, and role. Use this to personalize greetings or when the user asks about their account.",
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  handler,
};
