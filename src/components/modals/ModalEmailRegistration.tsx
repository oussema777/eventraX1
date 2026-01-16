import { useState, useEffect } from 'react';
import { X, ArrowLeft, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

interface ModalEmailRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onRegister: (email: string, password: string) => Promise<void>;
}

export default function ModalEmailRegistration({ 
  isOpen, 
  onClose, 
  onBack,
  onRegister 
}: ModalEmailRegistrationProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [touchedEmail, setTouchedEmail] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 10;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
    return Math.min(100, strength);
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Password requirements
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password)
  };

  const allRequirementsMet = requirements.length && requirements.uppercase && requirements.number;

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const isFormValid = email && isValidEmail(email) && password && allRequirementsMet && agreeToTerms;

  // Handle email blur
  const handleEmailBlur = () => {
    setTouchedEmail(true);
    if (email && !isValidEmail(email)) {
      setEmailError(t('auth.emailRegistration.errors.invalidEmail'));
    } else {
      setEmailError('');
    }
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (touchedEmail) {
      if (e.target.value && !isValidEmail(e.target.value)) {
        setEmailError(t('auth.emailRegistration.errors.invalidEmail'));
      } else {
        setEmailError('');
      }
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      await onRegister(email, password);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setAgreeToTerms(false);
      setEmailError('');
      setTouchedEmail(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Password strength color and label
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 33) return '#EF4444';
    if (passwordStrength <= 66) return '#F59E0B';
    return '#10B981';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 33) return t('auth.emailRegistration.strength.weak');
    if (passwordStrength <= 66) return t('auth.emailRegistration.strength.medium');
    return t('auth.emailRegistration.strength.strong');
  };

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
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section */}
          <div 
            className="px-8 pt-8 pb-6"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            {/* Back and Close Buttons */}
            <div className="flex items-center justify-between mb-6">
              {/* Back Button */}
              <button
                onClick={onBack}
                className="flex items-center justify-center transition-colors rounded-lg"
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
                <ArrowLeft size={20} />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex items-center justify-center transition-colors rounded-lg"
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
            </div>

            {/* Title and Subtitle */}
            <div>
              <h2 
                className="mb-2"
                style={{ 
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#111827',
                  lineHeight: '1.2'
                }}
              >
                {t('auth.emailRegistration.title')}
              </h2>
              <p 
                style={{ 
                  fontSize: '15px',
                  color: '#6B7280',
                  lineHeight: '1.5'
                }}
              >
                {t('auth.emailRegistration.subtitle')}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="px-8 py-6">
            <div className="space-y-5">
              {/* Email Input */}
              <div>
                <label 
                  htmlFor="email"
                  className="block mb-2"
                style={{ 
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151'
                }}
              >
                {t('auth.emailRegistration.emailLabel')}
              </label>
              <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                placeholder={t('auth.emailRegistration.emailPlaceholder')}
                className="w-full transition-all"
                  style={{
                    height: '48px',
                    padding: '12px 16px',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: '#FFFFFF',
                    border: `1.5px solid ${emailError ? '#EF4444' : '#D1D5DB'}`,
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!emailError) {
                      e.currentTarget.style.borderColor = '#0684F5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    handleEmailBlur();
                    if (!emailError) {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
                {emailError && (
                  <p 
                    className="mt-1.5"
                    style={{ 
                      fontSize: '13px',
                      color: '#EF4444'
                    }}
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label 
                  htmlFor="password"
                  className="block mb-2"
                style={{ 
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151'
                }}
              >
                {t('auth.emailRegistration.passwordLabel')}
              </label>
              <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.emailRegistration.passwordPlaceholder')}
                    className="w-full transition-all"
                    style={{
                      height: '48px',
                      padding: '12px 48px 12px 16px',
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 flex items-center justify-center transition-colors"
                    style={{
                      width: '48px',
                      height: '48px',
                      color: '#6B7280'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span 
                        style={{ 
                          fontSize: '13px',
                          color: getPasswordStrengthColor(),
                          fontWeight: 500
                        }}
                      >
                        {getPasswordStrengthLabel()}
                      </span>
                    </div>
                    <div 
                      className="w-full rounded-full overflow-hidden"
                      style={{ 
                        height: '4px',
                        backgroundColor: '#E5E7EB'
                      }}
                    >
                      <div 
                        className="h-full transition-all duration-300"
                        style={{ 
                          width: `${passwordStrength}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                <div className="mt-3 space-y-2">
                  {[
                    { label: t('auth.emailRegistration.requirements.length'), met: requirements.length },
                    { label: t('auth.emailRegistration.requirements.uppercase'), met: requirements.uppercase },
                    { label: t('auth.emailRegistration.requirements.number'), met: requirements.number }
                  ].map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="flex items-center justify-center rounded-full"
                        style={{
                          width: '14px',
                          height: '14px',
                          backgroundColor: req.met ? '#10B981' : '#D1D5DB'
                        }}
                      >
                        {req.met && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                      <span 
                        style={{ 
                          fontSize: '13px',
                          color: req.met ? '#10B981' : '#6B7280'
                        }}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="appearance-none cursor-pointer transition-all"
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #D1D5DB',
                        borderRadius: '4px',
                        backgroundColor: agreeToTerms ? '#0684F5' : '#FFFFFF'
                      }}
                    />
                    {agreeToTerms && (
                      <Check 
                        size={14} 
                        color="#FFFFFF" 
                        strokeWidth={3}
                        className="absolute pointer-events-none"
                      />
                    )}
                  </div>
                  <span 
                    style={{ 
                      fontSize: '14px',
                      color: '#6B7280',
                      lineHeight: '1.5'
                    }}
                  >
                    {t('auth.emailRegistration.terms.prefix')}{' '}
                    <a 
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{ 
                        color: '#0684F5',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {t('auth.emailRegistration.terms.termsOfService')}
                    </a>
                    {' '}{t('auth.emailRegistration.terms.and')}{' '}
                    <a 
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{ 
                        color: '#0684F5',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {t('auth.emailRegistration.terms.privacyPolicy')}
                    </a>
                  </span>
                </label>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full flex items-center justify-center gap-2 transition-all"
                style={{
                  height: '48px',
                  marginTop: '24px',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: !isFormValid || isLoading ? '#9CA3AF' : '#0684F5',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: !isFormValid || isLoading ? 'not-allowed' : 'pointer',
                  opacity: !isFormValid || isLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (isFormValid && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#0570D6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isFormValid && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#0684F5';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t('auth.emailRegistration.submitting')}</span>
                  </>
                ) : (
                  t('auth.emailRegistration.submit')
                )}
              </button>
            </div>

            {/* Footer */}
            <div 
              className="text-center"
              style={{ marginTop: '24px' }}
            >
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                {t('auth.emailRegistration.alreadyAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    // In production, this would open the login modal
                  }}
                  style={{ 
                    color: '#0684F5',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {t('auth.emailRegistration.login')}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
