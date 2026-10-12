export const normalizeMarketplaceText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && !!item.trim()) : [];

export interface MarketplaceProfile {
  id: string;
  created_at?: string;
  company_name?: string;
  description?: string;
  address?: string;
  sectors?: string[];
  company_size?: string;
  logo_url?: string;
  cover_url?: string;
  verification_status?: string;
  branding?: { rating?: number; review_count?: number; sustainable?: boolean };
  business_offerings?: { name?: string; description?: string; sector?: string; tags?: string[]; images?: string[] }[];
}

export function marketplaceCard(profile: MarketplaceProfile) {
  const offerings = profile.business_offerings || [];
  const tags = [...new Map([...strings(profile.sectors), ...offerings.flatMap(offering => offering.sector ? [offering.sector] : [])]
    .map(value => [normalizeMarketplaceText(value), value.trim()])).values()];
  const gallery = [...new Set([profile.cover_url, profile.logo_url, ...offerings.flatMap(offering => strings(offering.images))].filter((value): value is string => !!value))].slice(0, 3);
  return {
    id: profile.id, name: profile.company_name || 'Business', location: profile.address || '',
    description: profile.description || '', tags, gallery, logo: profile.logo_url || profile.cover_url || '',
    companySize: profile.company_size || '', verified: profile.verification_status === 'verified',
    sustainable: profile.branding?.sustainable === true,
    rating: Math.max(0, Math.min(5, Number(profile.branding?.rating) || 0)),
    reviewCount: Number(profile.branding?.review_count) || 0,
    offeringCount: offerings.length, createdAt: profile.created_at || '',
    searchText: normalizeMarketplaceText([profile.company_name, profile.description, ...tags,
      ...offerings.flatMap(offering => [offering.name, offering.description, ...strings(offering.tags)])].filter(Boolean).join(' ')),
  };
}

export type MarketplaceCard = ReturnType<typeof marketplaceCard>;
export function filterMarketplace(businesses: MarketplaceCard[], filters: { search: string; location: string; sectors: string[]; sizes: string[]; sustainable: boolean; rating: number }) {
  const search = normalizeMarketplaceText(filters.search);
  const location = normalizeMarketplaceText(filters.location);
  const sectors = filters.sectors.map(normalizeMarketplaceText);
  return businesses.filter(business => (!search || business.searchText.includes(search))
    && (!location || normalizeMarketplaceText(business.location).includes(location))
    && (!sectors.length || business.tags.some(tag => sectors.includes(normalizeMarketplaceText(tag))))
    && (!filters.sizes.length || filters.sizes.includes(business.companySize))
    && (!filters.sustainable || business.sustainable)
    && business.rating >= filters.rating);
}
