import { handlers } from "@/server/auth";

export const runtime = "edge";

export async function GET(request: Request) {
  // Check if auth handlers are properly initialized
  const debugInfo = {
    handlersExist: !!handlers,
    hasGETHandler: !!handlers?.GET,
    hasPOSTHandler: !!handlers?.POST,
    authSecret: process.env.AUTH_SECRET ? "Set" : "Missing",
    googleId: process.env.AUTH_GOOGLE_ID ? "Set" : "Missing",
    googleSecret: process.env.AUTH_GOOGLE_SECRET ? "Set" : "Missing",
    nextAuthUrl: process.env.NEXTAUTH_URL || "Not set - using default",
    // Check if handlers are functions
    getHandlerType: typeof handlers?.GET,
    postHandlerType: typeof handlers?.POST,
  };

  return Response.json({ 
    message: "Auth configuration debug",
    debug: debugInfo,
    note: "Remove this endpoint before production!"
  });
}