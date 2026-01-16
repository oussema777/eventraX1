import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { translations, type Locale } from './translations';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
  tList: <T = string>(path: string, fallback?: T[]) => T[];
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);
const STORAGE_KEY = 'eventra_locale';

const isLocale = (value: string): value is Locale => Object.prototype.hasOwnProperty.call(translations, value);

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isLocale(stored)) return stored;
  const browserLocale = window.navigator.language?.toLowerCase() || '';
  if (browserLocale.startsWith('fr')) return 'fr';
  return 'en';
};

const getTranslationValue = (locale: Locale, path: string): unknown => {
  const keys = path.split('.');
  let current: unknown = translations[locale] || translations.en;
  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
};

const formatTranslation = (value: string, vars?: Record<string, string | number>): string => {
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_match, key: string) => {
    if (key in vars) return String(vars[key]);
    return `{${key}}`;
  });
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    }
  }, []);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      const value = getTranslationValue(locale, path);
      if (typeof value === 'string') return formatTranslation(value, vars);
      const fallbackValue = getTranslationValue('en', path);
      if (typeof fallbackValue === 'string') return formatTranslation(fallbackValue, vars);
      return path;
    },
    [locale]
  );

  const tList = useCallback(
    <T,>(path: string, fallback: T[] = []) => {
      const value = getTranslationValue(locale, path);
      if (Array.isArray(value)) return value as T[];
      const fallbackValue = getTranslationValue('en', path);
      if (Array.isArray(fallbackValue)) return fallbackValue as T[];
      return fallback;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t, tList }), [locale, setLocale, t, tList]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
}
