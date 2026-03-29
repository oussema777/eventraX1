import { useState } from 'react';
import { Check, Crown, Sparkles, Zap, Users, TrendingUp } from 'lucide-react';
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
import { useI18n } from '../i18n/I18nContext';
import SEOHead from '../components/SEOHead';

type BillingPeriod = '3-months' | '6-months' | '1-year';

const pricing = {
  '3-months': {
    pro: 49,
    discount: 0,
    label: '3 Months',
    period: '/month'
  },
  '6-months': {
    pro: 42,
    discount: 15,
    label: '6 Months',
    period: '/month',
    savings: 'Save $42'
  },
  '1-year': {
    pro: 35,
    discount: 29,
    label: '1 Year',
    period: '/month',
    savings: 'Save $168',
    popular: true
  }
};

export default function PricingPage() {
  const navigate = useNavigate();
  const { isPro, isFree } = usePlan();
  const { user, signOut, refreshProfile } = useAuth();
  const { t, tList } = useI18n();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('1-year');

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
      toast.success(tier === 'pro' ? t('pricing.toasts.welcomePro') : t('pricing.toasts.switchedFree'));
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error(t('pricing.toasts.updateError'));
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

  const currentPricing = pricing[billingPeriod];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
      <SEOHead title="Pricing — Eventra" description="" noindex />
      {user ? (
        <NavbarLoggedIn currentPage="pricing" onLogout={handleLogout} />
      ) : (
        <NavbarLoggedOut 
          onSignUpClick={() => setShowRegistrationModal(true)}
          onLoginClick={() => setShowLoginModal(true)}
        />
      )}
      
      <div style={{ height: '80px' }} />

      <div className="pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles size={24} style={{ color: '#0684F5' }} />
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: 'rgba(6, 132, 245, 0.1)', 
                  color: '#0684F5',
                  fontWeight: 600
                }}
              >
                {t('pricing.hero.badge')}
              </span>
            </div>
            <h1 className="text-5xl mb-4" style={{ fontWeight: 800, color: '#0B2641' }}>
              {t('pricing.hero.title')}
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B7280' }}>
              {t('pricing.hero.subtitle')}
            </p>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-12">
            <div 
              className="inline-flex p-1.5 rounded-xl"
              style={{ 
                backgroundColor: '#FFFFFF',
                border: '2px solid #E5E7EB',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}
            >
              {(Object.keys(pricing) as BillingPeriod[]).map((period) => {
                const isActive = billingPeriod === period;
                const periodData = pricing[period];
                return (
                  <button
                    key={period}
                    onClick={() => setBillingPeriod(period)}
                    className="relative px-6 py-3 rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: isActive ? '#0684F5' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#6B7280',
                      fontWeight: 600,
                      fontSize: '15px',
                      border: 'none',
                      cursor: 'pointer',
                      minWidth: '140px'
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <span>{periodData.label}</span>
                      {periodData.popular && (
                        <span 
                          className="text-xs mt-1"
                          style={{ 
                            color: isActive ? '#FFFFFF' : '#10B981',
                            fontWeight: 700
                          }}
                        >
                          {t('pricing.billing.mostPopular')}
                        </span>
                      )}
                      {!isActive && periodData.discount > 0 && (
                        <span className="text-xs mt-1" style={{ color: '#10B981' }}>
                          {t('pricing.billing.save', { percent: String(periodData.discount) })}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="flex justify-center gap-6 max-w-4xl mx-auto mb-40">
            {/* Free Plan */}
            <div
              className="rounded-2xl border-2 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl flex-1"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: isFree ? '#0684F5' : '#E5E7EB',
                boxShadow: isFree ? '0 8px 24px rgba(6, 132, 245, 0.15)' : '0 4px 12px rgba(15, 23, 42, 0.06)',
                maxWidth: '400px'
              }}
            >
              {isFree && (
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: 'linear-gradient(90deg, #0684F5 0%, #06B6D4 100%)' }}
                />
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)' }}
                  >
                    <Users size={20} style={{ color: '#0684F5' }} />
                  </div>
                  <div>
                    <h2 className="text-xl" style={{ fontWeight: 700, color: '#0B2641' }}>
                      {t('pricing.plans.free.name')}
                    </h2>
                  </div>
                </div>
                {isFree && (
                  <span
                    className="px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: 'rgba(6, 132, 245, 0.1)',
                      color: '#0684F5',
                      fontWeight: 700
                    }}
                  >
                    {t('pricing.plans.active')}
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl" style={{ fontWeight: 800, color: '#0B2641' }}>
                    $0
                  </span>
                  <span className="text-base" style={{ color: '#6B7280', fontWeight: 500 }}>
                    {t('pricing.plans.perMonth')}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  {t('pricing.plans.free.tagline')}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {tList<string>('pricing.plans.free.features').map((feature, index) => (
                  <div 
                    key={feature} 
                    className="flex items-start gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      <Check size={10} style={{ color: '#FFFFFF', strokeWidth: 3 }} />
                    </div>
                    <span className="text-xs leading-relaxed" style={{ color: '#0B2641' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {isFree && (
                <button
                  className="w-full h-10 rounded-lg transition-all duration-300 font-semibold text-sm"
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: '#64748B',
                    border: '2px solid #E2E8F0',
                    cursor: 'default'
                  }}
                  disabled
                >
                  ✓ {t('pricing.plans.currentPlan')}
                </button>
              )}
            </div>

            {/* Pro Plan */}
            <div
              className="rounded-2xl border-2 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl flex-1"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: isPro ? '#F59E0B' : '#E5E7EB',
                boxShadow: isPro ? '0 8px 24px rgba(245, 158, 11, 0.2)' : '0 4px 12px rgba(15, 23, 42, 0.06)',
                maxWidth: '400px'
              }}
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)' }}
              />
              
              {currentPricing.savings && (
                <div 
                  className="absolute -top-2 -right-2 px-3 py-1 rounded-full shadow-lg text-xs"
                  style={{ 
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    transform: 'rotate(5deg)'
                  }}
                >
                  {currentPricing.savings}
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}
                  >
                    <Crown size={20} style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-xl" style={{ fontWeight: 700, color: '#0B2641' }}>
                        {t('pricing.plans.pro.name')}
                      </h2>
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs flex items-center gap-0.5"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: '#FFFFFF',
                          fontWeight: 700
                        }}
                      >
                        <Zap size={8} />
                        PRO
                      </span>
                    </div>
                  </div>
                </div>
                {isPro && (
                  <span
                    className="px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: '#F59E0B',
                      fontWeight: 700
                    }}
                  >
                    {t('pricing.plans.active')}
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl" style={{ fontWeight: 800, color: '#0B2641' }}>
                    ${currentPricing.pro}
                  </span>
                  <span className="text-base" style={{ color: '#6B7280', fontWeight: 500 }}>
                    {t('pricing.plans.perMonthShort')}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {currentPricing.discount > 0 && (
                    <>
                      <span className="text-xs line-through" style={{ color: '#9CA3AF' }}>
                        $49{t('pricing.plans.perMonthShort')}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: '#10B981',
                          fontWeight: 700
                        }}
                      >
                        {currentPricing.discount}% {t('pricing.plans.off')}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  {t(`pricing.billing.billed.${billingPeriod}`)}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {tList<string>('pricing.plans.pro.features').map((feature, index) => (
                  <div 
                    key={feature} 
                    className="flex items-start gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}
                    >
                      <Check size={10} style={{ color: '#FFFFFF', strokeWidth: 3 }} />
                    </div>
                    <span 
                      className="text-xs leading-relaxed" 
                      style={{ 
                        color: '#0B2641',
                        fontWeight: index === 0 ? 600 : 400
                      }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className="w-full h-10 rounded-lg transition-all duration-300 font-semibold text-sm"
                style={{
                  background: isPro 
                    ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' 
                    : isUpdating
                    ? 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)'
                    : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: isUpdating ? 'default' : 'pointer',
                  boxShadow: isPro 
                    ? '0 4px 12px rgba(239, 68, 68, 0.4)' 
                    : isUpdating 
                    ? 'none' 
                    : '0 4px 12px rgba(255, 165, 0, 0.4)',
                  transform: 'scale(1)'
                }}
                disabled={isUpdating}
                onClick={() => handleUpdatePlan(isPro ? 'free' : 'pro')}
                onMouseEnter={(e) => {
                  if (!isUpdating) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    if (isPro) {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
                    } else {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 165, 0, 0.5)';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (isPro) {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                  } else if (!isUpdating) {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 165, 0, 0.4)';
                  } else {
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isPro ? t('pricing.plans.pro.cancel') : isUpdating ? t('pricing.plans.pro.processing') : t('pricing.plans.pro.upgrade')}
              </button>
            </div>
          </div>

          {/* Extra spacing before footer */}
          <div className="mt-40" />
        </div>
      </div>

      {/* Additional spacing before footer */}
      <div className="pb-20" />

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