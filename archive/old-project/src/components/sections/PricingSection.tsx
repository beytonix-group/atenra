
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { CheckCircle, Award, Crown, Gem, Calendar, DollarSign, Building, TrendingUp } from 'lucide-react';

const PricingSection = () => {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-slate-800 dark:text-stone-100 mb-6 tracking-tight">
            Simple <span className="bg-gradient-to-r from-amber-700 to-stone-700 dark:from-amber-400 dark:to-stone-300 bg-clip-text text-transparent">Pricing</span>
          </h1>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-stone-400/50 to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-slate-600 dark:text-stone-300 font-light max-w-4xl mx-auto leading-relaxed">
            Transparent pricing for clients and businesses with no hidden fees or long-term contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Client Plans */}
          <div>
            <h2 className="text-3xl font-light text-slate-800 dark:text-stone-100 mb-8 text-center">
              For Clients
            </h2>
            <div className="space-y-6">
              {/* Basic Tier */}
              <Card className="border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-stone-100 to-slate-100 dark:from-stone-900/30 dark:to-slate-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                    <Award className="h-8 w-8 text-stone-600 dark:text-stone-400" />
                  </div>
                  <CardTitle className="text-2xl font-light text-slate-800 dark:text-stone-100">Basic</CardTitle>
                  <div className="text-3xl font-light text-amber-700 dark:text-amber-400 mb-2">$54</div>
                  <div className="text-sm text-slate-500 dark:text-stone-400">per month</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-stone-300">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Lower service fees
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Quality matching service
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Standard support
                    </li>
                  </ul>
                  <Link to="/register">
                    <Button className="w-full bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-500 hover:to-slate-500 text-white">
                      Start Basic Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Advanced Tier */}
              <Card className="border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-br from-amber-50/50 to-stone-50/50 dark:from-amber-900/20 dark:to-stone-900/20 backdrop-blur-sm relative">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white">
                  Most Popular
                </Badge>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-amber-100 to-stone-100 dark:from-amber-900/30 dark:to-stone-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-amber-700 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-2xl font-light text-slate-800 dark:text-stone-100">Advanced</CardTitle>
                  <div className="text-3xl font-light text-amber-700 dark:text-amber-400 mb-2">$100.80</div>
                  <div className="text-sm text-slate-500 dark:text-stone-400">per month</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-stone-300">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Under 7% service fees
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Enhanced matching system
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Priority support
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Detailed tracking
                    </li>
                  </ul>
                  <Link to="/register">
                    <Button className="w-full bg-gradient-to-r from-amber-700 to-stone-700 hover:from-amber-600 hover:to-stone-600 text-white">
                      Start Advanced Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Elite Tier */}
              <Card className="border-stone-200/50 dark:border-stone-700/50 bg-gradient-to-br from-stone-50/50 to-slate-50/50 dark:from-stone-900/20 dark:to-slate-900/20 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-stone-100 to-slate-100 dark:from-stone-900/30 dark:to-slate-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                    <Gem className="h-8 w-8 text-slate-700 dark:text-slate-400" />
                  </div>
                  <CardTitle className="text-2xl font-light text-slate-800 dark:text-stone-100">Elite</CardTitle>
                  <div className="text-3xl font-light text-amber-700 dark:text-amber-400 mb-2">$180</div>
                  <div className="text-sm text-slate-500 dark:text-stone-400">per month</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-stone-300">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      3% fee or less
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      White-glove service
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Dedicated manager
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      24/7 priority support
                    </li>
                  </ul>
                  <Link to="/register">
                    <Button className="w-full bg-gradient-to-r from-slate-700 to-stone-700 hover:from-slate-600 hover:to-stone-600 text-white">
                      Start Elite Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Business Plans */}
          <div>
            <h2 className="text-3xl font-light text-slate-800 dark:text-stone-100 mb-8 text-center">
              For Businesses
            </h2>
            
            {/* Trial Program */}
            <Card className="border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-br from-amber-50/30 to-stone-50/30 dark:from-amber-900/10 dark:to-stone-900/10 backdrop-blur-sm mb-6">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-2">
                RISK-FREE TRIAL
              </Badge>
              <CardHeader className="text-center pb-4 pt-8">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-amber-700 dark:text-amber-400" />
                </div>
                <CardTitle className="text-2xl font-light text-slate-800 dark:text-stone-100">3-Month Trial</CardTitle>
                <div className="text-4xl font-light text-amber-700 dark:text-amber-400 mb-2">$180</div>
                <div className="text-sm text-slate-500 dark:text-stone-400">per month for 3 months</div>
                <Badge variant="outline" className="text-green-700 border-green-700 dark:text-green-400 dark:border-green-400 mt-2">
                  Full Refund Guarantee
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200/50 dark:border-green-800/50 mb-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Full Refund Policy
                  </h4>
                  <p className="text-green-700 dark:text-green-400 text-xs leading-relaxed">
                    Complete refund if our platform doesn't meet expectations set during onboarding.
                  </p>
                </div>
                <Link to="/business-registration">
                  <Button className="w-full bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-600 hover:to-orange-600 text-white">
                    Start Your Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Partnership Plans */}
            <div className="space-y-4">
              <h3 className="text-xl font-light text-slate-800 dark:text-stone-100 mb-4 text-center">
                Partnership Plans
              </h3>
              
              <Card className="border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto mb-3 p-2 bg-gradient-to-br from-stone-100 to-slate-100 dark:from-stone-900/30 dark:to-slate-900/30 rounded-full w-12 h-12 flex items-center justify-center">
                    <Building className="h-6 w-6 text-stone-600 dark:text-stone-400" />
                  </div>
                  <CardTitle className="text-lg font-light text-slate-800 dark:text-stone-100">Essential</CardTitle>
                  <div className="text-xl font-light text-amber-700 dark:text-amber-400">$150-200</div>
                  <div className="text-xs text-slate-500 dark:text-stone-400">per month</div>
                </CardHeader>
                <CardContent>
                  <Link to="/business-registration">
                    <Button size="sm" className="w-full bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-500 hover:to-slate-500 text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-br from-amber-50/50 to-stone-50/50 dark:from-amber-900/20 dark:to-stone-900/20 backdrop-blur-sm">
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto mb-3 p-2 bg-gradient-to-br from-amber-100 to-stone-100 dark:from-amber-900/30 dark:to-stone-900/30 rounded-full w-12 h-12 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-lg font-light text-slate-800 dark:text-stone-100">Growth</CardTitle>
                  <div className="text-xl font-light text-amber-700 dark:text-amber-400">$250-350</div>
                  <div className="text-xs text-slate-500 dark:text-stone-400">per month</div>
                </CardHeader>
                <CardContent>
                  <Link to="/business-registration">
                    <Button size="sm" className="w-full bg-gradient-to-r from-amber-700 to-stone-700 hover:from-amber-600 hover:to-stone-600 text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-stone-200/50 dark:border-stone-700/50 bg-gradient-to-br from-stone-50/50 to-slate-50/50 dark:from-stone-900/20 dark:to-slate-900/20 backdrop-blur-sm">
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto mb-3 p-2 bg-gradient-to-br from-stone-100 to-slate-100 dark:from-stone-900/30 dark:to-slate-900/30 rounded-full w-12 h-12 flex items-center justify-center">
                    <Crown className="h-6 w-6 text-slate-700 dark:text-slate-400" />
                  </div>
                  <CardTitle className="text-lg font-light text-slate-800 dark:text-stone-100">Enterprise</CardTitle>
                  <div className="text-xl font-light text-amber-700 dark:text-amber-400">$350-400</div>
                  <div className="text-xs text-slate-500 dark:text-stone-400">per month</div>
                </CardHeader>
                <CardContent>
                  <Link to="/business-registration">
                    <Button size="sm" className="w-full bg-gradient-to-r from-slate-700 to-stone-700 hover:from-slate-600 hover:to-stone-600 text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* No Contracts Notice */}
        <div className="text-center mt-12">
          <p className="text-slate-600 dark:text-stone-300 font-light">
            No long-term contracts. Cancel anytime. All plans include privacy protection and dedicated support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
