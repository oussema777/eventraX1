import { useMemo, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';

const LOGISTICS_API_BASE = import.meta.env.VITE_LOGISTICS_API_BASE || '';
const LOAD_CALC_ENDPOINT =
  import.meta.env.VITE_LOAD_CALC_ENDPOINT || (LOGISTICS_API_BASE ? `${LOGISTICS_API_BASE}/load-calc` : '');

const CONTAINER_TYPES = [
  { id: '20std', label: "20' Standard" },
  { id: '40std', label: "40' Standard" },
  { id: '40hc', label: "40' High Cube" }
];

export default function LoadCalculatorPage() {
  const { user, profile, signOut } = useAuth();
  const { t } = useI18n();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const [containerType, setContainerType] = useState(CONTAINER_TYPES[0].id);
  const [unitLength, setUnitLength] = useState('');
  const [unitWidth, setUnitWidth] = useState('');
  const [unitHeight, setUnitHeight] = useState('');
  const [unitWeight, setUnitWeight] = useState('');
  const [quantity, setQuantity] = useState('');
  const [stackable, setStackable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const canSubmit = useMemo(() => {
    return unitLength && unitWidth && unitHeight && unitWeight && quantity;
  }, [unitLength, unitWidth, unitHeight, unitWeight, quantity]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!LOAD_CALC_ENDPOINT) {
      toast.error('Logistics API is not configured.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        containerType,
        unitLength: Number(unitLength),
        unitWidth: Number(unitWidth),
        unitHeight: Number(unitHeight),
        unitWeight: Number(unitWeight),
        quantity: Number(quantity),
        stackable
      };
      const res = await fetch(LOAD_CALC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || 'Failed to calculate load');
      }
      setResult(data?.data || data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to calculate load');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingTop: '72px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
              Load Calculator (MENA & AFRICA)
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>
              Estimate container utilization based on cargo dimensions.
            </p>
          </div>

          <div className="load-calc__layout" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '24px'
              }}
            >
              <div className="load-calc__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Container Type</label>
                  <select
                    value={containerType}
                    onChange={(event) => setContainerType(event.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  >
                    {CONTAINER_TYPES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Quantity (units)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Unit Length (cm)</label>
                  <input
                    type="number"
                    value={unitLength}
                    onChange={(event) => setUnitLength(event.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Unit Width (cm)</label>
                  <input
                    type="number"
                    value={unitWidth}
                    onChange={(event) => setUnitWidth(event.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Unit Height (cm)</label>
                  <input
                    type="number"
                    value={unitHeight}
                    onChange={(event) => setUnitHeight(event.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Unit Weight (kg)</label>
                  <input
                    type="number"
                    value={unitWeight}
                    onChange={(event) => setUnitWeight(event.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  checked={stackable}
                  onChange={(event) => setStackable(event.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#0684F5' }}
                />
                <span style={{ color: '#94A3B8', fontSize: '13px' }}>Stackable cargo</span>
              </div>

              <button
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
                style={{
                  marginTop: '20px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: canSubmit ? '#0684F5' : 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  width: '100%'
                }}
              >
                {isSubmitting ? 'Calculating...' : 'Calculate Load'}
              </button>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '24px',
                minHeight: '320px'
              }}
            >
              <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                Utilization Summary
              </h3>
              {result ? (
                <div style={{ color: '#E2E8F0', fontSize: '14px', lineHeight: 1.6 }}>
                  <div>Total Units: {result.totalUnits ?? quantity}</div>
                  <div>Total Weight: {result.totalWeight ?? '—'} kg</div>
                  <div>Total Volume: {result.totalVolume ?? '—'} cbm</div>
                  <div>Utilization: {result.utilization ?? '—'}%</div>
                  <div style={{ marginTop: '12px', color: '#94A3B8' }}>
                    {result.summary || 'Calculation completed.'}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '13px' }}>
                  Submit the form to see container utilization.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .load-calc__layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .load-calc__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

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
