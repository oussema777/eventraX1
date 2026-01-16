import { useState, useEffect, useRef } from 'react';
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  Mic,
  Award,
  ArrowRight,
  Play,
  Mail,
  Phone,
  ExternalLink,
  Check,
  Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { supabase } from '../../lib/supabase';

interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  image: string;
}

interface ScheduleItem {
  time: string;
  title: string;
  speaker?: string;
}

export default function SingleEventLanding() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [showRegisterButton, setShowRegisterButton] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [event, setEvent] = useState<any>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const overviewRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const speakersRef = useRef<HTMLDivElement>(null);
  const exhibitorsRef = useRef<HTMLDivElement>(null);
  const venueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
      trackView();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch Event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // 2. Fetch Speakers
      const { data: speakerData } = await supabase
        .from('event_speakers')
        .select('*')
        .eq('event_id', eventId);
      
      setSpeakers((speakerData || []).map(s => ({
        id: s.id,
        name: s.full_name,
        title: s.title || '',
        company: s.company || '',
        image: s.avatar_url || 'https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?w=400'
      })));

      // 3. Fetch Sessions
      const { data: sessionData } = await supabase
        .from('event_sessions')
        .select('*')
        .eq('event_id', eventId)
        .order('start_time', { ascending: true });
      
      setSessions(sessionData || []);

      // 4. Fetch Sponsors
      const { data: sponsorData } = await supabase
        .from('event_sponsors')
        .select('*')
        .eq('event_id', eventId);
      
      setSponsors(sponsorData || []);

      // 5. Fetch Exhibitors
      const { data: exhibitorData } = await supabase
        .from('event_exhibitors')
        .select('*')
        .eq('event_id', eventId);
      
      setExhibitors(exhibitorData || []);

    } catch (error) {
      console.error('Error fetching event landing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackView = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('event_views').insert([{
        event_id: eventId,
        viewer_profile_id: user?.id || null,
        source: 'direct'
      }]);
    } catch (err) {
      // Silent error for tracking
    }
  };

  // Group sessions by day
  const scheduleByDay: Record<number, any[]> = {};
  if (sessions.length > 0) {
    sessions.forEach(s => {
      const date = new Date(s.start_time).toLocaleDateString();
      // Simple logic: first date found is day 1, second is day 2, etc.
      // For now just use index or mock days if only 1 day
      const day = 1; // Simplify for now
      if (!scheduleByDay[day]) scheduleByDay[day] = [];
      scheduleByDay[day].push({
        time: new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: s.title,
        description: s.description
      });
    });
  } else {
    scheduleByDay[1] = [];
  }

  // Track scroll position for sticky nav button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowRegisterButton(window.scrollY > 500);
    };

    window?.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B2641]">
        <Loader2 className="animate-spin text-[#0684F5]" size={40} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B2641] text-white">
        Event not found.
      </div>
    );
  }

  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>, sectionName: string) => {
    setActiveSection(sectionName);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  return (
    <div style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingTop: '72px' }}>
      {/* Event Specific Navigation - Sticky */}
      <nav
        className="fixed left-0 right-0 z-40 transition-all"
        style={{
          top: '72px',
          height: '60px',
          backgroundColor: 'rgba(11, 38, 65, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div
          className="h-full flex items-center justify-between mx-auto px-6"
          style={{ maxWidth: '1200px' }}
        >
          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            {[
              { label: 'Overview', ref: overviewRef, key: 'overview' },
              { label: 'Schedule', ref: scheduleRef, key: 'schedule' },
              { label: 'Speakers', ref: speakersRef, key: 'speakers' },
              { label: 'Exhibitors', ref: exhibitorsRef, key: 'exhibitors' },
              { label: 'Venue', ref: venueRef, key: 'venue' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => scrollToSection(item.ref, item.key)}
                className="relative transition-colors"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: activeSection === item.key ? '#FFFFFF' : '#94A3B8',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 0'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => {
                  if (activeSection !== item.key) {
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                {item.label}
                {activeSection === item.key && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: '#0684F5'
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Register Button (Appears on Scroll) */}
          {showRegisterButton && (
            <button
              onClick={() => navigate('/event/saas-summit-2024/register')}
              className="px-6 py-2 rounded-lg flex items-center gap-2 transition-all"
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
              Register Now
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div
        ref={overviewRef}
        className="relative"
        style={{
          height: '500px',
          marginTop: '60px',
          backgroundImage: `url('${event.cover_image_url || 'https://images.unsplash.com/photo-1764471444363-e6dc0f9773bc?w=1200'}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(11, 38, 65, 0.7)'
          }}
        />

        {/* Hero Content */}
        <div
          className="relative h-full flex flex-col justify-end"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '60px 40px'
          }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10B981',
              width: 'fit-content'
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10B981'
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
              {event.status?.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h1
            className="mb-4"
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: '1.2'
            }}
          >
            {event.name}
          </h1>

          {/* Subtitle */}
          <p
            className="mb-6"
            style={{
              fontSize: '20px',
              color: '#E2E8F0',
              maxWidth: '700px'
            }}
          >
            {event.tagline || event.description?.substring(0, 150)}
          </p>

          {/* Meta Row */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Calendar size={20} style={{ color: event.primary_color || '#0684F5' }} />
              <span style={{ fontSize: '15px', color: '#E2E8F0' }}>
                {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={20} style={{ color: event.primary_color || '#0684F5' }} />
              <span style={{ fontSize: '15px', color: '#E2E8F0' }}>
                {event.location_address || 'TBD'}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div>
            <button
              onClick={() => navigate(`/event/${event.id}/register`)}
              className="px-8 py-4 rounded-lg flex items-center gap-3 transition-all"
              style={{
                backgroundColor: event.primary_color || '#0684F5',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Register for Event
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Highlights Row - Overlapping Hero */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '-40px auto 0',
          padding: '0 40px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div className="grid grid-cols-3 gap-6">
          <div
            className="p-8 rounded-xl"
            style={{
              backgroundColor: '#1E3A5F',
              boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <Mic size={28} style={{ color: event.primary_color || '#0684F5', marginBottom: '16px' }} />
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              {speakers.length} Speakers
            </div>
            <div style={{ fontSize: '14px', color: '#94A3B8' }}>
              Industry Leaders
            </div>
          </div>

          <div
            className="p-8 rounded-xl"
            style={{
              backgroundColor: '#1E3A5F',
              boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <Clock size={28} style={{ color: event.primary_color || '#0684F5', marginBottom: '16px' }} />
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              {sessions.length} Sessions
            </div>
            <div style={{ fontSize: '14px', color: '#94A3B8' }}>
              Full Program
            </div>
          </div>

          <div
            className="p-8 rounded-xl"
            style={{
              backgroundColor: '#1E3A5F',
              boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <Users size={28} style={{ color: event.primary_color || '#0684F5', marginBottom: '16px' }} />
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              {event.capacity_limit || 'Open'} Seats
            </div>
            <div style={{ fontSize: '14px', color: '#94A3B8' }}>
              Available
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '80px 0', marginTop: '60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div className="grid grid-cols-2 gap-16 items-center">
            {/* Left - Text */}
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '24px' }}>
                About the Event
              </h2>
              <div style={{ fontSize: '16px', color: '#94A3B8', lineHeight: '1.8', marginBottom: '16px' }}>
                {event.description}
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {[
                  'Keynotes from Fortune 500 leaders',
                  'Hands-on workshops and breakout sessions',
                  'Exclusive networking opportunities',
                  'Access to latest SaaS innovations'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: 'rgba(6, 132, 245, 0.2)',
                        border: '1px solid #0684F5'
                      }}
                    >
                      <Check size={14} style={{ color: '#0684F5' }} />
                    </div>
                    <span style={{ fontSize: '15px', color: '#E2E8F0' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Video/Image */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                height: '400px',
                backgroundColor: '#1E3A5F'
              }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHNwZWFrZXIlMjBwcmVzZW50YXRpb258ZW58MXx8fHwxNzY1OTc1MjY5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Event Preview"
                className="w-full h-full object-cover"
              />
              
              {/* Play Button Overlay */}
              <button
                className="absolute inset-0 flex items-center justify-center transition-all"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
              >
                <div
                  className="flex items-center justify-center rounded-full transition-transform"
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Play size={32} style={{ color: '#0684F5', marginLeft: '4px' }} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Speakers Section */}
      <div ref={speakersRef} style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '48px', textAlign: 'center' }}>
            Meet Our Speakers
          </h2>

          <div className="grid grid-cols-4 gap-8">
            {speakers.map((speaker) => (
              <div
                key={speaker.id}
                className="flex flex-col items-center text-center transition-transform cursor-pointer"
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Speaker Image */}
                <div
                  className="rounded-full overflow-hidden mb-4"
                  style={{
                    width: '120px',
                    height: '120px',
                    border: '3px solid rgba(6, 132, 245, 0.3)'
                  }}
                >
                  <ImageWithFallback
                    src={speaker.image}
                    alt={speaker.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Speaker Info */}
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                  {speaker.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '2px' }}>
                  {speaker.title}
                </p>
                <p style={{ fontSize: '12px', color: '#0684F5' }}>
                  {speaker.company}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div ref={scheduleRef} style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '48px', textAlign: 'center' }}>
            Event Schedule
          </h2>

          {/* Day Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            {[1, 2, 3].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className="px-6 py-3 rounded-lg transition-all"
                style={{
                  backgroundColor: selectedDay === day ? '#0684F5' : 'rgba(255,255,255,0.05)',
                  color: selectedDay === day ? '#FFFFFF' : '#94A3B8',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: selectedDay === day ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (selectedDay !== day) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDay !== day) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }
                }}
              >
                Day {day}
              </button>
            ))}
          </div>

          {/* Schedule Items */}
          <div
            className="rounded-xl p-8 mb-6"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="space-y-4">
              {(scheduleByDay[selectedDay] || []).map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-6 pb-4"
                  style={{
                    borderBottom: index < (scheduleByDay[selectedDay]?.length || 0) - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                  }}
                >
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{
                      backgroundColor: 'rgba(6, 132, 245, 0.1)',
                      minWidth: '120px'
                    }}
                  >
                    <Clock size={16} style={{ color: event.primary_color || '#0684F5' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: event.primary_color || '#0684F5' }}>
                      {item.time}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                      {item.title}
                    </h4>
                    {item.description && (
                      <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {(scheduleByDay[selectedDay] || []).length === 0 && (
                 <div className="text-center py-10 text-gray-500">No sessions scheduled for this day.</div>
              )}
            </div>
          </div>

          {/* View Full Schedule Button */}
          <div className="flex justify-center">
            <button
              className="px-6 py-3 rounded-lg transition-all"
              style={{
                backgroundColor: 'transparent',
                color: '#0684F5',
                fontSize: '14px',
                fontWeight: 600,
                border: '1px solid #0684F5',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              View Full Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Exhibitors & Sponsors Section */}
      <div ref={exhibitorsRef} style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '48px', textAlign: 'center' }}>
            Our Partners
          </h2>

          {/* Platinum Sponsors */}
          {sponsors.length > 0 && (
            <div className="mb-12">
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#94A3B8', marginBottom: '24px', textAlign: 'center' }}>
                Featured Sponsors
              </h3>
              <div className="grid grid-cols-3 gap-8">
                {sponsors.map((sponsor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center p-8 rounded-xl transition-all cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      height: '120px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.borderColor = event.primary_color || '#0684F5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    {sponsor.logo_url ? (
                       <img src={sponsor.logo_url} alt={sponsor.name} style={{ maxHeight: '60px' }} />
                    ) : (
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                        {sponsor.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exhibitors */}
          {exhibitors.length > 0 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#94A3B8', marginBottom: '24px', textAlign: 'center' }}>
                Exhibitors
              </h3>
              <div className="grid grid-cols-6 gap-4">
                {exhibitors.map((exhibitor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center p-4 rounded-lg transition-all cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      height: '80px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textAlign: 'center' }}>
                      {exhibitor.company}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sponsors.length === 0 && exhibitors.length === 0 && (
             <div className="text-center py-10 text-gray-500">No partners listed yet.</div>
          )}
        </div>
      </div>

      {/* Venue Section */}
      <div ref={venueRef} style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '48px', textAlign: 'center' }}>
            Venue & Contact
          </h2>

          <div className="grid grid-cols-2 gap-12 items-start">
            {/* Left - Map */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                height: '400px',
                backgroundColor: '#1E3A5F'
              }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1639527027808-7d178a943028?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW4lMjBmcmFuY2lzY28lMjBtb3Njb25lfGVufDF8fHx8MTc2NTk4NzI2M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Venue Location"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right - Venue Info */}
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginBottom: '24px' }}>
                Venue Information
              </h3>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'rgba(6, 132, 245, 0.1)',
                      flexShrink: 0
                    }}
                  >
                    <MapPin size={24} style={{ color: '#0684F5' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>
                      Address
                    </h4>
                    <p style={{ fontSize: '16px', color: '#FFFFFF' }}>
                      Moscone Center
                      <br />
                      747 Howard Street
                      <br />
                      San Francisco, CA 94103
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'rgba(6, 132, 245, 0.1)',
                      flexShrink: 0
                    }}
                  >
                    <Mail size={24} style={{ color: '#0684F5' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>
                      Email
                    </h4>
                    <p style={{ fontSize: '16px', color: '#FFFFFF' }}>
                      hello@eventra.com
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'rgba(6, 132, 245, 0.1)',
                      flexShrink: 0
                    }}
                  >
                    <Phone size={24} style={{ color: '#0684F5' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>
                      Phone
                    </h4>
                    <p style={{ fontSize: '16px', color: '#FFFFFF' }}>
                      +1 (415) 555-0123
                    </p>
                  </div>
                </div>

                {/* Get Directions Button */}
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all mt-8"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = '#0684F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                >
                  <ExternalLink size={18} />
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0684F5 0%, #7C3AED 100%)',
          padding: '80px 0'
        }}
      >
        <div
          className="flex flex-col items-center text-center"
          style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}
        >
          <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
            Ready to Join Us?
          </h2>
          <p style={{ fontSize: '18px', color: '#E2E8F0', marginBottom: '32px' }}>
            Don't miss this opportunity to connect with industry leaders and innovators.
            Secure your spot today!
          </p>
          <button
            className="px-10 py-4 rounded-lg flex items-center gap-3 transition-all"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0684F5',
              fontSize: '18px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0px 10px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Get Your Ticket
            <ArrowRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}