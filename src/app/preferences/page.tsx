import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { ServicePreferencesForm } from "@/components/preferences/ServicePreferencesForm";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { users, userServicePreferences } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export const metadata = {
  title: "Set Your Preferences - Atenra",
  description: "Choose your service category preferences",
};

export default async function PreferencesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Super admins don't need preferences
  const isAdmin = await isSuperAdmin();
  if (isAdmin) {
    redirect("/admindashboard");
  }

  // Check if user already has preferences
  if (session.user.id) {
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, session.user.id))
      .get();

    if (user) {
      const existingPreferences = await db
        .select()
        .from(userServicePreferences)
        .where(eq(userServicePreferences.userId, user.id))
        .limit(1)
        .all();

      // If user already has preferences, redirect to dashboard
      if (existingPreferences.length > 0) {
        redirect("/dashboard");
      }
    }
  }

  return <ServicePreferencesForm />;
}