import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreditCard } from "lucide-react";

export const runtime = "edge";

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">Billing</h2>
          <p className="text-muted-foreground">Coming Soon - Work in Progress</p>
        </div>
      </div>
    </DashboardLayout>
  );
}