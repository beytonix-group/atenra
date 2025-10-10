"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Translations, LanguageCode } from "./translations";
import { newTranslations, NewTranslations } from "./new-translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  nt: NewTranslations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("atenra-language") as LanguageCode;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    } else {
      const browserLang = navigator.language.split("-")[0] as LanguageCode;
      if (translations[browserLang]) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("atenra-language", lang);
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
    nt: newTranslations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}