import { useState } from 'react';
import { X, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

interface ModalPasswordResetSentProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  email: string;
}

export default function ModalPasswordResetSent({
  isOpen,
  onClose,
  onBack,
  email
}: ModalPasswordResetSentProps) {
  const { t } = useI18n();
  const [isResending, setIsResending] = useState(false);

  if (!isOpen) return null;

  // Handle resend email
  const handleResend = async () => {
    setIsResending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsResending(false);
    
    console.log('Password reset link resent to:', email);
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

          {/* Content - Center Aligned */}
          <div className="text-center" style={{ paddingTop: '16px' }}>
            {/* Email Icon */}
            <div 
              className="inline-flex items-center justify-center"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                marginBottom: '24px'
              }}
            >
              <Mail size={32} style={{ color: '#10B981' }} />
            </div>

            {/* Heading */}
            <h2 
              style={{ 
                fontSize: '28px',
                fontWeight: 700,
                color: '#111827',
                lineHeight: '1.2',
                marginBottom: '12px'
              }}
            >
              {t('auth.passwordResetSent.title')}
            </h2>

            {/* Description */}
            <p 
              style={{ 
                fontSize: '16px',
                fontWeight: 400,
                color: '#6B7280',
                lineHeight: '1.5',
                marginBottom: '8px'
              }}
            >
              {t('auth.passwordResetSent.subtitle')}
            </p>

            {/* Email Display */}
            <div 
              className="inline-flex items-center justify-center"
              style={{
                padding: '8px 16px',
                backgroundColor: '#F3F4F6',
                borderRadius: '20px',
                marginBottom: '32px'
              }}
            >
              <span 
                style={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#111827'
                }}
              >
                {email}
              </span>
            </div>

            {/* Instructions */}
            <p 
              style={{ 
                fontSize: '15px',
                fontWeight: 400,
                color: '#6B7280',
                lineHeight: '1.5',
                marginBottom: '32px',
                maxWidth: '400px',
                margin: '0 auto 32px'
              }}
            >
              {t('auth.passwordResetSent.instructions')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col items-center">
              {/* Resend Email Button */}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center justify-center gap-2 transition-all"
                style={{
                  height: '44px',
                  padding: '0 24px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#374151',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: '8px',
                  cursor: isResending ? 'not-allowed' : 'pointer',
                  marginBottom: '16px',
                  opacity: isResending ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isResending) {
                    e.currentTarget.style.borderColor = '#9CA3AF';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isResending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t('auth.passwordResetSent.resending')}</span>
                  </>
                ) : (
                  t('auth.passwordResetSent.resend')
                )}
              </button>

              {/* Back to Login Link */}
              <button
                onClick={onBack}
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
                <span>{t('auth.passwordResetSent.backToLogin')}</span>
              </button>
            </div>

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
                {t('auth.passwordResetSent.help')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
