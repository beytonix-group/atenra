import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { isSuperAdmin } from "@/lib/auth-helpers";


export const metadata = {
	title: "Chat - Atenra",
	description: "Chat with AI assistant powered by OpenAI GPT",
};

export default async function ChatPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const isAdmin = await isSuperAdmin();

	// Use different layout based on user role
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user}>
			<div className="container mx-auto py-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">AI Chat Assistant</h1>
					<p className="text-muted-foreground mt-2">
						Have a conversation with our AI assistant
					</p>
				</div>

				<ChatInterface />
			</div>
		</Layout>
	);
}
