import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getEventRole, roleTabs } from '../../lib/eventAccess';
import { useI18n } from '../../i18n/I18nContext';
import BookMeetingModal from './BookMeetingModal';
import MeetingAvailability from './MeetingAvailability';
import './ProfileBookingPanel.css';

type Props = {
  currentUser: { id: string; email?: string; full_name?: string } | null;
  recipient: { id: string; name: string; avatar?: string | null };
  eventId?: string;
  onSignIn: () => void;
  instructions?: string;
};

// Keep event selection separate from the shared booking form. Changing the
// event remounts the form, so a date, slot or invitation cannot leak across events.
export default function ProfileBookingPanel(props: Props) {
  const { currentUser, recipient, eventId, onSignIn, instructions } = props;
  const { t, locale } = useI18n();
  const [eventChoice, setEventChoice] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const own = currentUser?.id === recipient.id;
  const shared = useQuery({
    queryKey: ['profile-booking-events', currentUser?.id, recipient.id],
    enabled: !!currentUser?.id && !!recipient.id && !own && !eventId,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase.from('event_attendees').select('event_id, profile_id')
        .in('profile_id', [currentUser!.id, recipient.id]).in('status', ['registered', 'approved']).eq('meta->>b2bOptIn', 'true');
      if (error) throw error;
      const mine = new Set((data || []).filter(row => row.profile_id === currentUser!.id).map(row => row.event_id));
      const ids = [...new Set((data || []).filter(row => row.profile_id === recipient.id && mine.has(row.event_id)).map(row => row.event_id))];
      const result = ids.length ? await supabase.from('events').select('id, name').in('id', ids).order('start_date', { ascending: false }) : { data: [], error: null };
      if (result.error) throw result.error;
      return result.data || [];
    },
  });
  const events = shared.data || [];
  const selectedEvent = eventId || eventChoice || (events.length === 1 ? events[0].id : '');
  const eligibility = useQuery({
    queryKey: ['profile-booking-access', selectedEvent, currentUser?.id, recipient.id],
    enabled: !!selectedEvent && !!currentUser?.id && !!recipient.id && !own,
    retry: 1,
    queryFn: async () => {
      const results = await Promise.all([currentUser!.id, recipient.id].map(id => supabase.rpc('b2b_event_eligible', { p_event: selectedEvent, p_profile: id })));
      const failure = results.find(result => result.error);
      if (failure) throw failure.error;
      const viewerEligible = results[0].data === true;
      const recipientEligible = results[1].data === true;
      const eligible = viewerEligible && recipientEligible;
      const role = eligible ? null : await getEventRole(selectedEvent);
      return { eligible, viewerEligible, recipientEligible, preview: !!role && roleTabs[role].includes('b2b') };
    },
  });
  const loading = shared.isLoading || eligibility.isLoading;
  const failed = shared.isError || eligibility.isError;
  const eligible = eligibility.data?.eligible === true;
  const preview = !eligible && eligibility.data?.preview === true;
  const retry = () => { if (shared.isError) void shared.refetch(); if (eligibility.isError) void eligibility.refetch(); };

  const introduction = <><span className="profile-booking__eyebrow">{t('meetingBooking.eyebrow')}</span><h2>{t('profileBooking.title')}</h2><p>{t('profileBooking.intro', { name: recipient.name })}</p></>;
  return <section id="profile-booking" className="profile-booking" tabIndex={-1} dir={locale === 'ar' ? 'rtl' : 'ltr'} aria-label={t('profileBooking.title')}>
    {own ? <div className="profile-booking__welcome"><CalendarDays size={28} /><h2>{t('networkingScheduling.myAvailability')}</h2><p>{t('networkingExperience.availabilityHint')}</p><MeetingAvailability eventId={eventId} profileId={recipient.id} /></div>
    : !recipient.id ? <div className="profile-booking__welcome">{introduction}<p>{t('profileBooking.unlinked')}</p></div>
    : !currentUser ? <div className="profile-booking__welcome"><CalendarDays size={30} />{introduction}<p>{t('profileBooking.signInHint')}</p><button className="profile-booking__action" onClick={onSignIn}>{t('profileBooking.signIn')}<ArrowRight size={18} /></button></div>
    : <>
      {!eventId && events.length > 1 && <div className="profile-booking__event-picker"><label htmlFor="profile-booking-event">{t('networkingScheduling.chooseEvent')}</label><p>{t('profileBooking.eventHint')}</p><select id="profile-booking-event" value={selectedEvent} disabled={sending} onChange={e => { setEventChoice(e.target.value); setSent(false); }}><option value="" disabled>{t('networkingScheduling.chooseEvent')}</option>{events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}</select></div>}
      {loading ? <div className="profile-booking__welcome" role="status"><Loader2 size={24} className="animate-spin" />{introduction}<p>{t('meetingBooking.loading')}</p></div>
      : failed ? <div className="profile-booking__welcome" role="alert">{introduction}<p>{t('networkingScheduling.loadError')}</p><button className="profile-booking__action" onClick={retry}>{t('networking.people.retry')}</button></div>
      : sent ? <div className="profile-booking__welcome profile-booking__success" role="status"><span className="profile-booking__check"><Check size={30} /></span><h2>{t('profileBooking.sent')}</h2><p>{t('profileBooking.sentHint', { name: recipient.name })}</p><Link className="profile-booking__action" to={`/my-networking?tab=schedule&event=${selectedEvent}`}>{t('eventAccount.myMeetings')}<ArrowRight size={18} /></Link></div>
      : selectedEvent && (eligible || preview) ? <>
        {instructions && <p className="profile-booking__instructions">{instructions}</p>}
        <BookMeetingModal key={`${selectedEvent}:${recipient.id}:${currentUser.id}:${preview}`} embedded previewOnly={preview} isOpen onSubmittingChange={setSending} onClose={() => { setSending(false); setSent(true); }} currentUser={currentUser} recipient={recipient} eventId={selectedEvent} />
      </> : !selectedEvent && events.length > 1 ? null : <div className="profile-booking__welcome"><CalendarDays size={28} />{introduction}<p>{t(selectedEvent ? eligibility.data?.viewerEligible ? 'profileBooking.recipientNotEligible' : 'profileBooking.viewerNotEligible' : 'flowRecovery.noSharedEvent')}</p>{selectedEvent ? <button className="profile-booking__action" onClick={() => void eligibility.refetch()}>{t('profileBooking.recheck')}</button> : <Link className="profile-booking__action" to="/browse-events">{t('flowRecovery.browseEvents')}<ArrowRight size={18} /></Link>}</div>}
    </>}
  </section>;
}
