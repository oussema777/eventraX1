import { useState } from 'react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import B2BMarketplaceDiscovery from '../components/marketplace/B2BMarketplaceDiscovery';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';

export default function B2BMarketplaceDiscoveryPage() {
  const { user, profile, signOut } = useAuth();
  const { t } = useI18n();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  // Auth Handlers
  const handleGoogleSignup = async () => setShowRegistrationModal(false);
  const handleEmailSignup = async () => setShowRegistrationModal(false);
  const handleLoginSuccess = () => setShowLoginModal(false);
  const handleGoogleLogin = async () => setShowLoginModal(false);
  
  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowRegistrationModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegistrationModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      {user ? (
        <NavbarLoggedIn 
          userName={profile?.full_name || user.user_metadata?.full_name || t('nav.placeholders.userName')}
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
      
      <B2BMarketplaceDiscovery />

      {/* Auth Modals */}
      <ModalRegistrationEntry
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onGoogleSignup={handleGoogleSignup}
        onEmailSignup={handleEmailSignup}
        onLoginClick={handleSwitchToLogin}
      />

      <ModalLogin
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onGoogleLogin={handleGoogleLogin}
        onLoginSuccess={handleLoginSuccess}
        onSignUpClick={handleSwitchToSignup}
      />
    </>
  );
}