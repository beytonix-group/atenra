import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { isSuperAdmin } from "@/lib/auth-helpers";


export default async function UsersPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const isAdmin = await isSuperAdmin();
  
  if (!isAdmin) {
    redirect("/403");
  }

  // For now, redirect to the main admin dashboard which has user management
  redirect("/admindashboard");
}