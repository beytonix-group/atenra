import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BarChart3 } from "lucide-react";


export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">Analytics</h2>
          <p className="text-muted-foreground">Coming Soon - Work in Progress</p>
        </div>
      </div>
    </DashboardLayout>
  );
}