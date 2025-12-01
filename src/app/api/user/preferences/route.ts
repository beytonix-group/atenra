import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, userServicePreferences, serviceCategories } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { isSuperAdmin } from "@/lib/auth-helpers";

export const runtime = "edge";

const savePreferencesSchema = z.object({
  categoryIds: z.array(z.number()).min(1, "Please select at least one service category"),
});

// GET - Check if user has preferences
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's database ID
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, session.user.id))
      .get();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's preferences
    const preferences = await db
      .select({
        categoryId: userServicePreferences.categoryId,
        categoryName: serviceCategories.name,
        priority: userServicePreferences.priority,
      })
      .from(userServicePreferences)
      .innerJoin(serviceCategories, eq(userServicePreferences.categoryId, serviceCategories.id))
      .where(eq(userServicePreferences.userId, user.id))
      .all();

    return NextResponse.json({
      hasPreferences: preferences.length > 0,
      preferences,
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Save user preferences
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin (they shouldn't set preferences)
    const isAdmin = await isSuperAdmin();
    if (isAdmin) {
      return NextResponse.json({
        error: "Super admins don't need to set preferences"
      }, { status: 400 });
    }

    // Get the user's database ID
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, session.user.id))
      .get();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = savePreferencesSchema.parse(body);

    // Delete existing preferences
    await db
      .delete(userServicePreferences)
      .where(eq(userServicePreferences.userId, user.id));

    // Insert new preferences
    const preferencesToInsert = validatedData.categoryIds.map((categoryId, index) => ({
      userId: user.id,
      categoryId,
      priority: index, // Use array index as priority (first selected = highest priority)
    }));

    await db.insert(userServicePreferences).values(preferencesToInsert);

    return NextResponse.json({
      message: "Preferences saved successfully",
      count: validatedData.categoryIds.length,
    });
  } catch (error) {
    console.error("Save preferences error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: error.issues[0].message
      }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}