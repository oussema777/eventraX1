import EventNetworkingBanner from '../components/networking/EventNetworkingBanner';
import ParticipantDirectoryFilters from '../components/networking/ParticipantDirectoryFilters';
import { eventAuthPath, eventMeetingAuthPath } from '../utils/authRedirect';
import ParticipantCard from '../components/networking/ParticipantCard';
import { loadEventParticipantDirectory } from '../lib/eventParticipantDirectory';
import { normalizeNetworkingValue, sectorOptions } from '../utils/eventNetworkingFields';
import EventMatchSuggestions from '../components/networking/EventMatchSuggestions';
import { useEventRecommendations } from '../hooks/useEventRecommendations';
import { eventPublicPath } from '../utils/eventLinks';
import { useEventRouteParams } from '../components/navigation/EventPublicRoute';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, User, MapPin, Check, Heart, Sparkles, Users, CreditCard, Building, Share2, Ticket, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import LandingPageNavbar from '../components/events/LandingPageNavbar';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { useAuth } from '../contexts/AuthContext';
import BookMeetingModal from '../components/networking/BookMeetingModal';
import { useMessageThread } from '../hooks/useMessageThread';
import { toast } from 'sonner';
import { useI18n } from '../i18n/I18nContext';
import SEOHead from '../components/SEOHead';
import { canonicalUrl } from '../utils/seo';
import { getWorkshopLimit, isSessionOpen } from '../utils/sessionBooking';
import { groupAgendaSessions, resolveAgendaTimeZone } from '../utils/agendaDates';
import { replaceWorkshopBooking } from '../lib/sessionBookings';
import WorkshopReplacementPrompt from '../components/events/WorkshopReplacementPrompt';

type SectionType = 'agenda' | 'speakers' | 'exhibitors' | 'attendees' | 'sponsors' | 'packages' | 'tickets';

