import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { supabase } from '../lib/supabase';
import { eventTeamCopy } from '../components/dashboard/eventTeamCopy';
import { type StaffRole } from '../lib/eventAccess';
import '../components/dashboard/EventTeam.css';

export default function EventTeamInvitation() {
  const { invitationId } = useParams();
  const { user, isLoading, signOut } = useAuth();
  const userId = user?.id;
  const { locale } = useI18n();
  const copy = eventTeamCopy[locale] || eventTeamCopy.en;
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<{ event_id: string; event_name: string; role: StaffRole; email: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const next = `/event-team/invite/${invitationId}`;
  const login = `/login?next=${encodeURIComponent(next)}`;
  useEffect(() => {
    let active = true;
    setInvitation(null); setError('');
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    void supabase.rpc('get_event_invitation', { p_invitation_id: invitationId }).then(({ data, error: rpcError }) => {
      if (!active) return;
      if (rpcError || !data?.event_id) setError(copy.unavailable);
      else setInvitation(data);
      setLoading(false);
    }).catch(() => { if (active) { setError(copy.failed); setLoading(false); } });
    return () => { active = false; };
  }, [invitationId, userId, copy, retry]);
  const accept = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const { data, error: rpcError } = await supabase.rpc('accept_event_invitation', { p_invitation_id: invitationId });
      if (rpcError || !data) throw rpcError || new Error('No event');
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) { setError(copy.refreshFailed); return; }
      navigate(`/event/${data}`, { replace: true });
    } catch { setError(copy.unavailable); } finally { setBusy(false); }
  };
  return <div className="event-team-invitation" dir={locale === 'ar' ? 'rtl' : 'ltr'}><main className="event-team">
    <span className="event-team__icon"><ShieldCheck size={24} /></span>
    <h1>{invitation?.event_name || copy.invitation}</h1>
    <p>{copy.invitationIntro}</p>
    {isLoading || loading ? <p role="status">{copy.loading}</p> : !user ? <div className="event-team__actions">
      <Link className="event-team__primary" to={login}>{copy.signIn}</Link>
      <Link className="event-team__primary" to={`/register?next=${encodeURIComponent(next)}`}>{copy.createAccount}</Link>
    </div> : <>
      <p dir="ltr">{user.email}</p>
      {error && <p role="alert" className="event-team__notice event-team__notice--error">{error}</p>}
      {invitation && <><div className="event-team__roles"><div><strong>{copy.roles[invitation.role]}</strong><p>{copy.descriptions[invitation.role]}</p></div></div>
        <button className="event-team__primary" disabled={busy} onClick={() => void accept()}>{busy ? copy.accepting : invitation.status === 'active' ? copy.open : copy.accept}</button></>}
      <div className="event-team__actions">
        <button disabled={busy} onClick={async () => { await signOut(); navigate(login, { replace: true }); }}>{copy.switchAccount}</button>
        {error && <button disabled={busy} onClick={() => setRetry(value => value + 1)}>{copy.retry}</button>}
      </div>
    </>}
  </main></div>;
}
