import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, MessageSquare, TrendingUp, Users, Search, Filter, Star, MapPin, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import BusinessInfoCard from './business/BusinessInfoCard';
import ServicesCard from './business/ServicesCard';
import BusinessMetricsCard from './business/BusinessMetricsCard';
import BusinessQuickActions from './business/BusinessQuickActions';
import { BusinessData, ServiceOffering } from '@/types/business';

const BusinessDashboard = () => {
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: '',
    description: '',
    services: '',
    schedule: '',
    revenue: '',
    expenses: '',
    location: '',
    targetMarket: '',
    category: '',
    employees: 0,
    website: '',
    phone: ''
  });

  const [serviceOfferings, setServiceOfferings] = useState<ServiceOffering[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const b2bListings = [
    {
      id: 1,
      name: 'Premium Logistics Solutions',
      category: 'Logistics & Supply Chain',
      description: 'End-to-end supply chain management for growing businesses',
      rating: 4.8,
      reviewCount: 124,
      location: 'Seattle, WA',
      priceRange: '$5,000 - $50,000',
      tags: ['Supply Chain', 'Warehousing', 'Distribution'],
      partnership: 'Preferred Partner'
    },
    {
      id: 2,
      name: 'Enterprise Software Solutions',
      category: 'Technology Services',
      description: 'Custom software development and enterprise system integration',
      rating: 4.9,
      reviewCount: 89,
      location: 'San Francisco, CA',
      priceRange: '$10,000 - $100,000',
      tags: ['Software Dev', 'System Integration', 'Cloud Solutions'],
      partnership: 'Gold Partner'
    },
    {
      id: 3,
      name: 'Professional Marketing Agency',
      category: 'Marketing & Advertising',
      description: 'Full-service B2B marketing and brand development',
      rating: 4.7,
      reviewCount: 156,
      location: 'Portland, OR',
      priceRange: '$2,000 - $25,000',
      tags: ['Brand Development', 'Digital Marketing', 'Lead Generation'],
      partnership: 'Verified Partner'
    },
    {
      id: 4,
      name: 'Financial Advisory Services',
      category: 'Financial Services',
      description: 'Business financial planning and investment advisory',
      rating: 4.9,
      reviewCount: 203,
      location: 'Vancouver, BC',
      priceRange: '$1,000 - $15,000',
      tags: ['Financial Planning', 'Investment', 'Tax Advisory'],
      partnership: 'Premium Partner'
    },
    {
      id: 5,
      name: 'Legal Business Solutions',
      category: 'Legal Services',
      description: 'Corporate law, contracts, and business compliance',
      rating: 4.8,
      reviewCount: 95,
      location: 'Seattle, WA',
      priceRange: '$500 - $10,000',
      tags: ['Corporate Law', 'Contracts', 'Compliance'],
      partnership: 'Trusted Partner'
    },
    {
      id: 6,
      name: 'Industrial Equipment Suppliers',
      category: 'Equipment & Supplies',
      description: 'Industrial machinery and equipment for manufacturing',
      rating: 4.6,
      reviewCount: 78,
      location: 'Tacoma, WA',
      priceRange: '$15,000 - $200,000',
      tags: ['Manufacturing', 'Industrial Equipment', 'Maintenance'],
      partnership: 'Verified Partner'
    }
  ];

  const categories = [
    'Technology Services',
    'Marketing & Advertising',
    'Financial Services',
    'Legal Services',
    'Logistics & Supply Chain',
    'Equipment & Supplies',
    'Consulting Services',
    'Real Estate Services'
  ];

  const filteredListings = b2bListings.filter(listing => {
    const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBusinessUpdate = (field: keyof BusinessData, value: string | number) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServicesUpdate = (services: ServiceOffering[]) => {
    setServiceOfferings(services);
  };

  const getPartnershipColor = (partnership: string) => {
    switch (partnership) {
      case 'Gold Partner': return 'default';
      case 'Premium Partner': return 'default';
      case 'Preferred Partner': return 'secondary';
      case 'Trusted Partner': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <DashboardLayout title="Business Management Portal">
        <div className="px-4 sm:px-0">
          <Tabs defaultValue="overview" className="w-full">
            {/* Reordered tabs: Overview -> Performance -> Service Details -> Account Info */}
            <TabsList className="grid w-full grid-cols-5 mb-6 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="overview" className="text-gray-700 dark:text-gray-300">Overview</TabsTrigger>
              <TabsTrigger value="marketplace" className="text-gray-700 dark:text-gray-300">B2B Marketplace</TabsTrigger>
              <TabsTrigger value="performance" className="text-gray-700 dark:text-gray-300">Performance</TabsTrigger>
              <TabsTrigger value="services" className="text-gray-700 dark:text-gray-300">Service Details</TabsTrigger>
              <TabsTrigger value="account" className="text-gray-700 dark:text-gray-300">Account Info</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-gray-300 dark:border-gray-600">
                  <CardContent className="flex items-center p-4">
                    <Building className="h-6 w-6 text-gray-600 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Listings</h3>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{serviceOfferings.length}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-gray-300 dark:border-gray-600">
                  <CardContent className="flex items-center p-4">
                    <Users className="h-6 w-6 text-gray-600 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Client Matches</h3>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">8</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-300 dark:border-gray-600">
                  <CardContent className="flex items-center p-4">
                    <TrendingUp className="h-6 w-6 text-gray-600 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Match Rate</h3>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">76%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-300 dark:border-gray-600">
                  <CardContent className="flex items-center p-4">
                    <MessageSquare className="h-6 w-6 text-gray-600 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Messages</h3>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">3</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <BusinessQuickActions />

              {/* Recent Client Matches */}
              <Card className="border-gray-300 dark:border-gray-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Client Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Sarah Johnson</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Interior Design Services - 95% match</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-gray-300 text-gray-700">Contact</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Michael Chen</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Event Planning - 88% match</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-gray-300 text-gray-700">Contact</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Emily Rodriguez</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Catering Services - 82% match</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-gray-300 text-gray-700">View Profile</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-4">
              {/* B2B Marketplace Header */}
              <Card className="border-gray-300 dark:border-gray-600">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100">
                    <Building className="h-5 w-5 mr-2" />
                    Business-to-Business Marketplace
                  </CardTitle>
                  <CardDescription>
                    Discover verified business partners, service providers, and vendor solutions tailored to your business needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search for services, vendors, or solutions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* B2B Listings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="border-gray-300 dark:border-gray-600 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {listing.name}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs mb-2">
                            {listing.category}
                          </Badge>
                        </div>
                        <Badge variant={getPartnershipColor(listing.partnership)} className="text-xs">
                          {listing.partnership}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {listing.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-gray-900 dark:text-gray-100">{listing.rating}</span>
                          <span className="text-gray-500 ml-1">({listing.reviewCount})</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {listing.location}
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {listing.priceRange}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {listing.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1 text-xs">
                          View Details
                        </Button>
                        <Button size="sm" variant="default" className="flex-1 text-xs">
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredListings.length === 0 && (
                <Card className="border-gray-300 dark:border-gray-600">
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No business partners found matching your criteria. Try adjusting your search or category filter.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-gray-300 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Lead Generation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">This Month</span>
                        <span className="text-gray-900 dark:text-gray-100">47 leads</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                        <span className="text-gray-900 dark:text-gray-100">68%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                        <span className="text-gray-900 dark:text-gray-100">$12,400</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-300 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Client Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Average Rating</span>
                        <span className="text-gray-900 dark:text-gray-100">4.8/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Reviews</span>
                        <span className="text-gray-900 dark:text-gray-100">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                        <span className="text-gray-900 dark:text-gray-100">2.3 hours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <ServicesCard 
                services={serviceOfferings}
                onServicesUpdate={handleServicesUpdate}
              />
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BusinessInfoCard 
                  businessData={businessData}
                  onUpdate={handleBusinessUpdate}
                />
                <BusinessMetricsCard 
                  businessData={businessData}
                  onUpdate={handleBusinessUpdate}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button size="sm" variant="outline" className="border-gray-300 text-gray-700">Save Changes</Button>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default BusinessDashboard;
