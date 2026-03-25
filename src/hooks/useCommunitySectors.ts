import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 1000;

let cachedSectors: string[] | null = null;
let inFlightPromise: Promise<string[]> | null = null;

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
      .range(from, to);

    if (error) {
      throw error;
    }

    const rows = data || [];
    rows.forEach((profile: any) => {
      extractProfileSectors(profile).forEach((sector) => uniqueSectors.add(sector));
    });

    if (rows.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return Array.from(uniqueSectors).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
}

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
  const [sectors, setSectors] = useState<string[]>(cachedSectors || fallback);
  const [isLoading, setIsLoading] = useState(!cachedSectors);
  const fallbackKey = fallback.join('|');

  useEffect(() => {
    let isMounted = true;

    loadCommunitySectors()
      .then((resolvedSectors) => {
        if (!isMounted) return;
        setSectors(resolvedSectors.length > 0 ? resolvedSectors : fallback);
      })
      .catch((error) => {
        console.error('Failed to load community sectors:', error);
        if (!isMounted) return;
        setSectors(fallback);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fallbackKey]);

  return { sectors, isLoading };
}