export default function EventSectionPage({ type }: { type: SectionType }) {
  const { eventId } = useEventRouteParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoading: isLoadingAuth, signOut } = useAuth();
  const { getOrCreateThread, loading: isMessageLoading } = useMessageThread();
  const { t, locale } = useI18n();
  const recommendations = useEventRecommendations(eventId, user?.id, type === 'attendees');
  const [isBookingSession, setIsBookingSession] = useState(false);
  const bookingLock = useRef(false);
  const [replacementSessionId, setReplacementSessionId] = useState<string | null>(null);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [counts, setCounts] = useState({ agenda: 0, speakers: 0, exhibitors: 0, attendees: 0, sponsors: 0, packages: 0, tickets: 0 });
  const [isRegistered, setIsRegistered] = useState(false);
  const [mySessionIds, setMySessionIds] = useState<Set<string>>(new Set());
  const [attendeeId, setAttendeeId] = useState<string | null>(null);
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [directoryFailed, setDirectoryFailed] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = type === 'attendees' ? 48 : 50;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Event attendees use their registration email for every sign-in entry point.
  // Also recover a general login dialog left open before a route change or hot update.
  useEffect(() => {
    if (type !== 'attendees' || !eventId || (!showLoginModal && !showRegistrationModal)) return;
    setShowLoginModal(false);
    setShowRegistrationModal(false);
    navigate(showRegistrationModal ? `/event/${eventId}/register` : eventAuthPath(`/event/${eventId}/attendees`));
  }, [type, eventId, showLoginModal, showRegistrationModal, navigate]);

  // The email link carries the selected profile, including when opened on another device.
  // Only restore a person from this event's loaded B2B directory; never create a meeting here.
  const requestedMeeting = searchParams.get('bookMeeting');
  useEffect(() => {
    if (type !== 'attendees' || !requestedMeeting || !user || isLoadingAuth || isLoadingData || directoryFailed || event?.id !== eventId) return;
    const person = (data || []).find((attendee: { profile_id?: string }) => attendee.profile_id === requestedMeeting);
    if (person && person.profile_id !== user.id) {
      setSelectedAttendee({ id: person.profile_id, name: person.name, avatar: person.final_avatar });
    } else if (!person) {
      toast.error(t('networking.errors.participantMissing'));
    }
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      next.delete('bookMeeting');
      return next;
    }, { replace: true });
  }, [type, requestedMeeting, user, isLoadingAuth, isLoadingData, directoryFailed, event?.id, eventId, data, setSearchParams, t]);

  const handleBookMeeting = (person: { id: string; name: string; avatar?: string | null }) => {
    if (!user) {
      if (eventId) navigate(eventMeetingAuthPath(eventId, person.id));
      return;
    }
    setSelectedAttendee(person);
  };

  // 1. Fetch Public Data (Event, Counts, Section Content)
  useEffect(() => {
    if (!eventId) return;
    const loadPublic = async () => {
      setIsLoadingData(true);
      setPage(1);
      try {
        const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
        setEvent(eventData);

        const [spk, sess, exh, att, spon, tix] = await Promise.all([
          supabase.from('event_speakers').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_sessions').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_exhibitors').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_attendees').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_sponsors').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_tickets').select('id', { count: 'exact', head: true }).eq('event_id', eventId)
        ]);
        
        const packagesCount = Array.isArray(eventData?.sponsorship_settings) ? eventData.sponsorship_settings.length : 0;

        setCounts({
          speakers: spk.count || 0,
          agenda: sess.count || 0,
          exhibitors: exh.count || 0,
          attendees: type === 'attendees' ? 0 : att.count || 0,
          sponsors: spon.count || 0,
          packages: packagesCount,
          tickets: tix.count || 0
        });

        if (type === 'agenda') {
          const [{ data: agendaData }, { data: speakersData }] = await Promise.all([
            supabase.from('event_sessions').select('*').eq('event_id', eventId).order('starts_at', { ascending: true }),
            supabase.from('event_speakers').select('*').eq('event_id', eventId)
          ]);
          
          const mapped = (agendaData || []).map((s: any) => ({
            ...s,
            speaker_details: (speakersData || []).filter((spk: any) => (s.speaker_ids || []).includes(spk.id))
          }));
          
          setData(mapped);
        } else if (type === 'tickets') {
          const { data: ticketsData } = await supabase.from('event_tickets').select('*').eq('event_id', eventId).order('price', { ascending: true });
          setData(ticketsData || []);
        } else if (type === 'packages') {
          setData(eventData?.sponsorship_settings || []);
        } else if (type === 'sponsors') {
          const { data: sponsorRows } = await supabase
            .from('event_sponsors')
            .select('*')
            .eq('event_id', eventId)
            .order('sort_order', { ascending: true });
          
          setData(sponsorRows);
        } else if (type === 'speakers') {
          await fetchSpeakerBatch(1, true);
        } else if (type === 'exhibitors') {
          await fetchExhibitorBatch(1, true);
        } else if (type === 'attendees') {
          await fetchAttendeeBatch(1, true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadPublic();
  }, [eventId, type]);

  const fetchSpeakerBatch = async (pageNumber: number, isInitial: boolean = false) => {
    if (!eventId) return;
    if (!isInitial) setIsLoadingMore(true);
    const start = (pageNumber - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    const { data: speakers, error } = await supabase
      .from('event_speakers')
      .select('*')
      .eq('event_id', eventId)
      .order('full_name', { ascending: true })
      .range(start, end);
    
    if (error) {
      console.error('Error fetching speakers:', error);
      if (isInitial) setData([]);
      setIsLoadingMore(false);
      return;
    }

    setData(speakers);
    setIsLoadingMore(false);
    if (!isInitial) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchExhibitorBatch = async (pageNumber: number, isInitial: boolean = false) => {
    if (!eventId) return;
    if (!isInitial) setIsLoadingMore(true);
    const start = (pageNumber - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    const { data: exhibitors, error } = await supabase
      .from('event_exhibitors')
      .select('*')
      .eq('event_id', eventId)
      .order('company_name', { ascending: true })
      .range(start, end);
    
    if (error) {
      console.error('Error fetching exhibitors:', error);
      if (isInitial) setData([]);
      setIsLoadingMore(false);
      return;
    }

    setData(exhibitors);
    setIsLoadingMore(false);
    if (!isInitial) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchAttendeeBatch = async (_pageNumber: number, _isInitial = false) => {
    if (!eventId) return;
    setIsLoadingMore(true);
    setDirectoryFailed(false);
    try {
      const participants = await loadEventParticipantDirectory(eventId, { networkingOnly: true });
      setData(participants);
      setCounts(previous => ({ ...previous, attendees: participants.length }));
      setPage(1);
    } catch {
      setDirectoryFailed(true);
      setData([]);
      setCounts(previous => ({ ...previous, attendees: 0 }));
    } finally { setIsLoadingMore(false); }
  };

  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    if (type === 'attendees') {
      document.getElementById('attendee-directory')?.scrollIntoView({ block: 'start' });
    } else if (type === 'speakers') {
      await fetchSpeakerBatch(newPage);
    } else if (type === 'exhibitors') {
      await fetchExhibitorBatch(newPage);
    }
  };

  const PaginationControls = ({ totalItems }: { totalItems: number }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '60px', opacity: isLoadingMore ? 0.7 : 1, pointerEvents: isLoadingMore ? 'none' : 'auto' }}>
        <button
          onClick={() => handlePageChange(Math.max(1, page - 1))}
          disabled={page === 1 || isLoadingMore}
          style={{
            padding: '10px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: (page === 1 || isLoadingMore) ? 'not-allowed' : 'pointer',
            opacity: page === 1 ? 0.5 : 1,
            transition: 'all 0.2s'
          }}
        >
          {t('attendeeExperience.previous')}
        </button>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;

            return (
              <button
                key={pageNum}
                aria-label={t('attendeeExperience.page', { page: pageNum })}
                aria-current={page === pageNum ? 'page' : undefined}
                onClick={() => handlePageChange(pageNum)}
                disabled={isLoadingMore}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: page === pageNum ? brandColor : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid',
                  borderColor: page === pageNum ? brandColor : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || isLoadingMore}
          style={{
            padding: '10px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: (page === totalPages || isLoadingMore) ? 'not-allowed' : 'pointer',
            opacity: page === totalPages ? 0.5 : 1,
            transition: 'all 0.2s'
          }}
        >
          {t('attendeeExperience.next')}
        </button>
      </div>
    );
  };

  // 2. Fetch Private Data
  useEffect(() => {
    if (!eventId || isLoadingAuth) return;
    const loadPrivate = async () => {
      if (!user) {
        setIsRegistered(false);
        setAttendeeId(null);
        setMySessionIds(new Set());
        return;
      }
      try {
        const { data: regData } = await supabase.from('event_attendees').select('id').eq('event_id', eventId).eq('profile_id', user.id).maybeSingle();
        if (regData) {
          setIsRegistered(true);
          setAttendeeId(regData.id);
          const { data: mySessions } = await supabase.from('event_attendee_sessions').select('session_id').eq('attendee_id', regData.id);
          if (mySessions) setMySessionIds(new Set(mySessions.map(r => r.session_id)));
        } else {
          setIsRegistered(false);
          setAttendeeId(null);
          setMySessionIds(new Set());
        }
      } catch (e) {
        console.error('Failed to load private data', e);
      }
    };
    loadPrivate();
  }, [eventId, user, isLoadingAuth]);

  const handleNavigate = (section: string) => {
    navigate(eventPublicPath(event || { id: eventId! }, section));
  };

  const handleRegister = () => {
    navigate(`/event/${eventId}/register`);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleGoogleSignup = async () => setShowRegistrationModal(false);
  const handleEmailSignup = async () => setShowRegistrationModal(false);
  const handleLoginSuccess = () => setShowLoginModal(false);
  const handleGoogleLogin = async () => setShowLoginModal(false);
  
  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowRegistrationModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegistrationModal(false);
    setShowLoginModal(true);
  };

  const handleToggleSession = async (sessionId: string) => {
    if (bookingLock.current) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!attendeeId) { handleRegister(); return; }
    const isAdded = mySessionIds.has(sessionId);
    const nextSet = new Set(mySessionIds);
    if (!isAdded) {
      const session = (data || []).find((s: any) => s.id === sessionId);
      if (!session || !isSessionOpen(session)) {
        toast.error(t('agendaBooking.sessionUnavailable'));
        return;
      }
      const limit = getWorkshopLimit(event?.workshop_selection_limit);
      const workshops = (data || []).filter((s: any) => s.type === 'workshop' && mySessionIds.has(s.id)).length;
      if (session.type === 'workshop' && limit !== null && workshops >= limit) {
        if (limit === 1 && workshops === 1) {
          if (replacementSessionId === sessionId) await handleReplaceWorkshop(sessionId);
          else setReplacementSessionId(sessionId);
          return;
        }
        toast.error(t(limit === 1 ? 'agendaBooking.workshopLimitReachedSingle' : 'agendaBooking.workshopLimitReached', { count: limit }));
        return;
      }
    }
    bookingLock.current = true;
    setIsBookingSession(true);
    try {
      const { error } = isAdded
        ? await supabase.from('event_attendee_sessions').delete().eq('attendee_id', attendeeId).eq('session_id', sessionId)
        : await supabase.from('event_attendee_sessions').insert({ attendee_id: attendeeId, session_id: sessionId });
      if (error) throw error;
      if (isAdded) nextSet.delete(sessionId); else nextSet.add(sessionId);
      setMySessionIds(nextSet);
      setReplacementSessionId(null);
    } catch {
      toast.error(t('agendaBooking.bookingRejected'));
      // Reconcile concurrent bookings or organizer changes without showing a
      // successful selection when the database rejected it.
      const [bookings, sessions, rules] = await Promise.all([
        supabase.from('event_attendee_sessions').select('session_id').eq('attendee_id', attendeeId),
        supabase.from('event_sessions').select('id, type, registration_open, status').eq('event_id', eventId),
        supabase.from('events').select('workshop_selection_limit').eq('id', eventId).single()
      ]);
      if (!bookings.error && bookings.data) setMySessionIds(new Set(bookings.data.map(r => r.session_id)));
      if (!sessions.error && sessions.data) setData((previous: any[]) => (previous || []).map(s => ({ ...s, ...sessions.data.find(fresh => fresh.id === s.id) })));
      if (!rules.error && rules.data) setEvent((previous: any) => ({ ...previous, ...rules.data }));
    } finally {
      bookingLock.current = false;
      setIsBookingSession(false);
    }
  };

  const handleReplaceWorkshop = async (sessionId: string) => {
    if (bookingLock.current || !attendeeId) return;
    const current = (data || []).filter((s: any) => s.type === 'workshop' && mySessionIds.has(s.id));
    const target = (data || []).find((s: any) => s.id === sessionId);
    if (current.length !== 1 || !target || target.type !== 'workshop' || !isSessionOpen(target)) return;
    bookingLock.current = true;
    setIsBookingSession(true);
    try {
      await replaceWorkshopBooking(attendeeId, current[0].id, sessionId);
      setMySessionIds(previous => {
        const next = new Set(previous);
        next.delete(current[0].id);
        next.add(sessionId);
        return next;
      });
      setReplacementSessionId(null);
      toast.success(t('agendaBooking.workshopChanged'));
    } catch {
      toast.error(t('agendaBooking.replaceFailed'));
    } finally {
      bookingLock.current = false;
      setIsBookingSession(false);
    }
  };

  const handleMessage = async (otherUserId: string) => {
    if (!user) {
      if (type === 'attendees' && eventId) navigate(eventAuthPath(`/event/${eventId}/attendees`));
      else setShowLoginModal(true);
      return;
    }
    const threadId = await getOrCreateThread(otherUserId);
    if (threadId) {
      navigate('/messages', { state: { threadId } });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const participantData = type === 'attendees' ? (data || []) : [];
  const searchTerm = normalizeNetworkingValue(searchQuery);
  const filteredParticipants = participantData.filter((person: any) =>
    (selectedSector === 'All' || (selectedSector === '__none' ? !person.sector : normalizeNetworkingValue(person.sector || '') === normalizeNetworkingValue(selectedSector))) &&
    (!searchTerm || [person.name, person.company, person.meta?.['Job Title'], person.sector].some(value => typeof value === 'string' && normalizeNetworkingValue(value).includes(searchTerm))));

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B2641]">
        <Loader2 className="animate-spin text-[#0684F5]" size={40} />
      </div>
    );
  }

  const brandColor = event?.branding_settings?.design_studio?.brandColor || '#635BFF';
  const logoUrl = event?.branding_settings?.design_studio?.logoUrl;
  const workshopLimit = getWorkshopLimit(event?.workshop_selection_limit);
  const selectedWorkshops = type === 'agenda' ? (data || []).filter((s: any) => s.type === 'workshop' && mySessionIds.has(s.id)).length : 0;
  const currentWorkshop = type === 'agenda' ? (data || []).find((s: any) => s.type === 'workshop' && mySessionIds.has(s.id)) : null;
  const agendaZone = resolveAgendaTimeZone(event?.timezone);

  return (
    <div style={{ backgroundColor: '#0B2641', minHeight: '100vh', color: '#FFFFFF' }}>
      {event && (
        <SEOHead
          title={`${type.charAt(0).toUpperCase() + type.slice(1)} — ${event.name || 'Event'}`}
          description={`View the ${type} for ${event.name} on Eventra.`}
          canonicalUrl={canonicalUrl(eventPublicPath(event, type))}
        />
      )}
      <style>{`
        .agenda-card {
          display: grid;
          grid-template-columns: 140px 1fr 180px 140px 50px;
          gap: 24px;
          align-items: center;
          padding: 24px;
          background-color: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background-color 0.2s;
        }
        
        @media (max-width: 1024px) {
          .agenda-card {
            grid-template-columns: 140px 1fr 140px 50px;
          }
          .agenda-speaker-col {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .agenda-card {
            grid-template-columns: 1fr auto;
            gap: 16px;
            padding: 20px;
          }
          .agenda-time-col {
            grid-column: 1 / -1;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding-bottom: 12px;
            width: 100% !important;
          }
          .agenda-location-col {
            display: none;
          }
          .agenda-speaker-mobile {
            display: flex !important;
            margin-top: 12px;
          }
        }
      `}</style>
      
      <LandingPageNavbar 
        activeSections={{
          agenda: counts.agenda > 0,
          speakers: counts.speakers > 0,
          exhibitors: counts.exhibitors > 0,
          attendees: counts.attendees > 0,
          sponsors: counts.sponsors > 0,
          packages: counts.packages > 0 && event?.branding_settings?.design_studio?.activeBlocks?.some((block: any) => block.isVisible && (block.blockId || block.type) === 'sponsor-packages'),
          tickets: counts.tickets > 0
        }}
        brandColor={brandColor}
        logoUrl={logoUrl}
        isRegistered={isRegistered}
        onNavigate={handleNavigate}
        onRegister={handleRegister}
      />

        {type === 'attendees' && <EventNetworkingBanner
          eventName={event?.name} participantCount={counts.attendees} participants={participantData}
          matchCount={!user || recommendations.isLoading || recommendations.isError || recommendations.data?.state !== 'ready' ? null : recommendations.data.matches.length}
          onExplore={() => document.getElementById('attendee-directory')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })}
        />}

      <div style={{ padding: type === 'attendees' ? '40px 24px 60px' : '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {type === 'attendees' && <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>{t('attendeeExperience.title')}</h2>}
        {type !== 'sponsors' && type !== 'attendees' && (
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '40px', textTransform: 'capitalize' }}>
            {t(`wizard.designStudio.navbar.${type}`, { defaultValue: type })}
          </h1>
        )}



        {type === 'agenda' && (
          <div className="space-y-8">
             {workshopLimit !== null && (data || []).some((s: any) => s.type === 'workshop') && (
               <div role="status" style={{ padding: 16, borderRadius: 12, border: '1px solid #3B82F6', background: 'rgba(59,130,246,0.1)' }}>
                 <strong>{t(workshopLimit === 1 ? 'agendaBooking.workshopRuleSingle' : 'agendaBooking.workshopRule', { count: workshopLimit })}</strong>
                 {isRegistered && <span style={{ marginInlineStart: 12 }}>{selectedWorkshops} / {workshopLimit}</span>}
                 {isRegistered && selectedWorkshops >= workshopLimit && <p style={{ marginTop: 8 }}>{t(workshopLimit === 1 && selectedWorkshops === 1 ? 'agendaBooking.switchHint' : 'agendaBooking.limitHintCard')}</p>}
               </div>
             )}
             <p style={{ color: '#94A3B8', fontSize: 13 }}>{t('agendaBooking.timezone', { zone: agendaZone })}</p>
             {(() => {
               if (!data || data.length === 0) {
                 return (
                   <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                     <Calendar size={48} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '16px' }} />
                     <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>{t('agendaBooking.noSessions')}</h3>
                     <p style={{ fontSize: '14px', color: '#94A3B8' }}>{t('agendaBooking.schedulePending')}</p>
                   </div>
                 );
               }

               const grouped = groupAgendaSessions(data || [], agendaZone, locale);

               return grouped.map(({ key, date, sessions }) => (
                 <div key={key}>
                   <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#94A3B8', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                     {date ? new Intl.DateTimeFormat(locale, { timeZone: agendaZone, weekday: 'long', month: 'long', day: 'numeric' }).format(date) : t('agendaBooking.datePending')}
                   </h3>
                   <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                     {sessions.map((s: any, index: number) => {
                       const start = s.starts_at ? new Date(s.starts_at) : null;
                       const end = s.ends_at ? new Date(s.ends_at) : null;
                       const sessionSpeakers = s.speaker_details || [];
                       const isSelected = mySessionIds.has(s.id);
                       const sessionOpen = isSessionOpen(s);
                       const atWorkshopLimit = s.type === 'workshop' && workshopLimit !== null && selectedWorkshops >= workshopLimit;
                       const canReplace = workshopLimit === 1 && selectedWorkshops === 1;
                       const sessionDisabled = isBookingSession || (!isSelected && (!sessionOpen || (atWorkshopLimit && !canReplace)));

                       return (
                         <div key={s.id} className="agenda-card"
                           onClick={(e) => {
                             if (isRegistered && !sessionDisabled && !(e.target as HTMLElement).closest('button, a, .workshop-replacement-prompt')) void handleToggleSession(s.id);
                           }}
                           style={{ cursor: isRegistered && !sessionDisabled ? 'pointer' : undefined,
                             outline: replacementSessionId === s.id ? '2px solid #FF767E' : undefined,
                             backgroundColor: replacementSessionId === s.id ? '#3A2A39' : undefined }}>
                           {/* Time Column */}
                           <div className="agenda-time-col" style={{ width: '140px', flexShrink: 0 }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', fontWeight: 600 }}>
                               <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                               </div>
                               <div>
                                 <div style={{ fontSize: '15px' }}>{start ? start.toLocaleTimeString(locale, { timeZone: agendaZone, hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBD'}</div>
                                 <div style={{ fontSize: '12px', color: '#94A3B8' }}>{end ? end.toLocaleTimeString(locale, { timeZone: agendaZone, hour: '2-digit', minute: '2-digit', hour12: false }) : ''}</div>
                               </div>
                             </div>
                           </div>

                           {/* Content Column */}
                           <div style={{ flex: 1, minWidth: 0 }}>
                             {s.track && <span style={{ display: 'inline-block', marginBottom: '6px', padding: '2px 8px', borderRadius: '4px', backgroundColor: `${brandColor}20`, color: brandColor, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{s.track}</span>}
                             <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', wordBreak: 'break-word', lineHeight: '1.4' }}>{s.title}</h4>
                             {!sessionOpen && <p style={{ color: '#FCD34D', fontSize: 13 }}>{t('agendaBooking.closed')}</p>}
                             {isRegistered && sessionOpen && !isSelected && atWorkshopLimit && <p style={{ color: '#93C5FD', fontSize: 13 }}>{t(canReplace ? 'agendaBooking.switchHint' : 'agendaBooking.limitHintCard')}</p>}
                             <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                               {s.type && <span style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'capitalize' }}>{t(`wizard.step3.sessions.types.${s.type}`, { defaultValue: s.type.replace('_', ' ') })}</span>}
                               {s.location && (
                                 <div className="md:hidden" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94A3B8' }}>
                                   <MapPin size={12} color="#94A3B8" />
                                   {s.location}
                                 </div>
                               )}
                             </div>

                             {/* Speaker Mobile View */}
                             {sessionSpeakers.length > 0 && (
                               <div className="agenda-speaker-mobile" style={{ display: 'none', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                                 {sessionSpeakers.map((spk: any) => (
                                   <div key={spk.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                     <img src={spk.avatar_url || spk.photo_url || 'https://via.placeholder.com/32'} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                     <span style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: 500 }}>{spk.full_name || spk.name}</span>
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>

                           {/* Speaker Desktop Column */}
                           <div className="agenda-speaker-col" style={{ width: '180px', flexShrink: 0 }}>
                             {sessionSpeakers.length > 0 ? (
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 {sessionSpeakers.map((spk: any) => (
                                   <div key={spk.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                     <img src={spk.avatar_url || spk.photo_url || 'https://via.placeholder.com/40'} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                                     <div style={{ overflow: 'hidden' }}>
                                       <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spk.full_name || spk.name}</div>
                                       <div style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spk.title}</div>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             ) : <span style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic' }}>No speaker</span>}
                           </div>

                           {/* Location Column */}
                           <div className="agenda-location-col" style={{ width: '140px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                             <span style={{ fontSize: '14px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.location || 'TBD'}</span>
                           </div>

                           {/* Action Column */}
                           <div style={{ width: '50px', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                             {isRegistered && (
                               <button onClick={() => handleToggleSession(s.id)} disabled={sessionDisabled}
                                 aria-pressed={isSelected}
                                 aria-label={t(isSelected ? 'agendaBooking.removeSession' : 'agendaBooking.addSession', { title: s.title })}
                                 title={t(isSelected ? 'agendaBooking.removeSession' : 'agendaBooking.addSession', { title: s.title })}
                                 style={{ opacity: sessionDisabled ? 0.5 : 1, width: '40px', height: '40px', borderRadius: '10px', border: '1px solid', borderColor: mySessionIds.has(s.id) ? 'transparent' : 'rgba(255,255,255,0.2)', backgroundColor: mySessionIds.has(s.id) ? '#10B981' : 'rgba(255,255,255,0.05)', color: mySessionIds.has(s.id) ? '#FFFFFF' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2', boxShadow: mySessionIds.has(s.id) ? '0 2px 4px rgba(16, 185, 129, 0.3)' : 'none' }}>
                                 {mySessionIds.has(s.id) ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
                               </button>
                             )}
                           </div>
                           {replacementSessionId === s.id && !isSelected && sessionOpen && canReplace && currentWorkshop && (
                             <div style={{ gridColumn: '1 / -1', minWidth: 0 }}>
                               <WorkshopReplacementPrompt dark currentTitle={currentWorkshop.title} nextTitle={s.title} pending={isBookingSession}
                                 onConfirm={() => { void handleReplaceWorkshop(s.id); }} onCancel={() => setReplacementSessionId(null)} />
                             </div>
                           )}
                         </div>
                       );
                     })}
                   </div>
                 </div>
               ));
             })()}
          </div>
        )}

        {type === 'tickets' && (
          <div className="space-y-12">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '32px',
              alignItems: 'start'
            }}>
              {(data || []).map((ticket: any) => (
                <div 
                  key={ticket.id}
                  className="ticket-premium-card group"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>{ticket.name}</h3>
                      <div style={{ 
                        padding: '4px 12px', 
                        borderRadius: '100px', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        color: '#10B981', 
                        fontSize: '11px', 
                        fontWeight: 800, 
                        textTransform: 'uppercase' 
                      }}>
                        {ticket.type || 'Standard'}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span style={{ fontSize: '36px', fontWeight: 900, color: brandColor }}>{ticket.price === 0 ? 'FREE' : `$${ticket.price}`}</span>
                      {ticket.price > 0 && <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 500 }}>/ person</span>}
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '24px' }}>
                    {ticket.description || 'Access to the event sessions and networking areas.'}
                  </p>

                  <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

                  {/* Ticket Benefits */}
                  <div className="space-y-3 mb-10 flex-1">
                    {(ticket.features || ['Full Access', 'Event Kit', 'Networking App']).map((feature: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-start gap-3">
                        <Check size={16} style={{ color: '#10B981', marginTop: '2px', flexShrink: 0 }} strokeWidth={3} />
                        <span style={{ fontSize: '14px', color: '#E2E8F0' }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleRegister}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      background: brandColor,
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: `0 4px 12px ${brandColor}40`
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Select Ticket
                  </button>

                  {/* Subtle Glow */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '1px',
                    borderRadius: '24px',
                    background: `linear-gradient(135deg, ${brandColor}, transparent, ${brandColor}20)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    opacity: 0.3,
                    transition: 'opacity 0.4s ease'
                  }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'packages' && (
          <div className="space-y-12">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
              gap: '24px',
              alignItems: 'start'
            }}>
              {(data || []).map((pkg: any, idx: number) => (
                <div 
                  key={pkg.id || idx}
                  className="package-card group"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '100%'
                  }}
                >
                  {/* Tier Label / Name */}
                  <div style={{ 
                    display: 'inline-flex',
                    padding: '4px 12px',
                    borderRadius: '100px',
                    background: pkg.color ? `${pkg.color}15` : `${brandColor}15`,
                    border: `1px solid ${pkg.color || brandColor}30`,
                    color: pkg.color || brandColor,
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    marginBottom: '16px',
                    width: 'fit-content'
                  }}>
                    {pkg.name}
                  </div>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF' }}>
                      {typeof pkg.value === 'number' ? `$${pkg.value.toLocaleString()}` : (pkg.price || '$0')}
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

                  {/* Features / Benefits List */}
                  <div className="space-y-3 mb-8 flex-1">
                    {(Array.isArray(pkg.benefits) ? pkg.benefits : Array.isArray(pkg.features) ? pkg.features : []).map((feature: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-start gap-3">
                        <div style={{ 
                          width: '18px', 
                          height: '18px', 
                          borderRadius: '50%', 
                          backgroundColor: `${pkg.color || brandColor}20`, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          marginTop: '2px',
                          flexShrink: 0
                        }}>
                          <Check size={10} style={{ color: pkg.color || brandColor }} strokeWidth={3} />
                        </div>
                        <span style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: '1.4' }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate(`/event/${eventId}/sponsor-inquiry/${pkg.id || pkg.name}`)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      background: pkg.color || brandColor,
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: `0 4px 12px ${pkg.color || brandColor}40`
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 8px 20px ${pkg.color || brandColor}60`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${pkg.color || brandColor}40`;
                    }}
                  >
                    Partner at {pkg.name} Level
                  </button>

                  {/* Animated Border Glow */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '1px',
                    borderRadius: '24px',
                    background: `linear-gradient(135deg, ${pkg.color || brandColor}, transparent, ${pkg.color || brandColor}40)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    opacity: 0,
                    transition: 'opacity 0.4s ease'
                  }} className="group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'sponsors' && (
          <div className="space-y-24">
            {(() => {
              if (!data || data.length === 0) {
                return (
                  <div className="text-center py-32 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto 24px' }}>
                      <Heart size={64} style={{ color: 'rgba(255,255,255,0.05)' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={32} className="animate-pulse" style={{ color: brandColor, opacity: 0.5 }} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>Partner with us</h3>
                    <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '300px', margin: '0 auto' }}>This event is currently looking for partners and sponsors.</p>
                  </div>
                );
              }

              const tiersOrder = ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Partner', 'Media Partner'];
              const grouped: Record<string, any[]> = {};
              
              (data || []).forEach(s => {
                const t = s.tier || 'Partner';
                if (!grouped[t]) grouped[t] = [];
                grouped[t].push(s);
              });

              const allTiers = [...tiersOrder, ...Object.keys(grouped).filter(t => !tiersOrder.includes(t))];

              const getTierGlow = (tier: string) => {
                switch(tier) {
                  case 'Diamond': return 'rgba(6, 132, 245, 0.4)';
                  case 'Platinum': return 'rgba(226, 232, 240, 0.3)';
                  case 'Gold': return 'rgba(245, 158, 11, 0.3)';
                  default: return 'rgba(255, 255, 255, 0.1)';
                }
              };

              return allTiers.filter(t => grouped[t] && grouped[t].length > 0).map(tier => (
                <div key={tier} style={{ position: 'relative' }}>
                  {/* Decorative Tier Header */}
                  <div className="mb-12 flex flex-col items-center text-center">
                    <div style={{ 
                      display: 'inline-flex',
                      padding: '6px 16px',
                      borderRadius: '100px',
                      background: `${brandColor}15`,
                      border: `1px solid ${brandColor}30`,
                      color: brandColor,
                      fontSize: '12px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '3px',
                      marginBottom: '16px',
                      boxShadow: `0 0 20px ${brandColor}20`
                    }}>
                      {tier} LEVEL
                    </div>
                    <h2 style={{ 
                      fontSize: 'clamp(28px, 5vw, 42px)', 
                      fontWeight: 900, 
                      color: '#FFFFFF', 
                      letterSpacing: '-0.02em',
                      marginBottom: '12px',
                      position: 'relative'
                    }}>
                      {tier}
                    </h2>
                    <div style={{ 
                      width: '60px', 
                      height: '4px', 
                      borderRadius: '2px', 
                      background: `linear-gradient(90deg, transparent, ${brandColor}, transparent)` 
                    }} />
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(auto-fill, minmax(${tier === 'Diamond' ? '340px' : '240px'}, 1fr))`, 
                    gap: '32px' 
                  }}>
                    {grouped[tier].map(s => (
                      <a 
                        key={s.id} 
                        href={s.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="sponsor-premium-card group"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '24px',
                          padding: tier === 'Diamond' ? '64px 40px' : '40px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          aspectRatio: tier === 'Diamond' ? '1.6' : '1.4',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Background subtle glow */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: `radial-gradient(circle at 50% 50%, ${getTierGlow(tier)}, transparent 70%)`,
                          opacity: 0,
                          transition: 'opacity 0.4s ease'
                        }} className="group-hover:opacity-100" />

                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          zIndex: 1
                        }}>
                          {s.logo_url ? (
                            <img 
                              src={s.logo_url} 
                              alt={s.name} 
                              style={{
                                maxWidth: '100%',
                                maxHeight: tier === 'Diamond' ? '100px' : '70px',
                                objectFit: 'contain',
                                transition: 'all 0.4s ease'
                              }}
                              className="group-hover:scale-110"
                            />
                          ) : (
                            <span style={{ 
                              fontSize: tier === 'Diamond' ? '24px' : '18px', 
                              fontWeight: 800, 
                              color: '#FFFFFF', 
                              textAlign: 'center',
                              opacity: 0.8
                            }} className="group-hover:opacity-100">{s.name}</span>
                          )}
                        </div>

                        {/* Animated Border Gradient */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          padding: '1px',
                          borderRadius: '24px',
                          background: `linear-gradient(135deg, ${brandColor}, transparent, ${brandColor}40)`,
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                          opacity: 0,
                          transition: 'opacity 0.4s ease'
                        }} className="group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {type === 'speakers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px', opacity: isLoadingMore ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {(data || []).map((s: any) => (
              <div key={s.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'; e.currentTarget.style.borderColor = brandColor; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}>
                {s.speaker_type && <div style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px 12px', borderRadius: '12px', backgroundColor: `${brandColor}20`, color: brandColor, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em' }}>{s.speaker_type.replace('_', ' ')}</div>}
                <div style={{ position: 'relative', marginBottom: '24px' }}><img src={s.avatar_url || s.photo_url || 'https://via.placeholder.com/150'} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: `4px solid #0B2641`, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} /></div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>{s.full_name || s.name}</h3>
                <div style={{ fontSize: '15px', fontWeight: 600, color: brandColor, marginBottom: '2px' }}>{s.title}</div>
                <div style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '20px' }}>{s.company}</div>
                {s.tags && s.tags.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>{s.tags.slice(0, 4).map((tag: string, idx: number) => <span key={idx} style={{ fontSize: '11px', fontWeight: 600, color: '#E2E8F0', padding: '4px 10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>{tag}</span>)}</div>}
                <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '24px', minHeight: '66px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.short_bio || s.bio || 'No biography available.'}</p>
                <div style={{ marginTop: 'auto', display: 'flex', gap: '16px', justifyContent: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%' }}>
                  {s.linkedin_url && <a href={s.linkedin_url} target="_blank" rel="noreferrer" title="LinkedIn" style={{ color: '#60A5FA' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>}
                  {s.twitter_url && <a href={s.twitter_url} target="_blank" rel="noreferrer" title="Twitter" style={{ color: '#38BDF8' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></a>}
                  {s.website_url && <a href={s.website_url} target="_blank" rel="noreferrer" title="Website" style={{ color: '#94A3B8' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>}
                </div>
              </div>
            ))}
          </div>
        )}

        {type === 'exhibitors' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', opacity: isLoadingMore ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {(data || []).map((e: any) => (
              <div key={e.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }} onMouseEnter={(evt) => { evt.currentTarget.style.transform = 'translateY(-4px)'; evt.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)'; evt.currentTarget.style.borderColor = brandColor; evt.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }} onMouseLeave={(evt) => { evt.currentTarget.style.transform = 'translateY(0)'; evt.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; evt.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; evt.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}>
                <div style={{ height: '120px', background: `linear-gradient(135deg, ${brandColor} 0%, #0B2641 100%)`, position: 'relative' }}>
                  {e.sponsorship_level && <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.9)', color: e.sponsorship_level === 'Gold' ? '#B45309' : e.sponsorship_level === 'Silver' ? '#4B5563' : '#4338CA', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{e.sponsorship_level}</div>}
                  <div style={{ position: 'absolute', bottom: '-30px', left: '24px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '4px solid #0B2641', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    <img src={e.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(e.company_name)}&background=random`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
                <div style={{ padding: '40px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1.3', marginBottom: '8px' }}>{e.company_name}</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>{e.industry && <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{e.industry.toUpperCase()}</span>}{e.booth_location && <span style={{ fontSize: '11px', fontWeight: 600, color: brandColor, padding: '2px 8px', backgroundColor: `${brandColor}20`, borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18"/></svg>BOOTH {e.booth_location}</span>}</div>
                  {e.description && <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{e.description}</p>}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>{e.website_url && <a href={e.website_url} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: '#FFFFFF', fontWeight: 600, fontSize: '13px', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(evt) => { evt.currentTarget.style.borderColor = brandColor; evt.currentTarget.style.color = brandColor; }} onMouseLeave={(evt) => { evt.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; evt.currentTarget.style.color = '#FFFFFF'; }}>Visit Website</a>}{(e.contact_email || e.contact_phone) && <div style={{ display: 'flex', gap: '8px' }}>{e.contact_email && <a href={`mailto:${e.contact_email}`} title="Email" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></a>}{e.contact_phone && <a href={`tel:${e.contact_phone}`} title="Call" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></a>}</div>}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {type === 'attendees' && (
          <div>
            {<EventMatchSuggestions
              key={`${eventId}:${user?.id || ''}`}
              matches={recommendations.data?.matches || []} state={recommendations.data?.state} signedIn={!!user} loading={recommendations.isLoading}
              failed={recommendations.isError} onRetry={() => { void recommendations.refetch(); }}
              onGenerate={async () => {
                const result = await recommendations.refetch();
                if (result.error) throw result.error;
                return result.data?.matches || [];
              }}
              onRegister={handleRegister}
              onAccess={() => navigate(`${eventAuthPath(`/event/${eventId}/networking`)}${user ? '&switch_account=1' : ''}`)}
              onView={person => navigate(eventPublicPath(event, `profile/${person.id}`))}
              onBook={handleBookMeeting} onMessage={handleMessage} messagePending={isMessageLoading}
              brandColor={brandColor}
            />}

            <section id="attendee-directory" className="attendee-directory" aria-label={t('eventImprovements.b2bParticipants')}>
            <ParticipantDirectoryFilters
              sectors={[...sectorOptions(participantData), ...(participantData.some((person: any) => !person.sector) ? ['__none'] : [])]}
              selected={selectedSector} search={searchQuery}
              onSector={value => { setSelectedSector(value); setPage(1); }}
              onSearch={value => { setSearchQuery(value); setPage(1); }}
              count={filteredParticipants.length} total={participantData.length}
            />
            {directoryFailed && <div role="alert" style={{ color: '#94A3B8' }}>{t('eventImprovements.directoryError')} <button onClick={() => { void fetchAttendeeBatch(1); }}>{t('eventImprovements.retry')}</button></div>}
            {!directoryFailed && filteredParticipants.length === 0 && <p style={{ color: '#b8cbdc', padding: '32px 0' }}>{t('attendeeExperience.noResults')}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '24px', opacity: isLoadingMore ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              {filteredParticipants.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
                .map((a: any) => (
                <ParticipantCard key={a.id} name={a.name || t('networking.defaults.user')}
                  avatar={a.final_avatar} title={a.meta?.['Job Title'] || a.meta?.Title} company={a.company}
                  tags={a.profile_industries || []}
                  onView={() => navigate(eventPublicPath(event, a.profile_id ? `profile/${a.profile_id}` : `participant/${a.id}`))}
                  bookLabel={t('eventImprovements.bookMeeting')}
                  onBook={a.profile_id && a.profile_id !== user?.id ? () => handleBookMeeting({ id: a.profile_id, name: a.name, avatar: a.final_avatar }) : undefined}
                  messagePending={isMessageLoading}
                  onMessage={a.profile_id && a.profile_id !== user?.id ? () => handleMessage(a.profile_id) : undefined} />
              ))}
            </div>
            </section>
          </div>
        )}

        {type === 'attendees' && filteredParticipants.length > 0 && <p style={{ textAlign: 'center', color: '#a2b6c9', fontSize: 13, marginTop: 28 }}>
          {t('attendeeExperience.pageRange', { start: (page - 1) * ITEMS_PER_PAGE + 1, end: Math.min(page * ITEMS_PER_PAGE, filteredParticipants.length), total: filteredParticipants.length })}
        </p>}
        {(type === 'speakers' || type === 'exhibitors' || type === 'attendees') && (
          <PaginationControls totalItems={type === 'attendees' ? filteredParticipants.length : counts[type]} />
        )}
      </div>

      <BookMeetingModal 
        isOpen={!!selectedAttendee}
        onClose={() => setSelectedAttendee(null)}
        recipient={selectedAttendee || { id: '', name: '' }}
        currentUser={user}
        eventId={eventId}
      />

      {/* Auth Modals */}
      <ModalRegistrationEntry
        isOpen={type !== 'attendees' && showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onGoogleSignup={handleGoogleSignup}
        onEmailSignup={handleEmailSignup}
        onLoginClick={handleSwitchToLogin}
      />

      <ModalLogin
        isOpen={type !== 'attendees' && showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onGoogleLogin={handleGoogleLogin}
        onLoginSuccess={handleLoginSuccess}
        onSignUpClick={handleSwitchToSignup}
      />
    </div>
  );
}
