
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Instagram, ExternalLink } from 'lucide-react';

const SocialsSection = () => {
  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/atenra',
      description: 'Follow us for updates and behind-the-scenes content',
      color: 'from-pink-500 to-purple-600'
    },
    {
      name: 'X (Twitter)',
      icon: () => (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: 'https://x.com/atenra',
      description: 'Get real-time updates and industry insights',
      color: 'from-slate-700 to-black'
    },
    {
      name: 'Facebook',
      icon: () => (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: 'https://facebook.com/atenra',
      description: 'Join our community discussions and updates',
      color: 'from-blue-600 to-blue-800'
    },
    {
      name: 'LinkedIn',
      icon: () => (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      url: 'https://linkedin.com/company/atenra',
      description: 'Connect with us professionally and see company updates',
      color: 'from-blue-700 to-blue-900'
    },
    {
      name: 'TikTok',
      icon: () => (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005.76 20.5a6.34 6.34 0 0010.86-4.43V7.56a8.16 8.16 0 004.77 1.17v-3.4a4.85 4.85 0 01-1.8-.64z"/>
        </svg>
      ),
      url: 'https://tiktok.com/@atenra',
      description: 'Watch quick tips and service provider spotlights',
      color: 'from-pink-600 to-red-600'
    }
  ];

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-slate-800 dark:text-stone-100 mb-6 tracking-tight">
            Connect With <span className="bg-gradient-to-r from-amber-700 to-stone-700 dark:from-amber-400 dark:to-stone-300 bg-clip-text text-transparent">Atenra</span>
          </h1>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-stone-400/50 to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-slate-600 dark:text-stone-300 font-light max-w-4xl mx-auto leading-relaxed">
            Stay connected with us across all platforms for updates, insights, and community discussions.
          </p>
        </div>

        {/* Social Media Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {socialLinks.map((social, index) => (
            <Card key={index} className="border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-4 p-3 bg-gradient-to-r ${social.color} rounded-full w-16 h-16 flex items-center justify-center`}>
                  <social.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-light text-slate-800 dark:text-stone-100">{social.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-slate-600 dark:text-stone-300 font-light text-sm leading-relaxed">
                  {social.description}
                </p>
                <a href={social.url} target="_blank" rel="noopener noreferrer">
                  <Button className={`w-full bg-gradient-to-r ${social.color} hover:opacity-90 text-white transition-all duration-300`}>
                    Follow Us
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-amber-50/80 to-stone-50/80 dark:from-amber-900/20 dark:to-stone-900/20 backdrop-blur-sm rounded-2xl p-8 border border-amber-200/30 dark:border-amber-700/30">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-light text-slate-800 dark:text-stone-100 mb-4">
              Direct Contact
            </h2>
            <p className="text-slate-600 dark:text-stone-300 font-light">
              Prefer direct communication? Reach out to us through these channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <Mail className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-stone-100 mb-2">Email Contacts</div>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-stone-400">General: </span>
                      <a href="mailto:info@atenra.com" className="text-amber-700 dark:text-amber-400 hover:underline">info@atenra.com</a>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-stone-400">Support: </span>
                      <a href="mailto:support@atenra.com" className="text-amber-700 dark:text-amber-400 hover:underline">support@atenra.com</a>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-stone-400">Media: </span>
                      <a href="mailto:social@atenra.com" className="text-amber-700 dark:text-amber-400 hover:underline">social@atenra.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-stone-100 dark:bg-stone-900/30 rounded-full">
                  <svg className="h-6 w-6 text-stone-700 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-stone-100 mb-2">Phone Support</div>
                  <a href="tel:18001899294" className="text-amber-700 dark:text-amber-400 hover:underline font-mono text-lg">
                    1-800-189-9294
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialsSection;
