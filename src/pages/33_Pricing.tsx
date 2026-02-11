import { useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import Footer from '../components/landing/Footer';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { usePlan } from '../hooks/usePlan';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const planFeatures = {
  free: [
    'Unlimited free events',
    'Basic registration flows',
    'Standard event pages',
    'Community support'
  ],
  pro: [
    'Paid tickets and payments',
    'Advanced design studio blocks',
    'Marketing automation tools',
    'Priority support'
  ]
};

export default function PricingPage() {
  const navigate = useNavigate();
  const { isPro, isFree } = usePlan();
  const { user, signOut, refreshProfile } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const handleUpdatePlan = async (tier: 'free' | 'pro') => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          has_pro: tier === 'pro',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success(tier === 'pro' ? 'Welcome to Pro!' : 'Switched to Free plan');
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan. Please try again.');
    } finally {
      setIsUpdating(false);
    }
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
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {user ? (
        <NavbarLoggedIn currentPage="pricing" onLogout={handleLogout} />
      ) : (
        <NavbarLoggedOut 
          onSignUpClick={() => setShowRegistrationModal(true)}
          onLoginClick={() => setShowLoginModal(true)}
        />
      )}
      
      <div style={{ height: '80px' }} />

      <div className="pt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h1 className="text-3xl mb-2" style={{ fontWeight: 700, color: '#0B2641' }}>
              Plans and Pricing
            </h1>
            <p className="text-base" style={{ color: '#6B7280' }}>
              All current features are available on the free plan. Payments will unlock paid ticketing when ready.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div
              className="rounded-2xl border p-8"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: isFree ? '#0684F5' : '#E5E7EB',
                boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl" style={{ fontWeight: 700, color: '#0B2641' }}>
                    Free
                  </h2>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Everything you need to get started
                  </p>
                </div>
                {isFree && (
                  <span
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)', color: '#0684F5', fontWeight: 700 }}
                  >
                    Current plan
                  </span>
                )}
              </div>
              <div className="text-3xl mb-6" style={{ fontWeight: 700, color: '#0B2641' }}>
                $0
                <span className="text-sm" style={{ color: '#6B7280', fontWeight: 500 }}>
                  /month
                </span>
              </div>
              <div className="space-y-3">
                {planFeatures.free.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      <Check size={12} style={{ color: '#FFFFFF' }} />
                    </div>
                    <span className="text-sm" style={{ color: '#0B2641' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <button
                className="mt-8 w-full h-11 rounded-lg transition-all active:scale-95"
                style={{
                  backgroundColor: isFree ? '#E2E8F0' : '#0684F5',
                  color: isFree ? '#0B2641' : '#FFFFFF',
                  fontWeight: 700,
                  cursor: (isFree || isUpdating) ? 'default' : 'pointer',
                  opacity: isUpdating ? 0.7 : 1
                }}
                disabled={isFree || isUpdating}
                onClick={() => handleUpdatePlan('free')}
              >
                {isFree ? 'Current Plan' : isUpdating ? 'Updating...' : 'Switch to Free'}
              </button>
            </div>

            <div
              className="rounded-2xl border p-8"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: isPro ? '#F59E0B' : '#E5E7EB',
                boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl" style={{ fontWeight: 700, color: '#0B2641' }}>
                      Pro
                    </h2>
                    <span
                      className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        color: '#FFFFFF',
                        fontWeight: 700
                      }}
                    >
                      <Crown size={12} />
                      PRO
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Unlock advanced monetization and automation
                  </p>
                </div>
                {isPro && (
                  <span
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontWeight: 700 }}
                  >
                    Current plan
                  </span>
                )}
              </div>
              <div className="text-3xl mb-6" style={{ fontWeight: 700, color: '#0B2641' }}>
                $49
                <span className="text-sm" style={{ color: '#6B7280', fontWeight: 500 }}>
                  /month
                </span>
              </div>
              <div className="space-y-3">
                {planFeatures.pro.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      <Check size={12} style={{ color: '#FFFFFF' }} />
                    </div>
                    <span className="text-sm" style={{ color: '#0B2641' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <button
                className="mt-8 w-full h-11 rounded-lg transition-transform hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  opacity: (isPro || isUpdating) ? 0.7 : 1,
                  cursor: (isPro || isUpdating) ? 'default' : 'pointer'
                }}
                disabled={isPro || isUpdating}
                onClick={() => handleUpdatePlan('pro')}
              >
                {isPro ? 'Current Plan' : isUpdating ? 'Updating...' : 'Upgrade to Pro'}
              </button>
              <p className="mt-3 text-xs" style={{ color: '#6B7280' }}>
                Checkout integration is coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-32" />

      <Footer />

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
    </div>
  );
}