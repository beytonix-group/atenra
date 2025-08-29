
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, Star, DollarSign, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from './DashboardLayout';

interface ServiceCard {
  id: number;
  businessName: string;
  serviceType: string;
  description: string;
  price: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  imageUrl: string;
  tags: string[];
  availability: string;
}

const SwipeInterface = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const services: ServiceCard[] = [
    {
      id: 1,
      businessName: "Elite Catering Co.",
      serviceType: "Premium Catering",
      description: "Luxury catering services for weddings, corporate events, and special occasions. Farm-to-table ingredients with world-class presentation.",
      price: "$75-150/person",
      rating: 4.9,
      reviews: 124,
      location: "Downtown District",
      distance: "2.3 miles",
      imageUrl: "/placeholder.svg",
      tags: ["Premium", "Farm-to-table", "Full Service"],
      availability: "Next available: Tomorrow"
    },
    {
      id: 2,
      businessName: "Modern Interior Design",
      serviceType: "Interior Design",
      description: "Contemporary interior design for homes and offices. Specializing in minimalist and modern aesthetics with sustainable materials.",
      price: "$5,000-25,000",
      rating: 4.7,
      reviews: 89,
      location: "Arts Quarter",
      distance: "4.1 miles",
      imageUrl: "/placeholder.svg",
      tags: ["Modern", "Sustainable", "Residential"],
      availability: "Next available: Next week"
    },
    {
      id: 3,
      businessName: "FitLife Personal Training",
      serviceType: "Personal Training",
      description: "One-on-one fitness coaching with certified trainers. Customized workout plans and nutritional guidance for all fitness levels.",
      price: "$80-120/session",
      rating: 4.8,
      reviews: 156,
      location: "Health District",
      distance: "1.8 miles",
      imageUrl: "/placeholder.svg",
      tags: ["Certified", "Nutrition", "Custom Plans"],
      availability: "Next available: Today"
    }
  ];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const card = cardRef.current;
    
    if (card) {
      card.style.transform = `translateX(${direction === 'right' ? '100%' : '-100%'}) rotate(${direction === 'right' ? '20deg' : '-20deg'})`;
      card.style.opacity = '0';
      
      setTimeout(() => {
        if (direction === 'right') {
          toast({
            title: "Service Appreciated ✨",
            description: `You've shown interest in ${services[currentIndex].businessName}`,
          });
        }
        
        setCurrentIndex(prev => (prev + 1) % services.length);
        
        if (card) {
          card.style.transform = 'translateX(0) rotate(0)';
          card.style.opacity = '1';
        }
        
        setIsAnimating(false);
      }, 300);
    }
  };

  const currentService = services[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-stone-900">
      {/* Elegant background elements */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-amber-600 to-stone-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-slate-600 to-amber-600 rounded-full blur-3xl"></div>
      </div>

      <DashboardLayout title="Discover Curated Services">
        <div className="max-w-md mx-auto p-4 relative">
          {/* Refined header */}
          <div className="mb-8 flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard/client')}
              className="flex items-center text-slate-600 dark:text-stone-300 hover:text-slate-800 dark:hover:text-stone-100 font-light tracking-wide"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return
            </Button>
            <div className="text-sm text-slate-500 dark:text-stone-400 font-light">
              {currentIndex + 1} of {services.length}
            </div>
          </div>

          {/* Elegant service card */}
          <div className="relative h-[650px] mb-8">
            <Card 
              ref={cardRef}
              className="absolute inset-0 transition-all duration-500 ease-out cursor-grab active:cursor-grabbing shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div 
                className="h-56 bg-cover bg-center rounded-t-lg relative overflow-hidden"
                style={{ backgroundImage: `url(${currentService.imageUrl})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-light tracking-wide mb-1">{currentService.businessName}</h3>
                  <p className="text-sm opacity-90 font-light">{currentService.serviceType}</p>
                </div>
              </div>

              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                        <span className="font-medium text-amber-700 dark:text-amber-300">{currentService.rating}</span>
                        <span className="text-amber-600/70 dark:text-amber-400/70 text-sm ml-1">({currentService.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center text-slate-500 dark:text-stone-400 text-sm mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="font-light">{currentService.location} • {currentService.distance}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-slate-700 dark:text-stone-300 font-medium bg-stone-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {currentService.price}
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-stone-300 leading-relaxed font-light">
                  {currentService.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {currentService.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs font-light bg-stone-100 dark:bg-slate-700 text-stone-700 dark:text-stone-300 border-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center text-sm text-slate-600 dark:text-stone-300 bg-stone-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <Clock className="h-4 w-4 mr-3 text-stone-500 dark:text-stone-400" />
                  <span className="font-light">{currentService.availability}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Refined swipe controls */}
          <div className="flex justify-center space-x-12">
            <Button
              size="lg"
              variant="outline"
              className="w-20 h-20 rounded-full border-2 border-stone-200 dark:border-slate-600 hover:border-stone-400 dark:hover:border-slate-500 hover:bg-stone-50 dark:hover:bg-slate-700 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => handleSwipe('left')}
              disabled={isAnimating}
            >
              <X className="h-8 w-8 text-stone-500 dark:text-stone-400" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="w-20 h-20 rounded-full border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => handleSwipe('right')}
              disabled={isAnimating}
            >
              <Heart className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </Button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-500 dark:text-stone-400 font-light tracking-wide">
              Express interest or continue exploring
            </p>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default SwipeInterface;
