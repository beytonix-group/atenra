
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Bug, AlertTriangle, Info } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const SupportTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    priority: '',
    category: '',
    description: '',
    steps: '',
    expectedBehavior: '',
    actualBehavior: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate ticket submission
    setTimeout(() => {
      toast({
        title: "Support ticket created",
        description: "Your ticket has been submitted successfully. Ticket ID: #ST-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      });
      setIsSubmitting(false);
      navigate('/dashboard/employee');
    }, 1000);
  };

  return (
    <DashboardLayout title="Create Support Ticket">
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard/employee')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <CardTitle className="flex items-center">
              <Bug className="h-6 w-6 mr-2" />
              Report a Bug or Issue
            </CardTitle>
            <CardDescription>
              Help us improve the platform by reporting bugs, glitches, or requesting features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center">
                          <Info className="h-4 w-4 mr-2 text-blue-500" />
                          Low - Minor issue
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                          Medium - Moderate impact
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                          High - Critical issue
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Issue Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ui-bug">UI/Display Bug</SelectItem>
                    <SelectItem value="functionality">Functionality Issue</SelectItem>
                    <SelectItem value="performance">Performance Problem</SelectItem>
                    <SelectItem value="data-loss">Data Loss/Corruption</SelectItem>
                    <SelectItem value="feature-request">Feature Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="steps">Steps to Reproduce</Label>
                <Textarea
                  id="steps"
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                  value={formData.steps}
                  onChange={(e) => setFormData(prev => ({ ...prev, steps: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                  <Textarea
                    id="expectedBehavior"
                    placeholder="What should have happened?"
                    value={formData.expectedBehavior}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedBehavior: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="actualBehavior">Actual Behavior</Label>
                  <Textarea
                    id="actualBehavior"
                    placeholder="What actually happened?"
                    value={formData.actualBehavior}
                    onChange={(e) => setFormData(prev => ({ ...prev, actualBehavior: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Support Ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SupportTicket;
