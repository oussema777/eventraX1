import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { EURO_PALLET_DIMENSIONS, STANDARD_PALLET_DIMENSIONS, PalletDimensions } from '../data/palletDimensions';
import { CONTAINER_DIMENSIONS_MAP } from '../data/containerDimensions';
import PdfDownloader from '../components/common/PdfDownloader';


const CONTAINER_TYPES = [
  { id: '20std', label: "20' Standard" },
  { id: '40std', label: "40' Standard" },
  { id: '40hc', label: "40' High Cube" }
];

interface PalletCalculationResult {
  palletCount: number;
  unitsPerPallet: number;
  palletVolumeUtilization: string; // Percentage, e.g., "75.25%"
  explanation: string; // Explains what these numbers mean
  palletTypeVolume: number; // Volume of the pallet type in cm^3
  cargoVolumePerPallet: number; // Volume of cargo that fits in one pallet in cm^3
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
    euroPallets: PalletCalculationResult | string | null;
    standardPallets: PalletCalculationResult | string | null;
    betterOption: 'Euro Pallet' | 'Standard Pallet' | 'None' | null;
  } | null>(null);

  const [pdfSummaryContent, setPdfSummaryContent] = useState('');


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
  }: PalletCalculationParams): PalletCalculationResult | string => { // Changed return type
    if (cargoLength <= 0 || cargoWidth <= 0 || cargoHeight <= 0 || cargoQuantity <= 0) {
      return "Invalid cargo dimensions or quantity (must be positive numbers).";
    }

    // How many units fit on a single layer of the pallet (floor plan)
    // Option 1: cargoLength along pallet length, cargoWidth along pallet width
    const fitLWCargoL = Math.floor(palletType.length / cargoLength) * Math.floor(palletType.width / cargoWidth);
    // Option 2: cargoWidth along pallet length, cargoLength along pallet width (rotated)
    const fitLWCargoW = Math.floor(palletType.length / cargoWidth) * Math.floor(palletType.width / cargoLength);
    const unitsPerLayer = Math.max(fitLWCargoL, fitLWCargoW);

    if (unitsPerLayer === 0) {
      return `Cargo unit (${cargoLength}x${cargoWidth}cm) is too large for the ${palletType.length}x${palletType.width}cm pallet surface.`;
    }

    // Determine how many layers can be stacked
    let layers = 1; // Default to 1 layer if not stackable or calculations result in less than 1
    if (stackable) {
      layers = Math.floor(palletType.height / cargoHeight);
      if (layers === 0) { // If cargo height is greater than pallet height even for one layer
        return `Cargo unit height (${cargoHeight}cm) exceeds ${palletType.height}cm pallet usable height, even with stacking enabled.`;
      }
    } else { // Not stackable
      if (cargoHeight > palletType.height) { // If not stackable and cargo height exceeds pallet height
        return `Cargo unit height (${cargoHeight}cm) exceeds ${palletType.height}cm pallet usable height, and stacking is not allowed.`;
      }
    }

    const unitsPerPallet = unitsPerLayer * layers;

    if (unitsPerPallet === 0) {
      return "No units can fit on a pallet due to size constraints."; // Fallback, should ideally be caught by above checks
    }

    const palletCount = Math.ceil(cargoQuantity / unitsPerPallet);

    // Calculate volume utilization
    const cargoUnitVolume = cargoLength * cargoWidth * cargoHeight;
    const totalCargoVolumeOnPallet = unitsPerPallet * cargoUnitVolume; // Volume of cargo that fits on one pallet

    const palletTypeVolume = palletType.length * palletType.width * palletType.height; // Usable volume of the pallet type
    let palletVolumeUtilization = "0.00";
    if (palletTypeVolume > 0) {
      palletVolumeUtilization = ((totalCargoVolumeOnPallet / palletTypeVolume) * 100).toFixed(2);
    }
    
    return {
      palletCount,
      unitsPerPallet,
      palletVolumeUtilization: palletVolumeUtilization + '%',
      explanation: `Each pallet holds ${unitsPerPallet} units. Total volume used on one pallet is ${ (totalCargoVolumeOnPallet / 1_000_000).toFixed(2) } m³ out of ${ (palletTypeVolume / 1_000_000).toFixed(2) } m³ available.`,
      palletTypeVolume: palletTypeVolume,
      cargoVolumePerPallet: totalCargoVolumeOnPallet
    };
  }, []);


  const generatePdfSummaryHtml = useCallback((
    containerResult: any | null,
    palletComparisonResults: {
      euroPallets: PalletCalculationResult | string | null;
      standardPallets: PalletCalculationResult | string | null;
      betterOption: 'Euro Pallet' | 'Standard Pallet' | 'None' | null;
    } | null,
    formInput: typeof formState, // Pass the formState to include inputs
    containerTypeLabel: string, // Pass the label of the selected container type
    stackableCargo: boolean, // Pass the stackable state
  ): string => {
    let html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #0684F5; text-align: center;">Load Calculation Summary</h1>
        <p style="text-align: center; color: #555;">Generated on ${new Date().toLocaleDateString()}</p>
        
        <h2 style="color: #0B2641; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Input Parameters</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 50%;">Container Type:</td><td style="padding: 8px; border: 1px solid #ddd;">${containerTypeLabel}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Quantity (units):</td><td style="padding: 8px; border: 1px solid #ddd;">${formInput.quantity}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Unit Length (cm):</td><td style="padding: 8px; border: 1px solid #ddd;">${formInput.unitLength}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Unit Width (cm):</td><td style="padding: 8px; border: 1px solid #ddd;">${formInput.unitWidth}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Unit Height (cm):</td><td style="padding: 8px; border: 1px solid #ddd;">${formInput.unitHeight}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Unit Weight (kg):</td><td style="padding: 8px; border: 1px solid #ddd;">${formInput.unitWeight}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Stackable Cargo:</td><td style="padding: 8px; border: 1px solid #ddd;">${stackableCargo ? 'Yes' : 'No'}</td></tr>
        </table>
    `;

    if (containerResult) {
      html += `
        <h2 style="color: #0B2641; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Container Utilization Summary</h2>
        <p>This section summarizes the estimated utilization of the selected container type based on the provided cargo dimensions.</p>
        <ul style="list-style-type: disc; margin-left: 20px;">
          <li><strong>Total Units:</strong> ${containerResult.totalUnits}</li>
          <li><strong>Total Weight:</strong> ${containerResult.totalWeight} kg</li>
          <li><strong>Total Volume:</strong> ${containerResult.totalVolume} m³</li>
          <li><strong>Utilization:</strong> ${containerResult.utilization}%</li>
        </ul>
        <p style="font-style: italic; color: #777;">${containerResult.summary}</p>
      `;
    } else {
      html += `
        <h2 style="color: #0B2641; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Container Utilization Summary</h2>
        <p style="color: #EF4444;">No container utilization data available. Please ensure all inputs are valid and re-run the calculation.</p>
      `;
    }

    if (palletComparisonResults) {
      html += `
        <h2 style="color: #0B2641; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Pallet Fit Comparison</h2>
        <p>Below is a comparison of how your cargo fits on Euro Pallets and Standard Pallets.</p>
      `;

      // Euro Pallet Results
      if (typeof palletComparisonResults.euroPallets === 'object' && palletComparisonResults.euroPallets !== null) {
        html += `
          <h3 style="color: #0684F5; margin-top: 15px;">Euro Pallet</h3>
          <ul style="list-style-type: disc; margin-left: 20px;">
            <li><strong>Required Pallets:</strong> ${palletComparisonResults.euroPallets.palletCount}</li>
            <li><strong>Units per Pallet:</strong> ${palletComparisonResults.euroPallets.unitsPerPallet}</li>
            <li><strong>Volume Utilization:</strong> ${palletComparisonResults.euroPallets.palletVolumeUtilization}</li>
          </ul>
          <p style="font-style: italic; color: #777;">${palletComparisonResults.euroPallets.explanation}</p>
        `;
      } else {
        html += `<p style="color: #EF4444;">Euro Pallet: ${String(palletComparisonResults.euroPallets || 'Not calculated')}</p>`;
      }

      // Standard Pallet Results
      if (typeof palletComparisonResults.standardPallets === 'object' && palletComparisonResults.standardPallets !== null) {
        html += `
          <h3 style="color: #0684F5; margin-top: 15px;">Standard Pallet</h3>
          <ul style="list-style-type: disc; margin-left: 20px;">
            <li><strong>Required Pallets:</strong> ${palletComparisonResults.standardPallets.palletCount}</li>
            <li><strong>Units per Pallet:</strong> ${palletComparisonResults.standardPallets.unitsPerPallet}</li>
            <li><strong>Volume Utilization:</strong> ${palletComparisonResults.standardPallets.palletVolumeUtilization}</li>
          </ul>
          <p style="font-style: italic; color: #777;">${palletComparisonResults.standardPallets.explanation}</p>
        `;
      } else {
        html += `<p style="color: #EF4444;">Standard Pallet: ${String(palletComparisonResults.standardPallets || 'Not calculated')}</p>`;
      }

      if (palletComparisonResults.betterOption !== 'None') {
        html += `
          <p style="margin-top: 20px; font-weight: bold; color: #0684F5;">
            Overall Better Option: ${palletComparisonResults.betterOption}
          </p>
        `;
      }
    } else {
      html += `
        <h2 style="color: #0B2641; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Pallet Fit Comparison</h2>
        <p style="color: #EF4444;">No pallet fit comparison data available. Please ensure all inputs are valid and re-run the calculation.</p>
      `;
    }

    html += `</div>`;
    return html;
  }, [formState, containerType, stackable]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setPalletResults(null); // Clear previous pallet results
    setResult(null); // Clear previous container results

    // Declare variables outside try block to ensure scope
    let calculatedTotalWeight = 0;
    let calculatedTotalCargoVolume = 0; // In cm^3
    let calculatedUtilization: string | number = 'N/A';

    const cargoLength = Number(formState.unitLength);
    const cargoWidth = Number(formState.unitWidth);
    const cargoHeight = Number(formState.unitHeight);
    const cargoQuantity = Number(formState.quantity);
    const unitWeight = Number(formState.unitWeight); // Define unitWeight here

    try {
      // Local container calculation
      calculatedTotalWeight = unitWeight * cargoQuantity;
      calculatedTotalCargoVolume = (cargoLength * cargoWidth * cargoHeight * cargoQuantity); // cm^3

      const selectedContainerDimensions = CONTAINER_DIMENSIONS_MAP[containerType];

      if (selectedContainerDimensions) {
        const containerVolume = selectedContainerDimensions.length * selectedContainerDimensions.width * selectedContainerDimensions.height; // cm^3
        if (containerVolume > 0) {
          calculatedUtilization = ((calculatedTotalCargoVolume / containerVolume) * 100).toFixed(2);
        } else {
          calculatedUtilization = '0.00'; // Avoid division by zero if container volume somehow ends up zero
        }
      } else {
        toast.info('Container dimensions not found for selected type. Utilization will be approximate.');
      }

      setResult({
        totalUnits: cargoQuantity,
        totalWeight: calculatedTotalWeight,
        totalVolume: (calculatedTotalCargoVolume / 1_000_000).toFixed(2), // Convert to m^3 for display
        utilization: calculatedUtilization,
        summary: 'Local container calculation completed.'
      });

      // Calculate pallet requirements
      const euroPalletResult = calculatePalletRequirements({ // Declare here
        cargoLength,
        cargoWidth,
        cargoHeight,
        cargoQuantity,
        stackable,
        palletType: EURO_PALLET_DIMENSIONS,
      });

      const standardPalletResult = calculatePalletRequirements({ // Declare here
        cargoLength,
        cargoWidth,
        cargoHeight,
        cargoQuantity,
        stackable,
        palletType: STANDARD_PALLET_DIMENSIONS,
      });

      let betterOption: 'Euro Pallet' | 'Standard Pallet' | 'None' = 'None';
      // Determine better option based on pallet count, then utilization
      if (typeof euroPalletResult === 'object' && euroPalletResult !== null && typeof standardPalletResult === 'object' && standardPalletResult !== null) {
        if (euroPalletResult.palletCount < standardPalletResult.palletCount) {
          betterOption = 'Euro Pallet';
        } else if (standardPalletResult.palletCount < euroPalletResult.palletCount) {
          betterOption = 'Standard Pallet';
        } else { // Pallet counts are equal, compare by utilization
          const euroUtil = parseFloat(euroPalletResult.palletVolumeUtilization);
          const standardUtil = parseFloat(standardPalletResult.palletVolumeUtilization);
          if (euroUtil > standardUtil) {
            betterOption = 'Euro Pallet';
          } else if (standardUtil > euroUtil) {
            betterOption = 'Standard Pallet';
          }
        }
      } else if (typeof euroPalletResult === 'object' && euroPalletResult !== null) { // Only Euro pallet fits
        betterOption = 'Euro Pallet';
      } else if (typeof standardPalletResult === 'object' && standardPalletResult !== null) { // Only Standard pallet fits
        betterOption = 'Standard Pallet';
      }

      setPalletResults({
        euroPallets: euroPalletResult, // Use declared variable
        standardPallets: standardPalletResult, // Use declared variable
        betterOption: betterOption,
      });

    } catch (error: any) {
      toast.error(error.message || 'Failed to perform local calculation.');
    } finally {
      setIsSubmitting(false);
      const selectedContainerLabel = CONTAINER_TYPES.find(c => c.id === containerType)?.label || containerType;
      const generatedHtml = generatePdfSummaryHtml(result, palletResults, formState, selectedContainerLabel, stackable);
      setPdfSummaryContent(generatedHtml);
      console.log('PDF Summary Content (from generator):', generatedHtml); // Debugging line
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

                              <div>Total Volume: {result.totalVolume ?? '—'} m³</div>

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

                                  {/* Euro Pallet Results */}

                                  <div style={{ flex: 1, marginRight: '16px' }}>

                                    <h5 style={{ fontWeight: 700, marginBottom: '4px' }}>Euro Pallet:</h5>

                                    {typeof palletResults.euroPallets === 'object' && palletResults.euroPallets !== null ? (

                                      <>

                                        <div>Required: <span style={{ fontWeight: 600 }}>

                                            {palletResults.euroPallets.palletCount}

                                          </span>

                                        </div>

                                        <div>Units per Pallet: {palletResults.euroPallets.unitsPerPallet}</div>

                                        <div>Volume Util.: {palletResults.euroPallets.palletVolumeUtilization}</div>

                                        <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>

                                          {palletResults.euroPallets.explanation}

                                        </p>

                                      </>

                                    ) : (

                                      <p style={{ color: '#EF4444' }}>

                                        {palletResults.euroPallets ? String(palletResults.euroPallets) : 'Not calculated'}

                                      </p>

                                    )}

                                  </div>

            

                                  {/* Standard Pallet Results */}

                                  <div style={{ flex: 1 }}>

                                    <h5 style={{ fontWeight: 700, marginBottom: '4px' }}>Standard Pallet:</h5>

                                    {typeof palletResults.standardPallets === 'object' && palletResults.standardPallets !== null ? (

                                      <>

                                        <div>Required: <span style={{ fontWeight: 600 }}>

                                            {palletResults.standardPallets.palletCount}

                                          </span>

                                        </div>

                                        <div>Units per Pallet: {palletResults.standardPallets.unitsPerPallet}</div>

                                        <div>Volume Util.: {palletResults.standardPallets.palletVolumeUtilization}</div>

                                        <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>

                                          {palletResults.standardPallets.explanation}

                                        </p>

                                      </>

                                    ) : (

                                      <p style={{ color: '#EF4444' }}>

                                        {palletResults.standardPallets ? String(palletResults.standardPallets) : 'Not calculated'}

                                      </p>

                                    )}

                                  </div>

                                </div>

            

                                {palletResults.betterOption !== 'None' && (

                                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>

                                    <h5 style={{ color: '#0684F5', fontWeight: 700, fontSize: '15px' }}>

                                      Better Option: {palletResults.betterOption}

                                    </h5>

                                  </div>

                                )}

                              </div>

                            )}

                            {result && (

                              <div style={{ marginTop: '24px' }}>

                                <PdfDownloader

                                  rootElementId="pdf-summary-content"

                                  fileName="LoadCalculationSummary.pdf"

                                  buttonText="Download Calculation Summary"

                                  disabled={isSubmitting}

                                />

                              </div>

                            )}

                        </div>

                                                            {/* Hidden div for PDF content */}

                                                            <div id="pdf-summary-content" style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: pdfSummaryContent }} />
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