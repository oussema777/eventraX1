import { useState } from 'react';
import { X, ArrowLeft, Loader2 } from 'lucide-react';
import ModalPasswordResetSent from './ModalPasswordResetSent';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { useI18n } from '../../i18n/I18nContext';

interface ModalForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

export default function ModalForgotPassword({
  isOpen,
  onClose,
  onBack
}: ModalForgotPasswordProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset state when modal closes
  const handleClose = () => {
    setEmail('');
    setIsSuccess(false);
    onClose();
  };

  // Handle back to login
  const handleBackToLogin = () => {
    setEmail('');
    setIsSuccess(false);
    onBack();
  };

  // Handle send reset link
  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEmailValid) return;

    setIsSending(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success(t('auth.forgotPassword.toastSuccess'));
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || t('auth.forgotPassword.toastError'));
    } finally {
      setIsSending(false);
    }
  };

  // Form validation
  const isEmailValid = email.trim() !== '' && email.includes('@');

  if (!isOpen) return null;

  // Show password reset sent screen
  if (isSuccess) {
    return (
      <ModalPasswordResetSent
        isOpen={true}
        onClose={handleClose}
        onBack={handleBackToLogin}
        email={email}
      />
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={handleClose}
      >
        {/* Modal Container */}
        <div
          className="relative w-full max-w-[480px] rounded-xl p-8"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Back Arrow */}
          <button
            onClick={handleBackToLogin}
            className="absolute top-6 left-6 p-2 rounded-lg transition-colors"
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
            <ArrowLeft size={24} />
          </button>

          {/* Close Button */}
          <button
            onClick={handleClose}
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

          {/* Form State */}
          <>
            {/* Header */}
            <div className="mb-8" style={{ paddingTop: '16px' }}>
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#111827',
                  lineHeight: '1.2',
                  marginBottom: '8px'
                }}
              >
                {t('auth.forgotPassword.title')}
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#6B7280',
                  lineHeight: '1.5'
                }}
              >
                {t('auth.forgotPassword.subtitle')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSendReset}>
              {/* Email Input */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="reset-email"
                  className="block"
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}
                >
                  {t('auth.forgotPassword.emailLabel')}
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
                  autoFocus
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

              {/* Send Button */}
              <button
                type="submit"
                disabled={!isEmailValid || isSending}
                className="w-full flex items-center justify-center gap-2 transition-all"
                style={{
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: !isEmailValid || isSending ? '#9CA3AF' : '#0684F5',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: !isEmailValid || isSending ? 'not-allowed' : 'pointer',
                  opacity: !isEmailValid || isSending ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (isEmailValid && !isSending) {
                    e.currentTarget.style.backgroundColor = '#0570D6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isEmailValid && !isSending) {
                    e.currentTarget.style.backgroundColor = '#0684F5';
                  }
                }}
              >
                {isSending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{t('auth.forgotPassword.sending')}</span>
                  </>
                ) : (
                  t('auth.forgotPassword.submit')
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center" style={{ marginTop: '24px' }}>
              <button
                onClick={handleBackToLogin}
                className="inline-flex items-center gap-2 transition-colors"
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
                <ArrowLeft size={16} />
                <span>{t('auth.forgotPassword.backToLogin')}</span>
              </button>
            </div>
          </>
        </div>
      </div>
    </>
  );
}
