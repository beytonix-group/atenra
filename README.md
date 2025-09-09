# Atenra

A comprehensive SaaS platform for service matching and asset management, built on Cloudflare's edge infrastructure.

## Tech Stack

- **Next.js 14.2.5** with App Router and Edge Runtime
- **Cloudflare Pages** for hosting and global deployment
- **Cloudflare D1** serverless SQLite database
- **Drizzle ORM 0.44.5** for type-safe database operations
- **NextAuth v5 ** for authentication (Google OAuth + Credentials)
- **Shadcn UI + Radix UI + Tailwind CSS** for modern component library
- **TypeScript 5** for type safety
- **Bun 1.1.0+** for package management and runtime

## Features

- 🌍 **Multi-language support** (English, Spanish, French, German, Chinese)
- 🔐 **Authentication system** with NextAuth v5 (Google OAuth + Credentials)
- 👤 **User profile management** with comprehensive form validation
- 🎨 **Dark/light theme support** with system preference detection
- 📱 **Responsive design** with mobile-first approach
- 🚀 **Edge runtime** optimized for Cloudflare Workers/Pages
- 🔒 **RBAC system** for role-based access control
- 💾 **Asset management** with user relationships
- 📊 **Activity tracking** with user analytics dashboard
- 🛠️ **Custom D1 adapter** for NextAuth compatibility

## Quick Start (Brand New Setup)

### Prerequisites

- [Bun 1.1.0+](https://bun.sh/) for package management and runtime
- [Node.js](https://nodejs.org/) (optional, for compatibility)
- [Wrangler CLI 4.33.1+](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- Cloudflare account with `wrangler login`

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
bun run db:migrate:prod  # Apply migrations to remote D1 database
bun run db:studio:dev    # Open Drizzle Studio for local database
bun run db:studio:prod   # Open Drizzle Studio for remote database
bun run db:query         # Execute SQL on local D1 database
bun run db:query:prod    # Execute SQL on remote D1 database
```

### Building & Preview

```bash
bun run pages:build      # Build for Cloudflare Pages (@cloudflare/next-on-pages)
bun run preview          # Preview built app locally with Wrangler
```


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
DATABASE=7ed327c0-e838-4fd5-8369-a6b5e90dd04d        # D1 database ID from wrangler.toml
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

