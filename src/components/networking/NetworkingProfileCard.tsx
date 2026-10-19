import { useEffect, useState } from 'react';
import { Check, ArrowRight, UserRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';
import { bookingProfileFields, missingBookingFields } from '../../utils/networkingProfile';
import './NetworkingExperience.css';

export default function NetworkingProfileCard({ profileId, onReady, compact = false }: {
  profileId: string; onReady?: (ready: boolean) => void; compact?: boolean;
}) {
  const { t } = useI18n();
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(compact);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const refresh = () => setRetry(value => value + 1);
    window.addEventListener('eventra:profile-updated', refresh);
    return () => window.removeEventListener('eventra:profile-updated', refresh);
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    supabase.from('profiles').select('*').eq('id', profileId).single().then(({ data, error }) => {
      if (!active) return;
      setLoading(false); setError(!!error); setProfile(data);
      setDraft(Object.fromEntries(bookingProfileFields.map(field => [field, data?.[field] || (field === 'industry' ? data?.sector : '') || ''])));
      onReady?.(!error && missingBookingFields(data).length === 0);
    });
    return () => { active = false; };
  }, [profileId, retry]);
  const missing = missingBookingFields(profile);
  const ready = !loading && !error && missing.length === 0;
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || missingBookingFields(draft).length) return;
    setSaving(true); setError(false);
    const updates = Object.fromEntries(bookingProfileFields.map(field => [field, draft[field].trim()]));
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', profileId).select('*').single();
    setSaving(false);
    if (error) { setError(true); return; }
    setProfile(data); setEditing(false); onReady?.(missingBookingFields(data).length === 0);
    window.dispatchEvent(new CustomEvent('eventra:profile-updated', { detail: { profileId } }));
  };
  if (loading) return <div className="networking-readiness" role="status">{t('networkingExperience.checkingProfile')}</div>;
  if (compact && ready) return null;
  return <section className={`networking-readiness ${ready ? 'is-ready' : ''}`} aria-label={t('networkingExperience.profileBasics')}>
    <div className="networking-readiness__heading">
      <div className="networking-readiness__icon">{ready ? <Check size={21} /> : <UserRound size={21} />}</div>
      <div className="networking-readiness__copy">
        <h2>{t(ready ? 'networkingExperience.readyTitle' : 'networkingExperience.unlockTitle')}</h2>
        <p>{t(ready ? 'networkingExperience.readyHint' : 'networkingExperience.unlockHint')}</p>
      </div>
      {!ready && !editing && <button className="networking-primary" onClick={() => setEditing(true)}>{t('networkingExperience.completeBasics')} <ArrowRight size={16} /></button>}
      {ready && <a className="networking-text-link" href="/my-profile">{t('networkingExperience.enrichProfile')} <ArrowRight size={16} /></a>}
    </div>
    {!ready && <>
      <div className="networking-readiness__progress" role="progressbar" aria-label={t('networkingExperience.profileBasics')} aria-valuenow={4 - missing.length} aria-valuemin={0} aria-valuemax={4}>
        <span style={{ width: `${(4 - missing.length) * 25}%` }} />
      </div>
      <div className="networking-readiness__checklist">{bookingProfileFields.map(field => <span key={field} className={missing.includes(field) ? '' : 'is-complete'}>
        {missing.includes(field) ? <span className="networking-dot" /> : <Check size={14} />}{t(`networkingExperience.fields.${field}`)}
      </span>)}</div>
    </>}
    {editing && <form onSubmit={save} className="networking-basics-form">
      <div>{bookingProfileFields.map(field => <label key={field}>{t(`networkingExperience.fields.${field}`)}
        <input required maxLength={160} value={draft[field] || ''} disabled={saving} autoComplete={field === 'full_name' ? 'name' : field === 'company' ? 'organization' : field === 'job_title' ? 'organization-title' : 'off'}
          onChange={event => setDraft(previous => ({ ...previous, [field]: event.target.value }))} />
      </label>)}</div>
      <div className="networking-basics-form__actions"><button className="networking-primary" disabled={saving || missingBookingFields(draft).length > 0}>{t(saving ? 'networkingScheduling.saving' : 'networkingExperience.saveBasics')}</button>
        <a className="networking-text-link" href="/my-profile">{t('networkingExperience.fullProfile')}</a></div>
    </form>}
    {error && <p role="alert">{t('networkingExperience.profileError')} <button type="button" onClick={() => setRetry(value => value + 1)}>{t('networking.people.retry')}</button></p>}
  </section>;
}
