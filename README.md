# Atenra

A SaaS platform for professional service matching, subscription management, and marketplace discovery, built on Cloudflare's edge infrastructure.

## Tech Stack

- **Next.js 15** with App Router
- **Cloudflare Workers** via OpenNext
- **Cloudflare D1** (SQLite)
- **Drizzle ORM** for database operations
- **NextAuth v5** for authentication
- **Stripe + PayPal** for payments
- **Shadcn UI + Tailwind CSS**
- **TypeScript 5**
- **Bun** for package management

## Quick Start

```bash
# Install dependencies
bun install

# Run interactive setup
bun run setup

# Setup database
bun run db:migrate:dev

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development Commands

### Core

```bash
bun run dev              # Start development server (port 3000)
bun run build            # Build Next.js application
bun run lint             # Run ESLint
```

### Database

```bash
bun run db:generate      # Generate migrations from schema changes
bun run db:migrate:dev   # Apply migrations to local D1
bun run db:migrate:prod  # Apply migrations to remote D1
bun run db:studio:dev    # Open Drizzle Studio (local)
bun run db:studio:prod   # Open Drizzle Studio (remote)
```

### Deployment

```bash
bunx opennextjs-cloudflare build    # Build for Cloudflare Workers
bun run preview                     # Build and preview locally
bun run deploy                      # Deploy to Cloudflare Workers
```

## Environment Configuration

### Local Development (`.dev.vars`)

```bash
AUTH_SECRET=your-auth-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-secret
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
PAYPAL_CLIENT_ID=your-paypal-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
SUPER_USER_EMAIL=admin@example.com
```

### Production Database (`.env`)

```bash
CLOUDFLARE_D1_ACCOUNT_ID=your-account-id
DATABASE=your-d1-database-id
CLOUDFLARE_D1_API_TOKEN=your-api-token
```

## Deployment to Cloudflare

1. Create production database:
   ```bash
   bunx wrangler d1 create atenra-prod-db
   ```

2. Update `wrangler.jsonc` with the database ID

3. Apply migrations:
   ```bash
   bun run db:migrate:prod
   ```

4. Configure secrets in Cloudflare Dashboard (Workers & Pages > Settings > Environment Variables)

5. Deploy:
   ```bash
   bun run deploy
   ```

## Project Structure

```
src/
<<<<<<< Updated upstream
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── activity/            # Activity tracking endpoints
│   │   ├── admin/               # Admin endpoints (users, plans, cart, roles, paypal)
│   │   ├── auth/                # NextAuth & auth endpoints (register, verify, password reset)
│   │   ├── billing/             # Billing & subscription management (Stripe)
│   │   ├── cart/                # Shopping cart endpoints
│   │   ├── chat/                # AI chat endpoint
│   │   ├── chat-task/           # Chat task management
│   │   ├── checkout/            # Checkout flow (Stripe & PayPal)
│   │   ├── companies/           # Company CRUD & employees
│   │   ├── company/             # Company dashboard API (invoices, jobs, reports)
│   │   ├── contact/             # Contact form endpoint
│   │   ├── messages/            # Messaging system (conversations, users, polling)
│   │   ├── orders/              # Order management
│   │   ├── paypal/              # PayPal integration (subscriptions, webhooks)
│   │   ├── plans/               # Subscription plans
│   │   ├── presence/            # User presence/status
│   │   ├── profile/             # User profile
│   │   ├── service-categories/  # Service category listing
│   │   ├── support/             # Support ticket system
│   │   ├── user/                # User data (preferences, owned companies)
│   │   └── ws/                  # WebSocket token endpoints
│   │       ├── token/          # Conversation & user WebSocket tokens
│   │       └── cart-token/     # Cart WebSocket tokens
│   ├── 403/                     # Access denied page
│   ├── about/                   # About page
│   ├── accept-invitation/       # Invitation acceptance flow
│   ├── admin/                   # Admin landing page
│   ├── admindashboard/          # Admin dashboard pages
│   │   ├── analytics/          # Analytics page
│   │   ├── billing/            # Billing management
│   │   ├── plans/              # Plan management
│   │   ├── profile/            # Admin profile
│   │   ├── reports/            # Reports
│   │   ├── support/            # Support tickets
│   │   └── users/              # User management
│   ├── auth/                    # Authentication pages (sign-in, error)
│   ├── billing/                 # User billing pages (success, cancel)
│   ├── careers/                 # Careers page
│   ├── cart/                    # Shopping cart page
│   ├── chat/                    # AI chat interface
│   ├── checkout/                # Checkout flow (success, cancel)
│   ├── company/                 # Company dashboard
│   │   ├── select/             # Company selection
│   │   └── [companyId]/        # Company-specific pages (invoices, jobs, reports)
│   ├── contact/                 # Contact page
│   ├── dashboard/               # User dashboard
│   │   └── profile/            # Profile editing
│   ├── faq/                     # FAQ page
│   ├── forgot-password/         # Password reset request
│   ├── login/                   # Login page
│   ├── marketplace/             # Service provider marketplace
│   │   ├── create/             # Create listing
│   │   └── [id]/               # Business detail page
│   ├── messages/                # Messaging center
│   ├── more/                    # Additional options page
│   ├── orders/                  # Order history & details
│   │   └── [id]/               # Order detail page
│   ├── preferences/             # User preferences
│   ├── pricing/                 # Pricing plans
│   ├── profile/                 # User profile page
│   ├── register/                # Registration page
│   ├── subscription/            # Subscription management
│   │   └── paypal/             # PayPal subscription flow
│   ├── support/                 # Support ticket submission
│   └── upgrade/                 # Upgrade prompts
├── components/                   # React components
│   ├── about/                   # About page components
│   ├── admin/                   # Admin dashboard components
│   │   └── support/            # Admin support ticket components
│   ├── auth/                    # Authentication forms
│   ├── billing/                 # Billing & subscription UI
│   ├── cart/                    # Shopping cart components
│   ├── chat/                    # AI chat components
│   ├── checkout/                # Checkout flow components
│   ├── company/                 # Company management components
│   ├── company-dashboard/       # Company dashboard layout & widgets
│   ├── contact/                 # Contact form components
│   ├── dashboard/               # Dashboard layouts (User & Admin)
│   ├── landing/                 # Landing page sections
│   ├── marketplace/             # Marketplace listing components
│   ├── messages/                # Messaging UI components
│   ├── more/                    # More options components
│   ├── nav/                     # Navigation components
│   ├── orders/                  # Order display components
│   ├── paypal/                  # PayPal button components
│   ├── preferences/             # Preferences form components
│   ├── presence/                # Online status indicators
│   ├── profile/                 # Profile management components
│   ├── providers/               # React context providers (Roles, Query, etc.)
│   ├── social/                  # Social sharing components
│   ├── subscription/            # Subscription UI components
│   ├── support/                 # Support ticket components
│   ├── ui/                      # Shadcn UI components
│   └── upgrade/                 # Upgrade prompt components
├── hooks/                        # Custom React hooks
│   ├── use-conversation-websocket.ts  # Conversation WebSocket connection
│   ├── use-cart-websocket.ts          # Cart WebSocket connection
│   ├── use-user-websocket.ts          # User WebSocket (unread count updates)
│   └── use-messages-query.ts          # Message polling with WebSocket integration
├── lib/                          # Utility libraries
│   ├── chat-functions/          # AI chat function definitions
│   ├── i18n/                    # Internationalization system
│   ├── theme/                   # Theme utilities
│   ├── utils/                   # Helper functions
│   ├── activity-tracker.ts      # User activity tracking
│   ├── auth-helpers.ts          # Authentication utilities
│   ├── discounts.ts             # Discount calculation
│   ├── orders.ts                # Order management
│   ├── paypal.ts                # PayPal API client
│   ├── stripe.ts                # Stripe client (lazy-loaded)
│   ├── webhook-handler.ts       # Stripe webhook processing
│   ├── websocket-types.ts       # Conversation WebSocket message types
│   ├── cart-websocket-types.ts  # Cart WebSocket message types
│   ├── user-websocket-types.ts  # User WebSocket message types
│   ├── cart-broadcast.ts        # Cart WebSocket broadcast helper
│   └── user-broadcast.ts        # User WebSocket broadcast helper
├── server/                       # Server-side code
│   ├── auth.ts                  # NextAuth v5 configuration
│   └── db/                      # Database layer
│       ├── index.ts             # D1 connection
│       ├── schema.ts            # Drizzle schema definitions
│       └── auth-adapter.ts      # Custom D1 adapter for NextAuth
├── durable-objects/              # Cloudflare Durable Objects for WebSocket
│   ├── conversation-ws.ts       # Per-conversation WebSocket (messages, typing)
│   ├── cart-ws.ts               # Per-cart WebSocket (real-time cart sync)
│   └── user-ws.ts               # Per-user WebSocket (unread count, notifications)
├── stores/                       # Zustand state stores
└── types/                        # TypeScript type definitions

