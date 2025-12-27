import { registry, z } from './registry';
import {
  UnauthorizedResponse,
  ValidationErrorResponse,
  NotFoundResponse,
  InternalServerErrorResponse,
} from './common.schemas';

// ============================================================
// Plan Schema (Public)
// ============================================================

const PlanSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  slug: z.string().openapi({ example: 'premium' }),
  name: z.string().openapi({ example: 'Premium Plan' }),
  description: z.string().nullable().openapi({ example: 'Full access to all features' }),
  monthlyPriceCents: z.number().openapi({ example: 1999 }),
  yearlyPriceCents: z.number().nullable().openapi({ example: 19990 }),
  features: z.string().nullable().openapi({ example: 'Unlimited projects, Priority support' }),
  isActive: z.number().openapi({ example: 1 }),
  displayOrder: z.number().openapi({ example: 1 }),
}).openapi('Plan');

// GET /api/plans
registry.registerPath({
  method: 'get',
  path: '/api/plans',
  tags: ['Billing'],
  summary: 'Get active plans',
  description: 'Get list of all active subscription plans (public endpoint)',
  responses: {
    200: {
      description: 'List of plans',
      content: {
        'application/json': {
          schema: z.object({
            plans: z.array(PlanSchema),
          }),
        },
      },
    },
    500: InternalServerErrorResponse,
  },
});

// ============================================================
// Subscription Schemas
// ============================================================

const SubscriptionResponseSchema = z.object({
  status: z.enum(['active', 'inactive', 'canceled', 'past_due']).openapi({ example: 'active' }),
  planSlug: z.string().openapi({ example: 'premium' }),
  planName: z.string().optional().openapi({ example: 'Premium Plan' }),
  provider: z.enum(['stripe', 'paypal']).optional().openapi({ example: 'stripe' }),
  currentPeriodEnd: z.number().optional().openapi({ example: 1706313600 }),
  cancelAtPeriodEnd: z.boolean().optional().openapi({ example: false }),
}).openapi('SubscriptionResponse');

// GET /api/billing/subscription
registry.registerPath({
  method: 'get',
  path: '/api/billing/subscription',
  tags: ['Billing'],
  summary: 'Get current subscription',
  description: 'Get the authenticated user\'s current subscription details',
  responses: {
    200: {
      description: 'Subscription details',
      content: { 'application/json': { schema: SubscriptionResponseSchema } },
    },
    401: UnauthorizedResponse,
    404: NotFoundResponse,
    500: InternalServerErrorResponse,
  },
});

// ============================================================
// Invoice Schemas
// ============================================================

const InvoiceSchema = z.object({
  id: z.string().openapi({ example: 'in_1234567890' }),
  amountPaid: z.number().openapi({ example: 1999 }),
  amountDue: z.number().openapi({ example: 0 }),
  currency: z.string().openapi({ example: 'usd' }),
  status: z.string().openapi({ example: 'paid' }),
  created: z.number().openapi({ example: 1703635200 }),
  hostedInvoiceUrl: z.string().nullable().openapi({ example: 'https://invoice.stripe.com/...' }),
  invoicePdf: z.string().nullable().openapi({ example: 'https://invoice.stripe.com/.../pdf' }),
}).openapi('Invoice');

