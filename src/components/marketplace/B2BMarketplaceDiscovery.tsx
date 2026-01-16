import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Mic,
  UtensilsCrossed,
  Laptop,
  Tent,
  Truck,
  MapPin,
  Star,
  Shield,
  Leaf,
  Users,
  ArrowRight,
  Bookmark,
  X,
  Check,
  Camera,
  Palette,
  Megaphone,
  Music,
  Sparkles,
  Gift,
  Globe,
  Building2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';

interface BusinessCard {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  sustainable: boolean;
  logo: string;
  gallery: string[];
  description: string;
  tags: string[];
  sector: string;
  companySize: 'Freelancer' | 'SME' | 'Enterprise';
  pending: boolean;
}

const toCompanySize = (value?: string): BusinessCard['companySize'] => {
  if (!value) return 'SME';
  if (value.startsWith('1-10')) return 'Freelancer';
  if (value.startsWith('11-50') || value.startsWith('51-200')) return 'SME';
  if (value.startsWith('201-500') || value.startsWith('500+')) return 'Enterprise';
  return 'SME';
};

const normalizeGallery = (images: string[]) => {
  const unique = images.filter(Boolean);
  if (unique.length >= 3) return unique.slice(0, 3);
  if (unique.length === 2) return [unique[0], unique[1], unique[0]];
  if (unique.length === 1) return [unique[0], unique[0], unique[0]];
  return [];
};

const CATEGORIES = [
  { icon: Mic, label: 'A/V & Production', value: 'A/V & Production', key: 'av' },
  { icon: UtensilsCrossed, label: 'Catering', value: 'Catering', key: 'catering' },
  { icon: Laptop, label: 'Event Tech', value: 'Event Tech', key: 'tech' },
  { icon: Tent, label: 'Venues', value: 'Venues', key: 'venues' },
  { icon: Truck, label: 'Logistics', value: 'Logistics', key: 'logistics' },
  { icon: Camera, label: 'Photography', value: 'Photography', key: 'photography' },
  { icon: Palette, label: 'Design & Decor', value: 'Design & Decor', key: 'design' },
  { icon: Megaphone, label: 'Marketing', value: 'Marketing', key: 'marketing' },
  { icon: Music, label: 'Entertainment', value: 'Entertainment', key: 'entertainment' },
  { icon: Gift, label: 'Swag & Gifts', value: 'Swag & Gifts', key: 'swag' },
  { icon: Globe, label: 'Translation', value: 'Translation', key: 'translation' },
  { icon: Building2, label: 'Staffing', value: 'Staffing', key: 'staffing' }
];

