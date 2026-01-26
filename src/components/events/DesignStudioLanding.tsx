import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import HeroBlock from '../design-studio/blocks/HeroBlock';
import AboutBlock from '../design-studio/blocks/AboutBlock';
import EventDetailsBlock from '../design-studio/blocks/EventDetailsBlock';
import SpeakersBlock from '../design-studio/blocks/SpeakersBlock';
import AgendaBlock from '../design-studio/blocks/AgendaBlock';
import TicketsBlock from '../design-studio/blocks/TicketsBlock';
import FooterBlock from '../design-studio/blocks/FooterBlock';
import LandingPageNavbar from './LandingPageNavbar';
import { useAuth } from '../../contexts/AuthContext';

interface EventRecord {
  id: string;
  name?: string;
  tagline?: string;
  description?: string;
  event_type?: string;
  event_status?: string;
  event_format?: string;
  start_date?: string;
  end_date?: string;
  timezone?: string;
  location_address?: string;
  capacity_limit?: number;
  branding_settings?: any;
}

interface DesignStudioSettings {
  activeBlocks: any[];
  brandColor: string;
  buttonRadius: number;
  logoUrl?: string;
}

interface SpeakerCard {
  name: string;
  title?: string;
  company?: string;
  avatarUrl?: string;
}

interface AgendaSession {
  day: number;
  time: string;
  duration: string;
  title: string;
  speaker?: string;
  location?: string;
  tags?: string[];
}

interface AgendaDay {
  day: number;
  label: string;
}

interface TicketCard {
  name: string;
  price: string;
  popular: boolean;
  features: string[];
}

const DEFAULT_DESIGN: DesignStudioSettings = {
  activeBlocks: [],
  brandColor: '#635BFF',
  buttonRadius: 12
};

const formatDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString();
};

const formatTime = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (start?: string, end?: string) => {
  if (!start || !end) return 'Session';
  const startTime = new Date(start);
  const endTime = new Date(end);
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) return 'Session';
  const minutes = Math.max(0, Math.round((endTime.getTime() - startTime.getTime()) / 60000));
  if (!minutes) return 'Session';
  return `${minutes} minutes`;
};

const formatPrice = (price?: number, currency?: string) => {
  if (typeof price !== 'number') return 'Free';
  const safeCurrency = currency || 'USD';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 0
    }).format(price);
  } catch {
    return `${price} ${safeCurrency}`;
  }
};

