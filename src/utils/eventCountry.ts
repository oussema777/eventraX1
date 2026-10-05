import { countries } from '../data/countries';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const codesByName = new Map<string, string>();
const names = ['en', 'fr', 'ar'].map(locale => new Intl.DisplayNames([locale], { type: 'region' }));

for (const country of countries) {
  codesByName.set(normalize(country.code), country.code);
  codesByName.set(normalize(country.name), country.code);
  for (const language of names) {
    const label = language.of(country.code);
    if (label) codesByName.set(normalize(label), country.code);
  }
}
codesByName.set('uk', 'GB');
codesByName.set('usa', 'US');
codesByName.set('uae', 'AE');
codesByName.set('ivorycoast', 'CI');

/** Use the event's explicit country; never guess from a venue or organizer. */
export function resolveEventCountry(value: unknown, locale = 'en'): { code: string; name: string } | null {
  if (typeof value !== 'string') return null;
  const code = codesByName.get(normalize(value));
  if (!code) return null;
  return { code, name: new Intl.DisplayNames([locale], { type: 'region' }).of(code) || code };
}
