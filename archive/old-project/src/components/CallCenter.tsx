
import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CallCenter = () => {
  const { toast } = useToast();
  const [callData, setCallData] = useState({
    urgency: '',
    category: '',
    description: '',
    preferredContact: '',
    budget: '',
    timeline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Request Submitted",
      description: "Your request has been logged and will be processed by our AI system.",
    });

    // Reset form
    setCallData({
      urgency: '',
      category: '',
      description: '',
      preferredContact: '',
      budget: '',
      timeline: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setCallData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <DashboardLayout title="Call & Message Center">
      <div className="px-4 sm:px-0">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <Phone className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <h3 className="font-semibold">Emergency Call</h3>
                <p className="text-sm text-gray-600">Immediate assistance</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <MessageSquare className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="font-semibold">Live Chat</h3>
                <p className="text-sm text-gray-600">Chat with support</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <h3 className="font-semibold">Schedule Callback</h3>
                <p className="text-sm text-gray-600">Book a time slot</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Request Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Service Request Form
            </CardTitle>
            <CardDescription>
              Tell us about your current need and we'll match you with the perfect service provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={callData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - I can wait</SelectItem>
                      <SelectItem value="medium">Medium - Within a week</SelectItem>
                      <SelectItem value="high">High - Within 24 hours</SelectItem>
                      <SelectItem value="emergency">Emergency - Right now</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Service Category</Label>
                  <Select value={callData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Services</SelectItem>
                      <SelectItem value="business">Business Services</SelectItem>
                      <SelectItem value="personal">Personal Services</SelectItem>
                      <SelectItem value="event">Event Planning</SelectItem>
                      <SelectItem value="health">Health & Wellness</SelectItem>
                      <SelectItem value="food">Food & Catering</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe your needs in detail. Include any specific requirements, preferences, or constraints..."
                  value={callData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <Select value={callData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-500">Under $500</SelectItem>
                      <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                      <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                      <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                      <SelectItem value="over-10000">Over $10,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeline">Preferred Timeline</Label>
                  <Select value={callData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP</SelectItem>
                      <SelectItem value="this-week">This week</SelectItem>
                      <SelectItem value="next-week">Next week</SelectItem>
                      <SelectItem value="this-month">This month</SelectItem>
                      <SelectItem value="flexible">I'm flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="contact">Preferred Contact Method</Label>
                <Select value={callData.preferredContact} onValueChange={(value) => handleInputChange('preferredContact', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How would you like to be contacted?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text message</SelectItem>
                    <SelectItem value="app">In-app notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">Save as Draft</Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* AI Processing Status */}
        <Card>
          <CardHeader>
            <CardTitle>AI Processing Status</CardTitle>
            <CardDescription>Real-time updates on your service matching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Request Analysis</h4>
                  <p className="text-sm text-gray-600">AI is analyzing your requirements...</p>
                </div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Provider Matching</h4>
                  <p className="text-sm text-gray-600">Finding the best service providers...</p>
                </div>
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Results Ready</h4>
                  <p className="text-sm text-gray-600">Matches will appear in your dashboard</p>
                </div>
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CallCenter;
