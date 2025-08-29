
import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketplaceView from './client/MarketplaceView';
import PreferencesView from './client/PreferencesView';
import AnalyticsView from './client/AnalyticsView';
import SwipeInterface from './SwipeInterface';
import { ProfileData } from '@/types/client';

const ClientDashboard = () => {
  const [profile, setProfile] = useState<ProfileData>({
    preferences: {
      colors: '',
      fabrics: '',
      foods: '',
      services: ''
    },
    social: {
      familyLocations: '',
      lifestyle: ''
    },
    financial: {
      income: '',
      budget: ''
    },
    location: ''
  });

  // Load quiz data on component mount
  useEffect(() => {
    const storedQuizData = localStorage.getItem('clientProfileData');
    if (storedQuizData) {
      try {
        const quizData = JSON.parse(storedQuizData);
        // Map quiz data to profile format
        setProfile(prev => ({
          ...prev,
          preferences: {
            colors: quizData.colorPreferences || '',
            fabrics: quizData.materialPreferences?.join(', ') || '',
            foods: quizData.interestCategories?.filter((cat: string) => cat.includes('Food')).join(', ') || '',
            services: quizData.serviceTypes?.join(', ') || ''
          },
          social: {
            familyLocations: '',
            lifestyle: quizData.lifestyleMarkers?.join(', ') || ''
          },
          financial: {
            income: quizData.incomeRange || '',
            budget: ''
          },
          location: quizData.location || ''
        }));
      } catch (error) {
        console.error('Error loading quiz data:', error);
      }
    }
  }, []);

  const handleProfileUpdate = (section: keyof Omit<ProfileData, 'location'>, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleLocationUpdate = (value: string) => {
    setProfile(prev => ({ ...prev, location: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-stone-900">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-600 to-stone-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-slate-600 to-amber-600 rounded-full blur-3xl"></div>
      </div>

      <DashboardLayout title="Your Personal Marketplace">
        <div className="px-4 sm:px-0 relative">
          <Tabs defaultValue="marketplace" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-card border border-border">
              <TabsTrigger value="marketplace" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="discover" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Discover
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace" className="space-y-8">
              <MarketplaceView />
            </TabsContent>

            <TabsContent value="discover" className="space-y-8">
              <SwipeInterface />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-8">
              <PreferencesView 
                profile={profile}
                onProfileUpdate={handleProfileUpdate}
                onLocationUpdate={handleLocationUpdate}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">
              <AnalyticsView />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default ClientDashboard;
