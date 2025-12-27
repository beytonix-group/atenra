import { registry, z } from './registry';
import {
  UnauthorizedResponse,
  ValidationErrorResponse,
  InternalServerErrorResponse,
} from './common.schemas';

// ============================================================
// AI Chat Schema
// ============================================================

// POST /api/chat
registry.registerPath({
  method: 'post',
  path: '/api/chat',
  tags: ['Misc'],
  summary: 'AI chat',
  description: 'Send a message to the AI chat assistant with function calling capabilities',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            messages: z.array(z.object({
              role: z.enum(['user', 'assistant', 'system']).openapi({ example: 'user' }),
              content: z.string().openapi({ example: 'What is my subscription status?' }),
            })),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'AI response',
      content: {
        'application/json': {
          schema: z.object({
            message: z.object({
              role: z.literal('assistant'),
              content: z.string().openapi({ example: 'You have an active Premium subscription.' }),
            }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// ============================================================
// Presence Schemas
// ============================================================

// POST /api/presence/heartbeat
registry.registerPath({
  method: 'post',
  path: '/api/presence/heartbeat',
  tags: ['User'],
  summary: 'Update presence',
  description: 'Send a heartbeat to update user\'s last active time',
  responses: {
    200: {
      description: 'Heartbeat received',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
  },
});

// GET /api/presence/status
registry.registerPath({
  method: 'get',
  path: '/api/presence/status',
  tags: ['User'],
  summary: 'Get online status',
  description: 'Get online status for a list of users',
  request: {
    query: z.object({
      userIds: z.string().openapi({ example: '1,2,3', description: 'Comma-separated user IDs' }),
    }),
  },
  responses: {
    200: {
      description: 'User statuses',
      content: {
        'application/json': {
          schema: z.object({
            statuses: z.record(z.string(), z.object({
              isOnline: z.boolean().openapi({ example: true }),
              lastActiveAt: z.number().nullable().openapi({ example: 1703635200 }),
            })),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
  },
});

// ============================================================
// User Preferences Schemas
// ============================================================

// GET /api/user/preferences
registry.registerPath({
  method: 'get',
  path: '/api/user/preferences',
  tags: ['User'],
  summary: 'Get preferences',
  description: 'Get user\'s service category preferences',
  responses: {
    200: {
      description: 'User preferences',
      content: {
        'application/json': {
          schema: z.object({
            preferences: z.array(z.object({
              categoryId: z.number(),
              categoryName: z.string(),
              isSelected: z.boolean(),
            })),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
  },
});

// POST /api/user/preferences
registry.registerPath({
  method: 'post',
  path: '/api/user/preferences',
  tags: ['User'],
  summary: 'Save preferences',
  description: 'Save user\'s service category preferences',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            categoryIds: z.array(z.number()).openapi({ example: [1, 2, 3] }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Preferences saved',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Preferences saved' }),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
  },
});

// GET /api/user/subscription-status
registry.registerPath({
  method: 'get',
  path: '/api/user/subscription-status',
  tags: ['User'],
  summary: 'Check subscription',
  description: 'Check if user has an active subscription',
  responses: {
    200: {
      description: 'Subscription status',
      content: {
        'application/json': {
          schema: z.object({
            hasActiveSubscription: z.boolean().openapi({ example: true }),
            planSlug: z.string().nullable().openapi({ example: 'premium' }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
  },
});

// ============================================================
// Service Categories Schema
// ============================================================

// GET /api/service-categories
registry.registerPath({
  method: 'get',
  path: '/api/service-categories',
  tags: ['Misc'],
  summary: 'List service categories',
  description: 'Get hierarchical list of service categories',
  responses: {
    200: {
      description: 'Service categories',
      content: {
        'application/json': {
          schema: z.object({
            categories: z.array(z.object({
              id: z.number().openapi({ example: 1 }),
              name: z.string().openapi({ example: 'Home Services' }),
              slug: z.string().openapi({ example: 'home-services' }),
              parentId: z.number().nullable(),
              children: z.array(z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string(),
              })).optional(),
            })),
          }),
        },
      },
    },
  },
});

// ============================================================
// Activity Tracking Schema
// ============================================================

// POST /api/activity/track
registry.registerPath({
  method: 'post',
  path: '/api/activity/track',
  tags: ['Misc'],
  summary: 'Track activity',
  description: 'Track a user activity event',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            action: z.string().openapi({ example: 'page_view' }),
            metadata: z.record(z.string(), z.any()).optional().openapi({ example: { page: '/dashboard' } }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Activity tracked',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    401: UnauthorizedResponse,
  },
});

// ============================================================
// Contact Form Schema
// ============================================================

// POST /api/contact
registry.registerPath({
  method: 'post',
  path: '/api/contact',
  tags: ['Misc'],
  summary: 'Contact form',
  description: 'Submit a contact form (public endpoint)',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().openapi({ example: 'John Doe' }),
            email: z.string().email().openapi({ example: 'john@example.com' }),
            subject: z.string().openapi({ example: 'General Inquiry' }),
            message: z.string().openapi({ example: 'I have a question about...' }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Message sent',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Thank you for contacting us!' }),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    500: InternalServerErrorResponse,
  },
});

// ============================================================
// Checkout Schema
// ============================================================

// POST /api/checkout/create-session
registry.registerPath({
  method: 'post',
  path: '/api/checkout/create-session',
  tags: ['Billing'],
  summary: 'Create checkout session',
  description: 'Create a checkout session for one-time or subscription purchase',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            planId: z.number().openapi({ example: 1 }),
            interval: z.enum(['month', 'year']).optional().openapi({ example: 'month' }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Checkout session created',
      content: {
        'application/json': {
          schema: z.object({
            sessionId: z.string(),
            url: z.string(),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});
