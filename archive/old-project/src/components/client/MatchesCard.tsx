
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MatchesCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmed Matches</CardTitle>
        <CardDescription>Your approved service matches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium">Premium Catering Service</h4>
            <p className="text-sm text-gray-600">Match Score: 95%</p>
            <p className="text-sm text-gray-500">Location: 2.3 miles away</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium">Interior Design Studio</h4>
            <p className="text-sm text-gray-600">Match Score: 88%</p>
            <p className="text-sm text-gray-500">Location: 4.1 miles away</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchesCard;
