import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Users, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MarketplaceView = () => {
  const navigate = useNavigate();

  const previouslyUsed = [
    {
      id: 1,
      name: "Elegant Catering Co.",
      category: "Catering",
      rating: 4.8,
      distance: "2.3 miles",
      lastUsed: "2 weeks ago",
      services: ["Wedding Catering", "Corporate Events", "Private Dining"],
      image: "/placeholder.svg",
      featured: true
    },
    {
      id: 2,
      name: "Luxe Interior Design",
      category: "Interior Design",
      rating: 4.9,
      distance: "4.1 miles",
      lastUsed: "1 month ago",
      services: ["Residential Design", "Commercial Spaces", "Color Consultation"],
      image: "/placeholder.svg",
      featured: false
    }
  ];

  const suggested = [
    {
      id: 3,
      name: "Artisan Furniture Studio",
      category: "Furniture",
      rating: 4.7,
      distance: "3.2 miles",
      services: ["Custom Furniture", "Restoration", "Design Consultation"],
      image: "/placeholder.svg",
      matchScore: 92
    },
    {
      id: 4,
      name: "Gourmet Food Truck Co.",
      category: "Food Service",
      rating: 4.6,
      distance: "1.8 miles",
      services: ["Event Catering", "Corporate Lunch", "Private Parties"],
      image: "/placeholder.svg",
      matchScore: 88
    },
    {
      id: 5,
      name: "Professional Photography",
      category: "Photography",
      rating: 4.9,
      distance: "5.5 miles",
      services: ["Event Photography", "Portrait Sessions", "Commercial Shoots"],
      image: "/placeholder.svg",
      matchScore: 85
    },
    {
      id: 6,
      name: "Elite Cleaning Services",
      category: "Cleaning",
      rating: 4.8,
      distance: "2.9 miles",
      services: ["Residential Cleaning", "Post-Event Cleanup", "Deep Cleaning"],
      image: "/placeholder.svg",
      matchScore: 90
    }
  ];

  const BusinessCard = ({ business, showLastUsed = false, showMatchScore = false }: any) => (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border border-border">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img 
          src={business.image} 
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {business.featured && (
          <Badge className="absolute top-3 left-3 bg-gold text-charcoal">
            Previously Used
          </Badge>
        )}
        {showMatchScore && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
            {business.matchScore}% Match
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {business.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {business.category}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="text-sm font-medium text-foreground">{business.rating}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{business.distance}</span>
          </div>
          {showLastUsed && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{business.lastUsed}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Available Services:</h4>
          <div className="flex flex-wrap gap-2">
            {business.services.slice(0, 3).map((service: string, index: number) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* Discover Button */}
      <div className="flex justify-center mb-8">
        <Button 
          onClick={() => navigate('/discover')}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Compass className="h-5 w-5 mr-2" />
          Discover New Businesses
        </Button>
      </div>

      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="inline-block mb-4">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-600/30 to-transparent"></div>
        </div>
        <h1 className="text-3xl md:text-4xl font-light text-slate-800 dark:text-stone-100 tracking-tight">
          Welcome to Your Marketplace
        </h1>
        <p className="text-lg text-slate-600 dark:text-stone-300 font-light max-w-2xl mx-auto">
          Discover premium services tailored to your preferences, reconnect with trusted providers, and explore new opportunities.
        </p>
      </div>

      {/* Previously Used Section */}
      {previouslyUsed.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Previously Used</h2>
              <p className="text-muted-foreground">Services you've enjoyed before</p>
            </div>
            <Button variant="outline" className="border-border text-foreground hover:bg-accent">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {previouslyUsed.map((business) => (
              <BusinessCard 
                key={business.id} 
                business={business} 
                showLastUsed={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Suggested for You Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Suggested for You</h2>
            <p className="text-muted-foreground">New services matched to your interests</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Based on your preferences</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {suggested.map((business) => (
            <BusinessCard 
              key={business.id} 
              business={business} 
              showMatchScore={true}
            />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <div className="text-center py-8 space-y-4">
        <div className="inline-block mb-6">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400/50 to-transparent"></div>
        </div>
        <h3 className="text-xl font-light text-foreground">Looking for something specific?</h3>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-amber-700 to-stone-700 hover:from-amber-600 hover:to-stone-600 text-white px-10 py-3 font-light tracking-wide shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Browse All Categories
        </Button>
      </div>
    </div>
  );
};

export default MarketplaceView;
