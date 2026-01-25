# Atenra

A comprehensive SaaS platform for professional service matching, subscription management, and marketplace discovery, built on Cloudflare's edge infrastructure.

## Tech Stack

- **Next.js 15.5** with App Router
- **OpenNext for Cloudflare** (`@opennextjs/cloudflare@1.15.1`) for deployment to Cloudflare Workers
- **Wrangler 4.60.0** for Cloudflare development and deployment
- **Cloudflare Workers** for hosting and global edge deployment
- **Cloudflare D1** serverless SQLite database (local + production)
- **Drizzle ORM 0.44.5** for type-safe database operations
- **NextAuth v5** for authentication (Google OAuth)
- **Shadcn UI + Radix UI + Tailwind CSS** for modern component library
- **TypeScript 5** for type safety
- **Bun 1.2.21+** for package management and runtime
- **React 19** for UI rendering

## Features

### Core Platform

- 🌍 **Multi-language support** - Fully translated UI (English, Spanish, French, German, Chinese)
- 🔐 **Authentication system** - NextAuth v5 with Google OAuth
- 👤 **User profile management** - Comprehensive profile forms with validation
- 🎨 **Dark/light theme** - System preference detection with manual toggle
- 📱 **Fully responsive design** - Mobile-first approach for all pages and dashboards
- 🚀 **Cloudflare Workers optimized** - Built with OpenNext for Cloudflare

### Business Features

- 💼 **Marketplace** - Browse and filter service providers by category
- 💳 **Subscription system** - Multi-tier pricing plans (Student, Personal, Business, Custom)
- 📊 **Activity tracking** - User analytics and activity monitoring dashboard
- 🔒 **RBAC system** - Role-based access control (Super Admin, Manager, Employee, User)
- 💾 **Asset management** - User relationship and data management
- 🎯 **Dynamic pricing** - Support for promotions, trial periods, and refund guarantees

### Technical Features

- 🛠️ **Custom D1 adapter** - NextAuth compatibility with Cloudflare D1
- 🔄 **Automatic role assignment** - Database triggers for new user onboarding
- 🌐 **i18n system** - Context-based translations with language switching
- 🎨 **Dynamic theming** - Separate logos/favicons for light/dark modes
- 📈 **Admin dashboard** - User management, analytics, and activity monitoring

## Quick Start (Brand New Setup)

### Prerequisites

