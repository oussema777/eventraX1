import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';
import BookMeetingModal from './BookMeetingModal';

// A member profile has no event in its URL. Resolve a shared registration before booking.
export default function ProfileMeetingRequest({ currentUser, recipient, onClose }: {
  currentUser: { id: string }; recipient: { id: string; name: string }; onClose: () => void;
}) {
  const { t } = useI18n();
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([]);
  const [eventId, setEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setFailed(false);
    (async () => {
      const { data, error } = await supabase.from('event_attendees').select('event_id, profile_id')
        .in('profile_id', [currentUser.id, recipient.id]).in('status', ['registered', 'approved']).eq('meta->>b2bOptIn', 'true');
      if (error) throw error;
      const mine = new Set((data || []).filter(row => row.profile_id === currentUser.id).map(row => row.event_id));
      const shared = [...new Set((data || []).filter(row => row.profile_id === recipient.id && mine.has(row.event_id)).map(row => row.event_id))];
      const result = shared.length ? await supabase.from('events').select('id, name').in('id', shared).order('start_date', { ascending: false }) : { data: [], error: null };
      if (result.error) throw result.error;
      if (!active) return;
      const options = result.data || [];
      setEvents(options);
      if (options.length === 1) setEventId(options[0].id);
    })().catch(() => { if (active) setFailed(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [currentUser.id, recipient.id, retry]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);

  if (eventId) return <BookMeetingModal isOpen onClose={onClose} currentUser={currentUser} recipient={recipient} eventId={eventId} />;
  return <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
    <section role="dialog" aria-modal="true" aria-labelledby="profile-meeting-title" onClick={event => event.stopPropagation()}
      style={{ background: '#0B2641', color: 'white', padding: 24, borderRadius: 16, maxWidth: 480, width: '100%', border: '1px solid #34516B' }}>
      <h2 id="profile-meeting-title" style={{ fontSize: 22, marginBottom: 16 }}>{t('publicProfilePage.modal.title')}</h2>
      {loading ? <p role="status">{t('networking.people.loading')}</p> : failed ? <p role="alert">
        {t('networkingExperience.eventsError')} <button onClick={() => setRetry(value => value + 1)}>{t('networking.people.retry')}</button>
      </p> : events.length ? <label>{t('networkingScheduling.chooseEvent')}
        <select autoFocus value="" onChange={event => setEventId(event.target.value)} style={{ width: '100%', padding: 12, marginTop: 8, background: '#153752', border: '1px solid #56728B', borderRadius: 8, color: 'white' }}>
          <option value="" disabled>{t('networkingScheduling.chooseEvent')}</option>
          {events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
        </select>
      </label> : <><p>{t('flowRecovery.noSharedEvent')}</p><Link to="/browse-events" style={{ display: 'inline-block', color: '#93C5FD', marginTop: 16 }}>{t('flowRecovery.browseEvents')}</Link></>}
      <button onClick={onClose} style={{ display: 'block', marginTop: 20, padding: '8px 16px', border: '1px solid #56728B', borderRadius: 8 }}>{t('publicProfilePage.modal.cancel')}</button>
    </section>
  </div>;
}
