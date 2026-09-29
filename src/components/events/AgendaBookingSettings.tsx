import { useEffect, useId, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';

export function SessionBookingToggle({ open, onChange }: { open: boolean; onChange: (open: boolean) => void }) {
  const { t } = useI18n();
  return (
    <label className="flex items-start gap-3 rounded-lg border p-4 text-white" style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
      <input type="checkbox" checked={open} onChange={e => onChange(e.target.checked)} className="mt-1 h-4 w-4" style={{ accentColor: '#0684F5' }} />
      <span>
        <span className="block text-sm font-semibold">{t('agendaBooking.open')}</span>
        <span className="mt-1 block text-xs text-white/60">{t('agendaBooking.openHint')}</span>
      </span>
    </label>
  );
}

export default function AgendaBookingSettings({ eventId }: { eventId?: string }) {
  const { t } = useI18n();
  const inputId = useId();
  const queryClient = useQueryClient();
  const [limit, setLimit] = useState('');
  const [savedLimit, setSavedLimit] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!eventId || eventId === 'new') { setLoading(false); return; }
    setLoading(true);
    setError(false);
    supabase.from('events').select('workshop_selection_limit').eq('id', eventId).single().then(({ data, error }) => {
      if (cancelled) return;
      setError(!!error);
      const value = data?.workshop_selection_limit?.toString() || '';
      setLimit(value);
      setSavedLimit(value);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [eventId]);

  if (!eventId || eventId === 'new') return null;
  const invalid = limit !== '' && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 2147483647);
  const save = async () => {
    if (invalid || saving) return;
    setSaving(true);
    setError(false);
    setSaved(false);
    try {
      const { data, error } = await supabase.from('events')
        .update({ workshop_selection_limit: limit === '' ? null : Number(limit) })
        .eq('id', eventId).select('id').single();
      if (error || !data) throw error || new Error('No event updated');
      setSavedLimit(limit);
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch {
      setError(true);
    } finally { setSaving(false); }
  };

  return (
    <section className="mb-6 rounded-xl border p-5 text-white" style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)' }} aria-label={t('agendaBooking.title')}>
      <h3 className="mb-2 text-base font-semibold">{t('agendaBooking.title')}</h3>
      <p className="mb-4 text-sm text-white/60">{t('agendaBooking.hint')}</p>
      <div className="flex flex-wrap items-end gap-3">
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <label htmlFor={inputId} className="mb-2 block text-sm">{t('agendaBooking.workshopMax')}</label>
          <input id={inputId} type="number" min="1" step="1" value={limit} disabled={loading || saving}
            placeholder={t('agendaBooking.unlimited')} aria-invalid={invalid}
            onChange={e => { setLimit(e.target.value); setSaved(false); }}
            className="w-full rounded-lg border px-3 py-2 text-white" style={{ backgroundColor: '#0D243B', borderColor: 'rgba(255,255,255,0.2)' }} />
        </div>
        <button type="button" onClick={save} disabled={loading || saving || invalid || limit === savedLimit}
          className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ backgroundColor: '#0684F5', opacity: loading || saving || invalid || limit === savedLimit ? 0.5 : 1 }}>
          {saving ? t('agendaBooking.saving') : t('agendaBooking.save')}
        </button>
      </div>
      <p className="mt-2 text-xs text-white/60">{t('agendaBooking.limitHint')}</p>
      {invalid && <p role="alert" className="mt-2 text-sm text-red-300">{t('agendaBooking.invalidLimit')}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-300">{t('agendaBooking.settingsError')}</p>}
      {saved && <p role="status" className="mt-2 text-sm text-green-300">{t('agendaBooking.saved')}</p>}
    </section>
  );
}
