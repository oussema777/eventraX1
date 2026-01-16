import { useEffect, useMemo, useState } from 'react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import Breadcrumb from '../components/dashboard/Breadcrumb';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsRow from '../components/dashboard/StatsRow';
import FilterBar from '../components/dashboard/FilterBar';
import EventsGrid from '../components/dashboard/EventsGrid';
import Pagination from '../components/dashboard/Pagination';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function MyEventsDashboard() {
  const { user } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'recent' | 'oldest'>('recent');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 6;

  const fetchEvents = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortOption]);

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (activeTab !== 'all') {
      if (activeTab === 'live') {
        filtered = filtered.filter((event) => ['live', 'published'].includes(event.status));
      } else {
        filtered = filtered.filter((event) => event.status === activeTab);
      }
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((event) => {
        const name = String(event.name || '').toLowerCase();
        const type = String(event.event_type || '').toLowerCase();
        const location = String(event.location_address || '').toLowerCase();
        return name.includes(query) || type.includes(query) || location.includes(query);
      });
    }

    const getSortValue = (event: any) => {
      const raw = event?.created_at || event?.start_date;
      if (!raw) return 0;
      const parsed = new Date(raw).getTime();
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const sorted = [...filtered].sort((a, b) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);
      return sortOption === 'oldest' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [events, activeTab, searchQuery, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    if (currentPage !== currentPageSafe) {
      setCurrentPage(currentPageSafe);
    }
  }, [currentPage, currentPageSafe]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Fixed Navigation */}
      <NavbarLoggedIn 
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        currentPage="my-events"
      />

      {/* Breadcrumb */}
      <div style={{ marginTop: '72px' }}>
        <Breadcrumb />
      </div>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 py-10">
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Key Stats Row */}
        <StatsRow />

        {/* Filter & Search Bar */}
        <FilterBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        {/* Events Grid */}
        <EventsGrid events={paginatedEvents} isLoading={isLoading} refreshEvents={fetchEvents} />

        {/* Pagination */}
        <Pagination currentPage={currentPageSafe} setCurrentPage={setCurrentPage} totalPages={totalPages} />
      </main>
    </div>
  );
}
