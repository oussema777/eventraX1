import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import enTranslations from './locales/en';

export type Locale = 'en' | 'fr' | 'ar';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
  tList: <T = string>(path: string, fallback?: T[]) => T[];
  isRTL: boolean;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);
const STORAGE_KEY = 'eventra_locale';

const VALID_LOCALES: Locale[] = ['en', 'fr', 'ar'];
const isLocale = (value: string): value is Locale => VALID_LOCALES.includes(value as Locale);

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isLocale(stored)) return stored;
  const browserLocale = window.navigator.language?.toLowerCase() || '';
  if (browserLocale.startsWith('fr')) return 'fr';
  if (browserLocale.startsWith('ar')) return 'ar';
  return 'en';
};

// Cache loaded locale data in memory so switching back is instant
const localeCache = new Map<Locale, Record<string, any>>();
localeCache.set('en', enTranslations);

async function loadLocaleData(locale: Locale): Promise<Record<string, any>> {
  const cached = localeCache.get(locale);
  if (cached) return cached;

  let data: Record<string, any>;
  if (locale === 'fr') {
    data = (await import('./locales/fr')).default;
  } else if (locale === 'ar') {
    data = (await import('./locales/ar')).default;
  } else {
    data = enTranslations;
  }

  localeCache.set(locale, data);
  return data;
}

const getValueByPath = (obj: Record<string, any>, path: string): unknown => {
  const keys = path.split('.');
  let current: unknown = obj;
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
  const [localeData, setLocaleData] = useState<Record<string, any>>(
    localeCache.get(getInitialLocale()) || enTranslations
  );
  const localeDataRef = useRef(localeData);
  localeDataRef.current = localeData;

  const isRTL = useMemo(() => false, []); // Always false as per user request to not flip layout

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = 'ltr'; // Always LTR
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Load locale data when locale changes
  useEffect(() => {
    let cancelled = false;
    loadLocaleData(locale).then((data) => {
      if (!cancelled) setLocaleData(data);
    });
    return () => { cancelled = true; };
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    }
  }, []);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      const value = getValueByPath(localeDataRef.current, path);
      if (typeof value === 'string') return formatTranslation(value, vars);
      // Fallback to EN
      const fallbackValue = getValueByPath(enTranslations, path);
      if (typeof fallbackValue === 'string') return formatTranslation(fallbackValue, vars);
      if (vars && typeof vars === 'object' && 'defaultValue' in vars) return String(vars.defaultValue);
      if (typeof vars === 'string') return vars;
      return path;
    },
    [localeData] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const tList = useCallback(
    <T,>(path: string, fallback: T[] = []) => {
      const value = getValueByPath(localeDataRef.current, path);
      if (Array.isArray(value)) return value as T[];
      const fallbackValue = getValueByPath(enTranslations, path);
      if (Array.isArray(fallbackValue)) return fallbackValue as T[];
      return fallback;
    },
    [localeData] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const value = useMemo(() => ({ locale, setLocale, t, tList, isRTL }), [locale, setLocale, t, tList, isRTL]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
}
