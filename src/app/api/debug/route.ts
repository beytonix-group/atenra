import { getEnv } from "@/lib/env-edge";

// Only use edge runtime in production
export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';

export async function GET(request: Request) {
  // Test the dual-access helper
  const envCheck = {
    AUTH_SECRET: getEnv("AUTH_SECRET") ? "Value read" : "Value missing",
    AUTH_GOOGLE_ID: getEnv("AUTH_GOOGLE_ID") ? "Value read" : "Value missing", 
    AUTH_GOOGLE_SECRET: getEnv("AUTH_GOOGLE_SECRET") ? "Value read" : "Value missing",
    DATABASE: getEnv("DATABASE") ? "Value read" : "Value missing",
    SUPER_USER_EMAIL: getEnv("SUPER_USER_EMAIL") ? "Value read" : "Value missing",
  };

  return Response.json({ 
    message: "Environment check with dual-access helper",
    env: envCheck,
    note: "Remove this endpoint before production!"
  });
}