export default function B2BMarketplaceDiscovery() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sustainableOnly, setSustainableOnly] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [savedBusinesses, setSavedBusinesses] = useState<string[]>([]);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<BusinessCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        console.log('Fetching businesses from Supabase...');
        const { data, error } = await supabase
          .from('business_profiles')
          .select('id, company_name, description, sectors, company_size, address, logo_url, cover_url, verification_status, branding, business_offerings(images)')
          .eq('verification_status', 'verified')
          .eq('is_public', true);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Raw data received:', data);

        if (!data || data.length === 0) {
          console.warn('No public business profiles found in database.');
        }

        const mapped: BusinessCard[] = (data || []).map((profile: any) => {
          console.log(`Mapping profile: ${profile.company_name} (Status: ${profile.verification_status})`);
          const branding = profile.branding || {};
          const sectorTags = profile.sectors || [];
          const images = [
            profile.cover_url,
            profile.logo_url,
            ...(profile.business_offerings || []).flatMap((offering: any) => offering.images || [])
          ];

          return {
            id: profile.id,
            name: profile.company_name || 'Business',
            location: profile.address || 'Location TBD',
            rating: Number(branding.rating) || 0,
            reviewCount: Number(branding.review_count) || 0,
            verified: profile.verification_status === 'verified',
            sustainable: Boolean(branding.sustainable),
            logo: profile.logo_url || profile.cover_url || '',
            gallery: normalizeGallery(images),
            description: profile.description || 'No description provided.',
            tags: sectorTags.length > 0 ? sectorTags : ['Business'],
            sector: sectorTags[0] || 'Business',
            companySize: toCompanySize(profile.company_size),
            pending: profile.verification_status === 'pending'
          };
        });

        console.log('Mapped businesses:', mapped);
        setBusinesses(mapped);
      } catch (error: any) {
        console.error('Fetch error:', error);
        setLoadError(error.message || 'Failed to load businesses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (!selectedSectors.includes(category)) {
      setSelectedSectors([...selectedSectors, category]);
    }
  };

  const handleSectorToggle = (sector: string) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter(s => s !== sector));
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleClearFilters = () => {
    setSelectedSectors([]);
    setSelectedCategory('');
    setVerifiedOnly(false);
    setSustainableOnly(false);
    setSelectedSizes([]);
    setMinRating(0);
    setSearchQuery('');
  };

  const toggleSave = (businessId: string) => {
    if (savedBusinesses.includes(businessId)) {
      setSavedBusinesses(savedBusinesses.filter(id => id !== businessId));
    } else {
      setSavedBusinesses([...savedBusinesses, businessId]);
    }
  };

  // Filter businesses
  const filteredBusinesses = businesses.filter(business => {
    if (searchQuery && !business.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !business.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !business.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    if (selectedSectors.length > 0 && !selectedSectors.some(s => business.tags.includes(s))) {
      return false;
    }
    if (verifiedOnly && !business.verified) {
      return false;
    }
    if (sustainableOnly && !business.sustainable) {
      return false;
    }
    if (selectedSizes.length > 0 && !selectedSizes.includes(business.companySize)) {
      return false;
    }
    if (minRating > 0 && business.rating < minRating) {
      return false;
    }
    return true;
  });

  const activeFiltersCount = selectedSectors.length + selectedSizes.length + 
    (verifiedOnly ? 1 : 0) + (sustainableOnly ? 1 : 0) + (minRating > 0 ? 1 : 0);

  const recommendedBusinesses = useMemo(
    () => businesses.filter((b) => b.rating >= 4.8).slice(0, 4),
    [businesses]
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B2641' }}>
      {/* Hero: Category Explorer */}
      <div
        style={{
          width: '100%',
          height: '480px',
          background: 'radial-gradient(circle at center, #1E3A5F 0%, #0B2641 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '28px',
          padding: '80px 20px 40px'
        }}
      >
        {/* Headline - Pushed Lower */}
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', marginTop: '40px' }}>
          {t('marketplace.hero.title')}
        </h1>

        {/* Search Bar */}
        <div
          className="flex items-center gap-2 rounded-xl overflow-hidden"
          style={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '4px'
          }}
        >
          <Search size={20} style={{ color: '#94A3B8', marginLeft: '16px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('marketplace.hero.searchPlaceholder')}
            className="flex-1 p-3"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <button
            className="px-6 py-3 rounded-lg transition-all"
            style={{
              backgroundColor: '#0684F5',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
          >
            {t('marketplace.hero.searchButton')}
          </button>
        </div>

        {/* Visual Category Nav - 2 rows with more icons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div className="flex items-center gap-4">
            {CATEGORIES.slice(0, 6).map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.value;
              return (
                <button
                  key={category.value}
                  onClick={() => handleCategoryClick(category.value)}
                  className="flex flex-col items-center gap-2 transition-all"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? 'rgba(6, 132, 245, 0.1)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <IconComponent
                    size={24}
                    style={{ color: isSelected ? '#0684F5' : '#94A3B8' }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: isSelected ? '#0684F5' : '#94A3B8',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t(`marketplace.hero.categories.${category.key}`, { defaultValue: category.label })}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4">
            {CATEGORIES.slice(6, 12).map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.value;
              return (
                <button
                  key={category.value}
                  onClick={() => handleCategoryClick(category.value)}
                  className="flex flex-col items-center gap-2 transition-all"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? 'rgba(6, 132, 245, 0.1)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <IconComponent
                    size={24}
                    style={{ color: isSelected ? '#0684F5' : '#94A3B8' }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: isSelected ? '#0684F5' : '#94A3B8',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t(`marketplace.hero.categories.${category.key}`, { defaultValue: category.label })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Marketplace Content */}
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '40px 20px',
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '32px'
        }}
      >
        {/* Left Column: Smart Filters */}
        <div
          style={{
            position: 'sticky',
            top: '20px',
            height: 'fit-content',
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>
                  {t('marketplace.filters.active')} ({activeFiltersCount})
                </span>
                <button
                  onClick={handleClearFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0684F5',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('marketplace.filters.clearAll')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSectors.map(sector => (
                  <span
                    key={sector}
                    className="px-2 py-1 rounded flex items-center gap-1"
                    style={{
                      backgroundColor: 'rgba(6, 132, 245, 0.1)',
                      border: '1px solid #0684F5',
                      color: '#0684F5',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    {t(`constants.sectors.${sector.replace(/\s+/g, '')}`, { defaultValue: sector })}
                    <button
                      onClick={() => handleSectorToggle(sector)}
                      style={{ background: 'none', border: 'none', color: '#0684F5', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Filter Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Sectors */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '12px' }}>
                {t('marketplace.filters.sectors')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Technology', 'Marketing', 'Venues', 'Catering', 'Logistics', 'Event Tech'].map(sector => (
                  <label key={sector} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSectors.includes(sector)}
                      onChange={() => handleSectorToggle(sector)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', color: '#CBD5E1' }}>
                      {t(`constants.sectors.${sector.replace(/\s+/g, '')}`, { defaultValue: sector })}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '12px' }}>
                {t('marketplace.filters.location')}
              </h4>
              <div className="flex items-center gap-2 rounded-lg p-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <MapPin size={16} style={{ color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder={t('marketplace.filters.locationPlaceholder')}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Trust Badges */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '12px' }}>
                {t('marketplace.filters.trustBadges')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <Shield size={16} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '13px', color: '#CBD5E1' }}>{t('marketplace.filters.verified')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sustainableOnly}
                    onChange={(e) => setSustainableOnly(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <Leaf size={16} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '13px', color: '#CBD5E1' }}>{t('marketplace.filters.sustainable')}</span>
                </label>
              </div>
            </div>

            {/* Company Size */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '12px' }}>
                {t('marketplace.filters.size')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Freelancer', 'SME', 'Enterprise'].map(size => (
                  <label key={size} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', color: '#CBD5E1' }}>
                      {t(`marketplace.filters.sizes.${size.toLowerCase()}`, { defaultValue: size })}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '12px' }}>
                {t('marketplace.filters.rating')}
              </h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={minRating === 4}
                  onChange={(e) => setMinRating(e.target.checked ? 4 : 0)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <div className="flex items-center gap-1">
                  <span style={{ fontSize: '13px', color: '#CBD5E1' }}>4</span>
                  <Star size={14} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>{t('marketplace.filters.up')}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Rich Business Cards Grid */}
        <div>
          {/* Recommended Section - AI Powered */}
          {activeFiltersCount === 0 && searchQuery === '' && (
            <div style={{ marginBottom: '32px' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                      border: '1px solid rgba(168, 85, 247, 0.3)'
                    }}
                  >
                    <Sparkles size={16} style={{ color: '#A855F7' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#E9D5FF' }}>
                      {t('marketplace.recommended.badge')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                    {t('marketplace.recommended.title')}
                  </h3>
                </div>
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: '#A855F7'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
                  }}
                >
                  <RefreshCw size={14} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('marketplace.recommended.refresh')}</span>
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px'
                }}
              >
                {recommendedBusinesses.map(business => (
                  <div
                    key={business.id}
                    className="rounded-lg overflow-hidden transition-all relative"
                    style={{
                      backgroundColor: '#152C48',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(168, 85, 247, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.2)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.1)';
                    }}
                  >
                    {/* AI Badge on Card */}
                    <div
                      className="absolute top-2 right-2 px-2 py-1 rounded flex items-center gap-1"
                      style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Sparkles size={10} style={{ color: '#FFFFFF' }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#FFFFFF' }}>
                        {t('marketplace.recommended.aiMatch')}
                      </span>
                    </div>
                    
                  <div className="flex items-center gap-3 p-3" onClick={() => navigate(`/business/${business.id}`)}>
                      <img
                        src={business.logo}
                        alt={business.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid rgba(168, 85, 247, 0.3)'
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                            {business.name}
                          </span>
                          {business.verified && <Check size={14} style={{ color: '#10B981' }} />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>{business.rating} ★</span>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>•</span>
                          <span style={{ fontSize: '11px', color: '#A855F7', fontWeight: 600 }}>{t('marketplace.recommended.match')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#E2E8F0' }}>
              {isLoading ? t('marketplace.results.loading') : t('marketplace.results.found', { count: filteredBusinesses.length, label: filteredBusinesses.length === 1 ? t('marketplace.results.business') : t('marketplace.results.businesses') })}
            </h3>
            {loadError && (
              <span style={{ fontSize: '13px', color: '#F59E0B' }}>
                {loadError}
              </span>
            )}
          </div>

          {/* Business Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px'
            }}
          >
            {filteredBusinesses.map(business => (
              <div
                key={business.id}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  backgroundColor: '#152C48',
                  border: '1px solid rgba(255,255,255,0.05)',
                  height: '380px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header (Identity) */}
                <div className="p-5" onClick={() => navigate(`/business/${business.id}`)}>
                  <div className="flex items-start gap-3">
                    <img
                      src={business.logo}
                      alt={business.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid rgba(6, 132, 245, 0.3)'
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                          {business.name}
                        </h4>
                        {business.verified && (
                          <div
                            className="rounded-full p-1"
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.1)'
                            }}
                          >
                            <Check size={12} style={{ color: '#10B981' }} />
                          </div>
                        )}
                        {business.sustainable && (
                          <Leaf size={14} style={{ color: '#10B981' }} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} style={{ color: '#6B7280' }} />
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                          {business.location || t('marketplace.results.locationTbd')}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>•</span>
                        <Star size={12} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                          {business.rating} ({business.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Micro-Gallery */}
                <div
                  className="grid grid-cols-3"
                  style={{
                    height: '120px',
                    gap: '2px',
                    backgroundColor: '#0B2641'
                  }}
                  onClick={() => navigate(`/business/${business.id}`)}
                >
                  {business.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        height: '120px'
                      }}
                      onMouseEnter={() => setHoveredImage(`${business.id}-${idx}`)}
                      onMouseLeave={() => setHoveredImage(null)}
                    >
                      <img
                        src={img}
                        alt={`${business.name} ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: hoveredImage === `${business.id}-${idx}` ? 'scale(1.1)' : 'scale(1)',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Details & Tags */}
                <div className="p-5 flex-1" onClick={() => navigate(`/business/${business.id}`)}>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#94A3B8',
                      lineHeight: '1.5',
                      marginBottom: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {business.description || t('marketplace.results.noDescription')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {business.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor: idx === 0 ? 'rgba(6, 132, 245, 0.1)' : 'rgba(255,255,255,0.05)',
                          color: idx === 0 ? '#0684F5' : '#94A3B8',
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  className="p-5 flex items-center justify-between"
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <button
                    onClick={() => navigate(`/business/${business.id}`)}
                    className="flex items-center gap-2 transition-all"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0684F5',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0570D6'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#0684F5'}
                  >
                    {t('marketplace.results.requestQuote')}
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(business.id);
                    }}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      background: savedBusinesses.includes(business.id) ? 'rgba(6, 132, 245, 0.1)' : 'rgba(255,255,255,0.03)',
                      border: 'none',
                      color: savedBusinesses.includes(business.id) ? '#0684F5' : '#6B7280',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!savedBusinesses.includes(business.id)) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!savedBusinesses.includes(business.id)) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                      }
                    }}
                  >
                    <Bookmark
                      size={18}
                      style={{
                        fill: savedBusinesses.includes(business.id) ? '#0684F5' : 'none'
                      }}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Zero State */}
          {!isLoading && filteredBusinesses.length === 0 && (
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <Users size={48} style={{ color: '#6B7280', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {t('marketplace.empty.title')}
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '16px' }}>
                {t('marketplace.empty.subtitle')}
              </p>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: '#0684F5',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
              >
                {t('marketplace.empty.action')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
