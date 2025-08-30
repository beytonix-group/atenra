import { handlers } from "@/server/auth";

export const runtime = "edge";

// For local development, the handlers from auth.ts work fine
// For production, Cloudflare will have access to env vars
export const { GET, POST } = handlers;