import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  MapPin,
  Tag,
  ChevronDown,
  Loader2
} from 'lucide-react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  image: string;
  status: 'upcoming' | 'filling-fast' | 'free';
  date: string;
  location: string;
  title: string;
  description: string;
  price: number | 'free' | string;
  category: string;
}

export default function BrowseEventsPublic() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [activeFilter]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'published')
        .order('start_date', { ascending: true });

      // Apply simple filtering if needed based on activeFilter
      // For now, we fetch all published public events

      const { data, error } = await query;

      if (error) throw error;

      const mappedEvents: Event[] = (data || []).map((event: any) => {
        const startDate = event.start_date ? new Date(event.start_date) : new Date();
        const isUpcoming = startDate > new Date();
        
        let status: 'upcoming' | 'filling-fast' | 'free' = 'upcoming';
        if (event.pricing_type === 'free') {
          status = 'free';
        } else if (isUpcoming && Math.random() > 0.7) { 
          // Simulate "filling fast" for demo purposes or use capacity logic if available
          status = 'filling-fast';
        }

        return {
          id: event.id,
          image: event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          status: status,
          date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          location: event.event_format === 'virtual' ? 'Online Event' : (event.location_address || 'TBD'),
          title: event.name,
          description: event.description || '',
          price: event.pricing_type === 'free' ? 'free' : 'Paid',
          category: event.event_type || 'General'
        };
      });

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status: Event['status']) => {
    const styles = {
      'upcoming': {
        bg: '#E6F4EA',
        text: '#1F7A3E',
        label: 'Upcoming'
      },
      'filling-fast': {
        bg: '#FFF3E0',
        text: '#B54708',
        label: 'Filling Fast'
      },
      'free': {
        bg: '#E0E7FF',
        text: '#635BFF',
        label: 'Free'
      }
    };
    return styles[status];
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFBFC' }}>
      {/* Navbar */}
      <NavbarLoggedIn
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        currentPage="browse-events"
      />

      {/* Main Content */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px 80px 80px' }}>
        
        {/* Hero Section */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '60px',
            borderRadius: '16px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
            marginBottom: '32px'
          }}
        >
          <h1
            style={{
              fontFamily: 'Inter',
              fontSize: '48px',
              fontWeight: 700,
              color: '#1A1D1F',
              textAlign: 'center',
              marginBottom: '16px'
            }}
          >
            Discover Your Next Professional Event
          </h1>
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: '18px',
              color: '#6F767E',
              textAlign: 'center',
              marginBottom: '32px'
            }}
          >
            Connect with industry leaders, expand your network, and accelerate your business growth
          </p>

          {/* Search Bar */}
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9A9FA5'
              }}
            />
            <input
              type="text"
              placeholder="Search events by name, category, or location..."
              style={{
                width: '100%',
                height: '56px',
                paddingLeft: '56px',
                paddingRight: '20px',
                backgroundColor: '#F4F5F6',
                border: '2px solid transparent',
                borderRadius: '12px',
                fontFamily: 'Inter',
                fontSize: '16px',
                color: '#1A1D1F',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#635BFF';
                e.currentTarget.style.boxShadow = '0px 0px 0px 4px rgba(99, 91, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Filters & Sort Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}
        >
          {/* Left - Filter Chips */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { id: 'all', label: 'All Events', icon: null },
              { id: 'date', label: 'Date Range', icon: Calendar },
              { id: 'location', label: 'Location', icon: MapPin },
              { id: 'category', label: 'Category', icon: Tag }
            ].map(filter => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;
              
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    backgroundColor: isActive ? '#635BFF' : '#F4F5F6',
                    border: isActive ? 'none' : '1px solid #E9EAEB',
                    borderRadius: '8px',
                    color: isActive ? '#FFFFFF' : '#6F767E',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isActive ? '#7C75FF' : '#E9EAEB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isActive ? '#635BFF' : '#F4F5F6';
                  }}
                >
                  {Icon && <Icon size={16} />}
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Right - Sort Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              style={{
                width: '200px',
                height: '40px',
                padding: '0 40px 0 16px',
                backgroundColor: '#F4F5F6',
                border: '1px solid #E9EAEB',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                color: '#6F767E',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none'
              }}
            >
              <option>Sort by: Upcoming</option>
              <option>Sort by: Price (Low to High)</option>
              <option>Sort by: Price (High to Low)</option>
              <option>Sort by: Most Popular</option>
            </select>
            <ChevronDown
              size={16}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6F767E',
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <Loader2 className="animate-spin text-[#635BFF]" size={40} />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6F767E' }}>
            <p style={{ fontSize: '18px', fontWeight: 500 }}>No events found.</p>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        )}

        {/* Events Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '48px'
          }}
        >
          {events.map((event) => {
            const statusStyle = getStatusStyle(event.status);
            
            return (
              <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Card Image */}
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={event.image}
                    alt={event.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  
                  {/* Status Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      height: '28px',
                      padding: '0 12px',
                      backgroundColor: statusStyle.bg,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: statusStyle.text
                      }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '20px' }}>
                  {/* Date & Location */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} style={{ color: '#9A9FA5' }} />
                      <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#6F767E' }}>
                        {event.date}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={16} style={{ color: '#9A9FA5' }} />
                      <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#6F767E' }}>
                        {event.location}
                      </span>
                    </div>
                  </div>

                  {/* Event Title */}
                  <h3
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#1A1D1F',
                      marginBottom: '8px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.3
                    }}
                  >
                    {event.title}
                  </h3>

                  {/* Event Description */}
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      color: '#6F767E',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.5
                    }}
                  >
                    {event.description}
                  </p>

                  {/* Card Footer */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #E9EAEB',
                      paddingTop: '16px'
                    }}
                  >
                    {/* Price */}
                    <div>
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '18px',
                          fontWeight: 700,
                          color: event.price === 'free' ? '#1F7A3E' : '#1A1D1F'
                        }}
                      >
                        {event.price === 'free' ? 'Free' : `From ${event.price}`}
                      </span>
                    </div>

                    {/* CTA Button */}
                    <button
                      style={{
                        height: '36px',
                        padding: '0 16px',
                        backgroundColor: '#635BFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#7C75FF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#635BFF';
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/event/${event.id}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: currentPage === page ? '#635BFF' : '#F4F5F6',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 500,
                color: currentPage === page ? '#FFFFFF' : '#6F767E',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== page) {
                  e.currentTarget.style.backgroundColor = '#E9EAEB';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== page) {
                  e.currentTarget.style.backgroundColor = '#F4F5F6';
                }
              }}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}