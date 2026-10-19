import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, MessageSquare, ArrowUpRight } from 'lucide-react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import UserB2BCenter from '../components/networking/UserB2BCenter';
import { supabase } from '../lib/supabase';
import { networkingTimeZone } from '../utils/networkingSchedule';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import '../components/networking/NetworkingExperience.css';

type EventOption = { id: string; name: string; start_date?: string; end_date?: string; timezone?: string };
const asArray = <T,>(data: T[] | T | null): T[] => data ? Array.isArray(data) ? data : [data] : [];
function day(value: string | Date, zone = 'UTC') {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
    return ['year', 'month', 'day'].map(type => parts.find(p => p.type === type)?.value).join('-');
  } catch { return ''; }
}
export default function UserB2BCenterPage({ initialEventId }: { initialEventId?: string } = {}) {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventId, setEventId] = useState(initialEventId || '');
  const [event, setEvent] = useState<EventOption | null>(null);
  const [attendeeId, setAttendeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [welcome, setWelcome] = useState(false);
  const changeEvent = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('event', id);
    next.delete('meetingId');
    navigate(`/my-networking?${next}`);
  };
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    setLoading(true); setFailed(false);
    (async () => {
      const registrations = await supabase.from('event_attendees').select('event_id').eq('profile_id', user.id)
        .in('status', ['registered', 'approved']).eq('meta->>b2bOptIn', 'true');
      if (registrations.error) throw registrations.error;
      const ids = [...new Set(asArray(registrations.data).map(row => row.event_id).filter(Boolean))];
      const result = ids.length ? await supabase.from('events').select('id, name, start_date, end_date, timezone').in('id', ids).order('start_date') : { data: [], error: null };
      if (result.error) throw result.error;
      if (!active) return;
      const options = (asArray(result.data) as EventOption[]).map(option => ({ ...option, timezone: networkingTimeZone(option.id, null, option.timezone) }));
      setEvents(options);
      const remembered = params.get('event') || localStorage.getItem(`eventra-networking-event:${user.id}`);
      const upcoming = options.find(option => option.end_date && day(option.end_date, option.timezone) >= day(new Date(), option.timezone));
      setEventId(initialEventId || (options.some(option => option.id === remembered) ? remembered! : upcoming?.id || options[0]?.id || ''));
    })().catch(() => { if (active) setFailed(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, initialEventId, retry, params.get('event')]);
  useEffect(() => {
    if (!user?.id || !eventId) { setEvent(null); return; }
    let active = true;
    localStorage.setItem(`eventra-networking-event:${user.id}`, eventId);
    setWelcome(user.user_metadata?.created_via === 'event_b2b' && localStorage.getItem(`eventra-event-welcome:${user.id}:${eventId}`) !== 'dismissed');
    setAttendeeId('');
    void Promise.all([
      supabase.from('events').select('id, name, start_date, end_date, timezone').eq('id', eventId).single(),
      supabase.from('event_attendees').select('id').eq('event_id', eventId).eq('profile_id', user.id).limit(1).maybeSingle()
    ]).then(([eventResult, attendeeResult]) => {
      if (active) { setEvent(eventResult.data ? { ...eventResult.data, timezone: networkingTimeZone(eventId, null, eventResult.data.timezone) } : null); setAttendeeId(attendeeResult.data?.id || ''); }
    });
    return () => { active = false; };
  }, [eventId, user?.id]);
  const today = day(new Date(), event?.timezone);
  const isToday = !!event?.start_date && today >= day(event.start_date, event.timezone) && today <= day(event.end_date || event.start_date, event.timezone);
  return <div className="networking-experience">
    <NavbarLoggedIn />
    <div className="networking-context">
      <div className="networking-context__top">
        <div><span className="networking-eyebrow">{t('networkingExperience.yourEventSpace')}</span>
          {events.length > 1 ? <label className="networking-event-picker"><span className="sr-only">{t('networkingScheduling.chooseEvent')}</span><select value={eventId} onChange={e => changeEvent(e.target.value)}>{events.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
            : <h2>{event?.name || t('networking.title')}</h2>}
        </div>
        <div className="networking-context__links">
          {eventId && <Link to={`/event/${eventId}/agenda`}><CalendarDays size={17} />{t('eventAccount.eventAgenda')}</Link>}
          <Link to="/messages"><MessageSquare size={17} />{t('eventAccount.messages')}</Link>
          <Link to="/my-profile">{t('eventAccount.myProfile')}<ArrowUpRight size={17} /></Link>
        </div>
      </div>
      {failed && <p role="alert">{t('networkingExperience.eventsError')} <button onClick={() => setRetry(v => v + 1)}>{t('networking.people.retry')}</button></p>}
      {isToday && <section className="networking-day" aria-label="Event day essentials">
        {attendeeId && <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(attendeeId)}`} width="100" height="100" alt="Your event check-in QR code" />}
        <div><h2>{t('eventAccount.todayAt', { event: event?.name || '' })}</h2><p>{t('eventAccount.dayHint')}</p>
          <Link to={`${initialEventId ? `/event/${eventId}/networking` : '/my-networking'}?tab=schedule${!initialEventId ? `&event=${eventId}` : ''}`} className="networking-text-link">{t('eventAccount.myMeetings')} <ArrowUpRight size={16} /></Link></div>
      </section>}
      {welcome && !isToday && <section className="networking-welcome" aria-label="Welcome to Eventra">
        <div><h2>{t('eventAccount.welcomeTitle')}</h2><p>{t('networkingExperience.welcomeHint')}</p>
          <div className="networking-context__links"><Link to="/my-profile">{t('eventAccount.editProfile')}</Link><Link to="/business-profile-wizard">{t('eventAccount.createBusiness')}</Link></div></div>
        <button onClick={() => { localStorage.setItem(`eventra-event-welcome:${user?.id}:${eventId}`, 'dismissed'); setWelcome(false); }}>{t('eventAccount.dismiss')}</button>
      </section>}
    </div>
    {loading ? <p className="networking-context" role="status">{t('networking.people.loading')}</p> : <UserB2BCenter key={eventId || 'all'} eventId={eventId || undefined} embedded
      networkingEvents={event && !events.some(option => option.id === event.id) ? [...events, event] : events} onNetworkingEventChange={changeEvent} />}
  </div>;
}
