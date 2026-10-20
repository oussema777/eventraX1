import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Copy, Check, Users, History } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';
import { staffRoles, type StaffRole } from '../../lib/eventAccess';
import { eventTeamCopy } from './eventTeamCopy';
import './EventTeam.css';

type Member = { id: string; email: string; role: StaffRole; status: 'pending' | 'active' | 'revoked'; expires_at: string };
type Audit = { id: string; email: string; action: 'invited' | 'accepted' | 'role_changed' | 'revoked'; new_role: StaffRole | null; created_at: string };
export default function EventTeamTab({ eventId }: { eventId: string }) {
  const { locale } = useI18n();
  const copy = eventTeamCopy[locale] || eventTeamCopy.en;
  const [members, setMembers] = useState<Member[]>([]);
  const [history, setHistory] = useState<Audit[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('coordinator');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const [team, audit] = await Promise.all([
        supabase.from('event_team_members').select('id,email,role,status,expires_at').eq('event_id', eventId).order('invited_at', { ascending: false }),
        supabase.from('event_team_audit').select('id,email,action,new_role,created_at').eq('event_id', eventId).order('created_at', { ascending: false }).limit(30),
      ]);
      if (team.error || audit.error) throw team.error || audit.error;
      setMembers(team.data || []); setHistory(audit.data || []);
    } catch { setLoadError(true); } finally { setLoading(false); }
  }, [eventId]);
  useEffect(() => { void load(); }, [load]);
  const invitationLink = (id: string) => new URL(`/event-team/invite/${id}`, window.location.origin).href;
  const copyLink = async (value: string) => {
    setLink(value); setCopied(false);
    try { await navigator.clipboard.writeText(value); setCopied(true); }
    catch { setNotice(copy.copyFailed); }
  };
  const invite = async (address: string, accessRole: StaffRole) => {
    if (busy) return;
    setBusy(true); setError(''); setNotice(''); setLink(''); setCopied(false);
    try {
      const { data, error: rpcError } = await supabase.rpc('invite_event_member', { p_event_id: eventId, p_email: address.trim().toLowerCase(), p_role: accessRole });
      if (rpcError) throw rpcError;
      if (!data?.id) throw new Error('Missing invitation');
      setLink(invitationLink(data.id)); setNotice(copy.created); setEmail('');
      await load();
    } catch (e) {
      const code = (e as { code?: string }).code;
      setError(code === '23505' ? copy.duplicate : code === '22023' ? copy.invalid : copy.failed);
    } finally { setBusy(false); }
  };
  const updateMember = async (member: Member, nextRole?: StaffRole) => {
    if (busy || (nextRole && nextRole === member.role)) return;
    if (!window.confirm(nextRole ? copy.roleChangeConfirm : member.status === 'pending' ? copy.cancelConfirm : copy.revokeConfirm)) return;
    setBusy(true); setError(''); setNotice(''); setLink('');
    try {
      const { error: rpcError } = await supabase.rpc('update_event_member', { p_member_id: member.id, p_role: nextRole || null, p_revoke: !nextRole });
      if (rpcError) throw rpcError;
      setNotice(copy.saved); await load();
    } catch { setError(copy.failed); } finally { setBusy(false); }
  };
  return <section className="event-team" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="event-team__heading"><span className="event-team__icon"><ShieldCheck size={24} /></span><div><h2>{copy.title}</h2><p>{copy.subtitle}</p></div></header>
    <div className="event-team__roles">{staffRoles.map(value => <div key={value}><strong>{copy.roles[value]}</strong><p>{copy.descriptions[value]}</p></div>)}</div>
    <p className="event-team__owner-note"><ShieldCheck size={16} aria-hidden="true" />{copy.ownerOnly}</p>
    {loadError ? <div role="alert" className="event-team__notice event-team__notice--error event-team__load-error"><span>{copy.loadFailed}</span><button onClick={() => void load()}>{copy.retry}</button></div> : <>
      <form className="event-team__invite" onSubmit={e => { e.preventDefault(); void invite(email, role); }}>
        <div><label htmlFor="team-email">{copy.email}</label><input id="team-email" type="email" autoComplete="email" maxLength={254} required dir="ltr" value={email} onChange={e => setEmail(e.target.value)} disabled={busy || loading} placeholder="colleague@example.com" /></div>
        <div><label htmlFor="team-role">{copy.role}</label><select id="team-role" value={role} onChange={e => setRole(e.target.value as StaffRole)} disabled={busy || loading}>{staffRoles.map(value => <option key={value} value={value}>{copy.roles[value]}</option>)}</select></div>
        <button className="event-team__primary" type="submit" disabled={busy || loading || !email.trim()}><UserPlus size={18} />{busy ? copy.inviting : copy.invite}</button>
        <p>{copy.inviteHint}</p>
      </form>
      {notice && <p role="status" className="event-team__notice">{notice}</p>}
      {error && <p role="alert" className="event-team__notice event-team__notice--error">{error}</p>}
      {link && <div className="event-team__link"><input readOnly aria-label={copy.copy} value={link} onFocus={e => e.target.select()} dir="ltr" /><button onClick={() => void copyLink(link)}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? copy.copied : copy.copy}</button></div>}
      {loading ? <p role="status">{copy.loading}</p> : members.length === 0 ? <div className="event-team__empty"><Users size={28} /><p>{copy.empty}</p></div> : <ul className="event-team__members">
        {members.map(member => {
          const expired = member.status === 'pending' && new Date(member.expires_at).getTime() <= Date.now();
          const status = expired ? 'expired' : member.status;
          return <li key={member.id}>
            <div className="event-team__identity"><span aria-hidden="true">{member.email[0].toUpperCase()}</span><div><strong dir="ltr">{member.email}</strong><small className={`event-team__status event-team__status--${status}`}>{copy[status]}</small></div></div>
            <div className="event-team__actions">
              {member.status === 'active' ? <select aria-label={`${copy.role}: ${member.email}`} value={member.role} disabled={busy} onChange={e => void updateMember(member, e.target.value as StaffRole)}>{staffRoles.map(value => <option key={value} value={value}>{copy.roles[value]}</option>)}</select> : <span>{copy.roles[member.role]}</span>}
              {status === 'pending' && <button disabled={busy} title={copy.copy} aria-label={`${copy.copy}: ${member.email}`} onClick={() => void copyLink(invitationLink(member.id))}><Copy size={16} /></button>}
              {status === 'revoked' || status === 'expired' ? <button disabled={busy} onClick={() => void invite(member.email, member.role)}>{copy.renew}</button>
                : <button className="event-team__revoke" disabled={busy} onClick={() => void updateMember(member)}>{status === 'active' ? copy.revoke : copy.cancel}</button>}
            </div>
          </li>;
        })}
      </ul>}
      {history.length > 0 && <details className="event-team__history"><summary><History size={17} />{copy.history}</summary><ul>{history.map(entry => <li key={entry.id}><div><strong>{copy.actions[entry.action]}</strong><span dir="ltr">{entry.email}</span>{entry.new_role && <small>{copy.roles[entry.new_role]}</small>}</div><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString(locale)}</time></li>)}</ul></details>}
    </>}
  </section>;
}
