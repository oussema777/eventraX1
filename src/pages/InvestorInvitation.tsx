import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { investorFailure, investorRpc } from '../lib/investorReview';
import { investorReviewCopy } from '../components/networking/investorReviewCopy';
import '../components/networking/InvestorReview.css';

const STORAGE = 'eventra:investor-invitation';
type Invitation = { event_id: string; event_name: string; status: string };
export default function InvestorInvitation() {
  const { user, isLoading, signOut } = useAuth(); const { locale } = useI18n(); const c = investorReviewCopy[locale] || investorReviewCopy.en;
  const [token] = useState(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (value && /^[a-f0-9]{64}$/.test(value)) {
      sessionStorage.setItem(STORAGE, value);
      // Secret never enters a query string, auth redirect or analytics page URL.
      window.history.replaceState(window.history.state, '', window.location.pathname);
      return value;
    }
    return sessionStorage.getItem(STORAGE) || '';
  });
  const [info, setInfo] = useState<Invitation | null>(null); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); const [registration, setRegistration] = useState(false); const [retry, setRetry] = useState(0);
  const userId = user?.id;
  useEffect(() => {
    let active = true; setInfo(null); setError(''); setRegistration(false);
    if (!userId || !token) { setLoading(false); return; }
    setLoading(true);
    void investorRpc<Invitation>('get_event_investor_invitation', { p_token: token }).then(result => { if (active) setInfo(result); })
      .catch(() => { if (active) setError(c.unavailable); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, token, retry, c]);
  const accept = async () => {
    if (busy) return; setBusy(true); setError('');
    try {
      const result = await investorRpc<Invitation>('accept_event_investor_invitation', { p_token: token });
      setInfo(result); sessionStorage.removeItem(STORAGE);
    } catch (failure) { const key = investorFailure(failure); setRegistration(key === 'registrationRequired'); setError(key === 'failed' ? c.unavailable : c[key as keyof typeof c]); }
    finally { setBusy(false); }
  };
  const next = encodeURIComponent('/investor-invitation');
  return <div className="investor-invitation" dir={locale === 'ar' ? 'rtl' : 'ltr'}><main className="investor-review">
    <ShieldCheck size={32} /><h1>{info?.status === 'accepted' ? c.accepted : c.invitation}</h1><p>{info?.event_name}</p><p>{c.invitationHint}</p>
    {isLoading || loading ? <p role="status">{c.loading}</p> : !token ? <p role="alert">{c.unavailable}</p> : !user ? <div className="investor-review__actions"><Link className="investor-review__link" to={`/login?next=${next}`}>{c.signIn}</Link><Link className="investor-review__link" to={`/register?next=${next}`}>{c.register}</Link></div> : <>
      <p dir="ltr">{user.email}</p>{error && <p role="alert" className="investor-review__notice investor-review__error">{error}</p>}
      {info?.status === 'accepted' ? <Link className="investor-review__link" to={`/event/${info.event_id}`}>{c.open}</Link> : <>
        {registration && info && <div className="investor-review__actions"><a className="investor-review__link" href={`/event/${info.event_id}/register`} target="_blank" rel="noreferrer">{c.eventRegistration}</a><button disabled={busy} onClick={() => void accept()}>{c.recheck}</button></div>}
        {info && !registration && <button className="investor-review__primary" disabled={busy} onClick={() => void accept()}>{busy ? c.working : c.accept}</button>}
        <div className="investor-review__actions"><button disabled={busy} onClick={() => void signOut()}>{c.switchAccount}</button>{error && !registration && <button disabled={busy} onClick={() => setRetry(value => value + 1)}>{c.retry}</button>}</div>
      </>}
    </>}
  </main></div>;
}
