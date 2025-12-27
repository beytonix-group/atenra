import { registry, z } from './registry';
import {
  UnauthorizedResponse,
  ForbiddenResponse,
  ValidationErrorResponse,
  NotFoundResponse,
  PaginationQuerySchema,
} from './common.schemas';

// ============================================================
// Messaging Schemas
// ============================================================

const ParticipantSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  userId: z.number().openapi({ example: 1 }),
  displayName: z.string().nullable().openapi({ example: 'John Doe' }),
  email: z.string().openapi({ example: 'john@example.com' }),
  avatarUrl: z.string().nullable(),
  isOnline: z.boolean().optional().openapi({ example: true }),
}).openapi('Participant');

const MessageSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  conversationId: z.number().openapi({ example: 1 }),
  senderId: z.number().openapi({ example: 1 }),
  senderName: z.string().nullable().openapi({ example: 'John Doe' }),
  senderAvatar: z.string().nullable(),
  content: z.string().openapi({ example: 'Hello, how can I help you?' }),
  createdAt: z.number().openapi({ example: 1703635200 }),
  readAt: z.number().nullable().openapi({ example: null }),
}).openapi('Message');

const ConversationSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  title: z.string().nullable().openapi({ example: 'Project Discussion' }),
  type: z.enum(['direct', 'group']).openapi({ example: 'direct' }),
  lastMessageAt: z.number().nullable().openapi({ example: 1703635200 }),
  lastMessage: z.string().nullable().openapi({ example: 'Hello, how can I help you?' }),
  unreadCount: z.number().openapi({ example: 2 }),
  participants: z.array(ParticipantSchema),
  createdAt: z.number().openapi({ example: 1703635200 }),
}).openapi('Conversation');

// GET /api/messages/conversations
registry.registerPath({
  method: 'get',
  path: '/api/messages/conversations',
  tags: ['Messaging'],
  summary: 'List conversations',
  description: 'Get list of conversations for the current user',
  request: {
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      description: 'List of conversations',
      content: {
        'application/json': {
          schema: z.object({
            conversations: z.array(ConversationSchema),
            total: z.number(),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
  },
});

// POST /api/messages/conversations
registry.registerPath({
  method: 'post',
  path: '/api/messages/conversations',
  tags: ['Messaging'],
  summary: 'Create conversation',
  description: 'Create a new conversation with one or more participants',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            participantIds: z.array(z.number()).openapi({ example: [2, 3] }),
            title: z.string().optional().openapi({ example: 'Project Discussion' }),
            initialMessage: z.string().optional().openapi({ example: 'Hello!' }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Conversation created',
      content: { 'application/json': { schema: z.object({ conversation: ConversationSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
  },
});

// GET /api/messages/conversations/{id}
registry.registerPath({
  method: 'get',
  path: '/api/messages/conversations/{id}',
  tags: ['Messaging'],
  summary: 'Get conversation',
  description: 'Get conversation details',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'Conversation details',
      content: { 'application/json': { schema: z.object({ conversation: ConversationSchema }) } },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// PATCH /api/messages/conversations/{id}
registry.registerPath({
  method: 'patch',
  path: '/api/messages/conversations/{id}',
  tags: ['Messaging'],
  summary: 'Update conversation',
  description: 'Update conversation title or settings',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string().optional().openapi({ example: 'New Title' }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Conversation updated',
      content: { 'application/json': { schema: z.object({ conversation: ConversationSchema }) } },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// GET /api/messages/conversations/{id}/messages
registry.registerPath({
  method: 'get',
  path: '/api/messages/conversations/{id}/messages',
  tags: ['Messaging'],
  summary: 'Get messages',
  description: 'Get messages in a conversation',
  request: {
    params: z.object({ id: z.string() }),
    query: PaginationQuerySchema.extend({
      before: z.coerce.number().optional().openapi({ description: 'Get messages before this ID' }),
    }),
  },
  responses: {
    200: {
      description: 'List of messages',
      content: {
        'application/json': {
          schema: z.object({
            messages: z.array(MessageSchema),
            hasMore: z.boolean(),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// POST /api/messages/conversations/{id}/messages
registry.registerPath({
  method: 'post',
  path: '/api/messages/conversations/{id}/messages',
  tags: ['Messaging'],
  summary: 'Send message',
  description: 'Send a new message in a conversation',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            content: z.string().openapi({ example: 'Hello, how are you?' }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Message sent',
      content: { 'application/json': { schema: z.object({ message: MessageSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// POST /api/messages/conversations/{id}/participants
registry.registerPath({
  method: 'post',
  path: '/api/messages/conversations/{id}/participants',
  tags: ['Messaging'],
  summary: 'Add participant',
  description: 'Add a participant to a group conversation',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            userId: z.number().openapi({ example: 4 }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Participant added',
      content: { 'application/json': { schema: z.object({ message: z.string() }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// DELETE /api/messages/conversations/{id}/participants
registry.registerPath({
  method: 'delete',
  path: '/api/messages/conversations/{id}/participants',
  tags: ['Messaging'],
  summary: 'Remove participant',
  description: 'Remove a participant from a group conversation',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            userId: z.number().openapi({ example: 4 }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Participant removed',
      content: { 'application/json': { schema: z.object({ message: z.string() }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// POST /api/messages/conversations/{id}/read
registry.registerPath({
  method: 'post',
  path: '/api/messages/conversations/{id}/read',
  tags: ['Messaging'],
  summary: 'Mark as read',
  description: 'Mark all messages in a conversation as read',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'Marked as read',
      content: { 'application/json': { schema: z.object({ message: z.string() }) } },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// GET /api/messages/poll
registry.registerPath({
  method: 'get',
  path: '/api/messages/poll',
  tags: ['Messaging'],
  summary: 'Poll for new messages',
  description: 'Long-poll for new messages across all conversations',
  request: {
    query: z.object({
      since: z.coerce.number().optional().openapi({ description: 'Get messages since this timestamp' }),
    }),
  },
  responses: {
    200: {
      description: 'New messages',
      content: {
        'application/json': {
          schema: z.object({
            messages: z.array(MessageSchema),
            conversationUpdates: z.array(z.object({
              id: z.number(),
              unreadCount: z.number(),
            })),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
  },
});

// GET /api/messages/users/search
registry.registerPath({
  method: 'get',
  path: '/api/messages/users/search',
  tags: ['Messaging'],
  summary: 'Search users',
  description: 'Search for users to start a conversation with',
  request: {
    query: z.object({
      q: z.string().openapi({ example: 'john' }),
      limit: z.coerce.number().optional().openapi({ example: 10 }),
    }),
  },
  responses: {
    200: {
      description: 'Search results',
      content: {
        'application/json': {
          schema: z.object({
            users: z.array(z.object({
              id: z.number(),
              email: z.string(),
              displayName: z.string().nullable(),
              avatarUrl: z.string().nullable(),
            })),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
  },
});
