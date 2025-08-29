
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

interface PreferencesCardProps {
  profile: ProfileData;
  onProfileUpdate: (section: keyof Omit<ProfileData, 'location'>, field: string, value: string) => void;
}

const PreferencesCard: React.FC<PreferencesCardProps> = ({ profile, onProfileUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Tell us about your style and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="colors">Favorite Colors</Label>
          <Input
            id="colors"
            placeholder="e.g., Blue, Green, Red"
            value={profile.preferences.colors}
            onChange={(e) => onProfileUpdate('preferences', 'colors', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="fabrics">Preferred Fabrics</Label>
          <Input
            id="fabrics"
            placeholder="e.g., Cotton, Silk, Linen"
            value={profile.preferences.fabrics}
            onChange={(e) => onProfileUpdate('preferences', 'fabrics', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="foods">Food Preferences</Label>
          <Input
            id="foods"
            placeholder="e.g., Italian, Vegetarian, Spicy"
            value={profile.preferences.foods}
            onChange={(e) => onProfileUpdate('preferences', 'foods', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="services">Service Preferences</Label>
          <Textarea
            id="services"
            placeholder="Tell us about the services you're interested in..."
            value={profile.preferences.services}
            onChange={(e) => onProfileUpdate('preferences', 'services', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesCard;
