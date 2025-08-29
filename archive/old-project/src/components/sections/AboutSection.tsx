
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Zap, Clock, Home, Truck, Dumbbell, Car, Wrench, Globe } from 'lucide-react';

const AboutSection = () => {
  const services = [
    { icon: Home, name: "Home Repairs", description: "Professional home maintenance and repairs" },
    { icon: Truck, name: "Logistics", description: "Moving, delivery, and transportation services" },
    { icon: Dumbbell, name: "Wellness", description: "Personal training, therapy, and health services" },
    { icon: Car, name: "Vehicle Services", description: "Auto repair, detailing, and maintenance" },
    { icon: Wrench, name: "Professional Services", description: "Legal, financial, and consulting services" },
    { icon: Globe, name: "& More", description: "Expanding catalog of trusted service providers" }
  ];

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Mission Statement */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-slate-800 dark:text-stone-100 mb-6 tracking-tight">
            About <span className="bg-gradient-to-r from-amber-700 to-stone-700 dark:from-amber-400 dark:to-stone-300 bg-clip-text text-transparent">Atenra</span>
          </h1>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-stone-400/50 to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-slate-600 dark:text-stone-300 font-light max-w-4xl mx-auto leading-relaxed">
            Our mission is to revolutionize how people connect with trusted service providers through human-first matching, 
            cutting-edge technology, and unwavering commitment to privacy and results.
          </p>
        </div>

        {/* Company History */}
        <div className="mb-16">
          <Card className="border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-light text-slate-800 dark:text-stone-100">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-3">Founded on Trust</h3>
                  <p className="text-slate-600 dark:text-stone-300 font-light leading-relaxed">
                    Atenra was born from the frustration of endless searching, comparing, and uncertainty when finding reliable service providers. 
                    We recognized that people deserved a better way—one that prioritized human connection and expert curation over automated algorithms.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-3">Human-First Approach</h3>
                  <p className="text-slate-600 dark:text-stone-300 font-light leading-relaxed">
                    Every match is carefully evaluated by our team of experts who understand local markets, service quality, and client needs. 
                    We combine this human insight with advanced technology to deliver results that exceed expectations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-light text-slate-800 dark:text-stone-100 mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Privacy First", desc: "Your data is never sold or compromised" },
              { icon: Users, title: "Human Connection", desc: "Real people guiding every match" },
              { icon: Zap, title: "Efficiency", desc: "Results delivered in minutes, not days" },
              { icon: Clock, title: "Reliability", desc: "Consistent quality you can trust" }
            ].map((value, index) => (
              <Card key={index} className="border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm text-center">
                <CardContent className="pt-6">
                  <value.icon className="h-8 w-8 text-amber-700 dark:text-amber-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-800 dark:text-stone-100 mb-2">{value.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-300 font-light">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Supported Services */}
        <div>
          <h2 className="text-3xl font-light text-slate-800 dark:text-stone-100 mb-8 text-center">Supported Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-amber-100 to-stone-100 dark:from-amber-900/30 dark:to-stone-900/30 rounded-full">
                      <service.icon className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-stone-100 mb-2">{service.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-stone-300 font-light leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
