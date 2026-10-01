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

  const params = new URLSearchParams(location.search);
  const rawRedirect = params.get('redirect') || '';
  const candidate = safeAuthPath(rawRedirect, window.location.origin);
  const redirectUrl = candidate && !/^\/(event-auth|auth\/callback)(?:[/?#]|$)/.test(candidate) ? candidate : null;
  const expired = new URLSearchParams(location.hash.slice(1)).has('error') || params.has('error');
  const returnUrl = redirectUrl ? eventAuthReturnUrl(redirectUrl, window.location.origin) : '';

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
    if (!returnUrl || !email.trim() || status === 'sending') return;
    setStatus('sending');
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        // Registration already created/linked the account. Do not create a
        // different account if the returning attendee mistypes their email.
        options: { emailRedirectTo: returnUrl, shouldCreateUser: false }
      });
      if (error) throw error;
      setStatus('sent');
    } catch {
      setStatus('error');
      setErrorMessage('Could not send a sign-in link. Check that this is your registration email, then try again.');
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
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Access your event networking hub</h1>
        <p style={{ color: '#94A3B8', marginBottom: '24px' }}>
          Sign in with the same email you used to register. We’ll take you directly to this event’s networking hub.
        </p>
        {expired && <p role="status" style={{ color: '#FCD34D', marginBottom: '16px' }}>This sign-in link has expired or was already used. Request a fresh link below; your registration is still saved.</p>}

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
          Or use a magic link
        </div>

        <form onSubmit={e => { e.preventDefault(); void handleMagicLink(); }}>
        <input
          type="email"
          required
          autoComplete="email"
          aria-label="Registration email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          disabled={status === 'sending' || googlePending || !email.trim()}
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
          {status === 'sending' ? 'Sending...' : 'Send magic link'}
        </button>
        </form>
        {status === 'sent' && (
          <div role="status" style={{ marginTop: '12px', fontSize: '13px', color: '#10B981' }}>
            Check your inbox for a fresh sign-in link. It will return you to this event’s networking hub.
          </div>
        )}
        {errorMessage && (
          <div role="alert" style={{ marginTop: '12px', fontSize: '13px', color: '#EF4444' }}>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
