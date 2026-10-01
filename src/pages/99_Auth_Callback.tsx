import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { eventAuthPath, safeAuthPath } from '../utils/authRedirect';

export default function AuthCallback() { 
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing sign-in...');
  const next = safeAuthPath(new URLSearchParams(window.location.search).get('next'), window.location.origin);

  useEffect(() => {
    const finishAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      // The SDK may already have consumed the callback while initializing.
      let { data: { session } } = await supabase.auth.getSession();
      if (code && !session) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage('Unable to complete sign-in. Please try again.');
          return;
        }
        session = data.session;
      }

      if (session?.user) {
        // If B2B registration is pending, go directly to the event landing page
        // (the landing page useEffect will handle final redirect to register after profile setup)
        const b2bRedirect = safeAuthPath(localStorage.getItem('pendingB2BRegister'), window.location.origin);
        // An explicit event destination wins over stale registration state.
        const finalNext = next && next !== '/' ? next
          : b2bRedirect ? b2bRedirect.replace(/\/register(?=[?#]|$)/, '/landing') : '/';
        navigate(finalNext, { replace: true });
      } else {
        setMessage('Sign-in link expired. Please request a new link.');
      }
    };

    finishAuth().catch(() => setMessage('Unable to complete sign-in. Please try again.'));
  }, [navigate, next]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#0B2641', color: '#FFFFFF' }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
          {message}
        </div>
        <div style={{ fontSize: '14px', color: '#94A3B8' }}>
          {next && /^\/event\/[^/]+\/networking(?:[/?#]|$)/.test(next)
            ? <Link to={eventAuthPath(next)}>Request a fresh event sign-in link</Link>
            : <Link to="/">Back to Eventra</Link>}
        </div>
      </div>
    </div>
  );
}
