import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ChatPageContent } from "@/components/chat/ChatPageContent";
import { isSuperAdmin, isRegularUser, getUserOwnedCompanies } from "@/lib/auth-helpers";

export const metadata = {
  title: "Chat - Atenra",
  description: "Get help and guidance from the Atenra Assistant.",
};

export default async function ChatPage() {
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
        <ChatPageContent userId={session.user.id} />
      </ChatLayout>
    );
  }

  // For admins and other elevated roles, use their normal dashboard layout
  const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

  return (
    <Layout user={session.user} ownedCompanies={ownedCompanies}>
      <ChatPageContent userId={session.user.id} />
    </Layout>
  );
}
