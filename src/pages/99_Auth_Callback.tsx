import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() { 
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing sign-in...');

  useEffect(() => {
    const finishAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const next = params.get('next') || '/';

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage('Unable to complete sign-in. Please try again.');
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate(next, { replace: true });
      } else {
        setMessage('Sign-in link expired. Please request a new link.');
      }
    };

    finishAuth();
  }, [navigate]);

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
          You can close this tab after the redirect.
        </div>
      </div>
    </div>
  );
}
