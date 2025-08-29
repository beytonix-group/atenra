
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BusinessData } from '@/types/business';

interface BusinessInfoCardProps {
  businessData: BusinessData;
  onUpdate: (field: keyof BusinessData, value: string | number) => void;
}

const BusinessInfoCard: React.FC<BusinessInfoCardProps> = ({ businessData, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>Update your business details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            placeholder="Enter your business name"
            value={businessData.name}
            onChange={(e) => onUpdate('name', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your business..."
            value={businessData.description}
            onChange={(e) => onUpdate('description', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="category">Business Category</Label>
          <Input
            id="category"
            placeholder="e.g., Restaurant, Fitness, Consulting"
            value={businessData.category}
            onChange={(e) => onUpdate('category', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="location">Business Location</Label>
          <Input
            id="location"
            placeholder="e.g., New York, NY"
            value={businessData.location}
            onChange={(e) => onUpdate('location', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            placeholder="https://www.example.com"
            value={businessData.website || ''}
            onChange={(e) => onUpdate('website', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="(555) 123-4567"
            value={businessData.phone || ''}
            onChange={(e) => onUpdate('phone', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessInfoCard;
