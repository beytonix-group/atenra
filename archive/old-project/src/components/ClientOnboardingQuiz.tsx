
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QuizData {
  // Identity & Demographics
  fullName: string;
  ageRange: string;
  gender: string;
  occupation: string;
  incomeRange: string;
  educationLevel: string;
  
  // Location & Availability
  location: string;
  serviceRadius: string;
  availableTimes: string[];
  contactMethod: string;
  
  // Preferences & Behavior
  interestCategories: string[];
  serviceTypes: string[];
  materialPreferences: string[];
  colorPreferences: string;
  accessibilityNeeds: string[];
  lifestyleMarkers: string[];
  
  // Additional preferences
  languagePreferences: string;
  voiceProfilePreferences: string;
}

interface ClientOnboardingQuizProps {
  onComplete: (data: QuizData) => void;
  onSkip: () => void;
}

const ClientOnboardingQuiz: React.FC<ClientOnboardingQuizProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState<QuizData>({
    fullName: '',
    ageRange: '',
    gender: '',
    occupation: '',
    incomeRange: '',
    educationLevel: '',
    location: '',
    serviceRadius: '',
    availableTimes: [],
    contactMethod: '',
    interestCategories: [],
    serviceTypes: [],
    materialPreferences: [],
    colorPreferences: '',
    accessibilityNeeds: [],
    lifestyleMarkers: [],
    languagePreferences: '',
    voiceProfilePreferences: ''
  });
  
  const { toast } = useToast();
  const totalSteps = 4;

  const updateData = (field: keyof QuizData, value: any) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: keyof QuizData, value: string, checked: boolean) => {
    setQuizData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(quizData);
      toast({
        title: "Profile Complete!",
        description: "Your preferences have been saved for personalized service matching.",
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name (Optional)</Label>
        <Input
          id="fullName"
          value={quizData.fullName}
          onChange={(e) => updateData('fullName', e.target.value)}
          placeholder="Enter your name or alias"
        />
      </div>
      
      <div>
        <Label htmlFor="ageRange">Age Range</Label>
        <Select value={quizData.ageRange} onValueChange={(value) => updateData('ageRange', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select age range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="18-24">18-24</SelectItem>
            <SelectItem value="25-34">25-34</SelectItem>
            <SelectItem value="35-44">35-44</SelectItem>
            <SelectItem value="45-54">45-54</SelectItem>
            <SelectItem value="55-64">55-64</SelectItem>
            <SelectItem value="65+">65+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="gender">Gender (Optional)</Label>
        <Select value={quizData.gender} onValueChange={(value) => updateData('gender', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="non-binary">Non-binary</SelectItem>
            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="occupation">Occupation/Industry</Label>
        <Input
          id="occupation"
          value={quizData.occupation}
          onChange={(e) => updateData('occupation', e.target.value)}
          placeholder="e.g., Software Engineer, Teacher"
        />
      </div>

      <div>
        <Label htmlFor="incomeRange">Income Range</Label>
        <Select value={quizData.incomeRange} onValueChange={(value) => updateData('incomeRange', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select income range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under-25k">Under $25,000</SelectItem>
            <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
            <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
            <SelectItem value="75k-100k">$75,000 - $100,000</SelectItem>
            <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
            <SelectItem value="150k+">$150,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="educationLevel">Education Level</Label>
        <Select value={quizData.educationLevel} onValueChange={(value) => updateData('educationLevel', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select education level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high-school">High School</SelectItem>
            <SelectItem value="some-college">Some College</SelectItem>
            <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
            <SelectItem value="masters">Master's Degree</SelectItem>
            <SelectItem value="phd">PhD</SelectItem>
            <SelectItem value="trade">Trade School</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="location">Current Location</Label>
        <Input
          id="location"
          value={quizData.location}
          onChange={(e) => updateData('location', e.target.value)}
          placeholder="ZIP code or city"
        />
      </div>

      <div>
        <Label htmlFor="serviceRadius">Preferred Service Radius</Label>
        <Select value={quizData.serviceRadius} onValueChange={(value) => updateData('serviceRadius', value)}>
          <SelectTrigger>
            <SelectValue placeholder="How far are you willing to travel?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5-miles">Within 5 miles</SelectItem>
            <SelectItem value="10-miles">Within 10 miles</SelectItem>
            <SelectItem value="25-miles">Within 25 miles</SelectItem>
            <SelectItem value="50-miles">Within 50 miles</SelectItem>
            <SelectItem value="anywhere">Anywhere</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Available Times (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-10PM)', 'Weekends', 'Weekdays', 'Flexible'].map((time) => (
            <div key={time} className="flex items-center space-x-2">
              <Checkbox
                id={time}
                checked={quizData.availableTimes.includes(time)}
                onCheckedChange={(checked) => updateArrayField('availableTimes', time, checked as boolean)}
              />
              <Label htmlFor={time} className="text-sm">{time}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="contactMethod">Preferred Contact Method</Label>
        <Select value={quizData.contactMethod} onValueChange={(value) => updateData('contactMethod', value)}>
          <SelectTrigger>
            <SelectValue placeholder="How should businesses contact you?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS/Text</SelectItem>
            <SelectItem value="phone">Phone Call</SelectItem>
            <SelectItem value="app">In-App Messaging</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <Label>Categories of Interest (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Food & Dining', 'Legal Services', 'Home Repair', 'Wellness & Health', 'Beauty & Personal Care', 'Automotive', 'Technology', 'Education', 'Entertainment', 'Financial Services'].map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={quizData.interestCategories.includes(category)}
                onCheckedChange={(checked) => updateArrayField('interestCategories', category, checked as boolean)}
              />
              <Label htmlFor={category} className="text-sm">{category}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Preferred Service Types (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Eco-friendly', 'Luxury', 'Budget-friendly', 'Fast delivery', 'Premium quality', 'Local businesses'].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={quizData.serviceTypes.includes(type)}
                onCheckedChange={(checked) => updateArrayField('serviceTypes', type, checked as boolean)}
              />
              <Label htmlFor={type} className="text-sm">{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Material Preferences (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Organic', 'Synthetic', 'Recycled', 'Natural', 'Sustainable', 'Vegan'].map((material) => (
            <div key={material} className="flex items-center space-x-2">
              <Checkbox
                id={material}
                checked={quizData.materialPreferences.includes(material)}
                onCheckedChange={(checked) => updateArrayField('materialPreferences', material, checked as boolean)}
              />
              <Label htmlFor={material} className="text-sm">{material}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="colorPreferences">Color Preferences</Label>
        <Input
          id="colorPreferences"
          value={quizData.colorPreferences}
          onChange={(e) => updateData('colorPreferences', e.target.value)}
          placeholder="e.g., Blue, Green, Neutral tones"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <Label>Accessibility Needs (select all that apply)</Label>
        <div className="grid grid-cols-1 gap-2 mt-2">
          {['Wheelchair accessible', 'Low-sensory environments', 'Large print/text', 'Sign language interpretation', 'Audio descriptions', 'Braille materials'].map((need) => (
            <div key={need} className="flex items-center space-x-2">
              <Checkbox
                id={need}
                checked={quizData.accessibilityNeeds.includes(need)}
                onCheckedChange={(checked) => updateArrayField('accessibilityNeeds', need, checked as boolean)}
              />
              <Label htmlFor={need} className="text-sm">{need}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Lifestyle Markers (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Vegan', 'Vegetarian', 'Pet owner', 'Frequent traveler', 'Smoker', 'Non-smoker', 'Health conscious', 'Tech-savvy'].map((marker) => (
            <div key={marker} className="flex items-center space-x-2">
              <Checkbox
                id={marker}
                checked={quizData.lifestyleMarkers.includes(marker)}
                onCheckedChange={(checked) => updateArrayField('lifestyleMarkers', marker, checked as boolean)}
              />
              <Label htmlFor={marker} className="text-sm">{marker}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="languagePreferences">Language Preferences</Label>
        <Input
          id="languagePreferences"
          value={quizData.languagePreferences}
          onChange={(e) => updateData('languagePreferences', e.target.value)}
          placeholder="e.g., English, Spanish, Bilingual"
        />
      </div>

      <div>
        <Label htmlFor="voiceProfilePreferences">Voice Profile Preferences</Label>
        <Select value={quizData.voiceProfilePreferences} onValueChange={(value) => updateData('voiceProfilePreferences', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Future voice AI personalization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Personal Information";
      case 2: return "Location & Availability";
      case 3: return "Preferences & Interests";
      case 4: return "Lifestyle & Accessibility";
      default: return "Profile Setup";
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-2xl dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center dark:text-white">
            Personalize Your Experience
          </CardTitle>
          <CardDescription className="text-center dark:text-gray-300">
            {getStepTitle()} - Step {currentStep} of {totalSteps}
          </CardDescription>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {getStepContent()}
          
          <div className="flex justify-between mt-6">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious} className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={onSkip}>
                Skip for now
              </Button>
              <Button onClick={handleNext} className="flex items-center">
                {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
                {currentStep < totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOnboardingQuiz;
