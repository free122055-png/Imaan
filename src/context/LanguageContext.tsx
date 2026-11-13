import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, TranslationKey } from '../i18n/translations';
import { getSettings } from '../services/storeService';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  getL: <T extends Record<string, any>>(obj: T | null | undefined, field: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'aiman_brand_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (saved === 'bn' || saved === 'en') return saved;
      const settings = getSettings();
      return settings.defaultLanguage || 'bn';
    } catch {
      return 'bn';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {
      console.error('Failed to persist language setting:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  // Synchronize document <html lang="...">, title, meta description & fonts
  useEffect(() => {
    document.documentElement.lang = language;

    if (language === 'en') {
      document.documentElement.classList.add('lang-en');
      document.documentElement.classList.remove('lang-bn');
      document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    } else {
      document.documentElement.classList.add('lang-bn');
      document.documentElement.classList.remove('lang-en');
      document.body.style.fontFamily = "'Hind Siliguri', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }

    // Dynamic hreflang tag updates
    let hrefBn = document.querySelector('link[hreflang="bn"]') as HTMLLinkElement;
    if (!hrefBn) {
      hrefBn = document.createElement('link');
      hrefBn.rel = 'alternate';
      hrefBn.hreflang = 'bn';
      document.head.appendChild(hrefBn);
    }
    hrefBn.href = window.location.origin + window.location.pathname;

    let hrefEn = document.querySelector('link[hreflang="en"]') as HTMLLinkElement;
    if (!hrefEn) {
      hrefEn = document.createElement('link');
      hrefEn.rel = 'alternate';
      hrefEn.hreflang = 'en';
      document.head.appendChild(hrefEn);
    }
    hrefEn.href = window.location.origin + window.location.pathname;
  }, [language]);

  // Translation function t(key)
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.bn;
    let val: string = (dict[key] || translations.bn[key] || String(key)) as string;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        val = val.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return val;
  };

  // Helper for bilingual dynamic content getters with seamless fallback
  const getL = <T extends Record<string, any>>(obj: T | null | undefined, field: string): string => {
    if (!obj) return '';

    const enKey = `${field}En`;
    const bnKey = `${field}Bn`;

    if (language === 'en') {
      const enVal = obj[enKey];
      if (typeof enVal === 'string' && enVal.trim().length > 0) {
        return enVal.trim();
      }
      const bnVal = obj[bnKey];
      if (typeof bnVal === 'string' && bnVal.trim().length > 0) {
        return bnVal.trim();
      }
      const defaultVal = obj[field];
      if (typeof defaultVal === 'string' && defaultVal.trim().length > 0) {
        return defaultVal.trim();
      }
    } else {
      const bnVal = obj[bnKey];
      if (typeof bnVal === 'string' && bnVal.trim().length > 0) {
        return bnVal.trim();
      }
      const defaultVal = obj[field];
      if (typeof defaultVal === 'string' && defaultVal.trim().length > 0) {
        return defaultVal.trim();
      }
      const enVal = obj[enKey];
      if (typeof enVal === 'string' && enVal.trim().length > 0) {
        return enVal.trim();
      }
    }

    return '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, getL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
