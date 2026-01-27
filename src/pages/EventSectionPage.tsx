import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import LandingPageNavbar from '../components/events/LandingPageNavbar';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { useAuth } from '../contexts/AuthContext';
import BookMeetingModal from '../components/networking/BookMeetingModal';
import { useMessageThread } from '../hooks/useMessageThread';

type SectionType = 'agenda' | 'speakers' | 'exhibitors' | 'attendees';

export default function EventSectionPage({ type }: { type: SectionType }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: isLoadingAuth, signOut } = useAuth();
  const { getOrCreateThread, loading: isMessageLoading } = useMessageThread();
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [counts, setCounts] = useState({ agenda: 0, speakers: 0, exhibitors: 0, attendees: 0 });
  const [isRegistered, setIsRegistered] = useState(false);
  const [mySessionIds, setMySessionIds] = useState<Set<string>>(new Set());
  const [attendeeId, setAttendeeId] = useState<string | null>(null);
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 50;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // 1. Fetch Public Data (Event, Counts, Section Content)
  useEffect(() => {
    if (!eventId) return;
    const loadPublic = async () => {
      setIsLoadingData(true);
      setPage(0);
      try {
        const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
        setEvent(eventData);

        const [spk, sess, exh, att] = await Promise.all([
          supabase.from('event_speakers').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_sessions').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_exhibitors').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_attendees').select('id', { count: 'exact', head: true }).eq('event_id', eventId)
        ]);
        setCounts({
          speakers: spk.count || 0,
          agenda: sess.count || 0,
          exhibitors: exh.count || 0,
          attendees: att.count || 0
        });

        if (type === 'agenda') {
          const { data: sessions } = await supabase.from('event_sessions').select('*').eq('event_id', eventId).order('starts_at', { ascending: true });
          setData(sessions);
        } else if (type === 'speakers') {
          await fetchSpeakerBatch(0, true);
        } else if (type === 'exhibitors') {
          await fetchExhibitorBatch(0, true);
        } else if (type === 'attendees') {
          await fetchAttendeeBatch(0, true);
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
    const start = pageNumber * ITEMS_PER_PAGE;
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
      return;
    }

    if (isInitial) {
      setData(speakers);
    } else {
      setData((prev: any) => [...(prev || []), ...speakers]);
    }
  };

  const fetchExhibitorBatch = async (pageNumber: number, isInitial: boolean = false) => {
    if (!eventId) return;
    const start = pageNumber * ITEMS_PER_PAGE;
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
      return;
    }

    if (isInitial) {
      setData(exhibitors);
    } else {
      setData((prev: any) => [...(prev || []), ...exhibitors]);
    }
  };

  const fetchAttendeeBatch = async (pageNumber: number, isInitial: boolean = false) => {
    if (!eventId) return;
    const start = pageNumber * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    const { data: attendees, error } = await supabase
      .from('event_attendees')
      .select('id, profile_id, name, company, avatar_url, photo_url, meta')
      .eq('event_id', eventId)
      .order('name', { ascending: true })
      .range(start, end);
    
    if (error) {
      console.error('Error fetching attendees:', error);
      if (isInitial) setData([]);
      return;
    }

    const profileIds = attendees.map((a: any) => a.profile_id).filter(Boolean);
    let profileMap: Record<string, string> = {};
    
    if (profileIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, avatar_url')
        .in('id', profileIds);
      
      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap[p.id] = p.avatar_url;
        });
      }
    }
    
    const mapped = attendees.map((a: any) => ({
      ...a,
      final_avatar: profileMap[a.profile_id] || a.avatar_url || a.photo_url
    }));
    
    if (isInitial) {
      setData(mapped);
    } else {
      setData((prev: any) => [...(prev || []), ...mapped]);
    }
  };

  const loadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    if (type === 'speakers') {
      await fetchSpeakerBatch(nextPage);
    } else if (type === 'exhibitors') {
      await fetchExhibitorBatch(nextPage);
    } else if (type === 'attendees') {
      await fetchAttendeeBatch(nextPage);
    }
    setPage(nextPage);
    setIsLoadingMore(false);
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
    navigate(`/event/${eventId}/${section}`);
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
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!attendeeId) return;
    const isAdded = mySessionIds.has(sessionId);
    const nextSet = new Set(mySessionIds);
    if (isAdded) {
      nextSet.delete(sessionId);
      setMySessionIds(nextSet);
      await supabase.from('event_attendee_sessions').delete().eq('attendee_id', attendeeId).eq('session_id', sessionId);
    } else {
      nextSet.add(sessionId);
      setMySessionIds(nextSet);
      await supabase.from('event_attendee_sessions').insert({ attendee_id: attendeeId, session_id: sessionId });
    }
  };

  const handleMessage = async (otherUserId: string) => {
    if (!user) {
      setShowLoginModal(true);
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

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B2641]">
        <Loader2 className="animate-spin text-[#0684F5]" size={40} />
      </div>
    );
  }

  const brandColor = event?.branding_settings?.design_studio?.brandColor || '#635BFF';
  const logoUrl = event?.branding_settings?.design_studio?.logoUrl;

  return (
    <div style={{ backgroundColor: '#0B2641', minHeight: '100vh', color: '#FFFFFF' }}>
      {user ? (
        <NavbarLoggedIn onLogout={handleLogout} />
      ) : (
        <NavbarLoggedOut 
          onSignUpClick={() => setShowRegistrationModal(true)}
          onLoginClick={() => setShowLoginModal(true)}
        />
      )}
      <div style={{ height: '72px' }} />
      
      <LandingPageNavbar 
        activeSections={{
          agenda: counts.agenda > 0,
          speakers: counts.speakers > 0,
          exhibitors: counts.exhibitors > 0,
          attendees: counts.attendees > 0
        }}
        brandColor={brandColor}
        logoUrl={logoUrl}
        isRegistered={isRegistered}
        onNavigate={handleNavigate}
        onRegister={handleRegister}
      />

      <div style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '40px', textTransform: 'capitalize' }}>
          {type}
        </h1>

        {type === 'agenda' && (
          <div className="space-y-8">
             {(() => {
               const grouped: Record<string, any[]> = {};
               (data || []).forEach((s: any) => {
                 const date = s.starts_at ? new Date(s.starts_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'TBD';
                 if (!grouped[date]) grouped[date] = [];
                 grouped[date].push(s);
               });

               return Object.entries(grouped).map(([date, sessions]) => (
                 <div key={date}>
                   <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#94A3B8', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                     {date}
                   </h3>
                   <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                     {sessions.map((s: any, index: number) => {
                       const start = s.starts_at ? new Date(s.starts_at) : null;
                       const end = s.ends_at ? new Date(s.ends_at) : null;
                       return (
                         <div key={s.id} style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', borderBottom: index === sessions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', gap: '24px', transition: 'background-color 0.2s' }} className="agenda-row">
                           <div style={{ width: '140px', flexShrink: 0 }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', fontWeight: 600 }}>
                               <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                               </div>
                               <div>
                                 <div style={{ fontSize: '15px' }}>{start ? start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'TBD'}</div>
                                 <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{end ? end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}</div>
                               </div>
                             </div>
                           </div>
                           <div style={{ flex: 1 }}>
                             {s.track && <span style={{ display: 'inline-block', marginBottom: '6px', padding: '2px 8px', borderRadius: '4px', backgroundColor: `${brandColor}20`, color: brandColor, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{s.track}</span>}
                             <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>{s.title}</h4>
                             {s.type && <span style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'capitalize' }}>{s.type.replace('_', ' ')}</span>}
                           </div>
                           <div style={{ width: '180px', flexShrink: 0 }}>
                             {s.speaker_name ? (
                               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                 <img src={s.speaker_photo || 'https://via.placeholder.com/40'} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                                 <div style={{ overflow: 'hidden' }}>
                                   <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.speaker_name}</div>
                                   <div style={{ fontSize: '12px', color: '#94A3B8' }}>Speaker</div>
                                 </div>
                               </div>
                             ) : <span style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic' }}>No speaker</span>}
                           </div>
                           <div style={{ width: '140px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                             <span style={{ fontSize: '14px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.location || 'TBD'}</span>
                           </div>
                           <div style={{ width: '50px', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                             {isRegistered && (
                               <button onClick={() => handleToggleSession(s.id)} title={mySessionIds.has(s.id) ? "Remove from my agenda" : "Add to my agenda"} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid', borderColor: mySessionIds.has(s.id) ? 'transparent' : 'rgba(255,255,255,0.2)', backgroundColor: mySessionIds.has(s.id) ? '#10B981' : 'rgba(255,255,255,0.05)', color: mySessionIds.has(s.id) ? '#FFFFFF' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: mySessionIds.has(s.id) ? '0 2px 4px rgba(16, 185, 129, 0.3)' : 'none' }}>
                                 {mySessionIds.has(s.id) ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
                               </button>
                             )}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               ));
             })()}
          </div>
        )}

        {type === 'speakers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {(data || []).map((a: any) => (
              <div 
                key={a.id} 
                onClick={() => {
                  console.log('Navigating to profile:', a.profile_id);
                  if (a.profile_id) navigate(`/profile/${a.profile_id}`);
                }}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.03)', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  padding: '24px', 
                  textAlign: 'center', 
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = brandColor;
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                }}
              >
                {/* Avatar Container */}
                <div style={{ width: '80px', height: '80px', marginBottom: '16px', flexShrink: 0 }}>
                  {a.final_avatar ? (
                    <img 
                      src={a.final_avatar} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        border: `3px solid #0B2641`, 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)' 
                      }} 
                      onError={(e) => { const parent = e.currentTarget.parentElement; if (parent) { e.currentTarget.style.display = 'none'; const fallback = document.createElement('div'); fallback.style.width = '100%'; fallback.style.height = '100%'; fallback.style.borderRadius = '50%'; fallback.style.backgroundColor = brandColor; fallback.style.color = '#FFFFFF'; fallback.style.display = 'flex'; fallback.style.alignItems = 'center'; fallback.style.justifyContent = 'center'; fallback.style.fontSize = '24px'; fallback.style.fontWeight = '700'; fallback.style.border = '3px solid #0B2641'; fallback.innerText = getInitials(a.name); parent.appendChild(fallback); } }} 
                    />
                  ) : <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: brandColor, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, border: '3px solid #0B2641', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>{getInitials(a.name)}</div>}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>{a.name || 'Attendee'}</h3>
                <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '2px' }}>{a.meta?.['Job Title'] || a.meta?.['Title'] || a.meta?.job_title || 'Professional'}</div>
                <div style={{ fontSize: '13px', color: brandColor, fontWeight: 500, marginBottom: '20px' }}>{a.company || a.meta?.['Company'] || a.meta?.['Organization'] || ''}</div>
                <div style={{ width: '100%', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={(e) => { e.stopPropagation(); if (!user) { navigate(`/event/${eventId}/register`); return; } if (a.profile_id) setSelectedAttendee({ id: a.profile_id, name: a.name }); }} style={{ width: '100%', height: '36px', backgroundColor: brandColor, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Book Meeting</button>
                  <button disabled={isMessageLoading} onClick={(e) => { e.stopPropagation(); if (a.profile_id) handleMessage(a.profile_id); }} style={{ width: '100%', height: '36px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', opacity: isMessageLoading ? 0.7 : 1 }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}>{isMessageLoading ? 'Loading...' : 'Message'}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(type === 'speakers' || type === 'exhibitors' || type === 'attendees') && (data || []).length < counts[type] && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              style={{
                padding: '12px 32px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !isLoadingMore && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
              onMouseLeave={(e) => !isLoadingMore && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Loading...
                </>
              ) : (
                `Load More (${counts[type] - (data?.length || 0)} remaining)`
              )}
            </button>
          </div>
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
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onGoogleSignup={handleGoogleSignup}
        onEmailSignup={handleEmailSignup}
        onLoginClick={handleSwitchToLogin}
      />

      <ModalLogin
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onGoogleLogin={handleGoogleLogin}
        onLoginSuccess={handleLoginSuccess}
        onSignUpClick={handleSwitchToSignup}
      />
    </div>
  );
}