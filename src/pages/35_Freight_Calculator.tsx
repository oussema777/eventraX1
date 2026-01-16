import { useMemo, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';

const LOGISTICS_API_BASE = import.meta.env.VITE_LOGISTICS_API_BASE || '';
const FREIGHT_EXPORT_ENDPOINT =
  import.meta.env.VITE_FREIGHT_EXPORT_ENDPOINT || (LOGISTICS_API_BASE ? `${LOGISTICS_API_BASE}/freight-export` : '');

const INCOTERMS = ['EXW', 'FOB', 'CIF', 'DAP', 'DDP'];
const MODES = ['Air', 'Sea', 'Road'];
const CARGO_TYPES = ['General', 'Perishable', 'Hazardous', 'Oversized'];

export default function FreightCalculatorPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState(MODES[0]);
  const [incoterm, setIncoterm] = useState(INCOTERMS[0]);
  const [cargoType, setCargoType] = useState(CARGO_TYPES[0]);
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [packagesCount, setPackagesCount] = useState('');
  const [readyDate, setReadyDate] = useState('');
  const [cargoValue, setCargoValue] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteResult, setQuoteResult] = useState<any | null>(null);

  const canSubmit = useMemo(() => {
    return origin.trim() && destination.trim() && weight.trim() && volume.trim();
  }, [origin, destination, weight, volume]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!FREIGHT_EXPORT_ENDPOINT) {
      toast.error('Logistics API is not configured.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        origin,
        destination,
        mode,
        incoterm,
        cargoType,
        weight: Number(weight),
        volume: Number(volume),
        packagesCount: packagesCount ? Number(packagesCount) : null,
        readyDate: readyDate || null,
        cargoValue: cargoValue ? Number(cargoValue) : null,
        notes: notes.trim() || null
      };
      const res = await fetch(FREIGHT_EXPORT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || 'Failed to calculate freight');
      }
      setQuoteResult(data?.data || data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to calculate freight');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavbarLoggedIn />
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
                    value={origin}
                    onChange={(event) => setOrigin(event.target.value)}
                    placeholder="e.g., Tunis, Tunisia"
                    className="freight-calc__input"
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Destination Country/Port</label>
                  <input
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder="e.g., Marseille, France"
                    className="freight-calc__input"
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Mode</label>
                  <select
                    value={mode}
                    onChange={(event) => setMode(event.target.value)}
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
                    {MODES.map((item) => (
                      <option key={item} value={item}>
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
                    {INCOTERMS.map((item) => (
                      <option key={item} value={item}>
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
                    {CARGO_TYPES.map((item) => (
                      <option key={item} value={item}>
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Total Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Total Volume (CBM)</label>
                  <input
                    type="number"
                    value={volume}
                    onChange={(event) => setVolume(event.target.value)}
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Packages Count</label>
                  <input
                    type="number"
                    value={packagesCount}
                    onChange={(event) => setPackagesCount(event.target.value)}
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Cargo Value (USD)</label>
                  <input
                    type="number"
                    value={cargoValue}
                    onChange={(event) => setCargoValue(event.target.value)}
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
                  <div>Origin: {quoteResult.origin || origin}</div>
                  <div>Destination: {quoteResult.destination || destination}</div>
                  <div>Mode: {quoteResult.mode || mode}</div>
                  <div style={{ marginTop: '12px', color: '#94A3B8' }}>
                    {quoteResult.summary || 'Quote generated successfully.'}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '13px' }}>
                  Submit the form to see your freight estimate.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .freight-calc__layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .freight-calc__grid {
            grid-template-columns: 1fr;
          }
          .freight-calc__header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
}
