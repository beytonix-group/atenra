import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { CartContent } from "@/components/cart/CartContent";
import { isSuperAdmin, isRegularUser, getUserOwnedCompanies } from "@/lib/auth-helpers";

export const metadata = {
  title: "Shopping Cart - Atenra",
  description: "View and manage your shopping cart.",
};

export default async function CartPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [isAdmin, isRegular, ownedCompanies] = await Promise.all([
    isSuperAdmin().catch(() => false),
    isRegularUser().catch(() => true),
    getUserOwnedCompanies().catch(() => [])
  ]);

  // Regular users get the minimal ChatLayout (no sidebar)
  if (isRegular) {
    return (
      <ChatLayout user={session.user}>
        <div className="p-4 lg:p-6">
          <CartContent />
        </div>
      </ChatLayout>
    );
  }

  // For admins and other elevated roles, use their normal dashboard layout
  const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

  return (
    <Layout user={session.user} ownedCompanies={ownedCompanies}>
      <CartContent />
    </Layout>
  );
}
