
import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { getCurrentLanguage, setCurrentLanguage } from '../utils/translations';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

interface LanguageSelectorProps {
  onLanguageChange?: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setCurrentLang(getCurrentLanguage());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    setCurrentLang(langCode);
    setCurrentLanguage(langCode);
    setIsOpen(false);
    
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors duration-200 border border-border/50"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-background/95 backdrop-blur-lg border border-border rounded-lg shadow-lg z-50">
          <div className="py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors duration-200 flex items-center space-x-3 ${
                  currentLang === language.code ? 'bg-muted/30 text-primary' : 'text-foreground'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="text-sm font-medium">{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
