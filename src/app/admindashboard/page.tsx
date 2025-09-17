import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { isSuperAdmin } from "@/lib/auth-helpers";

export const runtime = "edge";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const isAdmin = await isSuperAdmin();
  
  if (!isAdmin) {
    redirect("/403");
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-6">
        <AdminDashboard />
      </div>
    </DashboardLayout>
  );
}