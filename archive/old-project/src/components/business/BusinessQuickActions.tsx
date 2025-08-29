
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search, Users, BarChart } from 'lucide-react';

const BusinessQuickActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="font-semibold text-lg">Chat with Employee</h3>
                <p className="text-gray-600">Get direct support from our team</p>
              </div>
            </div>
            <Button>Start Chat</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <h3 className="font-semibold text-lg">Explore Marketplace</h3>
                <p className="text-gray-600">Discover products and services</p>
              </div>
            </div>
            <Button variant="outline">Explore</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <h3 className="font-semibold text-lg">Client Matches</h3>
                <p className="text-gray-600">View potential client connections</p>
              </div>
            </div>
            <Button variant="outline">View Matches</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart className="h-8 w-8 text-orange-600 mr-4" />
              <div>
                <h3 className="font-semibold text-lg">Analytics</h3>
                <p className="text-gray-600">View your business performance</p>
              </div>
            </div>
            <Button variant="outline">View Stats</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessQuickActions;
