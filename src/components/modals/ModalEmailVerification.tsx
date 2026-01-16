import { useState, useEffect } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { useI18n } from '../../i18n/I18nContext';

interface ModalEmailVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onChangeEmail: () => void;
}

export default function ModalEmailVerification({ 
  isOpen, 
  onClose, 
  userEmail,
  onChangeEmail
}: ModalEmailVerificationProps) {
  const { t } = useI18n();
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Format timer as MM:SS
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle resend email
  const handleResendEmail = async () => {
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      toast.success(t('auth.emailVerification.resendSuccess'));
      setResendTimer(60); // 60 seconds cooldown
    } catch (error: any) {
      console.error('Error resending verification:', error);
      toast.error(error.message || t('auth.emailVerification.resendError'));
    } finally {
      setIsResending(false);
    }
  };

  // Handle change email
  const handleChangeEmail = () => {
    onChangeEmail();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative pointer-events-auto"
          style={{ 
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '48px 40px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 flex items-center justify-center transition-colors rounded-lg"
            style={{
              width: '40px',
              height: '40px',
              color: '#6B7280'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} />
          </button>

          {/* Content - Centered */}
          <div className="text-center">
            {/* Email Icon */}
            <div 
              className="inline-flex items-center justify-center mb-6"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(6, 132, 245, 0.1)'
              }}
            >
              <Mail size={32} style={{ color: '#0684F5' }} />
            </div>

            {/* Heading */}
            <h2 
              className="mb-3"
              style={{ 
                fontSize: '28px',
                fontWeight: 700,
                color: '#111827',
                lineHeight: '1.2'
              }}
            >
              {t('auth.emailVerification.title')}
            </h2>

            {/* Description */}
            <p 
              className="mb-2"
              style={{ 
                fontSize: '16px',
                color: '#6B7280',
                lineHeight: '1.5'
              }}
            >
              {t('auth.emailVerification.subtitle')}
            </p>

            {/* Email Display */}
            <div 
              className="inline-flex items-center justify-center mb-8"
              style={{
                padding: '8px 16px',
                backgroundColor: '#F3F4F6',
                borderRadius: '20px'
              }}
            >
              <span 
                style={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#111827'
                }}
              >
                {userEmail}
              </span>
            </div>

            {/* Instructions */}
            <p 
              className="mb-8"
              style={{ 
                fontSize: '15px',
                color: '#6B7280',
                lineHeight: '1.5',
                maxWidth: '380px',
                margin: '0 auto 32px'
              }}
            >
              {t('auth.emailVerification.instructions')}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 mb-3">
              {/* Resend Email Button */}
              <button
                onClick={handleResendEmail}
                disabled={resendTimer > 0 || isResending}
                className="transition-all"
                style={{
                  height: '44px',
                  padding: '0 24px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: resendTimer > 0 || isResending ? '#9CA3AF' : '#374151',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: '8px',
                  cursor: resendTimer > 0 || isResending ? 'not-allowed' : 'pointer',
                  opacity: resendTimer > 0 || isResending ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (resendTimer === 0 && !isResending) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                {isResending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    {t('auth.emailVerification.resending')}
                  </span>
                ) : (
                  t('auth.emailVerification.resend')
                )}
              </button>

              {/* Change Email Button */}
              <button
                onClick={handleChangeEmail}
                className="transition-all"
                style={{
                  height: '44px',
                  padding: '0 16px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0684F5',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
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
                {t('auth.emailVerification.changeEmail')}
              </button>
            </div>

            {/* Timer Text */}
            {resendTimer > 0 && (
              <p 
                style={{ 
                  fontSize: '13px',
                  color: '#9CA3AF',
                  marginTop: '8px'
                }}
              >
                {t('auth.emailVerification.timer', { time: formatTimer(resendTimer) })}
              </p>
            )}

            {/* Help Section */}
            <div style={{ marginTop: '32px' }}>
              {/* Divider */}
              <div 
                style={{ 
                  height: '1px',
                  backgroundColor: '#E5E7EB',
                  marginBottom: '16px'
                }}
              />

              {/* Help Text */}
              <p 
                style={{ 
                  fontSize: '14px',
                  color: '#6B7280',
                  lineHeight: '1.5'
                }}
              >
                {t('auth.emailVerification.helpPrefix')}{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Contact support clicked');
                    // In production, this would open support modal or navigate to support page
                  }}
                  style={{ 
                    color: '#0684F5',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {t('auth.emailVerification.helpLink')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
