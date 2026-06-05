import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 1000;

export function extractProfileSectors(profile: any): string[] {
  const industry = typeof profile?.industry === 'string' ? profile.industry.trim() : '';
  const industriesOfInterest = Array.isArray(profile?.b2b_profile?.industries_of_interest)
    ? profile.b2b_profile.industries_of_interest
    : [];

  const merged = [
    industry,
    ...industriesOfInterest
      .filter((value: unknown) => typeof value === 'string')
      .map((value: string) => value.trim())
  ].filter(Boolean);

  return Array.from(new Set(merged));
}

async function fetchCommunitySectors(): Promise<string[]> {
  const uniqueSectors = new Set<string>();
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('profiles')
      .select('industry, b2b_profile')
      .neq('account_type', 'event_guest')
      .range(from, to);

    if (error) throw error;

    const rows = data || [];
    rows.forEach((profile: any) => {
      extractProfileSectors(profile).forEach((sector) => uniqueSectors.add(sector));
    });

    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return Array.from(uniqueSectors).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
}

// Keep the imperative API for non-React callers
let cachedSectors: string[] | null = null;
let inFlightPromise: Promise<string[]> | null = null;

export function loadCommunitySectors(): Promise<string[]> {
  if (cachedSectors) {
    return Promise.resolve(cachedSectors);
  }

  if (!inFlightPromise) {
    inFlightPromise = fetchCommunitySectors()
      .then((sectors) => {
        cachedSectors = sectors;
        return sectors;
      })
      .finally(() => {
        inFlightPromise = null;
      });
  }

  return inFlightPromise;
}

export function useCommunitySectors(fallback: string[] = []) {
  const { data: sectors = fallback, isLoading } = useQuery({
    queryKey: ['community-sectors'],
    queryFn: fetchCommunitySectors,
    staleTime: 30 * 60 * 1000, // 30 minutes — sectors rarely change
    gcTime: 60 * 60 * 1000,    // 1 hour cache
  });

  return { sectors: sectors.length > 0 ? sectors : fallback, isLoading };
}
