
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building, Send, Phone, X, AlertCircle, FileText, Settings } from 'lucide-react';

const BusinessSupportTerminal = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'business', text: 'Our payment processing system has been down for 2 hours. We\'re losing revenue and customers are frustrated.', timestamp: '2:45 PM' },
    { id: 2, sender: 'employee', text: 'I understand this is urgent. Let me check your payment gateway status and help resolve this immediately.', timestamp: '2:46 PM' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const businessInfo = {
    name: 'Elite Catering Co.',
    category: 'Catering Services',
    location: 'Seattle, WA',
    priority: 'Critical',
    issue: 'Payment processing system down',
    accountStatus: 'Premium Partner'
  };

  const suggestedSolutions = [
    { id: 1, title: 'Payment Gateway Reset', description: 'Reset connection to primary payment processor', urgency: 'Immediate' },
    { id: 2, title: 'Backup Payment Method', description: 'Activate secondary payment processing', urgency: 'Quick Fix' },
    { id: 3, title: 'System Health Check', description: 'Run full diagnostic on payment infrastructure', urgency: 'Follow-up' },
    { id: 4, title: 'Customer Communication', description: 'Send automated update to affected customers', urgency: 'Immediate' }
  ];

  const adminCategories = [
    'Technical Escalation',
    'Revenue Impact Issue',
    'Customer Relations Crisis',
    'System Architecture',
    'Legal/Compliance',
    'Other'
  ];

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setAiAnalysis(`SYSTEM ANALYSIS:
• Issue Type: Payment Gateway Failure
• Impact Level: Critical - Revenue Loss Active
• Estimated Downtime: 2+ hours
• Affected Transactions: ~47 pending payments
• Root Cause: API authentication timeout
• Recommended Action: Immediate gateway reset + backup activation
• ETA for Resolution: 15-30 minutes with proper intervention`);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'employee',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const endSession = () => {
    window.history.back();
  };

  const handleAdminRequest = (category: string) => {
    console.log(`Admin support requested for: ${category}`);
    setIsAdminDialogOpen(false);
  };

  const applySolution = (solutionId: number) => {
    console.log(`Applying solution ${solutionId}`);
    // Here you would implement the actual solution application
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Business Support Terminal</h2>
            <div className="flex items-center gap-2 mt-1">
              <Building className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{businessInfo.name}</p>
              <Badge variant="destructive">{businessInfo.priority}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <Phone className="h-3 w-3 mr-1" />
                  Escalate to Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-md">
                <DialogHeader>
                  <DialogTitle>Escalate to Administrator</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {adminCategories.map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      onClick={() => handleAdminRequest(category)}
                      className="text-left justify-start text-xs p-2 h-auto"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm" onClick={endSession} className="text-xs">
              <X className="h-3 w-3 mr-1" />
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Chat Section */}
        <div className="w-full lg:w-1/2 flex flex-col border-r-0 lg:border-r border-border">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'employee' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    message.sender === 'employee'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your response..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {/* Business Info & Solutions */}
          <div className="h-64 sm:h-80 lg:h-1/2 p-4 border-b lg:border-b border-border">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base lg:text-lg">
                  <Settings className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  Business Info & Suggested Solutions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 h-[calc(100%-80px)] overflow-hidden">
                <div className="bg-muted rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><strong>Category:</strong> {businessInfo.category}</div>
                    <div><strong>Status:</strong> {businessInfo.accountStatus}</div>
                    <div><strong>Location:</strong> {businessInfo.location}</div>
                    <div><strong>Issue:</strong> {businessInfo.issue}</div>
                  </div>
                </div>
                <div className="space-y-2 overflow-y-auto max-h-32 lg:max-h-40">
                  {suggestedSolutions.map((solution) => (
                    <div key={solution.id} className="flex justify-between items-center p-2 border border-border rounded text-xs lg:text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{solution.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{solution.description}</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <Badge variant={solution.urgency === 'Immediate' ? 'destructive' : 'secondary'} className="text-xs mb-1">
                          {solution.urgency}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => applySolution(solution.id)} className="text-xs">
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Terminal */}
          <div className="h-64 sm:h-80 lg:h-1/2 p-4">
            <Card className="h-full bg-black text-green-400 font-mono">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm lg:text-base">
                  <AlertCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                  AI BUSINESS SUPPORT TERMINAL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 h-[calc(100%-80px)] overflow-hidden">
                <div className="text-xs">
                  <p>&gt; Analyzing business issue...</p>
                  <p>&gt; Checking system dependencies...</p>
                  <p>&gt; Cross-referencing known solutions...</p>
                  <p>&gt; Analysis complete.</p>
                </div>
                {aiAnalysis && (
                  <div className="bg-gray-900 p-2 lg:p-3 rounded text-xs whitespace-pre-line border border-green-400 overflow-y-auto max-h-24 lg:max-h-32">
                    {aiAnalysis}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <Button size="sm" variant="outline" className="bg-green-900 border-green-400 text-green-400 hover:bg-green-800 text-xs">
                    Execute Fix
                  </Button>
                  <Button size="sm" variant="outline" className="bg-gray-900 border-gray-400 text-gray-400 hover:bg-gray-800 text-xs">
                    New Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSupportTerminal;
