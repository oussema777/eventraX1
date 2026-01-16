import { useEffect, useState } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import ModalEmailRegistration from './ModalEmailRegistration';
import ModalEmailVerification from './ModalEmailVerification';
import ModalProfileSetup, { ProfileData } from './ModalProfileSetup';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n/I18nContext';

interface ModalRegistrationEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignup?: () => void;
  onEmailSignup?: () => void;
  onLoginClick?: () => void;
}

export default function ModalRegistrationEntry({
  isOpen,
  onClose,
  onGoogleSignup,
  onEmailSignup,
  onLoginClick
}: ModalRegistrationEntryProps) {
  const { t } = useI18n();
  const { user, profile, refreshProfile, isLoading } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (isLoading) return;
    if (!user) return;

    const needsProfile =
      !profile ||
      !profile.full_name ||
      profile.full_name === 'New User' ||
      !profile.phone_number ||
      !profile.location;

    // If profile is already complete, ensure we don't show the setup
    // and clear any stale flags
    if (!needsProfile) {
      localStorage.removeItem('pendingProfileSetup');
      onClose();
      return;
    }

    // Only show setup if profile is genuinely incomplete
    if (needsProfile) {
      setRegisteredEmail(user.email || registeredEmail);
      setShowProfileSetup(true);
      setShowEmailForm(false);
    }
  }, [isOpen, user, profile, registeredEmail, isLoading, onClose]);

  if (!isOpen) return null;

  // If user is connected, we should either be showing profile setup
  // or waiting for the useEffect to close the modal (if profile complete)
  // We don't want to show the registration entry (title/google/email buttons) to a connected user
  if (user && !showProfileSetup && !showEmailForm && !showEmailVerification) {
    return null;
  }

  const handleGoogleClick = async () => {
    setIsGoogleLoading(true);
    
    try {
      localStorage.setItem('pendingProfileSetup', 'true');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      setIsGoogleLoading(false);
      toast.error(error.message || t('auth.registrationEntry.errors.googleSignupFailed'));
    }
  };

  const handleEmailClick = () => {
    setShowEmailForm(true);
  };

  const handleEmailRegister = async (email: string, password: string) => {
    const normalizedEmail = email.trim();
    try {
      // 1. Pre-check for existing user to prevent duplicates
      const { data: exists, error: rpcError } = await supabase.rpc('check_user_exists', { 
        email_input: normalizedEmail 
      });

      if (!rpcError && exists) {
        toast.error(t('auth.registrationEntry.errors.accountExists'));
        setShowEmailForm(false);
        onLoginClick?.();
        onClose();
        return;
      }

      const showVerificationModal = () => {
        localStorage.setItem('pendingProfileSetup', 'true');
        setRegisteredEmail(normalizedEmail);
        setShowEmailForm(false);
        setShowEmailVerification(true);
      };

      const showLoginPrompt = (message?: string) => {
        toast.error(message || t('auth.registrationEntry.errors.accountExists'));
        setShowEmailForm(false);
        onLoginClick?.();
        onClose();
      };

      // Direct sign-up attempt
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          showLoginPrompt();
          return;
        }
        throw error;
      }

      // Check for existing user (Supabase security feature returns fake success for existing emails)
      // If identities is empty, it means the user already exists but we are hiding it.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        showLoginPrompt();
        return;
      }

      if (!data.session) {
        // Registration successful, waiting for verification
        showVerificationModal();
        return;
      }

      // Session exists (Email confirmation might be disabled)
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error(t('auth.registrationEntry.errors.registrationIncomplete'));
      }

      localStorage.setItem('pendingProfileSetup', 'true');
      setRegisteredEmail(normalizedEmail);
      setShowEmailForm(false);
      setShowEmailVerification(false);
      setShowProfileSetup(true);

    } catch (error: any) {
      toast.error(error.message || t('auth.registrationEntry.errors.registrationFailed'));
      // Don't re-throw to keep modal open on generic errors
    }
  };

  const handleBackToEntry = () => {
    setShowEmailForm(false);
  };

  const handleChangeEmail = () => {
    setShowEmailVerification(false);
    setShowEmailForm(true);
  };

  const handleProfileComplete = async (profileData: ProfileData) => {
    const { data: authData } = user ? { data: { user } } : await supabase.auth.getUser();
    const activeUser = authData.user;
    if (!activeUser) {
      toast.error(t('auth.registrationEntry.errors.signInToComplete'));
      return;
    }

    const fullName = [profileData.firstName, profileData.lastName]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(' ')
      .trim();
    const phoneNumber = `${profileData.phoneCountryCode} ${profileData.phoneNumber}`?.trim();

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: activeUser.id,
          email: activeUser.email,
          full_name: fullName,
          phone_number: phoneNumber,
          location: profileData.country,
          job_title: profileData.jobTitle || null,
          company: profileData.company || null,
          industry: profileData.industry || null,
          department: profileData.department || null,
          years_experience: profileData.yearsOfExperience || null,
          company_size: profileData.companySize || null,
          professional_data: {
            ...(profile?.professional_data || {}),
            industry_other: profileData.industryOther || null
          },
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (error) {
      toast.error(error.message || t('auth.registrationEntry.errors.saveProfileFailed'));
      return;
    }

    try {
      await supabase
        .from('users')
        .upsert(
          {
            id: activeUser.id,
            email: activeUser.email
          },
          { onConflict: 'id' }
        );
    } catch (_error) {
      // Ignore if public users table is missing or blocked by RLS.
    }

    await supabase.auth.updateUser({ data: { full_name: fullName } });
    await refreshProfile();
    localStorage.removeItem('pendingProfileSetup');
    localStorage.removeItem('profileSetupDismissed');

    setShowProfileSetup(false);
    onEmailSignup?.();
    onClose();
  };

  const handleProfileSkip = async () => {
    const { data: authData } = user ? { data: { user } } : await supabase.auth.getUser();
    const activeUser = authData.user;
    if (!activeUser) {
      toast.error(t('auth.registrationEntry.errors.signInToContinue'));
      return;
    }

    const fallbackName =
      activeUser.user_metadata?.full_name ||
      activeUser.user_metadata?.name ||
      activeUser.email?.split('@')[0] ||
      'New User';

    await supabase
      .from('profiles')
      .upsert(
        {
          id: activeUser.id,
          email: activeUser.email,
          full_name: fallbackName,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    try {
      await supabase
        .from('users')
        .upsert(
          {
            id: activeUser.id,
            email: activeUser.email
          },
          { onConflict: 'id' }
        );
    } catch (_error) {
      // Ignore if public users table is missing or blocked by RLS.
    }

    await refreshProfile();
    localStorage.removeItem('pendingProfileSetup');
    localStorage.setItem('profileSetupDismissed', 'true');

    setShowProfileSetup(false);
    onEmailSignup?.();
    onClose();
  };

  // Show profile setup screen
  if (showProfileSetup) {
    return (
      <ModalProfileSetup
        isOpen={true}
        onClose={() => {
          setShowProfileSetup(false);
          onClose();
        }}
        userEmail={registeredEmail}
        onComplete={handleProfileComplete}
        onSkip={handleProfileSkip}
      />
    );
  }

  // Show email registration form
  if (showEmailForm) {
    return (
      <ModalEmailRegistration
        isOpen={true}
        onClose={() => {
          setShowEmailForm(false);
          onClose();
        }}
        onBack={handleBackToEntry}
        onRegister={handleEmailRegister}
      />
    );
  }

  if (showEmailVerification) {
    return (
      <ModalEmailVerification
        isOpen={true}
        onClose={() => {
          setShowEmailVerification(false);
          onClose();
        }}
        userEmail={registeredEmail}
        onChangeEmail={handleChangeEmail}
      />
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
              {t('auth.registrationEntry.title')}
            </h2>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 400,
                color: '#6B7280',
                lineHeight: '1.5'
              }}
            >
              {t('auth.registrationEntry.subtitle')}
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleClick}
            disabled={isGoogleLoading || showEmailForm}
            className="w-full flex items-center justify-center gap-3 transition-all"
            style={{
              height: '48px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              color: '#374151',
              cursor: isGoogleLoading || showEmailForm ? 'not-allowed' : 'pointer',
              opacity: isGoogleLoading || showEmailForm ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isGoogleLoading && !showEmailForm) {
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
                <span>{t('auth.registrationEntry.continueWithGoogle')}</span>
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
              {t('auth.registrationEntry.divider')}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
          </div>

          {/* Email Option Button */}
          <button
            onClick={handleEmailClick}
            disabled={isGoogleLoading || showEmailForm}
            className="w-full flex items-center justify-center gap-3 transition-all"
            style={{
              height: '48px',
              backgroundColor: 'transparent',
              border: '1.5px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              color: '#374151',
              cursor: isGoogleLoading || showEmailForm ? 'not-allowed' : 'pointer',
              opacity: isGoogleLoading || showEmailForm ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isGoogleLoading && !showEmailForm) {
                e.currentTarget.style.borderColor = '#9CA3AF';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {showEmailForm ? (
              <Loader2 size={20} className="animate-spin" style={{ color: '#374151' }} />
            ) : (
              <>
                <Mail size={20} style={{ color: '#374151' }} />
                <span>{t('auth.registrationEntry.continueWithEmail')}</span>
              </>
            )}
          </button>

          {/* Footer Link */}
          <div className="text-center" style={{ marginTop: '24px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 400,
                color: '#6B7280'
              }}
            >
              {t('auth.registrationEntry.alreadyAccount')}{' '}
            </span>
            <button
              onClick={onLoginClick}
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
              {t('auth.registrationEntry.login')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
