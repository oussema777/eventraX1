import { useState, useEffect, useMemo, useRef } from 'react';
import { allowedMeetingFormats, networkingTimeZone, networkingSlots, slotAvailability, type NetworkingVenue } from '../../utils/networkingSchedule';
import { X, Calendar, Clock, MapPin, ArrowRight, Check, Globe, Loader2 } from 'lucide-react';
import './BookMeetingModal.css';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { createNotification } from '../../lib/notifications';
import { useI18n } from '../../i18n/I18nContext';
import { sendMeetingConfirmationEmails, sendMeetingRescheduledEmail } from '../../lib/email';
import NetworkingProfileCard from './NetworkingProfileCard';
import { missingBookingFields } from '../../utils/networkingProfile';
import { networkingErrorKey } from '../../utils/networkingErrors';

interface BookMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  recipient: { id: string; name: string; avatar?: string | null };
  existingMeeting?: any;
  eventId?: string;
}

const MEETINGS_TABLE = 'event_b2b_meetings';

export default function BookMeetingModal({ isOpen, onClose, currentUser, recipient, existingMeeting, eventId }: BookMeetingModalProps) {
  const { t, locale } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [meetingType, setMeetingType] = useState<'video' | 'in-person' | 'hybrid' | ''>('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingEventId, setMeetingEventId] = useState<string | null>(eventId || null);
  const [meetingSessionId, setMeetingSessionId] = useState<string | null>(null);
  const [meetingEditId, setMeetingEditId] = useState<string | null>(null);
  const [meetingMessage, setMeetingMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  // Logistics State
  const [venueConfig, setVenueConfig] = useState<NetworkingVenue | null>(null);
  const [timeZone, setTimeZone] = useState(networkingTimeZone(eventId));
  const [configFailed, setConfigFailed] = useState(false);
  const [slotsFailed, setSlotsFailed] = useState(false);
  const slotRequest = useRef(0);
  const configRequest = useRef(0);
  const formats = allowedMeetingFormats(eventId, venueConfig);
  const schedule = useMemo(() => networkingSlots(venueConfig, timeZone), [venueConfig, timeZone]);
  const [generatedSlots, setGeneratedSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  
  // Data State
  const [eventCatalog, setEventCatalog] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (isOpen && currentUser?.id && recipient?.id) {
      loadEventData();
      if (existingMeeting) {
        setMeetingEditId(existingMeeting.id);
        setMeetingType(existingMeeting.meetingFormat || '');
        if (existingMeeting.startAt) {
          const date = new Date(existingMeeting.startAt);
          setMeetingDate(date.toISOString().slice(0, 10));
          setMeetingTime(date.toTimeString().slice(0, 5));
        } else {
          setMeetingDate('');
          setMeetingTime('');
          setSelectedSlot(null);
          setGeneratedSlots([]);
        }
        setMeetingEventId(existingMeeting.eventId || eventId || null);
        setMeetingSessionId(existingMeeting.sessionId || null);
        setVideoUrl(existingMeeting.meta?.video_url || '');
      } else {
        resetForm();
      }
    }
  }, [isOpen, existingMeeting, eventId, currentUser?.id, recipient?.id]);

  const resetForm = () => {
    setMeetingType(eventId && allowedMeetingFormats(eventId).length === 1 ? 'in-person' : '');
    setMeetingDate('');
    setMeetingTime('');
    setMeetingEventId(eventId || null);
    setMeetingSessionId(null);
    setMeetingEditId(null);
    setMeetingMessage('');
    setVideoUrl('');
    setGeneratedSlots([]);
    setSelectedSlot(null);
    setIsSubmitting(false);
  };

  const loadEventData = async () => {
    const request = ++configRequest.current;
    ++slotRequest.current;
    setVenueConfig(null);
    setGeneratedSlots([]);
    setSelectedSlot(null);
    setConfigFailed(false);
    setSlotsFailed(false);
    setIsLoadingEvents(true);
    try {
      if (!eventId) return;
      const [eventResult, settingsResult] = await Promise.all([
        supabase.from('events').select('id, name, start_date, location:location_address, timezone').eq('id', eventId).maybeSingle(),
        supabase.from('event_b2b_settings').select('venue_config').eq('event_id', eventId).maybeSingle()
      ]);
      if (eventResult.error) throw eventResult.error;
      if (settingsResult.error) throw settingsResult.error;
      if (request !== configRequest.current) return;
      const event = eventResult.data;
      const venue = settingsResult.data?.venue_config || null;
      setVenueConfig(venue);
      setTimeZone(networkingTimeZone(eventId, venue, event?.timezone));
      if (event) setEventCatalog([{ id: event.id, name: event.name, startDate: event.start_date, location: event.location }]);
      const allowed = allowedMeetingFormats(eventId, venue);
      setMeetingType(previous => allowed.includes(previous as any) ? previous : allowed.length === 1 ? allowed[0] : '');
    } catch {
      if (request === configRequest.current) setConfigFailed(true);
    } finally {
      if (request === configRequest.current) setIsLoadingEvents(false);
    }
  };

  const readSlots = async (dateStr: string) => {
    if (!venueConfig || !eventId || !currentUser?.id || !recipient?.id) return [];
    const slots = schedule.filter(s => s.date === dateStr);
    if (!slots.length) return [];
    const [meetingResult, availabilityResult] = await Promise.all([
      supabase.from(MEETINGS_TABLE)
        .select('id, event_id, start_at, end_at, location, profile_a_id, profile_b_id, status, meta')
        .eq('status', 'confirmed')
        .or(`event_id.eq.${eventId},profile_a_id.eq.${currentUser.id},profile_b_id.eq.${currentUser.id},profile_a_id.eq.${recipient.id},profile_b_id.eq.${recipient.id}`)
        .lt('start_at', slots[slots.length - 1].end).gt('end_at', slots[0].iso),
      supabase.from('event_b2b_availability').select('profile_id, available_slots')
        .eq('event_id', eventId).in('profile_id', [currentUser.id, recipient.id])
    ]);
    if (meetingResult.error) throw meetingResult.error;
    if (availabilityResult.error) throw availabilityResult.error;
    const availability = new Map<string, string[]>((availabilityResult.data || []).map(row => [row.profile_id, row.available_slots || []]));
    return slots.map(slot => slotAvailability(slot, venueConfig, meetingResult.data || [], [currentUser.id, recipient.id], availability, meetingEditId, eventId));
  };

  const generateSlots = async (dateStr: string) => {
    const request = ++slotRequest.current;
    setIsLoadingEvents(true);
    setSlotsFailed(false);
    setGeneratedSlots([]);
    setSelectedSlot(null);
    try {
      const slots = await readSlots(dateStr);
      if (request === slotRequest.current) setGeneratedSlots(slots);
    } catch {
      if (request === slotRequest.current) setSlotsFailed(true);
    } finally {
      if (request === slotRequest.current) setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (!isOpen || meetingType === 'video' || !venueConfig) return;
    const dates = [...new Set(schedule.map(slot => slot.date))];
    if (!meetingDate && dates.length === 1) setMeetingDate(dates[0]);
  }, [isOpen, schedule, venueConfig, meetingType, meetingDate]);

  useEffect(() => {
    if (isOpen && currentUser?.id && recipient?.id && meetingDate && venueConfig && meetingType && meetingType !== 'video') void generateSlots(meetingDate);
  }, [isOpen, meetingDate, venueConfig, timeZone, meetingType, currentUser?.id, recipient?.id]);

  const handleSubmit = async () => {
    if (isSubmitting || !profileReady) return;
    if (!currentUser?.id) {
      console.error('[BookMeetingModal] currentUser.id is missing:', currentUser);
      toast.error(t('networking.errors.sessionExpired'));
      return;
    }
    if (!recipient?.id) {
      console.error('[BookMeetingModal] recipient.id is missing:', recipient);
      toast.error(t('networking.errors.participantMissing'));
      return;
    }
    if (configFailed || isLoadingEvents || !formats.includes(meetingType as any)) {
      toast.error(t('networkingScheduling.loadError'));
      return;
    }
    if (!meetingType) {
      toast.error(t('networking.meetings.validation.selectType'));
      return;
    }
    setIsSubmitting(true);

    const ownProfile = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
    if (ownProfile.error || missingBookingFields(ownProfile.data).length) {
      setProfileReady(false); setIsSubmitting(false); toast.error(t('networkingExperience.unlockHint')); return;
    }
    let startAt: Date;
    let endAt: Date;
    let location = t('networking.meetings.videoCall');

    if (meetingType === 'video') {
       if (!meetingDate || !meetingTime) { toast.error(t('networking.meetings.validation.selectDateTime')); setIsSubmitting(false); return; }
       startAt = new Date(`${meetingDate}T${meetingTime}:00`);
       if (Number.isNaN(startAt.getTime())) {
        toast.error(t('networking.meetings.validation.invalidDateTime'));
        setIsSubmitting(false);
        return;
      }
       endAt = new Date(startAt.getTime() + 30 * 60000);
    } else {
       // In-person logic using generated slots
       if (!selectedSlot) {
         toast.error(t('networking.meetings.validation.selectSlot'));
         setIsSubmitting(false);
         return;
       }
       startAt = new Date(selectedSlot.iso);
       const duration = venueConfig?.slotDuration || 30;
       endAt = new Date(startAt.getTime() + duration * 60000);
       location = selectedSlot.nextTable || `Networking Area`;
    }

    // Resolve Attendee IDs
    const targetEventId = isVirtual(meetingType) ? (meetingEventId || eventCatalog[0]?.id) : (eventId || meetingEventId);

    if (!targetEventId) {
        toast.error(t('networking.meetings.validation.selectEvent'));
        setIsSubmitting(false);
        return;
    }

    // Reload availability and confirmed capacity; a visible slot may have changed.
    try {
        if (meetingType !== 'video') {
          const freshSlots = await readSlots(meetingDate);
          const fresh = freshSlots.find(slot => slot.iso === selectedSlot?.iso);
          if (!fresh || fresh.available <= 0) {
            setSelectedSlot(null);
            setGeneratedSlots(freshSlots);
            throw new Error(t('networkingScheduling.slotChanged'));
          }
          location = fresh.nextTable || t('networking.defaults.networkingArea');
        }

        const { data: conflicts, error: conflictError } = await supabase
            .from(MEETINGS_TABLE)
            .select('id, status, profile_a_id, profile_b_id')
            .eq('event_id', targetEventId)
            .in('status', ['confirmed', 'pending'])
            .lt('start_at', endAt.toISOString()).gt('end_at', startAt.toISOString())
            .or(`profile_a_id.eq.${currentUser.id},profile_b_id.eq.${currentUser.id},profile_a_id.eq.${recipient.id},profile_b_id.eq.${recipient.id}`);

        if (conflictError) throw conflictError;
        const realConflicts = (conflicts || []).filter(c => c.id !== meetingEditId && (c.status === 'confirmed' ||
          ((c.profile_a_id === currentUser.id && c.profile_b_id === recipient.id) || (c.profile_b_id === currentUser.id && c.profile_a_id === recipient.id))));

        if (realConflicts.length > 0) {
            const isSamePair = realConflicts.some(c => 
                (c.profile_a_id === currentUser.id && c.profile_b_id === recipient.id) ||
                (c.profile_a_id === recipient.id && c.profile_b_id === currentUser.id)
            );

            if (isSamePair) {
                toast.error(t('networkingScheduling.duplicateRequest'));
            } else {
                toast.error(t('networkingScheduling.participantBusy'));
            }
            setIsSubmitting(false);
            return;
        }
    } catch (e) {
        toast.error(e instanceof Error ? e.message : t('networkingScheduling.loadError'));
        setIsSubmitting(false);
        return;
    }

    try {
        // Try to resolve attendee IDs — first by profile lookup, then fallback to existing meeting data
        let attendeeAId: string | null = null;
        let attendeeBId: string | null = null;

        const [resA, resB] = await Promise.all([
            supabase.from('event_attendees').select('id').eq('event_id', targetEventId).eq('profile_id', currentUser.id).maybeSingle(),
            supabase.from('event_attendees').select('id').eq('event_id', targetEventId).eq('profile_id', recipient.id).maybeSingle()
        ]);

        attendeeAId = resA.data?.id || null;
        attendeeBId = resB.data?.id || null;

        // Fallback: use attendee IDs from the existing meeting (bulk matches store these)
        if ((!attendeeAId || !attendeeBId) && existingMeeting) {
            if (!attendeeAId) {
                attendeeAId = existingMeeting.isCurrentUserA ? existingMeeting.attendeeAId : existingMeeting.attendeeBId;
            }
            if (!attendeeBId) {
                attendeeBId = existingMeeting.isCurrentUserA ? existingMeeting.attendeeBId : existingMeeting.attendeeAId;
            }
        }

        if (!attendeeAId || !attendeeBId) {
            console.error('Could not resolve attendee IDs:', { attendeeAId, attendeeBId, resA, resB });
            toast.error(t('networking.errors.verifyRegistration'));
            setIsSubmitting(false);
            return;
        }

        const payload = {
          attendee_a_id: attendeeAId,
          attendee_b_id: attendeeBId,
          profile_a_id: currentUser.id,
          profile_b_id: recipient.id,
          organizer_id: currentUser.id,
          event_id: targetEventId,
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
          location,
          status: 'pending',
          meta: {
            meeting_type: meetingType === 'video' ? 'video' : 'in-person',
            meeting_format: meetingType,
            session_id: meetingType === 'video' ? null : meetingSessionId,
            message: meetingMessage,
            ...(meetingType === 'video' && videoUrl.trim() ? { video_url: videoUrl.trim() } : {})
          }
        };

        let savedMeetingId = meetingEditId;
        if (meetingEditId) {
            const { data: saved, error } = await supabase.from(MEETINGS_TABLE).update(payload).eq('id', meetingEditId).select('id').maybeSingle();
            if (error || !saved?.id) throw error || new Error(t('networking.errors.saveMeeting'));
            savedMeetingId = saved.id;
        } else {
            const { data: saved, error } = await supabase.from(MEETINGS_TABLE).insert([payload]).select('id').single();
            if (error || !saved?.id) throw error || new Error(t('networking.errors.saveMeeting'));
            savedMeetingId = saved.id;
        }

        // Fetch notification settings for meeting_booked
        let meetingNotifSettings = { is_bell_enabled: true, is_email_enabled: true };
        if (targetEventId) {
          try {
            const { data: notifSetting } = await supabase
              .from('event_notification_settings')
              .select('is_bell_enabled, is_email_enabled')
              .eq('event_id', targetEventId)
              .eq('trigger_type', 'meeting_booked')
              .maybeSingle();
            if (notifSetting) meetingNotifSettings = notifSetting;
          } catch { /* default ON */ }
        }

        if (meetingNotifSettings.is_bell_enabled) {
          try {
              await createNotification({
              recipient_id: recipient.id,
              type: 'action',
              title: meetingEditId
                ? t('networking.notifications.meetingRescheduled.title', { defaultValue: t('networking.toasts.meetingRescheduled') })
                : t('networking.notifications.meetingRequested.title', { defaultValue: t('networking.toasts.meetingRequested') }),
              body: meetingEditId
                ? t('networking.notifications.meetingRescheduled.body', { name: currentUser.full_name || currentUser.email })
                : t('networking.notifications.meetingRequested.body', { name: currentUser.full_name || currentUser.email }),
              action_url: '/my-networking',
              actor_id: currentUser.id
              });
          } catch (notifyError) {
              console.warn('Failed to send notification (likely RLS):', notifyError);
              toast.warning(t('networking.notifications.platformFailed'));
          }
        }

        toast.success(meetingEditId ? t('networking.toasts.meetingRescheduled') : t('networking.toasts.meetingRequested'));

        // --- SEND EMAILS ---
        if (meetingNotifSettings.is_email_enabled) {
        try {
          // 1. Fetch Recipient Email (currentUser already has email in auth)
          const { data: recipientProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', recipient.id)
            .single();

          // 2. Fetch Event Name
          const currentEvent = eventCatalog.find(e => e.id === targetEventId);
          const eventName = currentEvent ? currentEvent.name : 'Event';

          if (currentUser.email && recipientProfile?.email) {
            if (meetingEditId) {
              // Rescheduled — send rescheduled email to recipient
              const delivered = await sendMeetingRescheduledEmail(recipientProfile.email, {
                recipientName: recipient.name,
                reschedulerName: currentUser.full_name || currentUser.email,
                eventName: eventName,
                oldDate: existingMeeting?.startAt ? new Date(existingMeeting.startAt).toLocaleDateString(locale) : 'N/A',
                oldTime: existingMeeting?.startAt ? new Date(existingMeeting.startAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                newDate: startAt.toLocaleDateString(locale),
                newTime: startAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
                location: location
              });
              if (!delivered) toast.warning(t('networking.notifications.emailFailed'));
            } else {
              // New meeting — send confirmation emails
              const deliveries = await sendMeetingConfirmationEmails({
                organizerEmail: currentUser.email,
                organizerName: currentUser.full_name || currentUser.email,
                recipientEmail: recipientProfile.email,
                recipientName: recipient.name,
                meetingDate: startAt.toLocaleDateString(locale, { timeZone }),
                meetingTime: startAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone }),
                location: location,
                eventName: eventName,
                meetingId: savedMeetingId!,
                status: 'pending',
                organizerProfileId: currentUser.id, recipientProfileId: recipient.id,
                eventId: targetEventId, locale, timeZone
              });
              if (deliveries.some((delivered) => !delivered)) toast.warning(t('networking.notifications.emailFailed'));
            }
          }
        } catch (emailErr) {
          console.error('Error preparing meeting emails:', emailErr);
          toast.warning(t('networking.notifications.emailFailed'));
        }
        } // end is_email_enabled gate
        // -------------------

        onClose();

    } catch (err: any) {
        toast.error(t(networkingErrorKey(err) || 'networkingScheduling.loadError'));
    } finally {
        setIsSubmitting(false);
    }
  };

  const isVirtual = (type: string) => type === 'video';

  const submitDisabled = !profileReady || isSubmitting || isLoadingEvents || configFailed || slotsFailed || (meetingType !== 'video' && !selectedSlot);


  useEffect(() => {
    if (!isOpen || !currentUser?.id || !recipient?.id) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); if (!isSubmitting) onClose(); }
      if (event.key !== 'Tab') return;
      const elements = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled)') || []).filter(el => el.getClientRects().length);
      const first = elements[0], last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); previousFocus?.focus(); };
  }, [isOpen, currentUser?.id, recipient?.id, isSubmitting]);

  if (!isOpen || !currentUser?.id || !recipient?.id) return null;
  const formatDate = (date: string, options: Intl.DateTimeFormatOptions) => new Date(`${date}T12:00:00Z`).toLocaleDateString(locale, { timeZone: 'UTC', ...options });
  const eventDetails = eventCatalog.find(event => event.id === (meetingEventId || eventId));
  const selectedTime = meetingType === 'video' ? meetingTime : selectedSlot?.time;
  const selectionReady = !!(meetingDate && selectedTime && !slotsFailed && !configFailed);
  const close = () => { if (!isSubmitting) onClose(); };

  return <div className="meeting-booking-overlay" onClick={close}>
    <div className="meeting-booking" role="dialog" aria-modal="true" aria-labelledby="meeting-booking-title" tabIndex={-1} ref={dialogRef} onClick={event => event.stopPropagation()}>
      <header className="meeting-booking__header">
        <div><span className="meeting-booking__eyebrow">{t('meetingBooking.eyebrow')}</span>
          <h2 id="meeting-booking-title">{t(meetingEditId ? 'meetingBooking.reschedule' : 'meetingBooking.title')}</h2></div>
        <button className="meeting-booking__close" disabled={isSubmitting} aria-label={t('meetingBooking.close')} onClick={close}><X size={21} /></button>
      </header>
      <div className="meeting-booking__scroll">
        <div className="meeting-booking__layout">
          <aside className="meeting-booking__summary">
            <div className="meeting-booking__avatar" aria-hidden="true">{recipient.avatar && failedAvatar !== recipient.avatar ? <img src={recipient.avatar} alt="" onError={() => setFailedAvatar(recipient.avatar!)} /> : recipient.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</div>
            <p className="meeting-booking__with">{t('meetingBooking.withPerson', { name: recipient.name })}</p>
            <p className="meeting-booking__intro">{t('meetingBooking.hint')}</p>
            <div className="meeting-booking__facts">
              <div><Calendar size={17} /><span>{eventDetails?.name || t('meetingBooking.event')}</span></div>
              {venueConfig && <div><Clock size={17} /><span>{t('meetingBooking.duration', { minutes: venueConfig.slotDuration || 30 })}</span></div>}
              {meetingType && <div><MapPin size={17} /><span>{t(`networkingScheduling.formats.${meetingType}`)}</span></div>}
              <div><Globe size={17} /><span>{timeZone.replace(/_/g, ' ')}</span></div>
            </div>
            <div className={`meeting-booking__selection ${selectionReady ? 'is-selected' : ''}`} aria-live="polite">
              <span>{t('meetingBooking.selection')}</span>
              {selectionReady ? <><strong>{formatDate(meetingDate, { weekday: 'short', day: 'numeric', month: 'long' })}</strong><b><Check size={16} />{selectedTime}</b></> : <p>{t('meetingBooking.selectHint')}</p>}
            </div>
            <p className="meeting-booking__note">{t('meetingBooking.pending')}</p>
          </aside>
          <div className="meeting-booking__form">
            <div className="booking-readiness"><NetworkingProfileCard profileId={currentUser.id} compact onReady={setProfileReady} /></div>
            <h3>{t('meetingBooking.intro')}</h3>
            {configFailed ? <div role="alert" className="meeting-booking__error"><p>{t('networkingScheduling.loadError')}</p><button onClick={loadEventData}>{t('networking.people.retry')}</button></div>
            : isLoadingEvents ? <p role="status" className="meeting-booking__loading"><Loader2 size={18} className="animate-spin" />{t('meetingBooking.loading')}</p> : <>
              {formats.length > 1 && <fieldset className="meeting-booking__field"><legend>{t('meetingBooking.format')}</legend><div className="meeting-booking__formats">
                {formats.map(format => <button key={format} aria-pressed={meetingType === format} disabled={!!meetingEditId && !existingMeeting?._isUnscheduled} onClick={() => setMeetingType(format as any)}>{t(`networkingScheduling.formats.${format}`)}</button>)}
              </div>{meetingEditId && !existingMeeting?._isUnscheduled && <small>{t('meetingBooking.locked')}</small>}</fieldset>}
              {meetingType && meetingType !== 'video' && <>
                <fieldset className="meeting-booking__field"><legend><span className="meeting-booking__step">1</span>{t('meetingBooking.date')}</legend>
                  <div className="meeting-booking__dates">{[...new Set(schedule.map(slot => slot.date))].map(date => <button key={date} aria-label={formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} aria-pressed={meetingDate === date} onClick={() => { if (meetingDate === date) void generateSlots(date); else { setMeetingDate(date); setSelectedSlot(null); } }}>
                    <span>{formatDate(date, { weekday: 'short' })}</span><strong>{formatDate(date, { day: 'numeric' })}</strong><span>{formatDate(date, { month: 'short' })}</span>
                  </button>)}</div>
                  {!schedule.length && <p className="meeting-booking__muted">{t('networkingScheduling.noSchedule')}</p>}
                </fieldset>
                {meetingDate && <fieldset className="meeting-booking__field"><legend><span className="meeting-booking__step">2</span>{t('meetingBooking.time')}</legend>
                  <p className="meeting-booking__zone">{t('networkingScheduling.timeZone', { zone: timeZone })}</p>
                  {slotsFailed ? <div role="alert" className="meeting-booking__error"><p>{t('networkingScheduling.loadError')}</p><button onClick={() => generateSlots(meetingDate)}>{t('networking.people.retry')}</button></div>
                    : generatedSlots.length ? <div className="meeting-booking__slots">{generatedSlots.map(slot => <button key={slot.iso}
                        aria-label={`${slot.time}${slot.isConflicted ? ' ' + t('networkingScheduling.busy') : slot.unavailable ? ' ' + t('networkingScheduling.unavailable') : ''}`}
                        aria-pressed={selectedSlot?.iso === slot.iso} disabled={slot.available <= 0 || slot.isConflicted} onClick={() => setSelectedSlot(slot)}>
                        {slot.time}{selectedSlot?.iso === slot.iso && <Check size={14} />}
                        {(slot.isConflicted || slot.unavailable) && <small>{t(slot.unavailable ? 'networkingScheduling.unavailable' : 'networkingScheduling.busy')}</small>}
                      </button>)}</div> : <p className="meeting-booking__muted">{t('meetingBooking.empty')}</p>}
                </fieldset>}
              </>}
              {meetingType === 'video' && <>
                <div className="meeting-booking__video-fields">
                  <label>{t('meetingBooking.date')}<input type="date" value={meetingDate} onChange={event => setMeetingDate(event.target.value)} /></label>
                  <label>{t('meetingBooking.time')}<input type="time" value={meetingTime} onChange={event => setMeetingTime(event.target.value)} /></label>
                </div>
                <label className="meeting-booking__message">{t('meetingBooking.videoLink')}<input type="url" value={videoUrl} onChange={event => setVideoUrl(event.target.value)} placeholder={t('meetingBooking.videoPlaceholder')} /><small>{t('meetingBooking.videoHint')}</small></label>
              </>}
            </>}
            <label className="meeting-booking__message"><span>{t('meetingBooking.message')} <small>{t('meetingBooking.optional')}</small></span>
              <textarea value={meetingMessage} onChange={event => setMeetingMessage(event.target.value)} placeholder={t('meetingBooking.placeholder')} rows={3} />
            </label>
          </div>
        </div>
      </div>
      <footer className="meeting-booking__footer">
        <button className="meeting-booking__cancel" disabled={isSubmitting} onClick={close}>{t('meetingBooking.cancel')}</button>
        <button className="meeting-booking__submit" disabled={submitDisabled || (meetingType === 'video' && (!meetingDate || !meetingTime))} onClick={handleSubmit}>
          {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <Calendar size={17} />}{t(isSubmitting ? 'meetingBooking.sending' : meetingEditId ? 'meetingBooking.reschedule' : 'meetingBooking.title')}<ArrowRight size={17} />
        </button>
      </footer>
    </div>
  </div>;
}
