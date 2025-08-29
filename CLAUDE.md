# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack SaaS application built on Cloudflare's edge infrastructure using:
- **Next.js 14** with App Router for the frontend framework
- **Cloudflare Pages** for hosting and edge deployment
- **Cloudflare D1** serverless SQLite database for data persistence
- **Drizzle ORM** for type-safe database operations
- **NextAuth v5** for authentication (Google OAuth)
- **Shadcn UI + Radix UI + Tailwind CSS** for the component library and styling

The database schema includes comprehensive tables for users, assets, companies, services, subscriptions, RBAC, and content management. All relationships are properly defined with foreign keys and indexes for optimal query performance.

## Essential Commands

### Development
```bash
bun run dev          # Start local development server (http://localhost:3000)
bun run lint         # Run ESLint for code quality checks
```

### Database Operations
```bash
bun run db:generate       # Generate migration files from schema changes
bun run db:migrate:dev    # Apply migrations to local D1 database
bun run db:migrate:prod   # Apply migrations to remote D1 database (requires env vars)
bun run db:studio:dev     # Open Drizzle Studio for local database
bun run db:studio:prod    # Open Drizzle Studio for remote database
```

### Deployment
```bash
bun run pages:build  # Build for Cloudflare Pages using @cloudflare/next-on-pages
bun run preview      # Preview Pages build locally with Wrangler
bun run deploy       # Deploy to Cloudflare Pages
```

### Setup & Configuration
```bash
bun run setup        # Interactive setup script for initial configuration
bun run cf-typegen   # Generate TypeScript types for Cloudflare environment
```

## Development Guidelines

### Code Style Requirements (from .cursorrules)
- Use TypeScript for all code with interfaces over types
- Prefer functional components and avoid classes
- Use descriptive variable names with auxiliary verbs (isLoading, hasError)
- Directory names should be lowercase with dashes
- Minimize 'use client' - favor React Server Components
- Use Shadcn UI, Radix, and Tailwind for all UI components
- Implement mobile-first responsive design

### Database Access Pattern
- Database is accessed via Drizzle ORM with the D1 binding
- In development, uses local SQLite files at `.wrangler/state/v3/d1`
- In production, connects to Cloudflare D1 via REST API
- Database instance is available at `src/server/db/index.ts`
- Schema definitions are in `src/server/db/schema.ts`

### Environment Configuration
- Local development uses `.dev.vars` for secrets (AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET)
- Production database operations require `.env` with CLOUDFLARE_D1_ACCOUNT_ID, DATABASE, and CLOUDFLARE_D1_API_TOKEN
- Cloudflare bindings are configured in `wrangler.toml`

### Authentication Flow
- NextAuth v5 is configured in `src/server/auth.ts`
- Currently supports Google OAuth provider
- Uses Drizzle Adapter for session persistence
- Auth handlers are exposed at `/api/[...nextauth]/route.ts`

### Performance Optimization
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Optimize images with WebP format and lazy loading
- Focus on Web Vitals (LCP, CLS, FID)
- Use 'nuqs' for URL search parameter state management