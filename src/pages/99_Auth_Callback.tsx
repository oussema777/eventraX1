import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { eventAuthPath, safeAuthPath } from '../utils/authRedirect';
import { useI18n } from '../i18n/I18nContext';

export default function AuthCallback() { 
  const navigate = useNavigate();
  const { t } = useI18n();
  const [message, setMessage] = useState('completing');
  const [retry, setRetry] = useState(0);
  const [canRetry, setCanRetry] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [expiredLink, setExpiredLink] = useState(false);
  const next = safeAuthPath(new URLSearchParams(window.location.search).get('next'), window.location.origin);
  const eventDestination = next && /^\/event\/[^/]+\/(?:networking|attendees)(?:[/?#]|$)/.test(next) ? next : null;

  useEffect(() => {
    const finishAuth = async () => {
      setCanRetry(false);
      setNeedsSignIn(false);
      setExpiredLink(false);
      setMessage('completing');
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.slice(1));
      // OAuth failures can arrive in either place. A missing session alone is
      // not evidence that an email link expired. Never display raw URL messages.
      const callbackError = ['error', 'error_code', 'error_description'].some(key => params.has(key) || hash.has(key));
      if (callbackError) {
        const expired = (hash.get('error_code') || params.get('error_code')) === 'otp_expired';
        setExpiredLink(expired);
        setMessage(expired ? 'expired' : 'failed');
        setNeedsSignIn(true);
        return;
      }
      const code = params.get('code');
      // The SDK may already have consumed the callback while initializing.
      let { data: { session } } = await supabase.auth.getSession();
      if (code && !session) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage('failed');
          setNeedsSignIn(true);
          return;
        }
        session = data.session;
      }

      if (session?.user) {
        let firstEventPath: string | null = null;
        if (session.user.app_metadata?.account_type === 'event_guest') {
          setMessage('activating');
          const { data, error } = await supabase.functions.invoke('activate-event-account');
          if (error) {
            if ((error as { context?: { status?: number } }).context?.status === 403 && next) {
              navigate(next, { replace: true });
              return;
            }
            setMessage('activationFailed');
            setCanRetry(true);
            return;
          }
          if (data?.event_id && /^[0-9a-f-]{36}$/i.test(data.event_id)) {
            firstEventPath = `/event/${data.event_id}/networking`;
          }
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            setMessage('refreshFailed');
            setCanRetry(true);
            return;
          }
        }
        // If B2B registration is pending, go directly to the event landing page
        // (the landing page useEffect will handle final redirect to register after profile setup)
        const b2bRedirect = safeAuthPath(localStorage.getItem('pendingB2BRegister'), window.location.origin);
        // An explicit event destination wins over stale registration state.
        const finalNext = next && next !== '/' ? next
          : firstEventPath || (b2bRedirect ? b2bRedirect.replace(/\/register(?=[?#]|$)/, '/landing') : '/');
        navigate(finalNext, { replace: true });
      } else {
        setMessage('failed');
        setNeedsSignIn(true);
      }
    };

    finishAuth().catch(() => {
      setMessage('failed');
      setCanRetry(true);
    });
  }, [navigate, next, retry]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#0B2641', color: '#FFFFFF' }}
    >
      <div style={{ textAlign: 'center', maxWidth: 520, padding: 24 }}>
        <div role="status" aria-live="polite" style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          {t(`auth.callback.${message}`)}
        </div>
        {canRetry && <button type="button" onClick={() => setRetry(value => value + 1)}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white">{t('auth.callback.retry')}</button>}
        {needsSignIn && (
        <div style={{ fontSize: '14px', color: '#94A3B8' }}>
          <Link className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white"
            to={eventDestination ? eventAuthPath(eventDestination) : `/login?next=${encodeURIComponent(next || '/')}`}>
            {t(expiredLink && eventDestination ? 'auth.callback.freshLink' : 'auth.callback.signIn')}
          </Link>
        </div>
        )}
      </div>
    </div>
  );
}
