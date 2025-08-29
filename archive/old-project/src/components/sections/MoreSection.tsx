
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, FileText, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const MoreSection = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does Atenra's matching process work?",
      answer: "Our human experts review your specific needs and location, then use our proprietary system to identify the best service providers. Each match is personally vetted and tailored to your requirements, ensuring quality and compatibility."
    },
    {
      question: "What makes Atenra different from other service platforms?",
      answer: "Unlike automated platforms, every Atenra match is curated by real people who understand local markets and service quality. We prioritize privacy, never sell your data, and focus on long-term relationships rather than quick transactions."
    },
    {
      question: "How quickly can I get matched with a service provider?",
      answer: "Most matches are completed within minutes to a few hours, depending on the complexity of your request and provider availability. Our human-first approach ensures speed without compromising quality."
    },
    {
      question: "What if I'm not satisfied with a match?",
      answer: "We stand behind every match with our satisfaction guarantee. If a provider doesn't meet expectations, we'll work to find a better fit at no additional cost. Business trial subscribers also have access to our full refund policy."
    },
    {
      question: "How does pricing work?",
      answer: "Our transparent pricing varies by subscription tier, with service fees ranging from 3% to standard rates. There are no hidden costs, and you can cancel anytime. Business partnerships include trial periods with satisfaction guarantees."
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely. We use enterprise-grade encryption, never sell your data, and maintain strict privacy protocols. Your information is used solely to improve matching quality and is never shared without explicit consent."
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-slate-800 dark:text-stone-100 mb-6 tracking-tight">
            More <span className="bg-gradient-to-r from-amber-700 to-stone-700 dark:from-amber-400 dark:to-stone-300 bg-clip-text text-transparent">Information</span>
          </h1>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-stone-400/50 to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-slate-600 dark:text-stone-300 font-light max-w-4xl mx-auto leading-relaxed">
            Everything you need to know about using Atenra, our policies, and legal information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-light text-slate-800 dark:text-stone-100 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
                  <CardHeader 
                    className="cursor-pointer hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors duration-200"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-light text-slate-800 dark:text-stone-100 text-left">
                        {faq.question}
                      </CardTitle>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  {expandedFaq === index && (
                    <CardContent className="pt-0">
                      <p className="text-slate-600 dark:text-stone-300 font-light leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Legal & Privacy Sidebar */}
          <div className="space-y-6">
            <h2 className="text-3xl font-light text-slate-800 dark:text-stone-100 mb-6">
              Legal & Privacy
            </h2>

            {/* Privacy Guarantees */}
            <Card className="border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-3 p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full w-12 h-12 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-700 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg font-light text-slate-800 dark:text-stone-100 text-center">Privacy Guarantees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <Lock className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-stone-100">End-to-End Encryption</div>
                    <div className="text-slate-600 dark:text-stone-300 font-light">All data is fully encrypted</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-stone-100">Never Sold</div>
                    <div className="text-slate-600 dark:text-stone-300 font-light">Data is never shared or sold</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <HelpCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-stone-100">Internal Use Only</div>
                    <div className="text-slate-600 dark:text-stone-300 font-light">Used only to improve matching</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Documents */}
            <Card className="border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-3 p-3 bg-gradient-to-br from-amber-100 to-stone-100 dark:from-amber-900/30 dark:to-stone-900/30 rounded-full w-12 h-12 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg font-light text-slate-800 dark:text-stone-100 text-center">Legal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="#" className="block p-3 rounded-lg hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-colors duration-200">
                  <div className="font-semibold text-slate-800 dark:text-stone-100 text-sm mb-1">Terms of Service</div>
                  <div className="text-xs text-slate-600 dark:text-stone-300 font-light">User agreement and service terms</div>
                </a>
                <a href="#" className="block p-3 rounded-lg hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-colors duration-200">
                  <div className="font-semibold text-slate-800 dark:text-stone-100 text-sm mb-1">Privacy Policy</div>
                  <div className="text-xs text-slate-600 dark:text-stone-300 font-light">Data handling and privacy practices</div>
                </a>
                <a href="#" className="block p-3 rounded-lg hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-colors duration-200">
                  <div className="font-semibold text-slate-800 dark:text-stone-100 text-sm mb-1">Business Agreement</div>
                  <div className="text-xs text-slate-600 dark:text-stone-300 font-light">Partnership terms and conditions</div>
                </a>
                <a href="#" className="block p-3 rounded-lg hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-colors duration-200">
                  <div className="font-semibold text-slate-800 dark:text-stone-100 text-sm mb-1">Refund Policy</div>
                  <div className="text-xs text-slate-600 dark:text-stone-300 font-light">Money-back guarantee details</div>
                </a>
              </CardContent>
            </Card>

            {/* Contact for Legal */}
            <Card className="border-stone-200/50 dark:border-stone-700/50 bg-gradient-to-br from-stone-50/50 to-slate-50/50 dark:from-stone-900/20 dark:to-slate-900/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-slate-800 dark:text-stone-100 mb-2">Legal Questions?</h3>
                <p className="text-sm text-slate-600 dark:text-stone-300 font-light mb-3">
                  Contact our legal team for any questions about terms, privacy, or compliance.
                </p>
                <a href="mailto:legal@atenra.com" className="text-amber-700 dark:text-amber-400 hover:underline text-sm font-medium">
                  legal@atenra.com
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreSection;
