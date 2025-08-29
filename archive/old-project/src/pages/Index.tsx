
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X, Check, Star, Shield, Crown } from 'lucide-react';
import AboutSection from '@/components/sections/AboutSection';
import PricingSection from '@/components/sections/PricingSection';
import SocialsSection from '@/components/sections/SocialsSection';
import MoreSection from '@/components/sections/MoreSection';
import LanguageSelector from '@/components/LanguageSelector';
import { t } from '@/utils/translations';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleLanguageChange = () => {
      forceUpdate({}); // Force re-render when language changes
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'about':
        return <AboutSection />;
      case 'pricing':
        return <PricingSection />;
      case 'socials':
        return <SocialsSection />;
      case 'more':
        return <MoreSection />;
      default:
        return <MainLandingContent />;
    }
  };

  const menuItems = [
    { key: 'about', title: t('about'), desc: t('aboutDesc') },
    { key: 'pricing', title: t('pricing'), desc: t('pricingDesc') },
    { key: 'socials', title: t('socials'), desc: t('socialsDesc') },
    { key: 'more', title: t('more'), desc: t('moreDesc') }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-xl border-b border-border' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleMenu}
                className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <button
                onClick={() => handleSectionChange('home')}
                className="text-2xl font-bold text-foreground"
              >
                Atenra
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="font-medium">
                  {t('signIn')}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="font-medium rounded-xl">
                  {t('getStarted')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-background border-b border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSectionChange(item.key)}
                    className="text-left p-4 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="font-semibold text-foreground mb-2">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="relative">
        {renderActiveSection()}
      </main>
    </div>
  );
};

// Main Landing Content Component
const MainLandingContent = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({}); // Force re-render when language changes
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const subscriptionTiers = [
    {
      id: 'free',
      name: 'Guest Access',
      tier: 'Tier 4',
      price: '$0',
      period: 'month',
      label: 'Get Started – Limited Access',
      icon: <Star className="h-8 w-8" />,
      features: [
        'Basic dashboard (demo-only)',
        'Access to public documentation',
        'Community forum access',
        'Tutorial library access'
      ],
      cta: 'Try Free',
      popular: false,
      theme: 'default'
    },
    {
      id: 'standard',
      name: 'Essentials',
      tier: 'Tier 3',
      price: '$49',
      period: 'month',
      label: 'Contributor Plan – Active Workspace',
      icon: <Check className="h-8 w-8" />,
      features: [
        'Project participation tools',
        'Internal project dashboards',
        'Contribution tracking & KPI view',
        'Direct support access',
        'Task assignments & team chats'
      ],
      cta: 'Start Contributing',
      popular: true,
      theme: 'popular'
    },
    {
      id: 'pro',
      name: 'Premium',
      tier: 'Tier 2',
      price: '$99',
      period: 'month',
      label: 'Team Lead Plan – Tactical Control',
      icon: <Shield className="h-8 w-8" />,
      features: [
        'Everything in Essentials, plus:',
        'Custom analytics & reporting',
        'Role-based user management',
        'Voting rights on operations',
        'Multi-project access control'
      ],
      cta: 'Lead with Atenra',
      popular: false,
      theme: 'professional'
    },
    {
      id: 'enterprise',
      name: 'Executive',
      tier: 'Tier 1',
      price: '$199',
      period: 'month',
      label: 'Executive Access – Full Ecosystem Control',
      icon: <Crown className="h-8 w-8" />,
      features: [
        'Full platform access (all dashboards)',
        'Policy & fund decision voting',
        'Cross-tier user management',
        'Inter-entity governance visibility',
        'Capital allocation tools'
      ],
      cta: 'Access Full Control',
      popular: false,
      theme: 'executive'
    }
  ];

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-16 sm:py-24">
          <div className="atenra-logo-container mb-12">
            <div className="atenra-logo-background"></div>
            <div className="atenra-logo-rings">
              <div className="atenra-ring-1"></div>
              <div className="atenra-ring-2"></div>
              <div className="atenra-ring-3"></div>
            </div>
            <h1 className="atenra-logo-text text-6xl sm:text-7xl lg:text-8xl font-bold text-foreground tracking-tight relative z-10">
              <span className="atenra-logo-letters">
                <span className="letter">A</span>
                <span className="letter">t</span>
                <span className="letter">e</span>
                <span className="letter">n</span>
                <span className="letter">r</span>
                <span className="letter">a</span>
              </span>
            </h1>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {t('heroTitle')}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <p className="text-lg text-muted-foreground">
              {t('beginReferral')}
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Choose Your Access Level
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four tiers of professional access designed for every level of engagement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionTiers.map((tier) => (
              <div key={tier.id} className={`relative ${tier.popular ? 'ring-2 ring-primary' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="bg-card rounded-2xl border border-border p-6 h-full">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-6">
                    <div className="text-primary">
                      {tier.icon}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {tier.tier}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tier.label}</p>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/register" className="block">
                    <Button 
                      className={`w-full rounded-xl font-semibold ${
                        tier.popular ? 'bg-primary hover:bg-primary/90' : 
                        tier.theme === 'executive' ? 'bg-secondary hover:bg-secondary/90' :
                        'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Section */}
        <div className="py-16">
          <div className="bg-card rounded-2xl border border-border p-8 sm:p-12 text-center max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {t('businessPartnership')}
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t('businessDesc')}
            </p>
            <Link to="/business-registration">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-xl">
                {t('startBusinessTrial')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="py-16">
          <div className="bg-card rounded-2xl border border-border p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-bold text-foreground mb-6">{t('contact')}</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground">{t('general')}</span>
                    <a href="mailto:info@atenra.com" className="text-primary font-semibold hover:underline">
                      info@atenra.com
                    </a>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground">{t('support')}</span>
                    <a href="mailto:support@atenra.com" className="text-primary font-semibold hover:underline">
                      support@atenra.com
                    </a>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground">{t('media')}</span>
                    <a href="mailto:media@atenra.com" className="text-primary font-semibold hover:underline">
                      media@atenra.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xl font-bold text-foreground mb-6">{t('connect')}</h4>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'X', url: 'https://x.com/atenra' },
                    { name: 'TikTok', url: 'https://tiktok.com/@atenra' },
                    { name: 'Instagram', url: 'https://instagram.com/atenra' },
                    { name: 'LinkedIn', url: 'https://linkedin.com/company/atenra' },
                    { name: 'Facebook', url: 'https://facebook.com/atenra' }
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-muted/50 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted transition-colors font-medium"
                    >
                      {social.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-center pt-8 mt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">{t('copyright')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
