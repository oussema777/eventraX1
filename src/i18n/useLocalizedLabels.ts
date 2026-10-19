import { useMemo } from 'react';
import { countries } from '../data/countries';
import { PLATFORM_INTERESTS, PLATFORM_SECTORS } from '../constants/platformFields';
import { useI18n } from './I18nContext';
import en from './locales/en';

/** Translate known catalog values for display without changing saved or custom values. */
export function useLocalizedLabels() {
  const { locale, t, tList } = useI18n();
  const labels = useMemo(() => {
    const values = new Map<string, string>();
    for (const path of ['industries', 'companySizes', 'meetingGoals', 'companyStages', 'meetingFormats', 'meetingDurations']) {
      for (const option of tList<{ value: string; label: string }>(`profile.options.${path}`)) {
        values.set(option.value.toLowerCase(), option.label);
      }
    }
    for (const group of ['industries', 'companySizes'] as const) {
      const translated = tList<string>(`profileSetup.${group}`);
      en.profileSetup[group].forEach((value, index) => {
        if (translated[index]) values.set(value.toLowerCase(), translated[index]);
      });
    }
    for (const value of [...PLATFORM_SECTORS, ...PLATFORM_INTERESTS]) {
      values.set(value.toLowerCase(), t(`platformLabels.${value}`, { defaultValue: value }));
    }
    for (const [key, value] of Object.entries(en.constants.sectors)) {
      values.set(value.toLowerCase(), t(`constants.sectors.${key}`));
    }
    for (const value of Object.keys(en.constants.subsectors)) {
      values.set(value.toLowerCase(), t(`constants.subsectors.${value}`));
    }
    for (const minutes of [15, 30, 45, 60]) {
      values.set(`${minutes} min`, t('meetingBooking.duration', { minutes }));
    }
    values.set('potential fit', t('networking.matches.potentialFit'));
    return values;
  }, [t, tList]);
  const regionNames = useMemo(() => new Intl.DisplayNames([locale], { type: 'region' }), [locale]);
  const label = (value: string | null | undefined) => value ? labels.get(value.toLowerCase()) || value : '';
  const country = (value: string | null | undefined) => {
    if (!value) return '';
    const region = countries.find(item => item.code.toLowerCase() === value.toLowerCase() || item.name.toLowerCase() === value.toLowerCase());
    return region ? regionNames.of(region.code) || value : value;
  };
  // Older match records contain generated English explanations. Localize those
  // known templates at render time; leave custom explanations untouched.
  const matchReason = (value: string) => {
    if (/^Suggested based on (your profile details|overall profile signals)\.$/.test(value)) {
      return t('networking.matches.profileReason');
    }
    const shared = value.match(/^Shared (industry|interests|meeting topics|networking goals|skills) in (.+)\.$/);
    if (!shared) return value;
    const categories: Record<string, string> = { industry: 'industries', interests: 'interests', 'meeting topics': 'topics', 'networking goals': 'goals', skills: 'skills' };
    return t('networking.matches.sharedReason', {
      category: t(`networking.matches.categories.${categories[shared[1]]}`),
      shared: shared[2].split(', ').map(label).join(', '),
    });
  };
  return { label, country, matchReason };
}