- [Bun 1.1.0+](https://bun.sh/) for package management and runtime
- [Node.js 18+](https://nodejs.org/) (optional, for compatibility)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) - Installed via `bunx wrangler`
- Cloudflare account (sign up at [cloudflare.com](https://www.cloudflare.com/))

### Local Development

```bash
# 1. Install dependencies
bun install

# 2. Run interactive setup (creates .dev.vars, configures database)
bun run setup

# 3. Setup database
bun run db:migrate:dev

# 4. Start development server with D1 bindings
bun run dev:d1  # Recommended: runs both Next.js and wrangler proxy
# OR
bun run dev     # Just Next.js (limited D1 access)
```

**One-liner for fresh start:**

```bash
bun install && bun run setup && bun run db:migrate:dev && bun run dev:d1
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development Commands

### Core Development

```bash
bun run dev              # Start Next.js development server (port 3000)
bun run dev:wrangler     # Start wrangler proxy with D1 bindings (port 8788)
bun run dev:d1           # Start both concurrently (recommended)
bun run lint             # Run ESLint for code quality
bun run build            # Build Next.js application
```

### Database Management

```bash
bun run db:generate      # Generate migration files from schema changes
bun run db:migrate:dev   # Apply migrations to local D1 database
bun run db:migrate:prod  # Apply migrations to remote D1 database (requires .env)
bun run db:studio:dev    # Open Drizzle Studio for local database
bun run db:studio:prod   # Open Drizzle Studio for remote database (requires .env)
bun run db:query         # Execute SQL on local D1 database
bun run db:query:prod    # Execute SQL on remote D1 database (requires .env)
```

**Important Notes:**

- The project uses **two migration files** for database setup:
  - `drizzle/0000_setup.sql` - Used for **local development** (compatible with Drizzle)
  - `drizzle/0000_setup_remote.sql` - Used for **remote/production** (includes D1-specific indexes)
- Always use `bunx wrangler` (not just `wrangler`) for D1 operations
- Remote operations require environment variables in `.env` file

### Building & Deployment

```bash
bunx opennextjs-cloudflare build    # Build for Cloudflare Workers (OpenNext)
bun run preview                     # Build and preview locally with Wrangler
bun run deploy                      # Build and deploy to Cloudflare Workers
bun run upload                      # Build and upload to Cloudflare (without deployment)
```

#### Deployment to Cloudflare Workers

1. **Setup database on Cloudflare:**

   ```bash
   bunx wrangler d1 create atenra-prod-db
   ```

2. **Update `wrangler.jsonc`** with the new database ID in the `d1_databases` section

3. **Apply migrations to production:**

   ```bash
   # Set environment variables in .env first
   bun run db:migrate:prod
   ```

4. **Configure secrets in Cloudflare Dashboard:**

   - Navigate to Workers & Pages → Your Project → Settings → Environment Variables
   - Add: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `SUPER_USER_EMAIL`

5. **Deploy:**
   ```bash
   bun run deploy
   ```

#### Build Output

The OpenNext build generates output in the `.open-next` directory:
- `.open-next/worker.js` - The Cloudflare Worker bundle
- `.open-next/assets` - Static assets for the CDN

## Environment Configuration

### Local Development (`.dev.vars`)

```bash
AUTH_SECRET=your-auth-secret          # Generate with: openssl rand -base64 32
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-secret
SUPER_USER_EMAIL=admin@example.com    # Optional: Super admin email
```

### Production Database Operations (`.env`)

Required for production database migrations and studio access:

```bash
CLOUDFLARE_D1_ACCOUNT_ID=your-cloudflare-account-id  # Your Cloudflare account ID
DATABASE=7ed327c0...                                 # D1 database ID from wrangler.toml
CLOUDFLARE_D1_API_TOKEN=your-api-token               # Cloudflare API token with D1 permissions
```

### Application Secrets (`.dev.vars` for local, Cloudflare Dashboard for production)

```bash
AUTH_SECRET=your-auth-secret                         # Generate with: openssl rand -base64 32
AUTH_GOOGLE_ID=your-google-client-id                 # From Google Cloud Console
AUTH_GOOGLE_SECRET=your-google-secret                # From Google Cloud Console
SUPER_USER_EMAIL=admin@example.com                   # Optional: Super admin email
```

### Environment Variable Details

| Variable                   | Purpose                              | How to Get                                 |
| -------------------------- | ------------------------------------ | ------------------------------------------ |
| `AUTH_SECRET`              | Encrypts NextAuth sessions/tokens    | Generate: `openssl rand -base64 32`        |
| `AUTH_GOOGLE_ID`           | Google OAuth client ID               | Google Cloud Console → Credentials         |
| `AUTH_GOOGLE_SECRET`       | Google OAuth client secret           | Google Cloud Console → Credentials         |
| `SUPER_USER_EMAIL`         | Auto-assigns super admin role        | Your admin email address                   |
| `CLOUDFLARE_D1_ACCOUNT_ID` | Your Cloudflare account identifier   | Cloudflare Dashboard → Right sidebar       |
| `DATABASE`                 | D1 database identifier (7ed327c0...) | From `wrangler.toml` or `wrangler d1 list` |
| `CLOUDFLARE_D1_API_TOKEN`  | API token for D1 operations          | Cloudflare → My Profile → API Tokens       |

## Project Structure

```
src/
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
```

## Authentication Setup

### Google OAuth Configuration

1. Create OAuth consent screen in [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent)
2. Create OAuth 2.0 credentials with:
   - **Authorized JavaScript origins**:
     - `https://your-domain.com`
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `https://your-domain.com/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`

## Best Practices

### Development Workflow

1. **Always use `bunx wrangler`** instead of global `wrangler` for consistency
2. **Use `bun run dev:d1`** for local development to access D1 database
3. **Test locally before deploying** with `bun run preview`
4. **Run migrations carefully** - Use correct migration files for local vs production

### Code Guidelines

- **TypeScript strict mode** - All code must pass strict type checking
- **Mobile-first responsive** - Design for mobile, enhance for desktop
- **Cloudflare Workers compatibility** - Use `getCloudflareContext()` from `@opennextjs/cloudflare` for accessing D1 and other bindings
- **Next.js 15 async params** - Page `params` and `searchParams` are Promises and must be awaited
- **Use Shadcn UI components** - Maintain consistent design system
- **Internationalize all text** - Add translations for new UI text

### Security

- **Never commit secrets** - Use `.dev.vars` for local, Cloudflare Dashboard for production
- **Protect admin routes** - Use `isSuperAdmin()` helper for access control
- **Validate all inputs** - Both client and server-side validation
- **Use RBAC properly** - Check user roles before granting access
