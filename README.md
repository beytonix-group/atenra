# Atenra

A comprehensive SaaS platform for service matching and asset management, built on Cloudflare's edge infrastructure.

## Tech Stack

- **Next.js 14** with App Router and Edge Runtime
- **Cloudflare Pages** for hosting and global deployment
- **Cloudflare D1** serverless SQLite database
- **Drizzle ORM** for type-safe database operations
- **NextAuth v5** for authentication (Google OAuth + Credentials)
- **Shadcn UI + Tailwind CSS** for modern component library
- **TypeScript** for type safety
- **npm** for package management

## Features

- 🌍 **Multi-language support** (English, Spanish, French, German, Chinese)
- 🔐 **Authentication system** with Google OAuth and email/password
- 👤 **User profile management** with comprehensive form validation
- 🎨 **Dark/light theme support** with system preference detection
- 📱 **Responsive design** with mobile-first approach
- 🚀 **Edge runtime** for global performance
- 🔒 **RBAC system** for role-based access control
- 💾 **Asset management** with user relationships

## Quick Start (Brand New Setup)

### Prerequisites

- [Node.js](https://nodejs.org/) and npm installed
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- Cloudflare account with `wrangler login`

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run interactive setup (creates .dev.vars, configures database)
npm run setup

# 3. Setup database
npm run db:migrate:dev

# 4. Start development server
npm run dev
```

**One-liner for fresh start:**

```bash
npm install && npm run setup && npm run db:migrate:dev && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development Commands

### Core Development

```bash
npm run dev              # Start local development server
npm run lint             # Run ESLint for code quality
npm run build            # Build Next.js application
```

### Database Management

```bash
npm run db:generate      # Generate migration files from schema changes
npm run db:migrate:dev   # Apply migrations to local database
npm run db:migrate:prod  # Apply migrations to production database
npm run db:studio:dev    # Open Drizzle Studio for local database
npm run db:studio:prod   # Open Drizzle Studio for production database
```

### Cloudflare Deployment

```bash
npm run pages:build      # Build for Cloudflare Pages
npm run preview          # Preview built app locally with Wrangler
npm run deploy           # Quick deploy to Cloudflare Pages
npm run deploy:full      # Full deploy with linting and migrations
npm run deploy:staging   # Deploy to staging environment
```

### CI/CD Scripts

```bash
npm run ci:build         # CI build step (lint + pages:build)
npm run ci:deploy        # CI deploy step (migrate + deploy)
```

### Utilities

```bash
npm run cf-typegen       # Generate TypeScript types for Cloudflare environment
npm run setup            # Interactive project setup
```

## Environment Configuration

### Local Development (`.dev.vars`)

```bash
AUTH_SECRET=your-auth-secret          # Generate with: openssl rand -base64 32
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-secret
SUPER_USER_EMAIL=admin@example.com    # Optional: Super admin email
```

### Production Database Operations (`.env.local`)

Required for production database migrations and studio access:

```bash
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id     # Your Cloudflare account ID
CLOUDFLARE_DATABASE_ID=your-d1-database-id           # D1 database ID from wrangler.toml
CLOUDFLARE_D1_TOKEN=your-api-token                   # Cloudflare API token with D1 permissions
AUTH_SECRET=your-auth-secret                         # Same as .dev.vars
AUTH_GOOGLE_ID=your-google-client-id                 # Same as .dev.vars
AUTH_GOOGLE_SECRET=your-google-secret                # Same as .dev.vars
SUPER_USER_EMAIL=admin@example.com                   # Same as .dev.vars
```

### Environment Variable Details

| Variable                 | Purpose                            | How to Get                                 |
| ------------------------ | ---------------------------------- | ------------------------------------------ |
| `AUTH_SECRET`            | Encrypts NextAuth sessions/tokens  | Generate: `openssl rand -base64 32`        |
| `AUTH_GOOGLE_ID`         | Google OAuth client ID             | Google Cloud Console → Credentials         |
| `AUTH_GOOGLE_SECRET`     | Google OAuth client secret         | Google Cloud Console → Credentials         |
| `SUPER_USER_EMAIL`       | Auto-assigns super admin role      | Your admin email address                   |
| `CLOUDFLARE_ACCOUNT_ID`  | Your Cloudflare account identifier | Cloudflare Dashboard → Right sidebar       |
| `CLOUDFLARE_DATABASE_ID` | D1 database identifier             | From `wrangler.toml` or `wrangler d1 list` |
| `CLOUDFLARE_D1_TOKEN`    | API token for D1 operations        | Cloudflare → My Profile → API Tokens       |

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes (edge runtime)
│   ├── auth/           # Authentication pages
│   └── profile/        # User profile management
├── components/         # React components
│   ├── ui/            # Shadcn UI components
│   ├── auth/          # Authentication forms
│   ├── landing/       # Landing page components
│   └── profile/       # Profile management components
├── lib/               # Utility libraries
│   ├── i18n/         # Internationalization
│   ├── utils/        # Helper functions
│   └── theme/        # Theme management
└── server/            # Server-side code
    ├── auth.ts        # NextAuth configuration
    └── db/            # Database schema and connection
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

### Super Admin Setup

Add admin emails to `SUPER_USER_EMAIL` in env (comma-separated for multiple admins). The accounts will be assigned super admin role upon log in the first time

## Deployment

### Production Deployment

```bash
# Full deployment with all checks
bun run deploy:full

# Quick deployment
bun run deploy
```

### CI/CD Pipeline Example

```yaml
- name: Build
  run: npm run ci:build

- name: Deploy
  run: npm run ci:deploy
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Database Schema

The application includes comprehensive tables for:

- **User Management**: Users, authentication, profiles
- **Asset Management**: Asset types, user assets, relationships
- **Service Management**: Companies, services, job matching
- **Subscription System**: Plans, billing, usage tracking
- **RBAC**: Roles, permissions, access control
- **Content Management**: Dynamic content, plan-based access

## Development Notes

- All components use **TypeScript** with strict type checking
- **Server Components** by default, `"use client"` only when needed
- **Edge Runtime** for optimal Cloudflare compatibility
- **Mobile-first responsive design** with Tailwind CSS
- **Security-first approach** with input validation and sanitization

## Performance Features

- **Edge deployment** for global low-latency
- **Image optimization** with proper fallbacks
- **Lazy loading** for non-critical components
- **Suspense boundaries** for progressive loading
- **Optimized database queries** with proper indexing
