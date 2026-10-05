import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { eventAuthReturnUrl, safeAuthPath } from '../utils/authRedirect';

export default function EventAuthBridge() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [googlePending, setGooglePending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryAfter, setRetryAfter] = useState(0);
  const [eventName, setEventName] = useState('');

  const params = new URLSearchParams(location.search);
  const rawRedirect = params.get('redirect') || '';
  const candidate = safeAuthPath(rawRedirect, window.location.origin);
  const redirectUrl = candidate && !/^\/(event-auth|auth\/callback)(?:[/?#]|$)/.test(candidate) ? candidate : null;
  const callbackError = new URLSearchParams(location.hash.slice(1)).get('error_code') || params.get('error_code');
  const expired = callbackError === 'otp_expired';
  const callbackFailed = new URLSearchParams(location.hash.slice(1)).has('error') || params.has('error');
  const returnUrl = redirectUrl ? eventAuthReturnUrl(redirectUrl, window.location.origin) : '';
  const eventId = redirectUrl?.match(/^\/event\/([^/]+)\/networking(?:[/?#]|$)/)?.[1];

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
    if (!isLoading && user && redirectUrl) navigate(redirectUrl, { replace: true });
  }, [isLoading, user, redirectUrl, navigate]);

  const handleGoogleLogin = async () => {
    if (!returnUrl || googlePending) return;
    setGooglePending(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: returnUrl }
      });
      if (error) throw error;
    } catch {
      setGooglePending(false);
      setErrorMessage('Google sign-in could not start. Please try again.');
    }
  };

  const handleMagicLink = async () => {
    if (!returnUrl || !email.trim() || status === 'sending' || retryAfter) return;
    setStatus('sending');
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        // Registration already created/linked the account. Do not create a
        // different account if the returning attendee mistypes their email.
        options: { emailRedirectTo: returnUrl, shouldCreateUser: false }
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
        setErrorMessage('Too many sign-in requests. Wait a minute before trying again, and check your inbox for the latest email.');
      } else if (authError.code === 'otp_disabled' || authError.code === 'user_not_found' || authError.code === 'signup_disabled') {
        setErrorMessage('We could not find sign-in access for this email. Use your registration email. If it is correct, return to event registration and submit again with B2B networking selected to finish setting up access.');
      } else if (authError.name === 'AuthRetryableFetchError' || error instanceof TypeError) {
        setErrorMessage('We could not reach the sign-in service. Check your connection and try again.');
      } else {
        setErrorMessage('We could not send your sign-in email right now. Please try again shortly. If this continues, contact the event organizer.');
      }
    }
  };

  if (isLoading || (user && redirectUrl)) return <div role="status" className="min-h-screen flex items-center justify-center bg-[#0B2641] text-white">Opening your event…</div>;
  if (!redirectUrl) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B2641] text-white">
    <p>This event sign-in link is incomplete. Open the networking link in your registration email.</p>
    <Link to="/">Back to Eventra</Link>
  </div>;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B2641',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '32px',
          color: '#FFFFFF'
        }}
      >
        {eventName && <p style={{ color: '#93C5FD', marginBottom: '12px', fontWeight: 600 }}>{eventName}</p>}
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Access your event networking hub</h1>
        <p style={{ color: '#94A3B8', marginBottom: '24px' }}>
          Sign in with the same email you used to register. We’ll take you directly to this event’s networking hub.
        </p>
        {status !== 'sent' && callbackFailed && <p role="status" style={{ color: '#FCD34D', marginBottom: '16px' }}>{expired ? 'This sign-in link has expired or was already used.' : 'We could not complete sign-in from this link.'} Request a fresh link below; your registration is still saved.</p>}

        <button
          onClick={handleGoogleLogin}
          disabled={googlePending || status === 'sending'}
          style={{
            width: '100%',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: '#0684F5',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', marginBottom: '16px' }}>
          Or receive a sign-in email — no password needed
        </div>

        <form onSubmit={e => { e.preventDefault(); void handleMagicLink(); }}>
        <input
          type="email"
          required
          autoComplete="email"
          aria-label="Registration email address"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); if (status !== 'sending') setStatus('idle'); }}
          placeholder="Email address"
          style={{
            width: '100%',
            height: '44px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'transparent',
            color: '#FFFFFF',
            padding: '0 12px',
            marginBottom: '12px'
          }}
        />
        <button
          type="submit"
          disabled={status === 'sending' || googlePending || !email.trim() || retryAfter > 0}
          style={{
            width: '100%',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {status === 'sending' ? 'Sending...' : retryAfter ? `Send again in ${retryAfter}s` : 'Email me a sign-in link'}
        </button>
        </form>
        {status === 'sent' && (
          <div role="status" style={{ marginTop: '12px', fontSize: '13px', color: '#10B981' }}>
            Check your inbox for a fresh sign-in link. Open the latest email to access this event’s networking hub. Check spam if it does not arrive.
          </div>
        )}
        {errorMessage && (
          <div role="alert" style={{ marginTop: '12px', fontSize: '13px', color: '#EF4444' }}>
            {errorMessage}
          </div>
        )}
        {eventId && <p style={{ marginTop: '20px', fontSize: '13px' }}><Link style={{ color: '#93C5FD' }} to={`/event/${eventId}/register`}>Return to event registration</Link></p>}
      </div>
    </div>
  );
}
