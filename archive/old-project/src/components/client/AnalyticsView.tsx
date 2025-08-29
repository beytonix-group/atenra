
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Calendar, CreditCard, Star, Target } from 'lucide-react';

const AnalyticsView = () => {
  const categoryData = [
    { category: 'Catering', usage: 12, color: 'hsl(var(--navy))' },
    { category: 'Interior Design', usage: 8, color: 'hsl(var(--burgundy))' },
    { category: 'Photography', usage: 6, color: 'hsl(var(--gold))' },
    { category: 'Cleaning', usage: 4, color: 'hsl(var(--accent))' },
    { category: 'Events', usage: 3, color: 'hsl(var(--primary))' }
  ];

  const spendingData = [
    { month: 'Jan', catering: 1200, design: 800, photography: 400, other: 200 },
    { month: 'Feb', catering: 1500, design: 600, photography: 600, other: 300 },
    { month: 'Mar', catering: 1800, design: 1200, photography: 300, other: 150 },
    { month: 'Apr', catering: 1400, design: 900, photography: 500, other: 250 },
    { month: 'May', catering: 2000, design: 1100, photography: 700, other: 400 },
    { month: 'Jun', catering: 1700, design: 800, photography: 450, other: 180 }
  ];

  const statsData = [
    {
      title: 'Total Matches',
      value: '47',
      change: '+12%',
      icon: Target,
      description: 'Successful service connections'
    },
    {
      title: 'Satisfaction Rate',
      value: '94%',
      change: '+2%',
      icon: Star,
      description: 'Average rating given'
    },
    {
      title: 'Re-engagements',
      value: '23',
      change: '+8%',
      icon: Users,
      description: 'Services used multiple times'
    },
    {
      title: 'Active This Month',
      value: '8',
      change: '+3',
      icon: Calendar,
      description: 'Services booked this month'
    },
    {
      title: 'Total Spent',
      value: '$12.4k',
      change: '+15%',
      icon: CreditCard,
      description: 'Lifetime platform spending'
    },
    {
      title: 'Avg. Monthly',
      value: '$2.1k',
      change: '+5%',
      icon: TrendingUp,
      description: 'Average monthly spending'
    }
  ];

  const chartConfig = {
    usage: {
      label: 'Usage Count',
    },
    catering: {
      label: 'Catering',
      color: 'hsl(var(--navy))',
    },
    design: {
      label: 'Interior Design',
      color: 'hsl(var(--burgundy))',
    },
    photography: {
      label: 'Photography',
      color: 'hsl(var(--gold))',
    },
    other: {
      label: 'Other Services',
      color: 'hsl(var(--accent))',
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-block mb-4">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-600/30 to-transparent"></div>
        </div>
        <h1 className="text-3xl md:text-4xl font-light text-slate-800 dark:text-stone-100 tracking-tight">
          Your Usage Analytics
        </h1>
        <p className="text-lg text-slate-600 dark:text-stone-300 font-light">
          Track your service usage patterns and spending insights
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Usage Bar Chart */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Service Categories</CardTitle>
            <CardDescription>Your usage by service category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="category" 
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="usage" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Spending Trends Line Chart */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Spending Trends</CardTitle>
            <CardDescription>Monthly spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="catering" 
                    stroke="hsl(var(--navy))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--navy))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="design" 
                    stroke="hsl(var(--burgundy))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--burgundy))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="photography" 
                    stroke="hsl(var(--gold))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--gold))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Grid */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Platform Statistics</CardTitle>
          <CardDescription>Your success metrics and usage summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsData.map((stat, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {stat.change}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm font-medium text-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
          <CardDescription>Your latest platform interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Booked catering service', business: 'Elegant Catering Co.', time: '2 days ago', status: 'completed' },
              { action: 'Rated photography session', business: 'Professional Photography', time: '1 week ago', status: 'completed' },
              { action: 'Saved interior designer', business: 'Luxe Interior Design', time: '2 weeks ago', status: 'saved' },
              { action: 'Contacted cleaning service', business: 'Elite Cleaning Services', time: '3 weeks ago', status: 'contacted' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.business}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : activity.status === 'saved'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsView;