export default function DesignStudioLanding({ onRegisterRequest }: { onRegisterRequest?: () => void }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [design, setDesign] = useState<DesignStudioSettings>(DEFAULT_DESIGN);
  const [speakers, setSpeakers] = useState<SpeakerCard[]>([]);
  const [sessions, setSessions] = useState<AgendaSession[]>([]);
  const [days, setDays] = useState<AgendaDay[]>([]);
  const [tickets, setTickets] = useState<TicketCard[]>([]);
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [attendeesCount, setAttendeesCount] = useState(0);

  const handleRegister = () => {
    if (eventId) {
      navigate(`/event/${eventId}/register`);
    }
  };

  const handleNavigate = (section: string) => {
    if (section === 'landing') {
      navigate(`/event/${eventId}/landing`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate(`/event/${eventId}/${section}`);
  };

  // 1. Public Data Fetch (Runs once)
  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    const loadPublic = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          params.delete('access_token');
          params.delete('refresh_token');
          const nextSearch = params.toString();
          const nextUrl = nextSearch ? `${window.location.pathname}?${nextSearch}` : window.location.pathname;
          window.history.replaceState({}, '', nextUrl);
        }

        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle();
        if (eventError && eventError.code !== 'PGRST116') throw eventError;

        setEvent(eventData);
        const designSettings = eventData?.branding_settings?.design_studio;
        if (designSettings) {
          setDesign({
            activeBlocks: Array.isArray(designSettings.activeBlocks) ? designSettings.activeBlocks : [],
            brandColor: designSettings.brandColor || DEFAULT_DESIGN.brandColor,
            buttonRadius: Number.isFinite(designSettings.buttonRadius) ? designSettings.buttonRadius : DEFAULT_DESIGN.buttonRadius,
            logoUrl: designSettings.logoUrl
          });
        } else {
          setDesign(DEFAULT_DESIGN);
        }

        const [speakerRes, sessionRes, ticketRes, exhibitorRes, attendeeRes] = await Promise.all([
          supabase.from('event_speakers').select('*').eq('event_id', eventId),
          supabase.from('event_sessions').select('*').eq('event_id', eventId).order('starts_at', { ascending: true }),
          supabase.from('event_tickets').select('*').eq('event_id', eventId),
          supabase.from('event_exhibitors').select('*').eq('event_id', eventId),
          supabase.from('event_attendees').select('id', { count: 'exact', head: true }).eq('event_id', eventId)
        ]);

        if (exhibitorRes.data) setExhibitors(exhibitorRes.data);
        if (attendeeRes.count) setAttendeesCount(attendeeRes.count);

        if (speakerRes.error) console.warn('Failed to load speakers:', speakerRes.error);
        
        const speakerRows = speakerRes.data || [];
        setSpeakers(speakerRows.map((row: any) => ({
          name: row.full_name || row.name || 'Speaker',
          title: row.title || '',
          company: row.company || '',
          avatarUrl: row.avatar_url || row.photo_url || ''
        })));

        const sessionRows = sessionRes.data || [];
        const mappedSessions: AgendaSession[] = sessionRows.map((row: any) => {
          const dayValue = Number.isFinite(row.day) ? Number(row.day) : 1;
          const tags = [];
          if (row.track) tags.push(row.track);
          if (row.status) tags.push(row.status);
          return {
            day: dayValue || 1,
            time: formatTime(row.starts_at),
            duration: formatDuration(row.starts_at, row.ends_at),
            title: row.title || 'Session',
            speaker: row.speaker_name || row.speaker || 'TBD',
            location: row.location || eventData?.location_address || 'TBD',
            tags
          };
        });
        setSessions(mappedSessions);

        const dayLabels = new Map<number, string>();
        mappedSessions.forEach((session) => {
          if (dayLabels.has(session.day)) return;
          const row = sessionRows.find((item: any) => {
            const dayValue = Number.isFinite(item.day) ? Number(item.day) : 1;
            return dayValue === session.day;
          });
          const dateLabel = formatDate(row?.starts_at);
          dayLabels.set(session.day, dateLabel ? `Day ${session.day} - ${dateLabel}` : `Day ${session.day}`);
        });
        if (dayLabels.size === 0) {
          dayLabels.set(1, 'Day 1');
        }
        setDays(Array.from(dayLabels.entries()).map(([day, label]) => ({ day, label })));

        const ticketRows = ticketRes.data || [];
        const mappedTickets: TicketCard[] = ticketRows.map((row: any) => ({
          name: row.name || 'General Admission',
          price: formatPrice(row.price, row.currency),
          popular: !!row.is_vip,
          features: Array.isArray(row.includes) && row.includes.length > 0
            ? row.includes
            : row.description
              ? [row.description]
              : []
        }));

        if (mappedTickets.length > 0 && !mappedTickets.some((ticket) => ticket.popular)) {
          let highest = 0;
          let highestIndex = 0;
          mappedTickets.forEach((ticket, index) => {
            const match = ticket.price.match(/[\d,.]+/);
            const value = match ? Number(match[0].replace(/,/g, '')) : 0;
            if (value >= highest) {
              highest = value;
              highestIndex = index;
            }
          });
          mappedTickets[highestIndex] = {
            ...mappedTickets[highestIndex],
            popular: true
          };
        }
        setTickets(mappedTickets);
      } catch (error) {
        console.error('Failed to load landing data:', error);
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPublic();
  }, [eventId]);

  // 2. Private Data Fetch (Runs when Auth is ready)
  useEffect(() => {
    if (!eventId || isLoadingAuth) return;

    const loadPrivate = async () => {
      if (!user) {
        setIsRegistered(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('event_attendees')
          .select('id')
          .eq('event_id', eventId)
          .eq('profile_id', user.id)
          .maybeSingle();
        
        setIsRegistered(!!data);
      } catch (e) {
        console.error('Failed to check registration:', e);
      }
    };
    loadPrivate();
  }, [eventId, user, isLoadingAuth]);

  const orderedBlocks = useMemo(() => {
    const blocks = Array.isArray(design.activeBlocks) ? design.activeBlocks : [];
    return [...blocks].sort((a, b) => {
      const aPos = Number.isFinite(a?.position) ? a.position : 0;
      const bPos = Number.isFinite(b?.position) ? b.position : 0;
      return aPos - bPos;
    });
  }, [design.activeBlocks]);

  const renderBlock = (block: any) => {
    if (!block?.isVisible) return null;
    const blockType = block.blockId || block.type;
    const sharedProps = {
      showEditControls: false,
      brandColor: design.brandColor,
      buttonRadius: design.buttonRadius
    };

    switch (blockType) {
      case 'hero':
        return <HeroBlock key={block.id} {...sharedProps} event={event || undefined} onRegister={handleRegister} isRegistered={isRegistered} settings={block.settings} />;
      case 'about':
        const aboutData = block.settings?.title 
          ? { 
              name: block.settings.title, 
              tagline: block.settings.subtitle, 
              description: block.settings.description,
              features: block.settings.features,
              image: block.settings.image
            } 
          : (event || undefined);
        return <AboutBlock key={block.id} {...sharedProps} event={aboutData} />;
      case 'event-details':
      case 'details':
        return <EventDetailsBlock key={block.id} {...sharedProps} event={event || undefined} />;
      case 'speakers':
        return <SpeakersBlock key={block.id} {...sharedProps} speakers={speakers} />;
      case 'agenda':
        return <AgendaBlock key={block.id} {...sharedProps} sessions={sessions} days={days} />;
      case 'tickets':
        return <TicketsBlock key={block.id} {...sharedProps} tickets={tickets} onRegister={handleRegister} />;
      case 'footer':
        return <FooterBlock key={block.id} {...sharedProps} event={event || undefined} settings={block.settings} />;
      default:
        return null;
    }
  };

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

  if (!orderedBlocks.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B2641] text-white">
        This event does not have a published design yet.
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', position: 'relative' }}>
      <LandingPageNavbar 
        activeSections={{
          agenda: sessions.length > 0,
          speakers: speakers.length > 0,
          exhibitors: exhibitors.length > 0,
          attendees: attendeesCount > 0
        }}
        brandColor={design.brandColor}
        logoUrl={design.logoUrl}
        isRegistered={isRegistered}
        onNavigate={handleNavigate}
        onRegister={handleRegister}
      />
      {orderedBlocks.map((block) => {
        const blockType = block.blockId || block.type;
        return (
          <div id={blockType} key={block.id}>
            {renderBlock(block)}
          </div>
        );
      })}
    </div>
  );
}