// Legacy re-export — locales are now split into src/i18n/locales/{en,fr,ar}.ts
// I18nContext.tsx imports them directly with dynamic import() for lazy loading.
// This file exists only for backward compatibility if anything imports from it.

export type Locale = 'en' | 'fr' | 'ar';

import en from './locales/en';

export const translations: Record<Locale, any> = {
  en,
  fr: en, // Placeholder — actual FR is lazy-loaded by I18nContext
  ar: en, // Placeholder — actual AR is lazy-loaded by I18nContext
};
