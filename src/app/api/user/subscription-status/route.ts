import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { users, subscriptions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ hasActiveSubscription: false });
    }

    const isAdmin = await isSuperAdmin().catch(() => false);
    if (isAdmin) {
      return NextResponse.json({ hasActiveSubscription: true, isAdmin: true });
    }

    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, session.user.id))
      .get();

    if (!user) {
      return NextResponse.json({ hasActiveSubscription: false });
    }

    const activeSubscription = await db
      .select({ status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .all();

    const hasActive = activeSubscription.some(
      (s) => s.status === "active" || s.status === "trialing"
    );

    return NextResponse.json({ hasActiveSubscription: hasActive });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json({ hasActiveSubscription: false });
  }
}
