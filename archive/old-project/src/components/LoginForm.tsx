
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

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'business' | 'employee'>('client');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password, role);
      toast({
        title: "Login successful",
        description: "Welcome to your dashboard!",
      });
      navigate(`/dashboard/${role}`);
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl font-bold text-center text-foreground">Welcome Back</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign in to your account to continue
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
              <Label htmlFor="role" className="text-foreground">Role</Label>
              <Select value={role} onValueChange={(value: 'client' | 'business' | 'employee') => setRole(value)}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="client" className="text-popover-foreground hover:bg-accent">Client</SelectItem>
                  <SelectItem value="business" className="text-popover-foreground hover:bg-accent">Business</SelectItem>
                  <SelectItem value="employee" className="text-popover-foreground hover:bg-accent">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
