
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, MessageSquare, User, Settings } from 'lucide-react';

const QuickActionsGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/call-center')}>
        <CardContent className="flex items-center p-6">
          <Phone className="h-8 w-8 text-blue-600 mr-4" />
          <div>
            <h3 className="font-semibold">Call Center</h3>
            <p className="text-sm text-gray-600">Get immediate help</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="flex items-center p-6">
          <MessageSquare className="h-8 w-8 text-green-600 mr-4" />
          <div>
            <h3 className="font-semibold">Message Center</h3>
            <p className="text-sm text-gray-600">Send messages</p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="flex items-center p-6">
          <User className="h-8 w-8 text-purple-600 mr-4" />
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-sm text-gray-600">Get suggestions</p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="flex items-center p-6">
          <Settings className="h-8 w-8 text-orange-600 mr-4" />
          <div>
            <h3 className="font-semibold">Preferences</h3>
            <p className="text-sm text-gray-600">Update profile</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActionsGrid;
