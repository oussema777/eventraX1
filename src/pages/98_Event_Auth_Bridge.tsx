import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function EventAuthBridge() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const params = new URLSearchParams(location.search);
  const redirectUrl = params.get('redirect') || '';

  useEffect(() => {
    const autoStart = async () => {
      if (!redirectUrl) return;
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.location.replace(redirectUrl);
      }
    };
    void autoStart();
  }, [redirectUrl]);

  const handleGoogleLogin = async () => {
    if (!redirectUrl) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl }
    });
  };

  const handleMagicLink = async () => {
    if (!redirectUrl || !email.trim()) return;
    setStatus('sending');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectUrl }
    });
    if (error) {
      console.error(error);
      setStatus('error');
      return;
    }
    setStatus('sent');
  };

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
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Sign in to Eventra</h1>
        <p style={{ color: '#94A3B8', marginBottom: '24px' }}>
          Continue to the event registration experience.
        </p>

        <button
          onClick={handleGoogleLogin}
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

        <input
          type="email"
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
          onClick={handleMagicLink}
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
        {status === 'sent' && (
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#10B981' }}>
            Magic link sent. Check your inbox.
          </div>
        )}
        {status === 'error' && (
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#EF4444' }}>
            Failed to send magic link.
          </div>
        )}
      </div>
    </div>
  );
}
