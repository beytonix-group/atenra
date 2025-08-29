
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Building2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const BusinessRegistrationForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Account Information
    email: '',
    password: '',
    confirmPassword: '',
    
    // Business Information
    businessName: '',
    ownerName: '',
    businessLocation: '',
    businessCategory: '',
    businessDescription: '',
    website: '',
    phone: '',
    
    // Financial Information
    monthlyRevenue: '',
    yearlyRevenue: '',
    yearlyCosts: '',
    
    // Operational Information
    numberOfEmployees: '',
    businessHours: '',
    productsServices: '',
    targetMarket: '',
    businessAge: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, 'business');
      // In a real app, you'd also save the business data
      toast({
        title: "Business registration successful",
        description: "Welcome! Your business account has been created.",
      });
      navigate('/dashboard/business');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Business Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          placeholder="business@example.com"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          required
          placeholder="Create a secure password"
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          required
          placeholder="Confirm your password"
        />
      </div>
      <div>
        <Label htmlFor="ownerName">Owner/Contact Name</Label>
        <Input
          id="ownerName"
          value={formData.ownerName}
          onChange={(e) => handleInputChange('ownerName', e.target.value)}
          required
          placeholder="Your full name"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => handleInputChange('businessName', e.target.value)}
          required
          placeholder="Your business name"
        />
      </div>
      <div>
        <Label htmlFor="businessLocation">Business Location</Label>
        <Input
          id="businessLocation"
          value={formData.businessLocation}
          onChange={(e) => handleInputChange('businessLocation', e.target.value)}
          required
          placeholder="City, State"
        />
      </div>
      <div>
        <Label htmlFor="businessCategory">Business Category</Label>
        <Select value={formData.businessCategory} onValueChange={(value) => handleInputChange('businessCategory', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your business category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="restaurant">Restaurant & Food</SelectItem>
            <SelectItem value="retail">Retail & Shopping</SelectItem>
            <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
            <SelectItem value="fitness">Fitness & Wellness</SelectItem>
            <SelectItem value="education">Education & Training</SelectItem>
            <SelectItem value="technology">Technology & Software</SelectItem>
            <SelectItem value="consulting">Consulting & Professional Services</SelectItem>
            <SelectItem value="construction">Construction & Home Services</SelectItem>
            <SelectItem value="automotive">Automotive</SelectItem>
            <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
            <SelectItem value="entertainment">Entertainment & Events</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="businessDescription">Business Description</Label>
        <Textarea
          id="businessDescription"
          value={formData.businessDescription}
          onChange={(e) => handleInputChange('businessDescription', e.target.value)}
          placeholder="Describe what your business does..."
          className="min-h-[80px]"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://www.yourbusiness.com"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthlyRevenue">Monthly Revenue</Label>
          <Input
            id="monthlyRevenue"
            value={formData.monthlyRevenue}
            onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
            placeholder="$10,000"
          />
        </div>
        <div>
          <Label htmlFor="yearlyRevenue">Yearly Revenue</Label>
          <Input
            id="yearlyRevenue"
            value={formData.yearlyRevenue}
            onChange={(e) => handleInputChange('yearlyRevenue', e.target.value)}
            placeholder="$120,000"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="yearlyCosts">Yearly Operating Costs</Label>
        <Input
          id="yearlyCosts"
          value={formData.yearlyCosts}
          onChange={(e) => handleInputChange('yearlyCosts', e.target.value)}
          placeholder="$80,000"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numberOfEmployees">Number of Employees</Label>
          <Input
            id="numberOfEmployees"
            type="number"
            value={formData.numberOfEmployees}
            onChange={(e) => handleInputChange('numberOfEmployees', e.target.value)}
            placeholder="5"
          />
        </div>
        <div>
          <Label htmlFor="businessAge">Years in Business</Label>
          <Input
            id="businessAge"
            type="number"
            value={formData.businessAge}
            onChange={(e) => handleInputChange('businessAge', e.target.value)}
            placeholder="3"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="businessHours">Business Hours</Label>
        <Input
          id="businessHours"
          value={formData.businessHours}
          onChange={(e) => handleInputChange('businessHours', e.target.value)}
          placeholder="Mon-Fri 9AM-5PM"
        />
      </div>
      <div>
        <Label htmlFor="productsServices">Products & Services</Label>
        <Textarea
          id="productsServices"
          value={formData.productsServices}
          onChange={(e) => handleInputChange('productsServices', e.target.value)}
          placeholder="List your main products and services..."
          className="min-h-[80px]"
        />
      </div>
      <div>
        <Label htmlFor="targetMarket">Target Market</Label>
        <Textarea
          id="targetMarket"
          value={formData.targetMarket}
          onChange={(e) => handleInputChange('targetMarket', e.target.value)}
          placeholder="Describe your ideal customers..."
          className="min-h-[80px]"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="fixed top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>

      <Card className="w-full max-w-2xl dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center dark:text-white">
            <Building2 className="h-6 w-6 mr-2" />
            Business Registration
          </CardTitle>
          <CardDescription className="text-center dark:text-gray-300">
            Step {step} of 3: {step === 1 ? 'Account Setup' : step === 2 ? 'Business Information' : 'Financial & Operational Details'}
          </CardDescription>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <div className="flex justify-between space-x-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  Previous
                </Button>
              )}
              
              {step < 3 ? (
                <Button type="button" onClick={handleNextStep} className="ml-auto">
                  Next
                </Button>
              ) : (
                <Button type="submit" className="ml-auto" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Business Account"}
                </Button>
              )}
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessRegistrationForm;
