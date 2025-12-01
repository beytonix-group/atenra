import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { MessagesLayout } from '@/components/messages/MessagesLayout';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { UserDashboardLayout } from '@/components/dashboard/UserDashboardLayout';
import { isSuperAdmin } from '@/lib/auth-helpers';

export const runtime = 'edge';

export const metadata = {
	title: 'Messages',
	description: 'Your conversations and messages',
};

export default async function MessagesPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect('/api/auth/signin');
	}

	// Get current user from database
	const currentUser = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.authUserId, session.user.id))
		.get();

	if (!currentUser) {
		redirect('/api/auth/signin');
	}

	const isAdmin = await isSuperAdmin();
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user}>
			<MessagesLayout currentUserId={currentUser.id} />
		</Layout>
	);
}
