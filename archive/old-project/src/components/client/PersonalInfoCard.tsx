
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfileData {
  preferences: {
    colors: string;
    fabrics: string;
    foods: string;
    services: string;
  };
  social: {
    familyLocations: string;
    lifestyle: string;
  };
  financial: {
    income: string;
    budget: string;
  };
  location: string;
}

interface PersonalInfoCardProps {
  profile: ProfileData;
  onProfileUpdate: (section: keyof Omit<ProfileData, 'location'>, field: string, value: string) => void;
  onLocationUpdate: (value: string) => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ 
  profile, 
  onProfileUpdate, 
  onLocationUpdate 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Help us personalize your experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="lifestyle">Lifestyle</Label>
          <Textarea
            id="lifestyle"
            placeholder="Tell us about your lifestyle..."
            value={profile.social.lifestyle}
            onChange={(e) => onProfileUpdate('social', 'lifestyle', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="familyLocations">Family Locations</Label>
          <Input
            id="familyLocations"
            placeholder="e.g., New York, California"
            value={profile.social.familyLocations}
            onChange={(e) => onProfileUpdate('social', 'familyLocations', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="location">Current Location</Label>
          <Input
            id="location"
            placeholder="e.g., Los Angeles, CA"
            value={profile.location}
            onChange={(e) => onLocationUpdate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="budget">Budget Range</Label>
          <Input
            id="budget"
            placeholder="e.g., $500-1000"
            value={profile.financial.budget}
            onChange={(e) => onProfileUpdate('financial', 'budget', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard;
