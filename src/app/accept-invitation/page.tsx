import { Suspense } from "react";
import { db } from "@/server/db";
import { employeeInvitations, companies, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import SetPasswordForm from "@/components/auth/SetPasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}


async function AcceptInvitationContent({ token }: { token?: string }) {
  // Check if token is provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
            <CardDescription>
              No invitation token provided in the URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Please check the invitation link in your email and try again.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              Go to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch invitation details
  const invitation = await db
    .select({
      id: employeeInvitations.id,
      email: employeeInvitations.email,
      companyId: employeeInvitations.companyId,
      userId: employeeInvitations.userId,
      token: employeeInvitations.token,
      expiresAt: employeeInvitations.expiresAt,
      status: employeeInvitations.status,
      createdAt: employeeInvitations.createdAt,
      companyName: companies.name,
      userFirstName: users.firstName,
      userLastName: users.lastName,
    })
    .from(employeeInvitations)
    .innerJoin(companies, eq(employeeInvitations.companyId, companies.id))
    .leftJoin(users, eq(employeeInvitations.userId, users.id))
    .where(eq(employeeInvitations.token, token))
    .get();

  // Invalid token - invitation may have been revoked/removed or never existed
  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <CardTitle>Invitation Not Found</CardTitle>
            </div>
            <CardDescription>
              This invitation link is no longer valid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This could happen because:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>The invitation was revoked by an administrator</li>
                <li>You were removed from the company</li>
                <li>The invitation link is incorrect or incomplete</li>
              </ul>
              <p className="text-sm text-gray-600">
                Please contact your company administrator if you believe this is an error.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-6"
            >
              Go to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if already accepted
  if (invitation.status === "accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <CardTitle>Invitation Already Accepted</CardTitle>
            </div>
            <CardDescription>
              This invitation has already been accepted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              You have already set up your account. Please log in to continue.
            </p>
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              Go to Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if expired
  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = invitation.expiresAt < currentTime || invitation.status === "expired";

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="h-6 w-6" />
              <CardTitle>Invitation Expired</CardTitle>
            </div>
            <CardDescription>
              This invitation has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              This invitation link has expired. Please contact your company administrator at{" "}
              <strong>{invitation.companyName}</strong> to request a new invitation.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              Go to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation - show password setup form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-6 w-6" />
            <CardTitle>Accept Invitation</CardTitle>
          </div>
          <CardDescription>
            You&apos;ve been invited to join <strong>{invitation.companyName}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetPasswordForm
            email={invitation.email}
            token={token}
            companyName={invitation.companyName}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function AcceptInvitationPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading invitation...</p>
          </div>
        </div>
      }
    >
      <AcceptInvitationContent token={resolvedSearchParams.token} />
    </Suspense>
  );
}
