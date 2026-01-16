import { useEffect, useMemo, useState } from 'react';
import { 
  Search,
  MapPin,
  Calendar,
  Clock,
  Heart,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';

interface EventCard {
  id: string;
  title: string;
  image: string;
  date: {
    month: string;
    day: string;
  };
  location: string;
  time: string;
  price: string;
  priceValue: number;
  currency: string;
  category: string;
  format: 'in-person' | 'virtual' | 'hybrid';
  startTimestamp: number | null;
  popularity: number;
  isLiked?: boolean;
}

interface Filters {
  format: string[];
  category: string[];
  price: string[];
  date: string[];
}

export default function BrowseEventsDiscovery() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const pageSize = 9;
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('upcoming');
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const [filters, setFilters] = useState<Filters>({
    format: ['all'],
    category: [],
    price: [],
    date: []
  });

  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());

  const [allEvents, setAllEvents] = useState<EventCard[]>([]);

  const formatOptions = useMemo(() => ([
    { value: 'all', label: t('browseEventsPage.filters.format.all') },
    { value: 'in-person', label: t('browseEventsPage.filters.format.in-person') },
    { value: 'virtual', label: t('browseEventsPage.filters.format.virtual') },
    { value: 'hybrid', label: t('browseEventsPage.filters.format.hybrid') }
  ]), [t]);

  const categoryOptions = useMemo(() => ([
    { value: 'Business', label: t('browseEventsPage.filters.category.business') },
    { value: 'Technology', label: t('browseEventsPage.filters.category.technology') },
    { value: 'Music & Arts', label: t('browseEventsPage.filters.category.musicArts') },
    { value: 'Education', label: t('browseEventsPage.filters.category.education') },
    { value: 'Health & Wellness', label: t('browseEventsPage.filters.category.health') }
  ]), [t]);

  const dateOptions = useMemo(() => ([
    { value: 'today', label: t('browseEventsPage.filters.date.today') },
    { value: 'this-weekend', label: t('browseEventsPage.filters.date.this-weekend') },
    { value: 'custom', label: t('browseEventsPage.filters.date.custom') }
  ]), [t]);

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const { data, error } = await supabase
          .from('events')
          .select('id, name, description, event_type, event_format, event_status, start_date, location_address, cover_image_url')
          .eq('status', 'published')
          .eq('is_approved', true) // Only show approved events
          .order('start_date', { ascending: true });

        if (error) {
          if (mounted) setLoadError(t('browseEventsPage.states.loadError'));
          return;
        }

        const rows = Array.isArray(data) ? data : [];
        if (rows.length === 0) {
          if (mounted) setAllEvents([]);
          return;
        }

        const eventIds = rows.map((event) => event.id);
        const { data: ticketsData } = await supabase
          .from('event_tickets')
          .select('event_id, price, currency')
          .in('event_id', eventIds);

        const ticketMap = new Map<string, { minPrice: number; currency: string }>();
        (ticketsData || []).forEach((ticket: any) => {
          const price = Number(ticket.price) || 0;
          const current = ticketMap.get(ticket.event_id);
          if (!current || price < current.minPrice) {
            ticketMap.set(ticket.event_id, {
              minPrice: price,
              currency: ticket.currency || current?.currency || 'USD'
            });
          }
        });

        const mapped = rows.map((event: any) => {
          const start = event.start_date ? new Date(event.start_date) : null;
          const month = start ? start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : t('browseEventsPage.event.tbd');
          const day = start ? start.getDate().toString().padStart(2, '0') : '--';
          const timeLabel = start
            ? t('browseEventsPage.event.startsAt', { time: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) })
            : t('browseEventsPage.event.timeTbd');
          const ticketInfo = ticketMap.get(event.id);
          const fallbackPrice = event.event_status === 'free' ? 0 : ticketInfo?.minPrice ?? 0;
          const priceValue = ticketInfo?.minPrice ?? fallbackPrice;
          const currency = ticketInfo?.currency || 'USD';
          const priceLabel = priceValue <= 0
            ? t('browseEventsPage.event.free')
            : t('browseEventsPage.event.fromPrice', { currency, price: priceValue });
          const locationLabel = event.event_format === 'virtual'
            ? t('browseEventsPage.event.online')
            : (event.location_address || t('browseEventsPage.event.tbd'));

          return {
            id: event.id,
            title: event.name || t('browseEventsPage.event.untitled'),
            image: event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            date: { month, day },
            location: locationLabel,
            time: timeLabel,
            price: priceLabel,
            priceValue,
            currency,
            category: event.event_type || 'General',
            format: event.event_format || 'in-person',
            startTimestamp: start ? start.getTime() : null,
            popularity: 0
          } as EventCard;
        });

        if (mounted) setAllEvents(mapped);
      } catch (_err) {
        if (mounted) setLoadError(t('browseEventsPage.states.loadError'));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchEvents();
    return () => {
      mounted = false;
    };
  }, [t]);

  const resetPagination = () => {
    setVisibleCount(pageSize);
  };

  const handleFilterChange = (group: keyof Filters, value: string) => {
    setFilters(prev => {
      const updated = { ...prev };
      
      if (group === 'format' && value === 'all') {
        updated.format = ['all'];
      } else if (group === 'format') {
        const newFormat = prev.format.includes(value)
          ? prev.format.filter(f => f !== value)
          : [...prev.format.filter(f => f !== 'all'), value];
        updated.format = newFormat.length > 0 ? newFormat : ['all'];
      } else {
        const currentGroup = prev[group];
        updated[group] = currentGroup.includes(value)
          ? currentGroup.filter(v => v !== value)
          : [...currentGroup, value];
      }
      
      return updated;
    });
    resetPagination();
  };

  const clearAllFilters = () => {
    setFilters({
      format: ['all'],
      category: [],
      price: [],
      date: []
    });
    setPriceRange([0, 1000]);
    setSearchQuery('');
    setLocation('');
    setDateFilter('');
    resetPagination();
  };

  const toggleLike = (eventId: string) => {
    setLikedEvents(prev => {
      const updated = new Set(prev);
      if (updated.has(eventId)) {
        updated.delete(eventId);
      } else {
        updated.add(eventId);
      }
      return updated;
    });
  };

  const handleEventClick = (eventId: string) => {
    // Navigate to event detail page
    navigate(`/event/${eventId}/landing`);
  };

  const filteredEvents = useMemo(() => {
    const normalize = (value: string) => value.trim().toLowerCase();
    const search = normalize(searchQuery);
    const locationSearch = normalize(location);
    const customDate = dateFilter ? new Date(dateFilter) : null;
    const customDateValid = customDate && Number.isFinite(customDate.getTime());
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeekend = new Date(startOfToday);
    endOfWeekend.setDate(startOfToday.getDate() + (7 - startOfToday.getDay()));
    endOfWeekend.setHours(23, 59, 59, 999);

    return allEvents.filter((event) => {
      const matchesFormat = filters.format.includes('all') || filters.format.includes(event.format);
      if (!matchesFormat) return false;

      const matchesCategory =
        filters.category.length === 0 ||
        filters.category.some((category) => normalize(event.category) === normalize(category));
      if (!matchesCategory) return false;

      const isFree = event.priceValue <= 0;
      if (filters.price.includes('free') && !isFree) return false;
      if (filters.price.includes('paid') && isFree) return false;
      if (event.priceValue > priceRange[1]) return false;

      if (search) {
        const haystack = [
          event.title,
          event.category,
          event.location
        ]
          .map((value) => normalize(value))
          .join(' ');
        if (!haystack.includes(search)) return false;
      }

      if (locationSearch) {
        const locationValue = normalize(event.location);
        if (!locationValue.includes(locationSearch)) return false;
      }

      if (filters.date.length > 0 || customDateValid) {
        if (!event.startTimestamp) return false;
        const eventDate = new Date(event.startTimestamp);
        const isToday = eventDate >= startOfToday && eventDate < new Date(startOfToday.getTime() + 86_400_000);
        const isWeekend = (eventDate.getDay() === 0 || eventDate.getDay() === 6) && eventDate <= endOfWeekend;
        const isCustom = customDateValid
          ? eventDate.toDateString() === (customDate as Date).toDateString()
          : false;

        if (filters.date.includes('today') && !isToday) return false;
        if (filters.date.includes('this-weekend') && !isWeekend) return false;
        if (filters.date.includes('custom') && !isCustom) return false;
        if (!filters.date.includes('custom') && customDateValid && !isCustom) return false;
      }

      return true;
    });
  }, [allEvents, dateFilter, filters, location, priceRange, searchQuery]);

  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];
    sorted.sort((a, b) => {
      if (sortBy === 'price-low') return a.priceValue - b.priceValue;
      if (sortBy === 'price-high') return b.priceValue - a.priceValue;
      if (sortBy === 'popular') {
        if (b.popularity !== a.popularity) return b.popularity - a.popularity;
      }
      const aTime = a.startTimestamp ?? Number.MAX_SAFE_INTEGER;
      const bTime = b.startTimestamp ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
    return sorted;
  }, [filteredEvents, sortBy]);

  const visibleEvents = sortedEvents.slice(0, visibleCount);
  const resultsCount = sortedEvents.length;
  const canLoadMore = visibleCount < sortedEvents.length;
  const emptyStateTitle = loadError
    ? t('browseEventsPage.states.errorTitle')
    : isLoading
    ? t('browseEventsPage.states.loadingTitle')
    : t('browseEventsPage.states.emptyTitle');
  const emptyStateBody = loadError
    ? loadError
    : isLoading
    ? t('browseEventsPage.states.loadingBody')
    : t('browseEventsPage.states.emptyBody');

  return (
    <div className="browse-events" style={{ backgroundColor: '#0B2641', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 600px) {
          .browse-events__hero {
            height: auto !important;
            padding: 24px 16px 32px !important;
          }

          .browse-events__search {
            flex-direction: column;
            height: auto !important;
            border-radius: 20px !important;
            padding: 12px !important;
            gap: 10px;
          }

          .browse-events__search-divider {
            display: none !important;
          }

          .browse-events__search-field {
            width: 100% !important;
            min-width: 0 !important;
            padding: 10px 12px !important;
            background: rgba(255,255,255,0.95);
            border-radius: 12px;
          }

          .browse-events__search-button {
            width: 100% !important;
            border-radius: 12px !important;
          }

          .browse-events__layout {
            flex-direction: column;
            gap: 24px !important;
          }

          .browse-events__filters {
            width: 100% !important;
            position: static !important;
          }

          .browse-events__results-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }

          .browse-events__sort {
            width: 100%;
          }

          .browse-events__grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }

        @media (max-width: 400px) {
          .browse-events__hero {
            padding: 20px 12px 28px !important;
          }

          .browse-events__search {
            padding: 10px !important;
          }
        }
      `}</style>
      {/* Hero Search Section */}
      <div
        className="browse-events__hero flex flex-col items-center justify-center"
        style={{
          height: '300px',
          background: 'linear-gradient(180deg, rgba(6,132,245,0.2) 0%, #0B2641 100%)',
          paddingTop: '40px'
        }}
      >
        <h1 
          className="mb-6"
          style={{ 
            fontSize: '36px', 
            fontWeight: 700, 
            color: '#FFFFFF',
            textAlign: 'center',
            marginTop: '20px'
          }}
        >
          {t('browseEventsPage.hero.title')}
        </h1>

        {/* Search Bar */}
        <div
          className="browse-events__search flex items-center"
          style={{
            width: '800px',
            maxWidth: '90vw',
            height: '64px',
            backgroundColor: '#FFFFFF',
            borderRadius: '32px',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden'
          }}
        >
          {/* Search Input */}
          <div className="browse-events__search-field flex items-center gap-3 px-6 flex-1">
            <Search size={22} style={{ color: '#94A3B8', flexShrink: 0 }} />
            <input
              type="text"
              placeholder={t('browseEventsPage.hero.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none"
              style={{
                color: '#0B2641',
                fontSize: '15px'
              }}
            />
          </div>

          {/* Divider */}
          <div className="browse-events__search-divider" style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />

          {/* Location Input */}
          <div className="browse-events__search-field flex items-center gap-2 px-4" style={{ minWidth: '180px' }}>
            <MapPin size={18} style={{ color: '#94A3B8', flexShrink: 0 }} />
            <input
              type="text"
              placeholder={t('browseEventsPage.hero.locationPlaceholder')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none"
              style={{
                color: '#0B2641',
                fontSize: '14px',
                minWidth: '0'
              }}
            />
          </div>

          {/* Divider */}
          <div className="browse-events__search-divider" style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />

          {/* Date Picker */}
          <div className="browse-events__search-field flex items-center gap-2 px-4" style={{ minWidth: '140px' }}>
            <Calendar size={18} style={{ color: '#94A3B8', flexShrink: 0 }} />
            <input
              type="text"
              placeholder={t('browseEventsPage.hero.datePlaceholder')}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none"
              style={{
                color: '#0B2641',
                fontSize: '14px',
                minWidth: '0'
              }}
            />
          </div>

          {/* Search Button */}
          <button
            className="browse-events__search-button flex items-center justify-center transition-colors mr-1"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#0684F5',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0
            }}
            onClick={resetPagination}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
          >
            <Search size={22} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px' }}>
        <div className="browse-events__layout flex gap-10">
          {/* Left Column: Filters */}
          <div className="browse-events__filters" style={{ width: '280px', flexShrink: 0 }}>
            <div className="browse-events__filters-inner sticky top-4">
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                  {t('browseEventsPage.filters.title')}
                </h2>
                <button
                  onClick={clearAllFilters}
                  className="transition-colors"
                  style={{
                    fontSize: '14px',
                    color: '#0684F5',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  {t('browseEventsPage.filters.clearAll')}
                </button>
              </div>

              {/* Filter Groups */}
              <div className="space-y-6">
                {/* Format */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                    {t('browseEventsPage.filters.format.title')}
                  </h3>
                  <div className="space-y-2">
                    {formatOptions.map((format) => (
                      <label key={format.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.format.includes(format.value)}
                          onChange={() => handleFilterChange('format', format.value)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: '#0684F5' }}
                        />
                        <span style={{ fontSize: '14px', color: '#94A3B8', textTransform: 'capitalize' }}>
                          {format.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                    {t('browseEventsPage.filters.category.title')}
                  </h3>
                  <div className="space-y-2">
                    {categoryOptions.map((category) => (
                      <label key={category.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category.value)}
                          onChange={() => handleFilterChange('category', category.value)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: '#0684F5' }}
                        />
                        <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                          {category.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                    {t('browseEventsPage.filters.price.title')}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => handleFilterChange('price', 'free')}
                      className="px-4 py-2 rounded-lg transition-all"
                      style={{
                        backgroundColor: filters.price.includes('free') 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : 'rgba(255,255,255,0.05)',
                        border: filters.price.includes('free')
                          ? '1px solid #10B981'
                          : '1px solid rgba(255,255,255,0.1)',
                        color: filters.price.includes('free') ? '#10B981' : '#94A3B8',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        if (!filters.price.includes('free')) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!filters.price.includes('free')) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                        }
                      }}
                    >
                      {t('browseEventsPage.filters.price.free')}
                    </button>
                    <button
                      onClick={() => handleFilterChange('price', 'paid')}
                      className="px-4 py-2 rounded-lg transition-all"
                      style={{
                        backgroundColor: filters.price.includes('paid') 
                          ? 'rgba(6, 132, 245, 0.2)' 
                          : 'rgba(255,255,255,0.05)',
                        border: filters.price.includes('paid')
                          ? '1px solid #0684F5'
                          : '1px solid rgba(255,255,255,0.1)',
                        color: filters.price.includes('paid') ? '#0684F5' : '#94A3B8',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        if (!filters.price.includes('paid')) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!filters.price.includes('paid')) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                        }
                      }}
                    >
                      {t('browseEventsPage.filters.price.paid')}
                    </button>
                  </div>

                  {/* Price Range Slider */}
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full"
                      style={{ accentColor: '#0684F5' }}
                    />
                    <div className="flex justify-between mt-2">
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>$0</span>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                    {t('browseEventsPage.filters.date.title')}
                  </h3>
                  <div className="space-y-2">
                    {dateOptions.map((date) => (
                      <label key={date.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.date.includes(date.value)}
                          onChange={() => handleFilterChange('date', date.value)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: '#0684F5' }}
                        />
                        <span style={{ fontSize: '14px', color: '#94A3B8', textTransform: 'capitalize' }}>
                          {date.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Event Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="browse-events__results-header flex items-center justify-between mb-6">
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                {t('browseEventsPage.results.count', { count: resultsCount })}
              </h2>
              
              <div className="browse-events__sort relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border outline-none appearance-none pr-10"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                >
                  <option value="upcoming">{t('browseEventsPage.sort.upcoming')}</option>
                  <option value="popular">{t('browseEventsPage.sort.popular')}</option>
                  <option value="price-low">{t('browseEventsPage.sort.priceLow')}</option>
                  <option value="price-high">{t('browseEventsPage.sort.priceHigh')}</option>
                </select>
                <ChevronDown 
                  size={18} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#94A3B8' }}
                />
              </div>
            </div>

            {/* Event Cards Grid */}
            <div className="browse-events__grid grid grid-cols-3 gap-6 mb-8">
              {visibleEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl overflow-hidden transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  onClick={() => handleEventClick(event.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image Area */}
                  <div className="relative" style={{ height: '180px' }}>
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Date Badge */}
                    <div
                      className="absolute top-4 left-4"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        padding: '8px',
                        textAlign: 'center',
                        minWidth: '60px',
                        boxShadow: '0px 4px 12px rgba(0,0,0,0.2)'
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', marginBottom: '2px' }}>
                        {event.date.month}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#0B2641' }}>
                        {event.date.day}
                      </div>
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(event.id);
                      }}
                      className="absolute top-4 right-4 p-2 rounded-full transition-all"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(8px)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Heart 
                        size={18} 
                        style={{ 
                          color: likedEvents.has(event.id) ? '#EF4444' : '#6B7280',
                          fill: likedEvents.has(event.id) ? '#EF4444' : 'none'
                        }} 
                      />
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 
                      className="mb-3 line-clamp-2"
                      style={{ 
                        fontSize: '16px', 
                        fontWeight: 700, 
                        color: '#FFFFFF',
                        lineHeight: '1.4',
                        minHeight: '44px'
                      }}
                    >
                      {event.title}
                    </h3>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                          {event.time}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0684F5' }}>
                        {event.price}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full"
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#94A3B8',
                          backgroundColor: 'rgba(255,255,255,0.05)'
                        }}
                      >
                        {event.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {resultsCount > 0 && canLoadMore && (
              <button
                className="w-full py-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
                onClick={() => setVisibleCount((prev) => prev + pageSize)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = '#0684F5';
                  e.currentTarget.style.color = '#0684F5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                {t('browseEventsPage.results.loadMore')}
              </button>
            )}

            {/* Empty State */}
            {resultsCount === 0 && (
              <div 
                className="text-center py-16 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <SlidersHorizontal size={64} style={{ color: '#94A3B8', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  {emptyStateTitle}
                </h3>
                <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '16px' }}>
                  {emptyStateBody}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: '#0684F5',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                >
                  {t('browseEventsPage.filters.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
