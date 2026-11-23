import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PaymentMethod, TaxCategory } from '../types/daribati';
import {
  BID_TRANSLATIONS,
  formatLocalizedCompactDH,
  formatLocalizedDH,
  getCurrencyUnit,
  getLocaleDirection,
  Locale,
  PAYMENT_METHOD_TRANSLATIONS,
  SECTOR_TRANSLATIONS,
  SUB_SECTOR_TRANSLATIONS,
  TAX_CATEGORY_TRANSLATIONS,
  TENDER_TRANSLATIONS,
  UI_STRINGS,
  UIStrings,
} from './translations';

const LOCALE_STORAGE_KEY = 'daribati_locale_v1';

interface LanguageContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (next: Locale) => void;
  t: UIStrings;
  currencyUnit: string;
  formatMoney: (amount: number) => string;
  formatCompactMoney: (amount: number) => string;
  getTaxCategoryLabel: (cat: TaxCategory) => string;
  getPaymentMethodLabel: (method: PaymentMethod) => string;
  getSectorCopy: (sectorId: string, fallbackTitle: string, fallbackShort: string) => {
    title: string;
    shortTitle: string;
  };
  getSubSectorCopy: (subId: string, fallbackName: string, fallbackDesc: string) => {
    name: string;
    description: string;
  };
  getTenderCopy: (
    tenderId: string,
    fallback: { title: string; region: string; sectorTitle: string; deadlineDate: string; summary: string }
  ) => { title: string; region: string; sectorTitle: string; deadlineDate: string; summary: string };
  getBidCopy: (
    bidId: string,
    fallback: { enterpriseType: string; city: string; certifications: string; summary: string }
  ) => { enterpriseType: string; city: string; certifications: string; summary: string };
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function loadInitialLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'en' || saved === 'fr' || saved === 'ar') {
      return saved;
    }
  } catch {
    // Ignore storage access restrictions
  }
  return 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(loadInitialLocale);

  const dir = getLocaleDirection(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.title = UI_STRINGS[locale].pageTitle;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore storage quota errors
    }
  }, [locale, dir]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      locale,
      dir,
      setLocale: setLocaleState,
      t: UI_STRINGS[locale],
      currencyUnit: getCurrencyUnit(locale),
      formatMoney: (amount: number) => formatLocalizedDH(amount, locale),
      formatCompactMoney: (amount: number) => formatLocalizedCompactDH(amount, locale),
      getTaxCategoryLabel: (cat: TaxCategory) =>
        TAX_CATEGORY_TRANSLATIONS[locale][cat] ?? cat,
      getPaymentMethodLabel: (method: PaymentMethod) =>
        PAYMENT_METHOD_TRANSLATIONS[locale][method] ?? method,
      getSectorCopy: (sectorId, fallbackTitle, fallbackShort) =>
        SECTOR_TRANSLATIONS[locale][sectorId] ?? {
          title: fallbackTitle,
          shortTitle: fallbackShort,
        },
      getSubSectorCopy: (subId, fallbackName, fallbackDesc) =>
        SUB_SECTOR_TRANSLATIONS[locale][subId] ?? {
          name: fallbackName,
          description: fallbackDesc,
        },
      getTenderCopy: (tenderId, fallback) => TENDER_TRANSLATIONS[locale][tenderId] ?? fallback,
      getBidCopy: (bidId, fallback) => BID_TRANSLATIONS[locale][bidId] ?? fallback,
    };
  }, [locale, dir]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
