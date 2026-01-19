import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
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

const ONLINE_THRESHOLD_SECONDS = 60;

interface ConnectRequest {
  userRequest: string;
}

interface OnlineEmployee {
  id: number;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  lastActiveAt: number | null;
}

/**
 * Get all online agents
 */
async function getOnlineAgents(): Promise<OnlineEmployee[]> {
  const now = Math.floor(Date.now() / 1000);

  const employees = await db
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

  // Filter to only online employees
  return employees.filter(emp =>
    emp.lastActiveAt !== null &&
    (now - emp.lastActiveAt) < ONLINE_THRESHOLD_SECONDS
  );
}

/**
 * Select next employee using round-robin (least assignments first)
 */
async function selectNextEmployee(onlineEmployeeIds: number[]): Promise<number> {
  if (onlineEmployeeIds.length === 0) {
    throw new Error('No employees available');
  }

  if (onlineEmployeeIds.length === 1) {
    return onlineEmployeeIds[0];
  }

  // Count assignments per employee
  const counts = await db
    .select({
      employeeUserId: employeeAssignments.employeeUserId,
      count: sql<number>`count(*)`.as('count'),
    })
    .from(employeeAssignments)
    .where(inArray(employeeAssignments.employeeUserId, onlineEmployeeIds))
    .groupBy(employeeAssignments.employeeUserId)
    .all();

  // Build count map
  const countMap = new Map(counts.map(c => [c.employeeUserId, c.count]));

  // Find employee with least assignments
  let minCount = Infinity;
  let selectedId = onlineEmployeeIds[0];

  for (const id of onlineEmployeeIds) {
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
async function findExisting1on1Conversation(userId1: number, userId2: number): Promise<number | null> {
  const user1Conversations = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .innerJoin(conversations, eq(conversationParticipants.conversationId, conversations.id))
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

    const participantIds = participants.map(p => p.userId);
    if (participantIds.length === 2 && participantIds.includes(userId1) && participantIds.includes(userId2)) {
      return conversationId;
    }
  }

  return null;
}

/**
 * Get display name for a user
 */
function getDisplayName(user: { displayName: string | null; firstName: string | null; lastName: string | null }): string {
  return user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    'Team Member';
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user's database ID
    const currentUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, session.user.id))
      .get();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    let body: ConnectRequest;
    try {
      body = await request.json() as ConnectRequest;
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { userRequest } = body;

    if (!userRequest || typeof userRequest !== 'string' || userRequest.trim().length === 0) {
      return NextResponse.json(
        { error: 'userRequest is required' },
        { status: 400 }
      );
    }

    // Get online agents
    const onlineEmployees = await getOnlineAgents();

    // Check if any employees are online
    if (onlineEmployees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'no_employees_online',
        message: 'No team members are currently available. Please try again later or visit our Help & Support page.',
      }, { status: 503 });
    }

    // Select next employee using round-robin
    const onlineEmployeeIds = onlineEmployees.map(e => e.id);
    const selectedEmployeeId = await selectNextEmployee(onlineEmployeeIds);

    // Get the selected employee's details
    const selectedEmployee = onlineEmployees.find(e => e.id === selectedEmployeeId);
    if (!selectedEmployee) {
      return NextResponse.json(
        { error: 'Failed to select employee' },
        { status: 500 }
      );
    }

    const employeeName = getDisplayName(selectedEmployee);

    // Check for existing conversation
    let conversationId = await findExisting1on1Conversation(currentUser.id, selectedEmployeeId);
    let isExisting = false;

    if (conversationId) {
      isExisting = true;
    } else {
      // Create new conversation
      const newConversation = await db
        .insert(conversations)
        .values({
          isGroup: 0,
          createdByUserId: currentUser.id,
        })
        .returning()
        .get();

      if (!newConversation) {
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        );
      }

      conversationId = newConversation.id;

      // Add participants
      await db.insert(conversationParticipants).values([
        {
          conversationId,
          userId: currentUser.id,
          isAdmin: 0,
        },
        {
          conversationId,
          userId: selectedEmployeeId,
          isAdmin: 1,
        },
      ]);
    }

    // Send initial message with user's request
    await db.insert(messages).values({
      conversationId,
      senderId: currentUser.id,
      content: userRequest.trim(),
      contentType: 'html',
    });

    // Update conversation's updatedAt
    await db
      .update(conversations)
      .set({ updatedAt: sql`(unixepoch())` })
      .where(eq(conversations.id, conversationId));

    // Record the assignment for round-robin tracking
    await db.insert(employeeAssignments).values({
      employeeUserId: selectedEmployeeId,
      assignedToUserId: currentUser.id,
      conversationId,
      userRequest: userRequest.trim().substring(0, 500), // Limit stored request
    });

    return NextResponse.json({
      success: true,
      conversationId,
      employeeName,
      redirectUrl: `/messages?conversation=${conversationId}`,
      isExistingConversation: isExisting,
    });
  } catch (error) {
    console.error('Chat connect error:', error);

    return NextResponse.json(
      { error: 'Failed to connect to team member' },
      { status: 500 }
    );
  }
}
