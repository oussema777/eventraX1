import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

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
  category: string;
  format: 'in-person' | 'virtual' | 'hybrid';
}

interface WeeklyDigestSectionProps {
  userId: string;
  userInterests?: string[];
  userIndustry?: string;
}

export default function WeeklyDigestSection({ userId, userInterests = [], userIndustry }: WeeklyDigestSectionProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [events, setEvents] = useState<EventCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedEvents = async () => {
      try {
        setIsLoading(true);
        
        // Build query for events matching interests or industry
        let query = supabase
          .from('events')
          .select('id, name, event_type, event_format, event_status, start_date, location_address, cover_image_url')
          .eq('status', 'published')
          .eq('is_approved', true)
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(3);

        // Simple personalization: if user has industry or interests, try to match
        const searchTerms = [...userInterests];
        if (userIndustry) searchTerms.push(userIndustry);

        if (searchTerms.length > 0) {
          // In a real app, this would be a more complex ML-based or text-search query
          // For now, we'll just try to match one of the industries/types
          query = query.in('event_type', searchTerms);
        }

        let { data, error } = await query;

        // If no personalized matches, just get latest upcoming events
        if (error || !data || data.length === 0) {
          const { data: fallbackData } = await supabase
            .from('events')
            .select('id, name, event_type, event_format, event_status, start_date, location_address, cover_image_url')
            .eq('status', 'published')
            .eq('is_approved', true)
            .gte('start_date', new Date().toISOString())
            .order('start_date', { ascending: true })
            .limit(3);
          data = fallbackData;
        }

        if (data) {
          const mapped = data.map((event: any) => {
            const start = event.start_date ? new Date(event.start_date) : null;
            const month = start ? start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'TBD';
            const day = start ? start.getDate().toString().padStart(2, '0') : '--';
            const timeLabel = start
              ? start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              : 'TBD';
            
            return {
              id: event.id,
              title: event.name || 'Untitled Event',
              image: event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
              date: { month, day },
              location: event.event_format === 'virtual' ? 'Online' : (event.location_address || 'TBD'),
              time: timeLabel,
              price: event.event_status === 'free' ? 'Free' : 'Paid',
              category: event.event_type || 'General',
              format: event.event_format || 'in-person'
            };
          });
          setEvents(mapped);
        }
      } catch (err) {
        console.error('Error fetching digest events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedEvents();
  }, [userInterests, userIndustry]);

  if (isLoading || events.length === 0) return null;

  return (
    <section 
      style={{ 
        padding: '80px 20px', 
        backgroundColor: '#0B2641',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0684F5', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              <Sparkles size={18} />
              {t('landing.digest.tagline', 'Personalized for you')}
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF' }}>
              {t('landing.digest.title', 'Your Weekly Digest')}
            </h2>
            <p style={{ fontSize: '18px', color: '#94A3B8', marginTop: '12px' }}>
              {t('landing.digest.subtitle', 'A selection of events matched to your interests.')}
            </p>
          </div>
          <button
            onClick={() => navigate('/browse-events')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#0684F5',
              fontSize: '16px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {t('landing.digest.viewAll', 'View all events')}
            <ArrowRight size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/event/${event.id}/landing`)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
            >
              <div style={{ position: 'relative', height: '200px' }}>
                <ImageWithFallback
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '8px',
                    textAlign: 'center',
                    minWidth: '54px'
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase' }}>
                    {event.date.month}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0B2641' }}>
                    {event.date.day}
                  </div>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0684F5', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {event.category}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px', lineHeight: '1.4' }}>
                  {event.title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '14px' }}>
                    <MapPin size={16} />
                    {event.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '14px' }}>
                    <Clock size={16} />
                    {event.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
