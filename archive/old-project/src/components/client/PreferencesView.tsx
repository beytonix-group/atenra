
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileData } from '@/types/client';

interface PreferencesViewProps {
  profile: ProfileData;
  onProfileUpdate: (section: keyof Omit<ProfileData, 'location'>, field: string, value: string) => void;
  onLocationUpdate: (value: string) => void;
}

const PreferencesView: React.FC<PreferencesViewProps> = ({
  profile,
  onProfileUpdate,
  onLocationUpdate
}) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Edit Your Preferences
        </h1>
        <p className="text-muted-foreground">
          Update your preferences to get better recommendations
        </p>
      </div>

      {/* Compact Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Preferences */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Service Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="colors">Preferred Colors</Label>
              <Input
                id="colors"
                value={profile.preferences.colors}
                onChange={(e) => onProfileUpdate('preferences', 'colors', e.target.value)}
                placeholder="Navy, beige, burgundy..."
              />
            </div>
            <div>
              <Label htmlFor="foods">Food Preferences</Label>
              <Input
                id="foods"
                value={profile.preferences.foods}
                onChange={(e) => onProfileUpdate('preferences', 'foods', e.target.value)}
                placeholder="Italian, vegetarian, organic..."
              />
            </div>
            <div>
              <Label htmlFor="services">Service Types</Label>
              <Textarea
                id="services"
                value={profile.preferences.services}
                onChange={(e) => onProfileUpdate('preferences', 'services', e.target.value)}
                placeholder="Interior design, catering, photography..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => onLocationUpdate(e.target.value)}
                placeholder="City, State"
              />
            </div>
            <div>
              <Label htmlFor="lifestyle">Lifestyle</Label>
              <Input
                id="lifestyle"
                value={profile.social.lifestyle}
                onChange={(e) => onProfileUpdate('social', 'lifestyle', e.target.value)}
                placeholder="Active, luxury, family-oriented..."
              />
            </div>
            <div>
              <Label htmlFor="income">Income Range</Label>
              <Select
                value={profile.financial.income}
                onValueChange={(value) => onProfileUpdate('financial', 'income', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-50k">Under $50,000</SelectItem>
                  <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                  <SelectItem value="100k-200k">$100,000 - $200,000</SelectItem>
                  <SelectItem value="over-200k">Over $200,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Budget Preferences */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Budget Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="budget">Monthly Service Budget</Label>
              <Select
                value={profile.financial.budget}
                onValueChange={(value) => onProfileUpdate('financial', 'budget', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-500">Under $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                  <SelectItem value="over-2500">Over $2,500</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fabrics">Material Preferences</Label>
              <Input
                id="fabrics"
                value={profile.preferences.fabrics}
                onChange={(e) => onProfileUpdate('preferences', 'fabrics', e.target.value)}
                placeholder="Cotton, silk, leather..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Family & Social */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Family & Social</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="familyLocations">Family Locations</Label>
              <Input
                id="familyLocations"
                value={profile.social.familyLocations}
                onChange={(e) => onProfileUpdate('social', 'familyLocations', e.target.value)}
                placeholder="Cities where family members live..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="text-center py-6">
        <Button 
          size="lg" 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default PreferencesView;
