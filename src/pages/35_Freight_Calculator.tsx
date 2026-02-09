import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import PdfDownloader from '../components/common/PdfDownloader';

const LOGISTICS_API_BASE = import.meta.env.VITE_LOGISTICS_API_BASE || '';
const FREIGHT_EXPORT_ENDPOINT =
  import.meta.env.VITE_FREIGHT_EXPORT_ENDPOINT || (LOGISTICS_API_BASE ? `${LOGISTICS_API_BASE}/freight-export` : '');

const INCOTERMS = ['EXW', 'FOB', 'CIF', 'DAP', 'DDP'];
const MODES = ['Air', 'Sea', 'Road'];
const CARGO_TYPES = ['General', 'Perishable', 'Hazardous', 'Oversized'];

type LocalEstimatePayload = {
  origin: string;
  destination: string;
  weight: number;
  volume: number;
  mode: string;
  incoterm: string;
  cargoType: string;
};

// Local Estimation Function (Phase 2)
const calculateLocalFreightEstimate = (payload: LocalEstimatePayload): QuoteResult => {
  const { origin, destination, weight, volume, mode, incoterm, cargoType } = payload;

  // 1. Chargeable Weight Calculation
  let chargeableWeight = weight;
  const volumeWeightAirFactor = 167; // kg per CBM for air freight (approx. 1:6000 density)
  const volumeWeightSeaRoadFactor = 333; // kg per CBM for sea/road freight (approx. 1:3000 density for some LCL)

  if (mode === 'Air') {
    chargeableWeight = Math.max(weight, volume * volumeWeightAirFactor);
  } else if (mode === 'Sea' || mode === 'Road') {
    chargeableWeight = Math.max(weight, volume * volumeWeightSeaRoadFactor);
  }

  // 2. Dummy Distance Calculation (more refined than backend placeholder)
  let distance = 0;
  const originLower = origin.toLowerCase();
  const destinationLower = destination.toLowerCase();

  if (originLower.includes('tunis') && destinationLower.includes('marseille')) {
    distance = 800;
  } else if (originLower.includes('london') && destinationLower.includes('new york')) {
    distance = 5500;
  } else if (originLower.includes('shanghai') && destinationLower.includes('los angeles')) {
    distance = 10500;
  } else if (originLower.includes('sydney') && destinationLower.includes('tokyo')) {
    distance = 7800;
  } else {
    // Fallback: estimate based on random distance per 1000km range
    const distanceSeed = (origin.length + destination.length) % 10;
    distance = (distanceSeed * 1000) + Math.floor(Math.random() * 999) + 100;
  }

  // 3. Dummy Cost Calculation (more refined than backend placeholder)
  let cost = chargeableWeight * 5; // Base rate per chargeable kg/unit
  if (mode === 'Air') {
    cost += distance * 0.1; // Distance factor for air
    cost *= 2; // Higher base multiplier for air
  } else if (mode === 'Sea') {
    cost += distance * 0.02; // Distance factor for sea
    cost *= 0.8; // Lower base multiplier for sea
  } else if (mode === 'Road') {
    cost += distance * 0.05; // Distance factor for road
    cost *= 1.2; // Medium base multiplier for road
  }

  // Add surcharges for cargo type
  if (cargoType === 'Hazardous') {
    cost += 1000;
  } else if (cargoType === 'Perishable') {
    cost += 750;
  }

  // Add incoterm impact (simplistic)
  if (incoterm === 'EXW') {
    cost += 200; // Extra local handling
  } else if (incoterm === 'DDP') {
    cost += 300; // Extra duties/taxes handling
  }

  const currency = 'USD';
  const summary = `Local estimate from ${origin} to ${destination} via ${mode}. Charged on ${chargeableWeight.toFixed(2)} kg.`;

  return {
    origin,
    destination,
    mode,
    cost: parseFloat(cost.toFixed(2)),
    currency,
    distance: Math.floor(distance),
    summary,
    source: 'Local', // Indicate local estimate
  };
};

type FieldName = 'origin' | 'destination' | 'weight' | 'volume' | 'packagesCount' | 'cargoValue';

