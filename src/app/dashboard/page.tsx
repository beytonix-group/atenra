import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  CreditCard, 
  DollarSign, 
  Users,
  Package,
  TrendingUp,
  Calendar,
  FileText,
  Settings,
  ArrowRight
} from "lucide-react";

export const runtime = "edge";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const isAdmin = await isSuperAdmin();
  
  // If user is admin, redirect to admin dashboard
  if (isAdmin) {
    redirect("/admindashboard");
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <p className="text-lg text-muted-foreground">
            Welcome back, {session.user.name?.split(' ')[0] || 'User'}! Here&apos;s an overview of your account.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Account Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,234.56</div>
              <p className="text-xs text-muted-foreground">
                +2.5% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Services
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                2 premium, 1 basic
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Next Payment
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$89.99</div>
              <p className="text-xs text-muted-foreground">
                Due in 15 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usage This Month
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">72%</div>
              <p className="text-xs text-muted-foreground">
                Of monthly quota
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Package className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-base">My Services</CardTitle>
                <CardDescription className="text-sm">
                  View and manage your active services
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CreditCard className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-base">Billing</CardTitle>
                <CardDescription className="text-sm">
                  Manage payment methods and invoices
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-base">Reports</CardTitle>
                <CardDescription className="text-sm">
                  View usage reports and analytics
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Settings className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-base">Settings</CardTitle>
                <CardDescription className="text-sm">
                  Configure account preferences
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent account activity and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  title: "Payment processed", 
                  description: "Monthly subscription payment of $89.99",
                  time: "2 hours ago",
                  icon: CreditCard
                },
                { 
                  title: "Service upgraded", 
                  description: "Analytics Pro plan activated",
                  time: "1 day ago",
                  icon: TrendingUp
                },
                { 
                  title: "Report generated", 
                  description: "Monthly usage report is ready",
                  time: "3 days ago",
                  icon: FileText
                },
                { 
                  title: "Profile updated", 
                  description: "Account settings were modified",
                  time: "1 week ago",
                  icon: Settings
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="rounded-full bg-muted p-2">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              ))}
            </div>
            <Button variant="link" className="mt-4 p-0">
              View all activity
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>
              Important dates and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: "Dec 15", event: "Next payment due", type: "payment" },
                { date: "Dec 20", event: "Service renewal", type: "renewal" },
                { date: "Dec 31", event: "Usage quota resets", type: "reset" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}