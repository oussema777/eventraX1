import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import ModalLogin from '../components/modals/ModalLogin';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import WeeklyDigestSection from '../components/landing/WeeklyDigestSection';
import FinalCTASection from '../components/landing/FinalCTASection';
import Footer from '../components/landing/Footer';
import { ROUTES } from '../utils/navigation';
import { useEventWizard } from '../hooks/useEventWizard';
import { useI18n } from '../i18n/I18nContext';
import SEOHead from '../components/SEOHead';
import { generateOrganizationJsonLd, generateBreadcrumbJsonLd, canonicalUrl } from '../utils/seo';

export default function LandingPage() {
  // Authentication state
  const { user, profile, isLoading, signOut } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { saveDraft, resetWizard } = useEventWizard();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Effect to handle direct links to /login or /register
  useEffect(() => {
    if (location.pathname === '/login') {
      setShowLoginModal(true);
    } else if (location.pathname === '/register') {
      setShowRegistrationModal(true);
    }
  }, [location.pathname]);

  // Effect to automatically show profile setup for new users
  useEffect(() => {
    if (isLoading || !user) return;
    const needsProfile =
      !profile ||
      !profile.full_name ||
      profile.full_name === 'New User' ||
      !profile.phone_number ||
      !profile.location;
    const pendingProfileSetup = localStorage.getItem('pendingProfileSetup') === 'true';
    const profileSetupDismissed = localStorage.getItem('profileSetupDismissed') === 'true';
    
    if (needsProfile && (!profileSetupDismissed || pendingProfileSetup)) {
      setShowRegistrationModal(true);
    } else if (!needsProfile && pendingProfileSetup) {
      // If we had a pending setup but profile is actually complete, clear the flag
      localStorage.removeItem('pendingProfileSetup');
    }
  }, [user, profile, isLoading]);

  // B2B registration redirect — if user completed auth and landed here, send them back to the event
  useEffect(() => {
    if (isLoading || !user) return;
    const pendingUrl = localStorage.getItem('pendingB2BRegister');
    if (!pendingUrl) return;
    // If profile is complete, redirect immediately to registration
    const needsProfileCheck =
      !profile ||
      !profile.full_name ||
      profile.full_name === 'New User' ||
      !profile.phone_number ||
      !profile.location;
    if (!needsProfileCheck) {
      localStorage.removeItem('pendingB2BRegister');
      navigate(pendingUrl, { replace: true });
    }
    // If profile still incomplete, let the profile setup modal finish first
    // (the above useEffect already shows it), then this will re-fire when profile updates
  }, [user, profile, isLoading]);

  const handleLogout = async () => {
    await signOut();
  };

  // Handle Google signup
  const handleGoogleSignup = async () => {
    // Modal handles the logic
    setShowRegistrationModal(false);
  };

  // Handle email signup
  const handleEmailSignup = async () => {
    setShowRegistrationModal(false);
    const pendingUrl = localStorage.getItem('pendingB2BRegister');
    if (pendingUrl) {
      localStorage.removeItem('pendingB2BRegister');
      navigate(pendingUrl, { replace: true });
    }
  };

  // Handle login success
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    const pendingUrl = localStorage.getItem('pendingB2BRegister');
    if (pendingUrl) {
      localStorage.removeItem('pendingB2BRegister');
      navigate(pendingUrl, { replace: true });
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setShowLoginModal(false);
  };

  // Switch from login to signup
  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowRegistrationModal(true);
  };

  // Switch from signup to login
  const handleSwitchToLogin = () => {
    setShowRegistrationModal(false);
    setShowLoginModal(true);
  };

  const handleCreateEventClick = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    resetWizard();
    navigate('/create/details/new');
  };

  const isWeeklyDigestEnabled =
    Array.isArray(profile?.app_preferences?.notifications) && 
    profile.app_preferences.notifications.includes('Weekly Digest');

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Eventra — Professional Event Management & B2B Networking Platform"
        description="Create and manage professional events, B2B networking meetings, and conference registrations. The all-in-one platform for event organizers in Tunisia, Africa, and beyond."
        canonicalUrl={canonicalUrl('/')}
        keywords="event management platform, B2B networking events, conference registration, event management Tunisia, professional events"
        jsonLd={[
          generateOrganizationJsonLd(),
          generateBreadcrumbJsonLd([{ name: 'Home', url: canonicalUrl('/') }]),
        ]}
      />
      {/* Dynamic Navigation - Shows NavbarLoggedIn or NavbarLoggedOut based on auth state */}
      {user ? (
        <NavbarLoggedIn 
          userName={user.user_metadata?.full_name || t('nav.placeholders.userName')}
          userEmail={user.email}
          hasUnreadNotifications={true}
          onLogout={handleLogout}
        />
      ) : (
        <NavbarLoggedOut 
          onSignUpClick={() => setShowRegistrationModal(true)}
          onLoginClick={() => setShowLoginModal(true)}
        />
      )}

      {/* Main Content */}
      <main>
        <HeroSection onCreateEventClick={handleCreateEventClick} />
        
        {user && isWeeklyDigestEnabled && (
          <WeeklyDigestSection 
            userId={user.id} 
            userInterests={Array.isArray(profile?.b2b_profile?.industries_of_interest) ? profile.b2b_profile.industries_of_interest : []}
            userIndustry={profile?.industry}
          />
        )}

        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FinalCTASection onCreateEventClick={handleCreateEventClick} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Registration Modal */}
      <ModalRegistrationEntry
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onGoogleSignup={handleGoogleSignup}
        onEmailSignup={handleEmailSignup}
        onLoginClick={handleSwitchToLogin}
      />

      {/* Login Modal */}
      <ModalLogin
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onGoogleLogin={handleGoogleLogin}
        onLoginSuccess={handleLoginSuccess}
        onSignUpClick={handleSwitchToSignup}
      />

    </div>
  );
}