type QuoteResult = {
  origin: string;
  destination: string;
  mode: string;
  cost: number;
  currency: string;
  distance: number; // Assuming distance in km
  summary?: string;
  source: 'API' | 'Local'; // New field to indicate source
};

export default function FreightCalculatorPage() {
  const { user, profile, signOut } = useAuth();
  const { t } = useI18n();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const [formState, setFormState] = useState({
    origin: '',
    destination: '',
    weight: '',
    volume: '',
    packagesCount: '',
    cargoValue: '',
  });

  const [errors, setErrors] = useState<Record<FieldName, string>>({
    origin: '',
    destination: '',
    weight: '',
    volume: '',
    packagesCount: '',
    cargoValue: '',
  });

  const [mode, setMode] = useState(MODES[0]);
  const [incoterm, setIncoterm] = useState(INCOTERMS[0]);
  const [cargoType, setCargoType] = useState(CARGO_TYPES[0]);
  const [readyDate, setReadyDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [pdfSummaryContent, setPdfSummaryContent] = useState('');

  const generatePdfSummaryHtml = useCallback((
    quote: QuoteResult,
    formInput: typeof formState,
    selectedMode: string,
    selectedIncoterm: string,
    selectedCargoType: string,
    selectedReadyDate: string,
    notesInput: string,
  ): string => {
    let html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #0684F5; text-align: center;">Freight Calculation Summary</h1>
        <p style="text-align: center; color: #555;">Generated on ${new Date().toLocaleDateString()}</p>
        
        <h2 style="color: #0B2641; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Input Parameters</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 50%;">Origin:</td><td style="padding: 8px; border: 1px solid #ddd;">${formInput.origin}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Destination:</td><td style="padding: 8px; border: 1px solid #ddd;">${formInput.destination}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Mode:</td><td style="padding: 8px; border: 1px solid #ddd;">${selectedMode}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Incoterm:</td><td style="padding: 8px; border: 1px solid #ddd;">${selectedIncoterm}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Cargo Type:</td><td style="padding: 8px; border: 1px solid #ddd;">${selectedCargoType}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Ready Date:</td><td style="padding: 8px; border: 1px solid #ddd;">${selectedReadyDate || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Total Weight (kg):</td><td style="padding: 8px; border: 1px solid #ddd;">${formInput.weight}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Total Volume (CBM):</td><td style="padding: 8px; border: 1px solid #ddd;">${formInput.volume}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Packages Count:</td><td style="padding: 8px; border: 1px solid #ddd;">${formInput.packagesCount || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Cargo Value (USD):</td><td style="padding: 8px; border: 1px solid #ddd;">${formInput.cargoValue || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Notes:</td><td style="padding: 8px; border: 1px solid #ddd;">${notesInput || 'N/A'}</td></tr>
        </table>

        <h2 style="color: #0B2641; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Estimated Quote</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 50%;">Source:</td><td style="padding: 8px; border: 1px solid #ddd;">${quote.source} Estimate</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Origin:</td><td style="padding: 8px; border: 1px solid #ddd;">${quote.origin}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Destination:</td><td style="padding: 8px; border: 1px solid #ddd;">${quote.destination}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Mode:</td><td style="padding: 8px; border: 1px solid #ddd;">${quote.mode}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Distance:</td><td style="padding: 8px; border: 1px solid #ddd;">${quote.distance} km</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Estimated Cost:</td><td style="padding: 8px; border: 1px solid #ddd;">${quote.cost} ${quote.currency}</td></tr>
        </table>
        <p style="font-style: italic; color: #777;">${quote.summary || 'Quote generated successfully.'}</p>
      </div>
    `;
    return html;
  }, []);

  const validateField = useCallback((name: FieldName, value: string): string => {
    if (['origin', 'destination', 'weight', 'volume'].includes(name) && !value.trim()) {
      return 'This field is required.';
    }
    if (['weight', 'volume', 'packagesCount', 'cargoValue'].includes(name) && value) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue <= 0) {
        return 'Please enter a positive number.';
      }
    }
    return '';
  }, []);
  
  const handleInputChange = (name: FieldName, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const hasErrors = useMemo(() => Object.values(errors).some(error => error !== ''), [errors]);

  const canSubmit = useMemo(() => {
    const requiredFieldsFilled = formState.origin.trim() && formState.destination.trim() && formState.weight.trim() && formState.volume.trim();
    return requiredFieldsFilled && !hasErrors;
  }, [formState, hasErrors]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    const payload = {
      origin: formState.origin,
      destination: formState.destination,
      mode,
      incoterm,
      cargoType,
      weight: Number(formState.weight),
      volume: Number(formState.volume),
      packagesCount: formState.packagesCount ? Number(formState.packagesCount) : null,
      readyDate: readyDate || null,
      cargoValue: formState.cargoValue ? Number(formState.cargoValue) : null,
      notes: notes.trim() || null
    };

    let calculatedQuote: QuoteResult | null = null;

    if (FREIGHT_EXPORT_ENDPOINT) {
      try {
        const res = await fetch(FREIGHT_EXPORT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.error || 'Failed to calculate freight via API');
        }
        calculatedQuote = {
          origin: data.data?.origin || formState.origin,
          destination: data.data?.destination || formState.destination,
          mode: data.data?.mode || mode,
          cost: data.data?.cost,
          currency: data.data?.currency || 'USD',
          distance: data.data?.distance,
          summary: data.data?.summary,
          source: 'API',
        };
      } catch (apiError: any) {
        toast.error(`API Error: ${apiError.message}. Falling back to local estimation.`);
        console.error('API call failed:', apiError);
        // Fallback to local estimation if API fails
        calculatedQuote = calculateLocalFreightEstimate({
          origin: payload.origin,
          destination: payload.destination,
          weight: payload.weight,
          volume: payload.volume,
          mode: payload.mode,
          incoterm: payload.incoterm,
          cargoType: payload.cargoType,
        });
      }
    } else {
      toast.info('Logistics API is not configured. Using local estimation.');
      calculatedQuote = calculateLocalFreightEstimate({
        origin: payload.origin,
        destination: payload.destination,
        weight: payload.weight,
        volume: payload.volume,
        mode: payload.mode,
        incoterm: payload.incoterm,
        cargoType: payload.cargoType,
      });
    }
    
    setQuoteResult(calculatedQuote);
    setIsSubmitting(false);

    if (calculatedQuote) {
      const generatedHtml = generatePdfSummaryHtml(
        calculatedQuote,
        formState,
        mode,
        incoterm,
        cargoType,
        readyDate,
        notes,
      );
      setPdfSummaryContent(generatedHtml);
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
    const baseStyle: React.CSSProperties = {
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
          <div className="freight-calc__header" style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
              Freight Calculator (Exports)
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>
              Estimate export freight costs with the required shipment details.
            </p>
          </div>

          <div className="freight-calc__layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
            <div
              className="freight-calc__card"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '24px'
              }}
            >
              <div className="freight-calc__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Origin Country/Port</label>
                  <input
                    value={formState.origin}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    placeholder="e.g., Tunis, Tunisia"
                    style={getInputStyle('origin')}
                  />
                  {errors.origin && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.origin}</p>}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Destination Country/Port</label>
                  <input
                    value={formState.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    placeholder="e.g., Marseille, France"
                    style={getInputStyle('destination')}
                  />
                  {errors.destination && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.destination}</p>}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Mode</label>
                  <select
                    value={mode}
                    onChange={(event) => setMode(event.target.value)}
                    style={{...getInputStyle('packagesCount' /* dummy value */), appearance: 'none'}}
                  >
                    {MODES.map((item) => (
                      <option key={item} value={item} style={{ backgroundColor: '#0B2641'}}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Incoterm</label>
                  <select
                    value={incoterm}
                    onChange={(event) => setIncoterm(event.target.value)}
                    style={{...getInputStyle('packagesCount' /* dummy value */), appearance: 'none'}}
                  >
                    {INCOTERMS.map((item) => (
                      <option key={item} value={item} style={{ backgroundColor: '#0B2641'}}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Cargo Type</label>
                  <select
                    value={cargoType}
                    onChange={(event) => setCargoType(event.target.value)}
                    style={{...getInputStyle('packagesCount' /* dummy value */), appearance: 'none'}}
                  >
                    {CARGO_TYPES.map((item) => (
                      <option key={item} value={item} style={{ backgroundColor: '#0B2641'}}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Ready Date</label>
                  <input
                    type="date"
                    value={readyDate}
                    onChange={(event) => setReadyDate(event.target.value)}
                    style={{...getInputStyle('packagesCount' /* dummy value */), appearance: 'none'}}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Total Weight (kg)</label>
                  <input
                    type="number"
                    value={formState.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="0"
                    style={getInputStyle('weight')}
                  />
                  {errors.weight && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.weight}</p>}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Total Volume (CBM)</label>
                  <input
                    type="number"
                    value={formState.volume}
                    onChange={(e) => handleInputChange('volume', e.target.value)}
                    placeholder="0"
                    style={getInputStyle('volume')}
                  />
                  {errors.volume && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.volume}</p>}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Packages Count</label>
                  <input
                    type="number"
                    value={formState.packagesCount}
                    onChange={(e) => handleInputChange('packagesCount', e.target.value)}
                    placeholder="0"
                    style={getInputStyle('packagesCount')}
                  />
                  {errors.packagesCount && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.packagesCount}</p>}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Cargo Value (USD)</label>
                  <input
                    type="number"
                    value={formState.cargoValue}
                    onChange={(e) => handleInputChange('cargoValue', e.target.value)}
                    placeholder="0"
                    style={getInputStyle('cargoValue')}
                  />
                  {errors.cargoValue && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.cargoValue}</p>}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '12px', color: '#94A3B8' }}>Notes</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />
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
                {isSubmitting ? 'Calculating...' : 'Calculate Freight'}
              </button>
            </div>

            <div
              className="freight-calc__result"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '24px',
                minHeight: '320px'
              }}
            >
              <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                Estimated Quote
              </h3>
              {quoteResult ? (
                <div style={{ color: '#E2E8F0', fontSize: '14px', lineHeight: 1.6 }}>
                  <div style={{ marginBottom: '8px', fontWeight: 600, color: quoteResult.source === 'Local' ? '#FBBF24' : '#6EE7B7' }}>
                    Source: {quoteResult.source} Estimate
                  </div>
                  {quoteResult.source === 'Local' && (
                    <p style={{ color: '#FBBF24', fontSize: '12px', marginTop: '-4px', marginBottom: '8px' }}>
                      (API was unavailable or not configured, using local approximation)
                    </p>
                  )}
                  <div>Origin: {quoteResult.origin || formState.origin}</div>
                  <div>Destination: {quoteResult.destination || formState.destination}</div>
                  <div>Mode: {quoteResult.mode || mode}</div>
                  {quoteResult.distance && <div>Distance: {quoteResult.distance} km</div>}
                  {quoteResult.cost && <div>Estimated Cost: {quoteResult.cost} {quoteResult.currency}</div>}
                  <div style={{ marginTop: '12px', color: '#94A3B8' }}>
                    {quoteResult.summary || `Quote generated successfully from ${quoteResult.source}.`}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '13px' }}>
                  Submit the form to see your freight estimate.
                </p>
              )}

              {quoteResult && (
                <div style={{ marginTop: '24px' }}>
                  <PdfDownloader
                    rootElementId="freight-pdf-summary-content"
                    fileName="FreightCalculationSummary.pdf"
                    buttonText="Download Freight Summary"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden div for PDF content */}
      <div id="freight-pdf-summary-content" style={{ position: 'absolute', left: '-9999px', opacity: 0 }} dangerouslySetInnerHTML={{ __html: pdfSummaryContent }} />
      <style>{`
        /* Responsive layout for the main two-column grid */
        @media (max-width: 900px) {
          .freight-calc__layout {
            grid-template-columns: 1fr; /* Stack the form and results on smaller screens */
          }
        }
        /* Responsive layout for the inner form grid and header */
        @media (max-width: 600px) {
          .freight-calc__grid {
            grid-template-columns: 1fr; /* Stack form inputs on very small screens */
          }
          .freight-calc__header h1 {
            font-size: 24px;
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
