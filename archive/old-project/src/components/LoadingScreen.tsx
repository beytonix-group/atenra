
import React, { useEffect, useState } from 'react';
import { Brain, Users, Building, Zap } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  onComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Setting up your experience...", 
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Brain, text: "Initializing AI matching..." },
    { icon: Users, text: "Connecting to network..." },
    { icon: Building, text: "Loading your dashboard..." },
    { icon: Zap, text: "Finalizing setup..." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 2;
        const stepIndex = Math.floor(newProgress / 25);
        setCurrentStep(Math.min(stepIndex, steps.length - 1));
        
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary to-secondary rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-secondary to-accent rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2 animate-pulse"></div>
      </div>

      <div className="text-center relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-foreground mb-4 tracking-tight">
            <span className="gradient-text-luxury font-extralight">
              Atenra
            </span>
          </h1>
        </div>

        {/* Current Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
                    ${isActive ? 'bg-primary text-primary-foreground border-primary animate-pulse' : 
                      isCompleted ? 'bg-secondary text-secondary-foreground border-secondary' : 
                      'bg-muted text-muted-foreground border-border'}
                  `}>
                    <Icon className={`h-6 w-6 ${isActive ? 'animate-spin' : ''}`} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-16 h-px mx-2 transition-all duration-300
                      ${isCompleted ? 'bg-secondary' : 'bg-border'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
          
          <p className="text-lg text-foreground font-light">
            {steps[currentStep]?.text}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-80 mx-auto mb-6">
          <div className="w-full bg-muted rounded-full h-2 border border-border">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 font-light">
            {progress}% complete
          </p>
        </div>

        {/* Loading Message */}
        <p className="text-muted-foreground font-light">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
