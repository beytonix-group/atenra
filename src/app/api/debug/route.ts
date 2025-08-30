export const runtime = "edge";

export async function GET(request: Request) {
  // Only show in development - remove this endpoint in production!
  const envCheck = {
    AUTH_SECRET: process.env.AUTH_SECRET ? "Value read" : "Value missing",
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? "Value read" : "Value missing",
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? "Value read" : "Value missing",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "Value read" : "Value missing",
    DATABASE: process.env.DATABASE ? "Value read" : "Value missing",
    SUPER_USER_EMAIL: process.env.SUPER_USER_EMAIL ? "Value read" : "Value missing",
  };

  return Response.json({ 
    message: "Environment check",
    env: envCheck,
    note: "Remove this endpoint before production!"
  });
}