drizzle/                          # Database migrations
├── 0000_setup.sql               # Local database setup
├── 0000_setup_remote.sql        # Production database setup
└── meta/                        # Migration metadata

# Configuration files
wrangler.jsonc                    # Cloudflare Workers configuration (D1, Durable Objects)
custom-worker.ts                  # Custom worker entry (WebSocket routing, DO exports)
open-next.config.ts               # OpenNext configuration for Cloudflare
next.config.mjs                   # Next.js configuration
=======
├── app/                    # Next.js pages and API routes
│   ├── api/               # REST API endpoints
│   ├── admin/             # Admin pages
│   ├── marketplace/       # Marketplace pages
│   └── ...
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── server/                # Server-side code (auth, db)
├── durable-objects/       # Cloudflare Durable Objects (WebSocket)
└── types/                 # TypeScript definitions

drizzle/                   # Database migrations
wrangler.jsonc             # Cloudflare Workers config
>>>>>>> Stashed changes
```

## Authentication

Configure Google OAuth in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

- **Authorized JavaScript origins**: `https://your-domain.com`, `http://localhost:3000`
- **Authorized redirect URIs**: `https://your-domain.com/api/auth/callback/google`, `http://localhost:3000/api/auth/callback/google`

## Notes

- Use `bunx wrangler` (not global `wrangler`) for D1 operations
- Page `params` and `searchParams` are Promises in Next.js 15
- See `.claude/CLAUDE.md` for development guidelines
