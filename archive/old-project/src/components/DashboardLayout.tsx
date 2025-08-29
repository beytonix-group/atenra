import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { Settings, Bug, User, LogOut, BarChart3, CreditCard, Lock, Trash2, Smartphone, Wallet } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    location: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [bugReport, setBugReport] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    billingCity: '',
    billingZip: '',
    paymentMethod: 'card'
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileUpdate = () => {
    console.log('Updating profile:', profileData);
  };

  const handleBugReport = () => {
    console.log('Submitting bug report:', bugReport);
    setBugReport({ title: '', description: '', priority: 'medium' });
  };

  const handlePaymentUpdate = () => {
    console.log('Updating payment information:', paymentData);
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getStatsForRole = () => {
    switch (user?.role) {
      case 'client':
        return [
          { label: 'Successful Matches', value: '12' },
          { label: 'Active Conversations', value: '3' },
          { label: 'Services Found', value: '8' }
        ];
      case 'business':
        return [
          { label: 'Leads Generated', value: '47' },
          { label: 'Conversion Rate', value: '68%' },
          { label: 'Revenue This Month', value: '$12.4k' }
        ];
      case 'employee':
        return [
          { label: 'Tasks Completed', value: '156' },
          { label: 'Client Satisfaction', value: '94%' },
          { label: 'Response Time', value: '2.3min' }
        ];
      default:
        return [];
    }
  };

  // Only show payment methods for clients and business users
  const showPaymentMethods = user?.role === 'client' || user?.role === 'business';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
              <Badge variant="outline" className="ml-2 capitalize">
                {user?.role}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={user?.email} />
                      <AvatarFallback className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {user?.role} Account
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Account Settings Modal */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <Settings className="mr-2 h-5 w-5" />
                          Account Settings
                        </DialogTitle>
                      </DialogHeader>
                      
                      <Tabs defaultValue="profile" className="w-full">
                        <TabsList className={`grid w-full ${showPaymentMethods ? 'grid-cols-3' : 'grid-cols-2'}`}>
                          <TabsTrigger value="profile">Profile</TabsTrigger>
                          <TabsTrigger value="security">Security</TabsTrigger>
                          {showPaymentMethods && <TabsTrigger value="payment">Payment</TabsTrigger>}
                        </TabsList>
                        
                        <TabsContent value="profile" className="space-y-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={profileData.location}
                              onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="Enter your location"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={profileData.phone}
                              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Enter your phone number"
                            />
                          </div>
                          <Button onClick={handleProfileUpdate} className="w-full">Update Profile</Button>
                        </TabsContent>
                        
                        <TabsContent value="security" className="space-y-4">
                          <div>
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                              id="current-password"
                              type="password"
                              value={profileData.currentPassword}
                              onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Enter current password"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={profileData.newPassword}
                              onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Enter new password"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={profileData.confirmPassword}
                              onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm new password"
                            />
                          </div>
                          <Button onClick={handleProfileUpdate} className="w-full">
                            <Lock className="mr-2 h-4 w-4" />
                            Update Password
                          </Button>
                        </TabsContent>
                        
                        {showPaymentMethods && (
                          <TabsContent value="payment" className="space-y-6">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h3 className="text-lg font-medium">Payment Methods</h3>
                                <p className="text-sm text-muted-foreground">Manage your billing information securely</p>
                              </div>
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                            </div>
                            
                            {/* Payment Method Selection */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              <Button
                                variant={paymentData.paymentMethod === 'card' ? 'default' : 'outline'}
                                onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: 'card' }))}
                                className="h-16 flex flex-col items-center"
                              >
                                <CreditCard className="h-5 w-5 mb-1" />
                                <span className="text-xs">Card</span>
                              </Button>
                              <Button
                                variant={paymentData.paymentMethod === 'apple' ? 'default' : 'outline'}
                                onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: 'apple' }))}
                                className="h-16 flex flex-col items-center"
                              >
                                <Smartphone className="h-5 w-5 mb-1" />
                                <span className="text-xs">Apple Pay</span>
                              </Button>
                              <Button
                                variant={paymentData.paymentMethod === 'paypal' ? 'default' : 'outline'}
                                onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: 'paypal' }))}
                                className="h-16 flex flex-col items-center"
                              >
                                <Wallet className="h-5 w-5 mb-1" />
                                <span className="text-xs">PayPal</span>
                              </Button>
                              <Button
                                variant={paymentData.paymentMethod === 'klarna' ? 'default' : 'outline'}
                                onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: 'klarna' }))}
                                className="h-16 flex flex-col items-center"
                              >
                                <CreditCard className="h-5 w-5 mb-1" />
                                <span className="text-xs">Klarna</span>
                              </Button>
                            </div>

                            {/* Payment Form based on selection */}
                            {paymentData.paymentMethod === 'card' && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="cardNumber">Card Number</Label>
                                    <Input
                                      id="cardNumber"
                                      value={paymentData.cardNumber}
                                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                                      placeholder="1234 5678 9012 3456"
                                      maxLength={19}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                                    <Input
                                      id="cardholderName"
                                      value={paymentData.cardholderName}
                                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                                      placeholder="John Doe"
                                    />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="expiryDate">Expiry Date</Label>
                                    <Input
                                      id="expiryDate"
                                      value={paymentData.expiryDate}
                                      onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                                      placeholder="MM/YY"
                                      maxLength={5}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input
                                      id="cvv"
                                      value={paymentData.cvv}
                                      onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                                      placeholder="123"
                                      maxLength={4}
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor="billingAddress">Billing Address</Label>
                                  <Input
                                    id="billingAddress"
                                    value={paymentData.billingAddress}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, billingAddress: e.target.value }))}
                                    placeholder="123 Main Street"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="billingCity">City</Label>
                                    <Input
                                      id="billingCity"
                                      value={paymentData.billingCity}
                                      onChange={(e) => setPaymentData(prev => ({ ...prev, billingCity: e.target.value }))}
                                      placeholder="New York"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="billingZip">ZIP Code</Label>
                                    <Input
                                      id="billingZip"
                                      value={paymentData.billingZip}
                                      onChange={(e) => setPaymentData(prev => ({ ...prev, billingZip: e.target.value }))}
                                      placeholder="10001"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {paymentData.paymentMethod === 'apple' && (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">Apple Pay will be configured during checkout</p>
                                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                                  Touch ID or Face ID required for authentication
                                </div>
                              </div>
                            )}

                            {paymentData.paymentMethod === 'paypal' && (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">You'll be redirected to PayPal during checkout</p>
                                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                                  Sign in to your PayPal account to complete payment
                                </div>
                              </div>
                            )}

                            {paymentData.paymentMethod === 'klarna' && (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">Pay in 4 interest-free installments</p>
                                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                                  Klarna will perform a soft credit check
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <Button onClick={handlePaymentUpdate} className="flex-1">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Save Payment Method
                              </Button>
                              <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                              <Lock className="inline h-3 w-3 mr-1" />
                              Your payment information is encrypted and securely stored. We never store your full card details.
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </DialogContent>
                  </Dialog>

                  {/* Bug Report Modal */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Bug className="mr-2 h-4 w-4" />
                        <span>Report Bug</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <Bug className="mr-2 h-5 w-5" />
                          Report Bug
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bug-title">Bug Title</Label>
                          <Input
                            id="bug-title"
                            value={bugReport.title}
                            onChange={(e) => setBugReport(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Brief description of the issue"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bug-description">Description</Label>
                          <Textarea
                            id="bug-description"
                            value={bugReport.description}
                            onChange={(e) => setBugReport(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Detailed description of the bug, steps to reproduce, etc."
                            rows={6}
                          />
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <select
                            id="priority"
                            value={bugReport.priority}
                            onChange={(e) => setBugReport(prev => ({ ...prev, priority: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        <Button onClick={handleBugReport}>Submit Bug Report</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Usage Statistics Modal */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Usage Statistics</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <BarChart3 className="mr-2 h-5 w-5" />
                          Usage Statistics
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          {getStatsForRole().map((stat, index) => (
                            <Card key={index}>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                          <div className="space-y-2">
                            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Profile updated</span>
                                <span className="text-xs text-gray-500">2 hours ago</span>
                              </div>
                            </div>
                            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">New match found</span>
                                <span className="text-xs text-gray-500">1 day ago</span>
                              </div>
                            </div>
                            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Account created</span>
                                <span className="text-xs text-gray-500">1 week ago</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
