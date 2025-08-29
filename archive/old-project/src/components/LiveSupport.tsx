
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Send, Phone, X, AlertCircle } from 'lucide-react';

const LiveSupport = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'client', text: 'Hi, I need help finding a catering service for my wedding next month.', timestamp: '2:45 PM' },
    { id: 2, sender: 'employee', text: 'Hello! I\'d be happy to help you find the perfect catering service. What type of cuisine are you looking for?', timestamp: '2:46 PM' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const clientInfo = {
    name: 'Sarah Johnson',
    location: 'Downtown Seattle, WA',
    coordinates: { lat: 47.6062, lng: -122.3321 }
  };

  const nearbyPartners = [
    { id: 1, name: 'Elite Catering Co.', distance: '0.8 miles', specialty: 'Wedding Catering', rating: 4.9 },
    { id: 2, name: 'Pacific Northwest Cuisine', distance: '1.2 miles', specialty: 'Local Ingredients', rating: 4.7 },
    { id: 3, name: 'Luxury Events Catering', distance: '1.5 miles', specialty: 'High-End Events', rating: 4.8 },
    { id: 4, name: 'Garden Fresh Catering', distance: '2.1 miles', specialty: 'Organic Options', rating: 4.6 }
  ];

  const adminCategories = [
    'Technical Issue',
    'Payment Problem',
    'Service Quality Concern',
    'Urgent Client Need',
    'Partner Availability',
    'Other'
  ];

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setAiSuggestion(`RECOMMENDATION: Elite Catering Co. - Best match based on:
• Specializes in wedding catering (100% match)
• Excellent rating (4.9/5) from 200+ reviews
• Available for next month bookings
• Price range aligns with client's budget preferences
• Located within client's preferred radius (0.8 miles)`);
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
    // Navigate back to employee dashboard
    window.history.back();
  };

  const handleAdminRequest = (category: string) => {
    console.log(`Admin support requested for: ${category}`);
    setIsAdminDialogOpen(false);
    // Here you would implement the actual admin notification system
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Live Support Session</h2>
            <p className="text-sm text-muted-foreground">Client: {clientInfo.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <Phone className="h-3 w-3 mr-1" />
                  Call Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Administrator Support</DialogTitle>
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

      {/* Main Content - Two Column Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Half - Chat Section */}
        <div className="w-1/2 flex flex-col border-r border-border">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'employee' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg ${
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
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Half - Split vertically */}
        <div className="w-1/2 flex flex-col">
          {/* Top Right - Map and Partners Section */}
          <div className="h-1/2 p-4 border-b border-border">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <MapPin className="h-4 w-4 mr-2" />
                  Client Location & Nearby Partners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 h-[calc(100%-80px)] overflow-hidden">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-sm font-medium">{clientInfo.location}</p>
                  <p className="text-xs text-muted-foreground">Map integration would display here</p>
                </div>
                <div className="space-y-2 overflow-y-auto max-h-48">
                  {nearbyPartners.map((partner) => (
                    <div key={partner.id} className="flex justify-between items-center p-2 border border-border rounded text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{partner.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{partner.specialty}</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <Badge variant="secondary" className="text-xs mb-1">
                          {partner.distance}
                        </Badge>
                        <p className="text-xs">★ {partner.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Right - AI Terminal Section */}
          <div className="h-1/2 p-4">
            <Card className="h-full bg-black text-green-400 font-mono">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <AlertCircle className="h-3 w-3 mr-2" />
                  AI PARTNER MATCHING TERMINAL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 h-[calc(100%-80px)] overflow-hidden">
                <div className="text-xs">
                  <p>&gt; Analyzing client requirements...</p>
                  <p>&gt; Cross-referencing partner database...</p>
                  <p>&gt; Calculating compatibility scores...</p>
                  <p>&gt; Analysis complete.</p>
                </div>
                {aiSuggestion && (
                  <div className="bg-gray-900 p-2 rounded text-xs whitespace-pre-line border border-green-400 overflow-y-auto max-h-32">
                    {aiSuggestion}
                  </div>
                )}
                <div className="flex flex-col gap-2 mt-3">
                  <Button size="sm" variant="outline" className="bg-green-900 border-green-400 text-green-400 hover:bg-green-800 text-xs">
                    Send Recommendation
                  </Button>
                  <Button size="sm" variant="outline" className="bg-gray-900 border-gray-400 text-gray-400 hover:bg-gray-800 text-xs">
                    Request New Analysis
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

export default LiveSupport;
