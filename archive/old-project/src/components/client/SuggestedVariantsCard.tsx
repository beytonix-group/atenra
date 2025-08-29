
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SuggestedVariantsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Variants</CardTitle>
        <CardDescription>Similar services you might like</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium">Boutique Event Planning</h4>
            <p className="text-sm text-gray-600">87% match (+12% price)</p>
            <p className="text-sm text-gray-500">Location: 3.8 miles away</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium">Custom Furniture Design</h4>
            <p className="text-sm text-gray-600">82% match (-8% price)</p>
            <p className="text-sm text-gray-500">Location: 6.2 miles away</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestedVariantsCard;
