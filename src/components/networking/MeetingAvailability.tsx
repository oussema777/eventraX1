import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';
import { networkingSlots, networkingTimeZone, type NetworkingSlot } from '../../utils/networkingSchedule';
import './MeetingAvailability.css';

export default function MeetingAvailability({ eventId, profileId, initiallyOpen = false, eventOptions, onEventChange }: {
  eventId?: string; profileId: string; initiallyOpen?: boolean;
  eventOptions?: { id: string; name: string }[]; onEventChange?: (eventId: string) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(initiallyOpen);
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(eventId || '');
  const [slots, setSlots] = useState<NetworkingSlot[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState(true);
  const [timeZone, setTimeZone] = useState('UTC');
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [retry, setRetry] = useState(0);
  const writeInFlight = useRef(false);

  useEffect(() => {
    setSelectedEvent(eventId || '');
    setOpen(initiallyOpen);
  }, [eventId, profileId, initiallyOpen]);

  useEffect(() => {
    if (!open || eventId || eventOptions?.length) return;
    let cancelled = false;
    setLoading(true); setFailed(false);
    (async () => {
      const registrations = await supabase.from('event_attendees').select('event_id').eq('profile_id', profileId)
        .in('status', ['registered', 'approved']).eq('meta->>b2bOptIn', 'true');
      if (registrations.error) throw registrations.error;
      const ids = [...new Set((registrations.data || []).map(a => a.event_id))];
      const result = ids.length ? await supabase.from('events').select('id, name').in('id', ids).order('name') : { data: [], error: null };
      if (result.error) throw result.error;
      if (!cancelled) { setEvents(result.data || []); if (result.data?.length === 1) setSelectedEvent(result.data[0].id); }
    })().catch(() => { if (!cancelled) setFailed(true); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, eventId, profileId, retry, eventOptions]);

  useEffect(() => {
    if (!open || !selectedEvent) return;
    let cancelled = false;
    setLoading(true); setFailed(false); setSaved(false); setSaveFailed(false); setSlots([]); setSelected([]);
    (async () => {
      const [event, settings, availability] = await Promise.all([
        supabase.from('events').select('name, timezone').eq('id', selectedEvent).maybeSingle(),
        supabase.from('event_b2b_settings').select('venue_config').eq('event_id', selectedEvent).maybeSingle(),
        supabase.from('event_b2b_availability').select('available_slots').eq('event_id', selectedEvent).eq('profile_id', profileId).maybeSingle()
      ]);
      if (event.error || settings.error || availability.error) throw event.error || settings.error || availability.error;
      if (cancelled) return;
      const venue = settings.data?.venue_config || null;
      const zone = networkingTimeZone(selectedEvent, venue, event.data?.timezone);
      const available = availability.data?.available_slots;
      setEventName(event.data?.name || '');
      setTimeZone(zone); setSlots(networkingSlots(venue, zone));
      setAllSlots(!availability.data);
      setSelected((available || []).map((iso: string) => new Date(iso).toISOString()));
    })().catch(() => { if (!cancelled) setFailed(true); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, selectedEvent, profileId, retry]);

  const save = async () => {
    if (writeInFlight.current || loading || failed || !selectedEvent || !slots.length) return;
    writeInFlight.current = true;
    setSaving(true); setSaved(false); setSaveFailed(false);
    try {
      // Delete restores the default. Persisting [] explicitly opts out of every slot.
      const result = allSlots
        ? await supabase.from('event_b2b_availability').delete().eq('event_id', selectedEvent).eq('profile_id', profileId)
        : await supabase.from('event_b2b_availability').upsert({ event_id: selectedEvent, profile_id: profileId,
          available_slots: selected.filter(iso => slots.some(slot => slot.iso === iso)) }, { onConflict: 'event_id,profile_id' }).select('profile_id').single();
      if (result.error) throw result.error;
      setSaved(true);
    } catch { setSaveFailed(true); }
    finally { writeInFlight.current = false; setSaving(false); }
  };

  const options = eventOptions?.length ? eventOptions : events;
  const visibleEvents = selectedEvent && eventName && !options.some(event => event.id === selectedEvent)
    ? [...options, { id: selectedEvent, name: eventName }] : options;

  return <div className="meeting-availability">
    {!initiallyOpen && <button className="availability-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="personal-meeting-availability">
      {t('networkingScheduling.myAvailability')}
    </button>}
    {open && <section id="personal-meeting-availability" aria-label={t('networkingScheduling.myAvailability')}>
      <h2>{t('networkingScheduling.myAvailability')}</h2><p>{t('networkingExperience.availabilityHint')}</p>
      <label>{t('networkingScheduling.chooseEvent')}
        <select value={selectedEvent} disabled={saving || loading} onChange={e => {
          setSelectedEvent(e.target.value); setSaved(false);
          onEventChange?.(e.target.value);
        }}>
          {!selectedEvent && <option value="">{t('networkingScheduling.chooseEvent')}</option>}
          {visibleEvents.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
        </select>
      </label>
      {loading ? <p role="status">{t('networking.people.loading')}</p> : failed ? <p role="alert">
        {t('networkingScheduling.loadError')} <button onClick={() => setRetry(v => v + 1)}>{t('networking.people.retry')}</button>
      </p> : selectedEvent && <>
        <p className="availability-status">{t(allSlots ? 'networkingExperience.availableByDefault' : 'networkingExperience.customAvailability')}</p><p>{t('networkingScheduling.timeZone', { zone: timeZone })}</p>
        {!slots.length ? <p>{t('networkingScheduling.noSchedule')}</p> : <>
          <fieldset disabled={saving}>
            <legend>{t('networkingScheduling.availabilityMode')}</legend>
            <label><input type="radio" name="availability-mode" checked={allSlots} onChange={() => { setAllSlots(true); setSaved(false); }} />{t('networkingScheduling.allSlots')}</label>
            <label><input type="radio" name="availability-mode" checked={!allSlots} onChange={() => { setAllSlots(false); if (allSlots) setSelected(slots.map(slot => slot.iso)); setSaved(false); }} />{t('networkingScheduling.chosenSlots')}</label>
            {!allSlots && <>
              <p>{t('networkingScheduling.emptyAvailability')}</p>
              {[...new Set(slots.map(slot => slot.date))].map(date => <fieldset key={date}>
                <legend>{date}</legend><div className="availability-slots">
                  {slots.filter(slot => slot.date === date).map(slot => <label key={slot.iso}>
                    <input type="checkbox" checked={selected.includes(slot.iso)} aria-label={`${date} ${slot.time}`}
                      onChange={e => { setSaved(false); setSelected(previous => e.target.checked ? [...previous, slot.iso] : previous.filter(iso => iso !== slot.iso)); }} />{slot.time}
                  </label>)}
                </div>
              </fieldset>)}
            </>}
          </fieldset>
          <button onClick={save} disabled={saving}>{t(saving ? 'networkingScheduling.saving' : 'networkingScheduling.saveAvailability')}</button>
          {saved && <p role="status">{t('networkingScheduling.saved')}</p>}
          {saveFailed && <p role="alert">{t('networkingScheduling.saveError')}</p>}
        </>}
      </>}
    </section>}
  </div>;
}
