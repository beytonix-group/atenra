
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BusinessData } from '@/types/business';

interface BusinessMetricsCardProps {
  businessData: BusinessData;
  onUpdate: (field: keyof BusinessData, value: string | number) => void;
}

const BusinessMetricsCard: React.FC<BusinessMetricsCardProps> = ({ businessData, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Metrics</CardTitle>
        <CardDescription>Internal business data for AI matching</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="schedule">Business Hours</Label>
          <Input
            id="schedule"
            placeholder="e.g., Mon-Fri 9AM-6PM"
            value={businessData.schedule}
            onChange={(e) => onUpdate('schedule', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="employees">Number of Employees</Label>
          <Input
            id="employees"
            type="number"
            placeholder="e.g., 25"
            value={businessData.employees}
            onChange={(e) => onUpdate('employees', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="revenue">Monthly Revenue</Label>
          <Input
            id="revenue"
            placeholder="e.g., $50,000"
            value={businessData.revenue}
            onChange={(e) => onUpdate('revenue', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="expenses">Monthly Expenses</Label>
          <Input
            id="expenses"
            placeholder="e.g., $30,000"
            value={businessData.expenses}
            onChange={(e) => onUpdate('expenses', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="targetMarket">Target Market</Label>
          <Textarea
            id="targetMarket"
            placeholder="Describe your ideal customers..."
            value={businessData.targetMarket}
            onChange={(e) => onUpdate('targetMarket', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessMetricsCard;
