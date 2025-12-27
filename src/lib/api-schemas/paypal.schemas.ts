import { registry, z } from './registry';
import {
  UnauthorizedResponse,
  ValidationErrorResponse,
  InternalServerErrorResponse,
} from './common.schemas';

// ============================================================
// PayPal Schemas
// ============================================================

// GET /api/paypal/config
registry.registerPath({
  method: 'get',
  path: '/api/paypal/config',
  tags: ['PayPal'],
  summary: 'Get PayPal config',
  description: 'Get PayPal SDK configuration (public endpoint)',
  responses: {
    200: {
      description: 'PayPal configuration',
      content: {
        'application/json': {
          schema: z.object({
            clientId: z.string().openapi({ example: 'AaBbCcDdEeFf...' }),
          }),
        },
      },
    },
  },
});

// GET /api/paypal/plan-id
registry.registerPath({
  method: 'get',
  path: '/api/paypal/plan-id',
  tags: ['PayPal'],
  summary: 'Get PayPal plan ID',
  description: 'Get the PayPal billing plan ID for a given Atenra plan',
  request: {
    query: z.object({
      planId: z.coerce.number().openapi({ example: 1 }),
      interval: z.enum(['month', 'year']).openapi({ example: 'month' }),
    }),
  },
  responses: {
    200: {
      description: 'PayPal plan ID',
      content: {
        'application/json': {
          schema: z.object({
            paypalPlanId: z.string().openapi({ example: 'P-1234567890' }),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
  },
});

// POST /api/paypal/subscription/attach
registry.registerPath({
  method: 'post',
  path: '/api/paypal/subscription/attach',
  tags: ['PayPal'],
  summary: 'Attach PayPal subscription',
  description: 'Attach a verified PayPal subscription to user account',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            subscriptionId: z.string().openapi({ example: 'I-1234567890' }),
            planId: z.number().openapi({ example: 1 }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Subscription attached',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Subscription attached successfully' }),
            subscription: z.object({
              id: z.number(),
              status: z.string(),
              planId: z.number(),
            }),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/paypal/webhook
registry.registerPath({
  method: 'post',
  path: '/api/paypal/webhook',
  tags: ['PayPal'],
  summary: 'PayPal webhook handler',
  description: 'Handle PayPal webhook events (subscription updates, payments)',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({}).passthrough().openapi({ description: 'PayPal webhook event payload' }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Webhook processed',
      content: {
        'application/json': {
          schema: z.object({ received: z.boolean() }),
        },
      },
    },
    400: {
      description: 'Invalid webhook',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});
