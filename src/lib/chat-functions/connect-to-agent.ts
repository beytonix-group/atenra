import type { ChatFunction, FunctionContext } from './types';
import { db } from '@/server/db';
import {
  users,
  roles,
  userRoles,
  conversations,
  conversationParticipants,
  messages,
  employeeAssignments,
} from '@/server/db/schema';
import { eq, desc, inArray, sql, and } from 'drizzle-orm';
import { ONLINE_THRESHOLD_SECONDS } from './constants';

interface OnlineAgent {
  id: number;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  lastActiveAt: number | null;
}

/**
 * Get all online agents (role='agent', lastActiveAt within threshold)
 */
async function getOnlineAgents(): Promise<OnlineAgent[]> {
  const now = Math.floor(Date.now() / 1000);

  const agents = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      displayName: users.displayName,
      lastActiveAt: users.lastActiveAt,
    })
    .from(users)
    .innerJoin(userRoles, eq(users.id, userRoles.userId))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(roles.name, 'agent'))
    .orderBy(desc(users.lastActiveAt))
    .all();

  // Filter to only online agents
  return agents.filter(
    (agent) =>
      agent.lastActiveAt !== null &&
      now - agent.lastActiveAt < ONLINE_THRESHOLD_SECONDS
  );
}

/**
 * Select next agent using round-robin (least assignments first)
 */
async function selectNextAgent(onlineAgentIds: number[]): Promise<number> {
  if (onlineAgentIds.length === 0) {
    throw new Error('No agents available');
  }

  if (onlineAgentIds.length === 1) {
    return onlineAgentIds[0];
  }

  // Count assignments per agent
  const counts = await db
    .select({
      employeeUserId: employeeAssignments.employeeUserId,
      count: sql<number>`count(*)`.as('count'),
    })
    .from(employeeAssignments)
    .where(inArray(employeeAssignments.employeeUserId, onlineAgentIds))
    .groupBy(employeeAssignments.employeeUserId)
    .all();

  // Build count map
  const countMap = new Map(counts.map((c) => [c.employeeUserId, c.count]));

  // Find agent with least assignments
  let minCount = Infinity;
  let selectedId = onlineAgentIds[0];

  for (const id of onlineAgentIds) {
    const count = countMap.get(id) || 0;
    if (count < minCount) {
      minCount = count;
      selectedId = id;
    }
  }

  return selectedId;
}

/**
 * Find existing 1-on-1 conversation between two users
 */
async function findExisting1on1Conversation(
  userId1: number,
  userId2: number
): Promise<number | null> {
  const user1Conversations = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .innerJoin(
      conversations,
      eq(conversationParticipants.conversationId, conversations.id)
    )
    .where(
      and(
        eq(conversationParticipants.userId, userId1),
        eq(conversations.isGroup, 0)
      )
    )
    .all();

  for (const { conversationId } of user1Conversations) {
    const participants = await db
      .select({ userId: conversationParticipants.userId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.conversationId, conversationId))
      .all();

    const participantIds = participants.map((p) => p.userId);
    if (
      participantIds.length === 2 &&
      participantIds.includes(userId1) &&
      participantIds.includes(userId2)
    ) {
      return conversationId;
    }
  }

  return null;
}

/**
 * Get display name for a user
 */
function getDisplayName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  return (
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    'Team Member'
  );
}

async function handler(
  args: Record<string, unknown>,
  context: FunctionContext
): Promise<Record<string, unknown>> {
  try {
    if (!context.authUserId) {
      return { success: false, error: 'Authentication required' };
    }

    // Get current user's database ID
    const currentUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, context.authUserId))
      .get();

    if (!currentUser) {
      return { success: false, error: 'User not found' };
    }

    // Get online agents
    const onlineAgents = await getOnlineAgents();

    // Check if any agents are online
    if (onlineAgents.length === 0) {
      return {
        success: false,
        noAgentsAvailable: true,
        message:
          'All agents are currently offline. Please try again at a later time.',
      };
    }

    // Select next agent using round-robin
    const onlineAgentIds = onlineAgents.map((a) => a.id);
    const selectedAgentId = await selectNextAgent(onlineAgentIds);

    // Get the selected agent's details
    const selectedAgent = onlineAgents.find((a) => a.id === selectedAgentId);
    if (!selectedAgent) {
      return { success: false, error: 'Failed to select agent' };
    }

    const agentName = getDisplayName(selectedAgent);

    // Check for existing conversation between this user and this specific agent
    let conversationId = await findExisting1on1Conversation(
      currentUser.id,
      selectedAgentId
    );
    let isExisting = false;

    if (conversationId) {
      isExisting = true;
    } else {
      // Create new conversation with exactly 2 participants: current user + selected agent
      const newConversation = await db
        .insert(conversations)
        .values({
          isGroup: 0,
          createdByUserId: currentUser.id,
        })
        .returning()
        .get();

      if (!newConversation) {
        return { success: false, error: 'Failed to create conversation' };
      }

      conversationId = newConversation.id;

      // Add both participants: current user and the selected agent
      await db.insert(conversationParticipants).values([
        {
          conversationId,
          userId: currentUser.id,
          isAdmin: 0,
        },
        {
          conversationId,
          userId: selectedAgentId,
          isAdmin: 1,
        },
      ]);
    }

    // Send initial message if provided
    const initialMessage = args.initial_message as string | undefined;
    if (initialMessage && initialMessage.trim()) {
      await db.insert(messages).values({
        conversationId,
        senderId: currentUser.id,
        content: initialMessage.trim(),
        contentType: 'html',
      });

      // Update conversation's updatedAt
      await db
        .update(conversations)
        .set({ updatedAt: sql`(unixepoch())` })
        .where(eq(conversations.id, conversationId));
    }

    // Only record assignment for NEW conversations to avoid inflating round-robin counts
    if (!isExisting) {
      await db.insert(employeeAssignments).values({
        employeeUserId: selectedAgentId,
        assignedToUserId: currentUser.id,
        conversationId,
        userRequest: initialMessage?.trim().substring(0, 500) || 'Auto-connected',
      });
    }

    return {
      success: true,
      agentName,
      conversationId,
      redirectUrl: `/messages?conversation=${conversationId}`,
      isExistingConversation: isExisting,
    };
  } catch (error) {
    console.error('Error in connect_to_agent:', {
      error,
      authUserId: context.authUserId,
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Return sanitized error message - never expose internal error details
    return {
      success: false,
      error: 'Unable to connect to an agent at this time. Please try again.',
    };
  }
}

export const connectToAgent: ChatFunction = {
  definition: {
    name: 'connect_to_agent',
    description:
      'Connect the current user with an available online agent. Creates a message thread between them for direct communication. Use this when the user needs to be connected with a support agent.',
    parameters: {
      type: 'object',
      properties: {
        initial_message: {
          type: 'string',
          description:
            'Optional initial message to send to the agent on behalf of the user',
        },
      },
      required: [],
    },
  },
  handler,
};
