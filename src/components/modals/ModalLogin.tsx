import { useState } from 'react';
import { X, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import ModalForgotPassword from './ModalForgotPassword';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';

interface ModalLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin?: () => void;
  onLoginSuccess?: () => void;
  onSignUpClick?: () => void;
}

export default function ModalLogin({
  isOpen,
  onClose,
  onGoogleLogin,
  onLoginSuccess,
  onSignUpClick
}: ModalLoginProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(t('auth.login.errors.invalidCredentials'));
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (!isOpen) return null;

  // Show forgot password modal
  if (showForgotPassword) {
    return (
      <ModalForgotPassword
        isOpen={true}
        onClose={onClose}
        onBack={() => setShowForgotPassword(false)}
      />
    );
  }

  // Form validation
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  // Handle Google login
  const handleGoogleClick = async () => {
    setIsGoogleLoading(true);
    setShowError(false);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      // The browser will redirect to Google
    } catch (error: any) {
      console.error('Google login error:', error);
      setIsGoogleLoading(false);
      setShowError(true);
      setErrorMessage(error.message || t('auth.login.errors.googleInitFailed'));
    }
  };

  // Handle email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setIsLoggingIn(true);
    setShowError(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoggingIn(false);
      setShowError(true);
      setErrorMessage(error.message || t('auth.login.errors.invalidCredentials'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      >
        {/* Modal Container */}
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-[480px] rounded-xl p-8"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-lg transition-colors"
            style={{
              color: '#6B7280',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={24} />
          </button>

          {/* Header */}
          <div className="mb-8">
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#111827',
                lineHeight: '1.2',
                marginBottom: '8px'
              }}
            >
              {t('auth.login.title')}
            </h2>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 400,
                color: '#6B7280',
                lineHeight: '1.5'
              }}
            >
              {t('auth.login.subtitle')}
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleClick}
            disabled={isGoogleLoading || isLoggingIn}
            className="w-full flex items-center justify-center gap-3 transition-all"
            style={{
              height: '48px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              color: '#374151',
              cursor: isGoogleLoading || isLoggingIn ? 'not-allowed' : 'pointer',
              opacity: isGoogleLoading || isLoggingIn ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isGoogleLoading && !isLoggingIn) {
                e.currentTarget.style.borderColor = '#9CA3AF';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isGoogleLoading ? (
              <Loader2 size={20} className="animate-spin" style={{ color: '#374151' }} />
            ) : (
              <>
                {/* Google Icon SVG */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.1713 8.36791H17.5001V8.33325H10.0001V11.6666H14.7096C14.0225 13.6069 12.1763 14.9999 10.0001 14.9999C7.23882 14.9999 5.00007 12.7612 5.00007 9.99992C5.00007 7.23867 7.23882 4.99992 10.0001 4.99992C11.2746 4.99992 12.4342 5.48009 13.3171 6.26625L15.6742 3.90917C14.1859 2.52209 12.1951 1.66659 10.0001 1.66659C5.39799 1.66659 1.66674 5.39784 1.66674 9.99992C1.66674 14.602 5.39799 18.3333 10.0001 18.3333C14.6021 18.3333 18.3334 14.602 18.3334 9.99992C18.3334 9.44117 18.2763 8.89575 18.1713 8.36791Z" fill="#FFC107"/>
                  <path d="M2.62756 6.12117L5.36548 8.129C6.10631 6.29484 7.90048 5 10.0001 5C11.2747 5 12.4343 5.48017 13.3172 6.26633L15.6743 3.90925C14.186 2.52217 12.1951 1.66667 10.0001 1.66667C6.79923 1.66667 4.02339 3.47375 2.62756 6.12117Z" fill="#FF3D00"/>
                  <path d="M10.0001 18.3333C12.1525 18.3333 14.1084 17.5095 15.5871 16.1712L13.008 13.9878C12.1431 14.6312 11.0863 15.0007 10.0001 15C7.83302 15 5.99219 13.6179 5.29886 11.6891L2.58136 13.783C3.96053 16.4816 6.76136 18.3333 10.0001 18.3333Z" fill="#4CAF50"/>
                  <path d="M18.1713 8.36791H17.5001V8.33325H10.0001V11.6666H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.9879L13.008 13.9871L15.5871 16.1704C15.4046 16.3354 18.3334 14.1666 18.3334 9.99992C18.3334 9.44117 18.2763 8.89575 18.1713 8.36791Z" fill="#1976D2"/>
                </svg>
                <span>{t('auth.login.continueWithGoogle')}</span>
              </>
            )}
          </button>

          {/* Divider with OR */}
          <div className="flex items-center" style={{ margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
            <span
              style={{
                fontSize: '14px',
                color: '#9CA3AF',
                backgroundColor: '#FFFFFF',
                padding: '0 12px',
                fontWeight: 500
              }}
            >
              {t('auth.login.divider')}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="email"
                className="block"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '8px'
                }}
              >
                {t('auth.login.emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.login.emailPlaceholder')}
                className="w-full transition-all"
                style={{
                  height: '48px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  color: '#111827',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: '8px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0684F5';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="password"
                className="block"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '8px'
                }}
              >
                {t('auth.login.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  className="w-full transition-all"
                  style={{
                    height: '48px',
                    padding: '12px 44px 12px 16px',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0684F5';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {/* Eye Icon Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 flex items-center justify-center transition-colors"
                  style={{
                    width: '48px',
                    height: '48px',
                    color: '#6B7280'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6B7280';
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
              {/* Remember Me Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="cursor-pointer"
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#0684F5'
                  }}
                />
                <span
                  style={{
                    fontSize: '14px',
                    color: '#374151',
                    userSelect: 'none'
                  }}
                >
                  {t('auth.login.rememberMe')}
                </span>
              </label>

              {/* Forgot Password Link */}
              <button
                type="button"
                onClick={handleForgotPassword}
                className="transition-colors"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0684F5',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {t('auth.login.forgotPassword')}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoggingIn}
              className="w-full flex items-center justify-center gap-2 transition-all"
              style={{
                height: '48px',
                fontSize: '16px',
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: !isFormValid || isLoggingIn ? '#9CA3AF' : '#0684F5',
                borderRadius: '8px',
                border: 'none',
                cursor: !isFormValid || isLoggingIn ? 'not-allowed' : 'pointer',
                opacity: !isFormValid || isLoggingIn ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (isFormValid && !isLoggingIn) {
                  e.currentTarget.style.backgroundColor = '#0570D6';
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid && !isLoggingIn) {
                  e.currentTarget.style.backgroundColor = '#0684F5';
                }
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{t('auth.login.loggingIn')}</span>
                </>
              ) : (
                t('auth.login.submit')
              )}
            </button>

            {/* Error Message */}
            {showError && (
              <div
                className="flex items-start gap-3 mt-4"
                style={{
                  backgroundColor: '#FEE2E2',
                  borderLeft: '3px solid #DC2626',
                  padding: '12px 16px',
                  borderRadius: '6px'
                }}
              >
                <AlertCircle size={20} style={{ color: '#DC2626', flexShrink: 0, marginTop: '1px' }} />
                <p
                  style={{
                    fontSize: '14px',
                    color: '#991B1B',
                    lineHeight: '1.5',
                    margin: 0
                  }}
                >
                  {errorMessage}
                </p>
              </div>
            )}
          </form>

          {/* Footer Link */}
          <div className="text-center" style={{ marginTop: '24px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 400,
                color: '#6B7280'
              }}
            >
              {t('auth.login.newToEventra')}{' '}
            </span>
            <button
              onClick={onSignUpClick}
              className="transition-colors"
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#0684F5',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {t('auth.login.signUp')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
