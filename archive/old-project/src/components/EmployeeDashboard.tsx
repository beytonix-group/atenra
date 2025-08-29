import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, User, Building, MessageSquare, TrendingUp, DollarSign, Star, Award, Target, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientRequest {
  id: number;
  client: string;
  need: string;
  location: string;
  income: string;
  tags: string[];
  priority: string;
  timestamp: string;
  type: 'client';
}

interface BusinessRequest {
  id: number;
  business: string;
  issue: string;
  category: string;
  tags: string[];
  priority: string;
  timestamp: string;
  type: 'business';
}

type SupportRequest = ClientRequest | BusinessRequest;

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matches');

  // Mock data for demonstration
  const supportRequests: SupportRequest[] = [
    {
      id: 1,
      client: "Sarah Johnson",
      need: "Home cleaning service",
      location: "Downtown",
      income: "$75,000",
      tags: ["Premium", "Recurring"],
      priority: "high",
      timestamp: "2 mins ago",
      type: "client"
    },
    {
      id: 2,
      business: "CleanCorp Services",
      issue: "Staff shortage for weekend bookings",
      category: "Staffing",
      tags: ["Urgent", "Weekend"],
      priority: "emergency",
      timestamp: "5 mins ago",
      type: "business"
    },
    {
      id: 3,
      client: "Michael Chen",
      need: "Personal trainer",
      location: "Uptown",
      income: "$120,000",
      tags: ["Fitness", "Premium"],
      priority: "medium",
      timestamp: "12 mins ago",
      type: "client"
    },
    {
      id: 4,
      business: "FitLife Gym",
      issue: "Equipment maintenance scheduling",
      category: "Maintenance",
      tags: ["Equipment", "Scheduling"],
      priority: "low",
      timestamp: "18 mins ago",
      type: "business"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const sortedRequests = supportRequests.sort((a, b) => {
    const priorityOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
  });

  const clientRequests = sortedRequests.filter((req): req is ClientRequest => req.type === 'client');
  const businessRequests = sortedRequests.filter((req): req is BusinessRequest => req.type === 'business');

  const handleSelectRequest = (request: SupportRequest) => {
    if (request.type === 'business') {
      navigate('/business-support', { state: { requestId: request.id, requestData: request } });
    } else {
      navigate('/live-support', { state: { requestId: request.id, requestData: request } });
    }
  };

  const renderRequestCard = (request: SupportRequest) => (
    <Card key={request.id} className="hover:shadow-lg transition-shadow cursor-pointer mb-4" onClick={() => handleSelectRequest(request)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {request.type === 'client' ? (
              <User className="h-5 w-5 text-blue-600" />
            ) : (
              <Building className="h-5 w-5 text-purple-600" />
            )}
            <h3 className="font-semibold text-foreground">
              {request.type === 'client' ? request.client : request.business}
            </h3>
          </div>
          <Badge className={getPriorityColor(request.priority)}>
            {request.priority.toUpperCase()}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          {request.type === 'client' ? request.need : request.issue}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {request.type === 'client' && (
            <Badge variant="outline" className="text-xs">
              {request.location}
            </Badge>
          )}
          {request.type === 'business' && (
            <Badge variant="outline" className="text-xs">
              {request.category}
            </Badge>
          )}
          {request.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{request.timestamp}</span>
          </div>
          {request.type === 'client' && (
            <span className="font-medium">{request.income}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Performance metrics data
  const performanceMetrics = {
    successfulReferrals: 127,
    revenueGenerated: 45600,
    avgClientSatisfaction: 4.8,
    avgTaskCompletion: 8.5, // minutes
    monthlyGrowth: 15.2
  };

  // Employee rankings data
  const employeeRankings = [
    { rank: 1, name: "You", referrals: 127, revenue: 45600, satisfaction: 4.8 },
    { rank: 2, name: "Sarah Chen", referrals: 119, revenue: 42300, satisfaction: 4.7 },
    { rank: 3, name: "Michael Torres", referrals: 108, revenue: 38900, satisfaction: 4.6 },
    { rank: 4, name: "Emma Wilson", referrals: 95, revenue: 35200, satisfaction: 4.5 },
    { rank: 5, name: "David Park", referrals: 87, revenue: 31800, satisfaction: 4.4 }
  ];

  // Payroll breakdown data
  const payrollData = {
    currentMonth: {
      baseAmount: 3200,
      referralBonus: 1580,
      performanceBonus: 650,
      total: 5430
    },
    recentPayments: [
      { date: "2024-05-01", amount: 5430, referrals: 24, description: "Monthly + Referral Bonuses" },
      { date: "2024-04-01", amount: 4890, referrals: 22, description: "Monthly + Referral Bonuses" },
      { date: "2024-03-01", amount: 5120, referrals: 23, description: "Monthly + Performance Bonus" },
      { date: "2024-02-01", amount: 4650, referrals: 21, description: "Monthly + Referral Bonuses" }
    ],
    referralRate: 65 // dollars per successful referral
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/20 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full blur-3xl"></div>
      </div>

      <DashboardLayout title="Employee Support Center">
        <div className="px-4 sm:px-0 relative">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Requests</p>
                    <p className="text-2xl font-bold text-foreground">{sortedRequests.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Client Requests</p>
                    <p className="text-2xl font-bold text-foreground">{clientRequests.length}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Business Requests</p>
                    <p className="text-2xl font-bold text-foreground">{businessRequests.length}</p>
                  </div>
                  <Building className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Urgent Priority</p>
                    <p className="text-2xl font-bold text-foreground">
                      {sortedRequests.filter(r => r.priority === 'emergency' || r.priority === 'high').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-card border border-border">
              <TabsTrigger value="matches" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Active Matches
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Performance Analytics
              </TabsTrigger>
              <TabsTrigger value="payroll" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Payroll & Earnings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Client Support Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Client Support Requests
                    </CardTitle>
                    <CardDescription>
                      Help clients find the perfect services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    {clientRequests.length > 0 ? (
                      clientRequests.map(renderRequestCard)
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No client requests at the moment</p>
                    )}
                  </CardContent>
                </Card>

                {/* Business Support Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <Building className="h-5 w-5 mr-2 text-purple-600" />
                      Business Support Requests
                    </CardTitle>
                    <CardDescription>
                      Assist businesses with their operational needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    {businessRequests.length > 0 ? (
                      businessRequests.map(renderRequestCard)
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No business requests at the moment</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                      <Target className="h-5 w-5 mr-2 text-green-600" />
                      Successful Referrals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-2">{performanceMetrics.successfulReferrals}</div>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +{performanceMetrics.monthlyGrowth}% this month
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                      Revenue Generated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-2">${performanceMetrics.revenueGenerated.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total this quarter</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-600" />
                      Client Satisfaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-2">{performanceMetrics.avgClientSatisfaction}/5</div>
                    <div className="text-sm text-muted-foreground">Average rating</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-purple-600" />
                      Avg Task Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-2">{performanceMetrics.avgTaskCompletion}m</div>
                    <div className="text-sm text-muted-foreground">Per completion</div>
                  </CardContent>
                </Card>
              </div>

              {/* Employee Rankings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Award className="h-5 w-5 mr-2 text-gold" />
                    Employee Performance Rankings
                  </CardTitle>
                  <CardDescription>Based on referrals, revenue, and satisfaction scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {employeeRankings.map((employee) => (
                      <div key={employee.rank} className={`flex items-center justify-between p-4 rounded-lg border ${employee.name === 'You' ? 'bg-primary/10 border-primary/20' : 'bg-card border-border'}`}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            employee.rank === 1 ? 'bg-yellow-500 text-white' :
                            employee.rank === 2 ? 'bg-gray-400 text-white' :
                            employee.rank === 3 ? 'bg-amber-600 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {employee.rank}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">{employee.referrals} referrals</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">${employee.revenue.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {employee.satisfaction}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payroll" className="space-y-8">
              {/* Current Month Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Current Month Earnings
                    </CardTitle>
                    <CardDescription>June 2024 breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Base Salary</span>
                      <span className="font-semibold text-foreground">${payrollData.currentMonth.baseAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Referral Bonuses</span>
                      <span className="font-semibold text-green-600">+${payrollData.currentMonth.referralBonus.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Performance Bonus</span>
                      <span className="font-semibold text-blue-600">+${payrollData.currentMonth.performanceBonus.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-foreground">Total Expected</span>
                        <span className="text-xl font-bold text-green-600">${payrollData.currentMonth.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-4">
                      Rate: ${payrollData.referralRate} per successful referral
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Payment History
                    </CardTitle>
                    <CardDescription>Recent payment records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {payrollData.recentPayments.map((payment, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">{payment.date}</div>
                            <div className="text-sm text-muted-foreground">{payment.description}</div>
                            <div className="text-xs text-muted-foreground">{payment.referrals} referrals</div>
                          </div>
                          <div className="font-semibold text-foreground">${payment.amount.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Incentives Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Performance-Based Incentives</CardTitle>
                  <CardDescription>How your earnings are calculated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-accent/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">${payrollData.referralRate}</div>
                      <div className="text-sm font-medium text-foreground mb-1">Per Successful Referral</div>
                      <div className="text-xs text-muted-foreground">Client-business match completion</div>
                    </div>
                    <div className="text-center p-4 bg-accent/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">10%</div>
                      <div className="text-sm font-medium text-foreground mb-1">Revenue Share Bonus</div>
                      <div className="text-xs text-muted-foreground">Monthly performance bonus</div>
                    </div>
                    <div className="text-center p-4 bg-accent/30 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-2">4.8+</div>
                      <div className="text-sm font-medium text-foreground mb-1">Satisfaction Threshold</div>
                      <div className="text-xs text-muted-foreground">For maximum bonuses</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default EmployeeDashboard;
