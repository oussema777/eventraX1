import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useI18n } from '../i18n/I18nContext';

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const linkError = fragment.get('error_description');
    if (linkError) setErrorMessage(linkError);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && !linkError && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        setIsReady(true);
        setErrorMessage('');
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!active) return;
      if (!linkError) {
        setIsReady(!!session);
        if (error) setErrorMessage(error.message);
      }
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      setErrorMessage(t('auth.resetPassword.tooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t('auth.resetPassword.noMatch'));
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    const { error } = await supabase.auth.updateUser({ password });
    setIsSaving(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      setIsComplete(true);
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0B2641' }}>
      <div className="w-full max-w-md rounded-xl bg-white p-8" style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">{t('auth.resetPassword.title')}</h1>
        {isLoading ? (
          <p className="text-slate-600">{t('auth.resetPassword.checking')}</p>
        ) : isComplete ? (
          <p className="text-slate-600">{t('auth.resetPassword.complete')}</p>
        ) : !isReady ? (
          <p className="text-slate-600">{t('auth.resetPassword.invalidLink')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-sm font-medium text-slate-700">
              {t('auth.resetPassword.newPassword')}
              <input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              {t('auth.resetPassword.confirmPassword')}
              <input type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" />
            </label>
            <button type="submit" disabled={isSaving} className="rounded-lg px-4 py-3 font-semibold text-white disabled:opacity-60" style={{ backgroundColor: '#0684F5' }}>
              {isSaving ? t('auth.resetPassword.saving') : t('auth.resetPassword.submit')}
            </button>
          </form>
        )}
        {errorMessage && <p role="alert" className="mt-4 text-sm text-red-600">{errorMessage}</p>}
        <Link to="/login" className="mt-6 inline-block text-sm font-medium" style={{ color: '#0684F5' }}>{t('auth.forgotPassword.backToLogin')}</Link>
      </div>
    </main>
  );
}
