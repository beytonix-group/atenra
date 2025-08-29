
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import ClientOnboardingQuiz from '@/components/ClientOnboardingQuiz';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'business'>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (role === 'business') {
      navigate('/register/business');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, role);
      
      // Show quiz for clients immediately after registration
      if (role === 'client') {
        setShowQuiz(true);
      } else {
        toast({
          title: "Registration successful",
          description: "Welcome! Your account has been created.",
        });
        navigate(`/dashboard/${role}`);
      }
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

  const handleQuizComplete = (quizData: any) => {
    // Store quiz data (in a real app, this would be saved to a database)
    console.log('Quiz data:', quizData);
    localStorage.setItem('clientProfileData', JSON.stringify(quizData));
    
    toast({
      title: "Registration successful",
      description: "Welcome! Your personalized profile has been created.",
    });
    navigate('/dashboard/client');
  };

  const handleQuizSkip = () => {
    toast({
      title: "Registration successful",
      description: "Welcome! You can complete your profile later in settings.",
    });
    navigate('/dashboard/client');
  };

  // Show quiz if client just registered
  if (showQuiz) {
    return <ClientOnboardingQuiz onComplete={handleQuizComplete} onSkip={handleQuizSkip} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Back to Home Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="flex items-center text-foreground hover:bg-accent border border-border/50 hover:border-border"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>

      <Card className="w-full max-w-md card-enhanced">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-foreground">Create Account</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign up to get started with our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">Account Type</Label>
              <Select value={role} onValueChange={(value: 'client' | 'business') => setRole(value)}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="client" className="text-popover-foreground hover:bg-accent">Client</SelectItem>
                  <SelectItem value="business" className="text-popover-foreground hover:bg-accent">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
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

export default RegisterForm;
