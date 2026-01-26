import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut'; // Import NavbarLoggedOut
import BrowseEventsDiscovery from '../components/discovery/BrowseEventsDiscovery';
import { useAuth } from '../contexts/AuthContext'; // Corrected import path
import { useState } from 'react'; // Import useState
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry'; // Import registration modal
import ModalLogin from '../components/modals/ModalLogin'; // Import login modal


export default function BrowseEventsDiscoveryPage() {
  const { user } = useAuth(); // Use useAuth to get user status
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Handlers to open modals
  const handleSignUpClick = () => setShowRegistrationModal(true);
  const handleLoginClick = () => setShowLoginModal(true);

  // Handlers to switch between modals
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
        <NavbarLoggedIn />
      ) : (
        <NavbarLoggedOut
          onSignUpClick={handleSignUpClick}
          onLoginClick={handleLoginClick}
        />
      )}
      <BrowseEventsDiscovery />

      {/* Registration Modal */}
      <ModalRegistrationEntry
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        // Assuming these props are handled internally by the modal or not critical for this specific bug fix
        onGoogleSignup={() => setShowRegistrationModal(false)} // Placeholder
        onEmailSignup={() => setShowRegistrationModal(false)} // Placeholder
        onLoginClick={handleSwitchToLogin}
      />

      {/* Login Modal */}
      <ModalLogin
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        // Assuming these props are handled internally by the modal or not critical for this specific bug fix
        onGoogleLogin={() => setShowLoginModal(false)} // Placeholder
        onLoginSuccess={() => setShowLoginModal(false)} // Placeholder
        onSignUpClick={handleSwitchToSignup}
      />
    </>
  );
}
