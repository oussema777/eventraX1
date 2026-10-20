import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { eventAuthReturnUrl, safeAuthPath } from '../utils/authRedirect';
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { eventAuthCopy, type EventAuthError } from './eventAuthCopy';
import './EventAuthBridge.css';

export default function EventAuthBridge() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, accountType, isLoading } = useAuth();
  const { locale, t } = useI18n();
  const copy = eventAuthCopy[locale] || eventAuthCopy.en;
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<'link' | 'password'>('link');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<EventAuthError | ''>('');
  const [retryAfter, setRetryAfter] = useState(0);
  const [eventName, setEventName] = useState('');
  const busy = signingIn || googleLoading || status === 'sending';

  const params = new URLSearchParams(location.search);
  // Explicit recovery from an account that is not registered for this event.
  // Keep its session intact until the attendee follows the new email link.
  const switchAccount = params.get('switch_account') === '1';
  const rawRedirect = params.get('redirect') || '';
  const candidate = safeAuthPath(rawRedirect, window.location.origin);
  const redirectUrl = candidate && !/^\/(event-auth|auth\/callback)(?:[/?#]|$)/.test(candidate) ? candidate : null;
  const callbackError = new URLSearchParams(location.hash.slice(1)).get('error_code') || params.get('error_code');
  const expired = callbackError === 'otp_expired';
  const callbackFailed = new URLSearchParams(location.hash.slice(1)).has('error') || params.has('error');
  const returnUrl = redirectUrl ? eventAuthReturnUrl(redirectUrl, window.location.origin) : '';
  const eventId = redirectUrl?.match(/^\/event\/([^/]+)\/(?:networking|attendees)(?:[/?#]|$)/)?.[1];
  const bookingAccess = !!eventId && !!redirectUrl && new URL(redirectUrl, window.location.origin).searchParams.has('bookMeeting');

  useEffect(() => {
    if (!retryAfter) return;
    const timer = window.setTimeout(() => setRetryAfter(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [retryAfter]);

  useEffect(() => {
    let active = true;
    setEventName('');
    if (eventId && /^[0-9a-f-]{36}$/i.test(eventId)) {
      void supabase.from('events').select('name').eq('id', eventId).maybeSingle()
        .then(({ data }) => { if (active) setEventName(data?.name || ''); });
    }
    return () => { active = false; };
  }, [eventId]);

  useEffect(() => {
    if (!isLoading && user && redirectUrl && !switchAccount) {
      navigate(accountType === 'event_guest'
        ? `/auth/callback?next=${encodeURIComponent(redirectUrl)}`
        : redirectUrl, { replace: true });
    }
  }, [isLoading, user, accountType, redirectUrl, navigate, switchAccount]);

  const callbackReturnUrl = redirectUrl
    ? new URL(`/auth/callback?next=${encodeURIComponent(redirectUrl)}`, window.location.origin).href
    : '';

  const handleMagicLink = async () => {
    if (!returnUrl || !email.trim() || busy || retryAfter) return;
    setStatus('sending');
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        // Registration already created/linked the account. Do not create a
        // different account if the returning attendee mistypes their email.
        options: { emailRedirectTo: callbackReturnUrl, shouldCreateUser: false }
      });
      if (error) throw error;
      setStatus('sent');
      setRetryAfter(60);
    } catch (error) {
      setStatus('error');
      const authError = error as { code?: string; status?: number; name?: string };
      // Preserve useful diagnostics without logging the email or login tokens.
      console.warn('Event sign-in email failed', { code: authError.code, status: authError.status });
      if (authError.status === 429 || ['over_email_send_rate_limit', 'over_request_rate_limit'].includes(authError.code || '')) {
        setRetryAfter(60);
        setErrorMessage('rateLimit');
      } else if (authError.code === 'otp_disabled' || authError.code === 'user_not_found' || authError.code === 'signup_disabled') {
        setErrorMessage('missing');
      } else if (authError.name === 'AuthRetryableFetchError' || error instanceof TypeError) {
        setErrorMessage('offline');
      } else {
        setErrorMessage('unavailable');
      }
    }
  };

  const chooseMethod = (next: 'link' | 'password') => {
    if (busy) return;
    setMethod(next);
    setPassword('');
    setShowPassword(false);
    setErrorMessage('');
  };

  const handlePasswordLogin = async () => {
    if (!redirectUrl || !email.trim() || !password || busy) return;
    setSigningIn(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (error) throw error;
      setPassword('');
      // Normal sign-in is resumed by the authenticated-user effect above.
      // Explicit account switching deliberately disables that effect.
      if (switchAccount && data.user) {
        navigate(data.user.app_metadata?.account_type === 'event_guest'
          ? `/auth/callback?next=${encodeURIComponent(redirectUrl)}`
          : redirectUrl, { replace: true });
      }
    } catch (error) {
      const authError = error as { code?: string; status?: number; name?: string };
      if (authError.status === 429) setErrorMessage('rateLimit');
      else if (authError.code === 'email_not_confirmed') setErrorMessage('unconfirmed');
      else if (authError.code === 'invalid_credentials' || authError.status === 400) setErrorMessage('credentials');
      else if (authError.name === 'AuthRetryableFetchError' || error instanceof TypeError) setErrorMessage('offline');
      else setErrorMessage('signInUnavailable');
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!callbackReturnUrl || busy) return;
    setGoogleLoading(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackReturnUrl,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
      // Keep controls disabled while the browser leaves for Google.
    } catch {
      setGoogleLoading(false);
      setErrorMessage('signInUnavailable');
    }
  };

  if (isLoading || (user && redirectUrl && !switchAccount)) return (
    <div className="event-access-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <p role="status" className="event-access-loading"><KeyRound size={24} aria-hidden="true" />{copy.opening}</p>
    </div>
  );
  if (!redirectUrl) return (
    <div className="event-access-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <main className="event-access-card">
        <span className="event-access-icon"><KeyRound size={30} aria-hidden="true" /></span>
        <p className="event-access-intro">{copy.incomplete}</p>
        <Link className="event-access-back" to={eventId ? `/event/${eventId}/attendees` : '/'}><ArrowLeft size={16} aria-hidden="true" />{eventId ? copy.backToEvent : copy.back}</Link>
      </main>
    </div>
  );

  return (
    <div className="event-access-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="event-access-shell">
        <Link className="event-access-back" to={eventId ? `/event/${eventId}/attendees` : '/'}><ArrowLeft size={16} aria-hidden="true" />{eventId ? copy.backToEvent : copy.back}</Link>
        <main className="event-access-card">
          {eventName && <p className="event-access-event">{eventName}</p>}
          <h1>{bookingAccess ? copy.bookingTitle : copy.title}</h1>
          <p className="event-access-intro">{bookingAccess ? copy.bookingIntro : copy.intro}</p>
          {status !== 'sent' && callbackFailed && (
            <p role="status" className="event-access-notice">{expired ? copy.expired : copy.failed} {copy.fresh}</p>
          )}
          <div className="event-access-methods" role="group" aria-label={copy.methodLabel}>
            <button type="button" aria-pressed={method === 'link'} title={copy.linkMethodHint} disabled={busy} onClick={() => chooseMethod('link')}>
              <Mail size={16} aria-hidden="true" /><span>{copy.linkMethod}</span>
            </button>
            <button type="button" aria-pressed={method === 'password'} title={copy.accountMethodHint} disabled={busy} onClick={() => chooseMethod('password')}>
              <KeyRound size={16} aria-hidden="true" /><span>{copy.accountMethod}</span>
            </button>
          </div>
          {method === 'password' && <>
            <button type="button" className="event-access-google" disabled={busy} aria-busy={googleLoading} onClick={() => void handleGoogleLogin()}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.61 0-4.82-1.76-5.61-4.12H3.05v2.59A10 10 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.39 13.92a6 6 0 0 1 0-3.84V7.49H3.05a10 10 0 0 0 0 9.02l3.34-2.59Z" />
                <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.34 2.59C7.18 7.72 9.39 5.96 12 5.96Z" />
              </svg>
              <span>{googleLoading ? copy.signingIn : t('auth.login.continueWithGoogle')}</span>
            </button>
            <div className="event-access-divider"><span>{copy.orPassword}</span></div>
          </>}
          <form className="event-access-form" onSubmit={e => { e.preventDefault(); void (method === 'link' ? handleMagicLink() : handlePasswordLogin()); }}>
            <label htmlFor="event-access-email">{copy.emailLabel}</label>
            <div className="event-access-input">
              <Mail size={19} aria-hidden="true" />
              <input
                id="event-access-email"
                type="email"
                required
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                dir="ltr"
                aria-describedby={method === 'link' ? 'event-access-help' : undefined}
                value={email}
                disabled={busy}
                onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); if (status !== 'sending') setStatus('idle'); }}
                placeholder={copy.emailPlaceholder}
              />
            </div>
            {method === 'link' && <p id="event-access-help" className="event-access-help">{copy.passwordless}</p>}
            {method === 'password' && <>
              <label htmlFor="event-access-password" className="event-access-password-label">{copy.passwordLabel}</label>
              <div className="event-access-input">
                <LockKeyhole size={19} aria-hidden="true" />
                <input id="event-access-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                  value={password} disabled={busy} dir="ltr"
                  onChange={event => { setPassword(event.target.value); setErrorMessage(''); }} />
                <button type="button" className="event-access-password-toggle" disabled={busy} aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                  onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              <button type="button" className="event-access-alternative" disabled={busy} onClick={() => chooseMethod('link')}>{copy.useLinkInstead}</button>
            </>}
            <button
              type="submit"
              disabled={!email.trim() || busy || (method === 'link' ? retryAfter > 0 : !password)}
              aria-busy={method === 'link' ? status === 'sending' : signingIn}
              className="event-access-submit"
            >
              <span>{method === 'password' ? signingIn ? copy.signingIn : copy.signIn : status === 'sending' ? copy.sending : retryAfter ? copy.retry(retryAfter) : copy.submit}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
          {method === 'link' && status === 'sent' && <div role="status" className="event-access-notice event-access-notice--success">{bookingAccess ? copy.bookingSent : copy.sent}</div>}
          {errorMessage && <div role="alert" className="event-access-notice event-access-notice--error">{copy[errorMessage]}</div>}
          {eventId && (
            <div className="event-access-footer">
              <Link to={`/event/${eventId}/register`}>{bookingAccess ? copy.bookingRegistration : copy.registration}<ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