// GET /api/billing/invoices
registry.registerPath({
  method: 'get',
  path: '/api/billing/invoices',
  tags: ['Billing'],
  summary: 'Get subscription invoices',
  description: 'Get list of invoices for the authenticated user\'s subscription',
  responses: {
    200: {
      description: 'List of invoices',
      content: {
        'application/json': {
          schema: z.object({
            invoices: z.array(InvoiceSchema),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// ============================================================
// Checkout Session Schemas
// ============================================================

const CreateCheckoutSessionRequestSchema = z.object({
  planId: z.number().openapi({ example: 1 }),
  interval: z.enum(['month', 'year']).openapi({ example: 'month' }),
  successUrl: z.string().optional().openapi({ example: '/dashboard?success=true' }),
  cancelUrl: z.string().optional().openapi({ example: '/pricing?canceled=true' }),
}).openapi('CreateCheckoutSessionRequest');

// POST /api/billing/create-checkout-session
registry.registerPath({
  method: 'post',
  path: '/api/billing/create-checkout-session',
  tags: ['Billing'],
  summary: 'Create Stripe checkout session',
  description: 'Create a Stripe checkout session for subscription purchase',
  request: {
    body: {
      content: {
        'application/json': { schema: CreateCheckoutSessionRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Checkout session created',
      content: {
        'application/json': {
          schema: z.object({
            sessionId: z.string().openapi({ example: 'cs_test_...' }),
            url: z.string().openapi({ example: 'https://checkout.stripe.com/...' }),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/billing/create-setup-session
registry.registerPath({
  method: 'post',
  path: '/api/billing/create-setup-session',
  tags: ['Billing'],
  summary: 'Create payment method setup session',
  description: 'Create a Stripe setup session to add/update payment method',
  responses: {
    200: {
      description: 'Setup session created',
      content: {
        'application/json': {
          schema: z.object({
            sessionId: z.string().openapi({ example: 'seti_...' }),
            url: z.string().openapi({ example: 'https://checkout.stripe.com/...' }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/billing/create-portal-session
registry.registerPath({
  method: 'post',
  path: '/api/billing/create-portal-session',
  tags: ['Billing'],
  summary: 'Create billing portal session',
  description: 'Create a Stripe billing portal session for managing subscription',
  responses: {
    200: {
      description: 'Portal session created',
      content: {
        'application/json': {
          schema: z.object({
            url: z.string().openapi({ example: 'https://billing.stripe.com/...' }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// ============================================================
// Payment Method Schemas
// ============================================================

const PaymentMethodSchema = z.object({
  id: z.string().openapi({ example: 'pm_...' }),
  brand: z.string().openapi({ example: 'visa' }),
  last4: z.string().openapi({ example: '4242' }),
  expMonth: z.number().openapi({ example: 12 }),
  expYear: z.number().openapi({ example: 2025 }),
  isDefault: z.boolean().openapi({ example: true }),
}).openapi('PaymentMethod');

// GET /api/billing/payment-method
registry.registerPath({
  method: 'get',
  path: '/api/billing/payment-method',
  tags: ['Billing'],
  summary: 'Get payment methods',
  description: 'Get the authenticated user\'s saved payment methods',
  responses: {
    200: {
      description: 'Payment methods',
      content: {
        'application/json': {
          schema: z.object({
            paymentMethods: z.array(PaymentMethodSchema),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// DELETE /api/billing/payment-method
registry.registerPath({
  method: 'delete',
  path: '/api/billing/payment-method',
  tags: ['Billing'],
  summary: 'Remove payment method',
  description: 'Remove a payment method from the account',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            paymentMethodId: z.string().openapi({ example: 'pm_...' }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Payment method removed',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Payment method removed' }),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/billing/payment-method/set-default
registry.registerPath({
  method: 'post',
  path: '/api/billing/payment-method/set-default',
  tags: ['Billing'],
  summary: 'Set default payment method',
  description: 'Set a payment method as the default for the account',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            paymentMethodId: z.string().openapi({ example: 'pm_...' }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Default payment method updated',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Default payment method updated' }),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// ============================================================
// Subscription Management Schemas
// ============================================================

// POST /api/billing/cancel
registry.registerPath({
  method: 'post',
  path: '/api/billing/cancel',
  tags: ['Billing'],
  summary: 'Cancel subscription',
  description: 'Cancel the current subscription at end of billing period',
  responses: {
    200: {
      description: 'Subscription canceled',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Subscription will be canceled at end of billing period' }),
            cancelAt: z.number().openapi({ example: 1706313600 }),
          }),
        },
      },
    },
    400: {
      description: 'No active subscription',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string().openapi({ example: 'No active subscription to cancel' }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/billing/resume
registry.registerPath({
  method: 'post',
  path: '/api/billing/resume',
  tags: ['Billing'],
  summary: 'Resume subscription',
  description: 'Resume a canceled subscription before it expires',
  responses: {
    200: {
      description: 'Subscription resumed',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Subscription resumed successfully' }),
          }),
        },
      },
    },
    400: {
      description: 'Cannot resume subscription',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string().openapi({ example: 'No canceled subscription to resume' }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/billing/webhook
registry.registerPath({
  method: 'post',
  path: '/api/billing/webhook',
  tags: ['Billing'],
  summary: 'Stripe webhook handler',
  description: 'Handle Stripe webhook events (subscription updates, payments, etc.)',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({}).passthrough().openapi({ description: 'Stripe webhook event payload' }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Webhook processed',
      content: {
        'application/json': {
          schema: z.object({
            received: z.boolean().openapi({ example: true }),
          }),
        },
      },
    },
    400: {
      description: 'Invalid webhook signature',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string().openapi({ example: 'Invalid signature' }),
          }),
        },
      },
    },
  },
});
