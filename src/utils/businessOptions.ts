import { countries } from '../data/countries';

export interface BusinessOption { value: string; label: string }

/** Keep previously saved and custom values visible when an option list changes. */
export function mergeBusinessOptions(options: BusinessOption[], saved: string[] = []): BusinessOption[] {
  const result = new Map(options.map(option => [option.value, option]));
  for (const value of saved) {
    if (value && !result.has(value)) result.set(value, { value, label: value });
  }
  return [...result.values()];
}

const regionNames = ['en', 'fr', 'ar'].map(locale => new Intl.DisplayNames([locale], { type: 'region' }));
// The phone-number country list omits two uninhabited territories. They remain
// valid geographic reach options, without inventing telephone dialing codes.
const regions = [...countries.map(({ code, name }) => ({ code, name })),
  ...['AQ', 'HM'].filter(code => !countries.some(country => country.code === code))
    .map(code => ({ code, name: regionNames[0].of(code) || code }))];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const regionAliases = new Map<string, string>();
for (const { code, name } of regions) {
  for (const alias of [code, name, ...regionNames.map(names => names.of(code) || code)]) regionAliases.set(normalize(alias), name);
}

export function normalizeBusinessCountries(values: unknown): string[] {
  return Array.isArray(values) ? [...new Set(values.filter((value): value is string => typeof value === 'string' && !!value.trim())
    .map(value => regionAliases.get(normalize(value)) || value.trim()))] : [];
}

export function businessCountryOptions(locale: string, saved: string[] = []) {
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  const options = regions.map(({ code, name }) => ({
    value: name, label: names.of(code) || name,
    search: normalize([code, name, ...regionNames.map(language => language.of(code))].join(' ')),
  }));
  for (const value of normalizeBusinessCountries(saved)) {
    if (!options.some(option => option.value === value)) options.push({ value, label: value, search: normalize(value) });
  }
  return options.sort((a, b) => a.label.localeCompare(b.label, locale));
}

export function searchBusinessCountries<T extends { search: string }>(options: T[], query: string): T[] {
  const search = normalize(query);
  return options.filter(option => option.search.includes(search));
}

export function businessCurrencyOptions(saved = ''): string[] {
  return [...new Set([...Intl.supportedValuesOf('currency'), saved].filter(Boolean))].sort();
}

export function replaceBusinessSectors(existing: string[], previousPrimary: string, previousSecondary: string, primary: string, secondary: string): string[] {
  return [...new Set([primary, secondary, ...existing.filter(value => value !== previousPrimary && value !== previousSecondary)].filter(Boolean))];
}
