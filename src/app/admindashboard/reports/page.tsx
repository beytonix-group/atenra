import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FileText } from "lucide-react";
import { getUserOwnedCompanies } from "@/lib/auth-helpers";


export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  let ownedCompanies: Awaited<ReturnType<typeof getUserOwnedCompanies>> = [];
  try {
    ownedCompanies = await getUserOwnedCompanies();
  } catch (error) {
    console.error("Failed to fetch owned companies:", error);
  }

  return (
    <DashboardLayout user={session.user} ownedCompanies={ownedCompanies}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">Reports</h2>
          <p className="text-muted-foreground">Coming Soon - Work in Progress</p>
        </div>
      </div>
    </DashboardLayout>
  );
}