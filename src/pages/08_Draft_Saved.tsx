import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/navigation';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import DraftSavedAnimation from '../components/draft/DraftSavedAnimation';
import DraftSavedMessage from '../components/draft/DraftSavedMessage';

export default function DraftSaved() {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    // Auto-redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate(ROUTES.DASHBOARD);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Navigation */}
      <NavbarLoggedIn 
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        currentPage="wizard"
      />

      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 72px)', marginTop: '72px' }}>
        <div className="max-w-[600px] mx-auto px-10 text-center">
          {/* Success Animation */}
          <DraftSavedAnimation />

          {/* Success Message */}
          <DraftSavedMessage />

          {/* Manual Navigation */}
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="mt-8 h-12 px-6 rounded-xl border transition-colors hover:bg-gray-50"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
              fontWeight: 600
            }}
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    </div>
  );
}