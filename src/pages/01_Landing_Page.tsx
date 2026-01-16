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
import FinalCTASection from '../components/landing/FinalCTASection';
import Footer from '../components/landing/Footer';
import { ROUTES } from '../utils/navigation';
import { useEventWizard } from '../hooks/useEventWizard';
import { useI18n } from '../i18n/I18nContext';

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
    // Modal handles the logic
    setShowRegistrationModal(false);
  };

  // Handle login success
  const handleLoginSuccess = () => {
    // Modal handles the logic
    setShowLoginModal(false);
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    // Modal handles the logic
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

  return (
    <div className="min-h-screen bg-background">
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
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FinalCTASection />
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
