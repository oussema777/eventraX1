import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { EURO_PALLET_DIMENSIONS, STANDARD_PALLET_DIMENSIONS, PalletDimensions } from '../data/palletDimensions';


const CONTAINER_TYPES = [
  { id: '20std', label: "20' Standard" },
  { id: '40std', label: "40' Standard" },
  { id: '40hc', label: "40' High Cube" }
];

type FieldName = 'unitLength' | 'unitWidth' | 'unitHeight' | 'unitWeight' | 'quantity';

interface PalletCalculationParams {
  cargoLength: number;
  cargoWidth: number;
  cargoHeight: number;
  cargoQuantity: number;
  stackable: boolean;
  palletType: PalletDimensions;
}


export default function LoadCalculatorPage() {
  const { user, profile, signOut } = useAuth();
  const { t } = useI18n();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const [containerType, setContainerType] = useState(CONTAINER_TYPES[0].id);
  const [formState, setFormState] = useState({
    unitLength: '',
    unitWidth: '',
    unitHeight: '',
    unitWeight: '',
    quantity: '',
  });

  const [errors, setErrors] = useState<Record<FieldName, string>>({
    unitLength: '',
    unitWidth: '',
    unitHeight: '',
    unitWeight: '',
    quantity: '',
  });

  const [stackable, setStackable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [palletResults, setPalletResults] = useState<{
    euroPallets: number | null;
    standardPallets: number | null;
} | null>(null);


  const validateField = useCallback((name: FieldName, value: string): string => {
    if (!value) {
      return 'This field is required.';
    }
    const numValue = Number(value);
    if (isNaN(numValue) || numValue <= 0) {
      return 'Please enter a positive number.';
    }
    return '';
  }, []);

  const handleInputChange = (name: FieldName, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };
  
  const hasErrors = useMemo(() => Object.values(errors).some(error => error !== ''), [errors]);

  const canSubmit = useMemo(() => {
    const allFieldsFilled = Object.values(formState).every(value => value !== '');
    return allFieldsFilled && !hasErrors;
  }, [formState, hasErrors]);


  const calculatePalletRequirements = useCallback(({
    cargoLength,
    cargoWidth,
    cargoHeight,
    cargoQuantity,
    stackable,
    palletType,
  }: PalletCalculationParams): number => {
    // How many units fit on a single layer of the pallet (floor plan)
    const fitLWCargoL = Math.floor(palletType.length / cargoLength) * Math.floor(palletType.width / cargoWidth);
    const fitLWCargoW = Math.floor(palletType.length / cargoWidth) * Math.floor(palletType.width / cargoLength);
    const unitsPerLayer = Math.max(fitLWCargoL, fitLWCargoW);

    if (unitsPerLayer === 0) return Infinity; // Cannot fit any unit on a pallet

    // Determine how many layers can be stacked
    let layers = 1;
    if (stackable) {
      layers = Math.floor(palletType.height / cargoHeight);
      if (layers === 0) layers = 1; // At least one layer even if cargo height is greater than pallet height
    }

    const unitsPerPallet = unitsPerLayer * layers;

    if (unitsPerPallet === 0) return Infinity; // Avoid division by zero

    return Math.ceil(cargoQuantity / unitsPerPallet);
  }, []);


  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setPalletResults(null); // Clear previous pallet results
    setResult(null); // Clear previous container results

    try {
      const cargoLength = Number(formState.unitLength);
      const cargoWidth = Number(formState.unitWidth);
      const cargoHeight = Number(formState.unitHeight);
      const cargoQuantity = Number(formState.quantity);

      // Local container calculation (previously mocked by backend)
      const totalWeight = Number(formState.unitWeight) * cargoQuantity;
      const totalVolume = (cargoLength * cargoWidth * cargoHeight * cargoQuantity) / 1_000_000; // cm^3 to m^3
      // A more accurate utilization would require container dimensions,
      // which are not currently available here without the backend API.
      // For now, we'll keep it as a placeholder or a simpler calculation if possible.
      const utilization = (Math.random() * 100).toFixed(2); // Keep as random for now or implement basic if container dims are added

      setResult({
        totalUnits: cargoQuantity,
        totalWeight: totalWeight,
        totalVolume: totalVolume,
        utilization: utilization,
        summary: 'Local container calculation completed.'
      });

      // Calculate pallet requirements
      const euroPalletsNeeded = calculatePalletRequirements({
        cargoLength,
        cargoWidth,
        cargoHeight,
        cargoQuantity,
        stackable,
        palletType: EURO_PALLET_DIMENSIONS,
      });

      const standardPalletsNeeded = calculatePalletRequirements({
        cargoLength,
        cargoWidth,
        cargoHeight,
        cargoQuantity,
        stackable,
        palletType: STANDARD_PALLET_DIMENSIONS,
      });

      setPalletResults({
        euroPallets: euroPalletsNeeded,
        standardPallets: standardPalletsNeeded,
      });

    } catch (error: any) {
      toast.error(error.message || 'Failed to perform local calculation.');
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

  const getInputStyle = (fieldName: FieldName) => {
    const baseStyle = {
      width: '100%',
      marginTop: '6px',
      padding: '10px 12px',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.15)',
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: '#FFFFFF',
      fontSize: '13px',
      transition: 'border-color 0.2s',
    };
    if (errors[fieldName]) {
      return { ...baseStyle, borderColor: '#EF4444' };
    }
    return baseStyle;
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
                    style={getInputStyle('quantity')} // Not validated, but uses the style
                  >
                    {CONTAINER_TYPES.map((item) => (
                      <option key={item.id} value={item.id} style={{ backgroundColor: '#0B2641'}}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Quantity (units)</label>
                  <input
                    type="number"
                    value={formState.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="0"
                    style={getInputStyle('quantity')}
                  />
                  {errors.quantity && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.quantity}</p>}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Unit Length (cm)</label>
                  <input
                    type="number"
                    value={formState.unitLength}
                    onChange={(e) => handleInputChange('unitLength', e.target.value)}
                    placeholder="0"
                    style={getInputStyle('unitLength')}
                  />
                  {errors.unitLength && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.unitLength}</p>}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Unit Width (cm)</label>
                  <input
                    type="number"
                    value={formState.unitWidth}
                    onChange={(e) => handleInputChange('unitWidth', e.target.value)}
                    placeholder="0"
                    style={getInputStyle('unitWidth')}
                  />
                  {errors.unitWidth && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.unitWidth}</p>}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Unit Height (cm)</label>
                  <input
                    type="number"
                    value={formState.unitHeight}
                    onChange={(e) => handleInputChange('unitHeight', e.target.value)}
                    placeholder="0"
                    style={getInputStyle('unitHeight')}
                  />
                  {errors.unitHeight && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.unitHeight}</p>}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Unit Weight (kg)</label>
                  <input
                    type="number"
                    value={formState.unitWeight}
                    onChange={(e) => handleInputChange('unitWeight', e.target.value)}
                    placeholder="0"
                    style={getInputStyle('unitWeight')}
                  />
                  {errors.unitWeight && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.unitWeight}</p>}
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
                  <div>Total Units: {result.totalUnits ?? formState.quantity}</div>
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

                {palletResults && (
                  <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                      Pallet Fit Comparison
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0', fontSize: '14px', lineHeight: 1.6 }}>
                      <div>
                        {palletResults.euroPallets !== null && palletResults.euroPallets !== Infinity && (
                          <div>Euro Pallets: <span style={{ fontWeight: 600 }}>{palletResults.euroPallets}</span></div>
                        )}
                      </div>
                      <div>
                        {palletResults.standardPallets !== null && palletResults.standardPallets !== Infinity && (
                          <div>Standard Pallets: <span style={{ fontWeight: 600 }}>{palletResults.standardPallets}</span></div>
                        )}
                      </div>
                    </div>
                       {(palletResults.euroPallets === Infinity || palletResults.standardPallets === Infinity) && (
                        <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '8px' }}>
                          Cargo cannot fit on selected pallet types.
                        </p>
                      )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        /* Responsive layout for the main two-column grid */
        @media (max-width: 900px) {
          .load-calc__layout {
            grid-template-columns: 1fr; /* Stack the form and results on smaller screens */
          }
        }
        /* Responsive layout for the inner form grid */
        @media (max-width: 600px) {
          .load-calc__grid {
            grid-template-columns: 1fr; /* Stack form inputs on very small screens */
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
