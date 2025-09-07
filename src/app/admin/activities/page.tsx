import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { getUserRole } from "@/lib/auth/get-user-role";
import { ActivitiesView } from "@/components/admin/ActivitiesView";
import { ROLES } from "@/lib/auth/roles";

export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminActivitiesPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const userRole = await getUserRole(session.user.email);
  
  if (userRole !== ROLES.SUPER_ADMIN) {
    redirect("/unauthorized");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Activities</h1>
        <p className="text-muted-foreground mt-2">
          Track and monitor user activities across the platform
        </p>
      </div>
      <ActivitiesView />
    </div>
  );
}