import { useMemo, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';

const LOGISTICS_API_BASE = import.meta.env.VITE_LOGISTICS_API_BASE || '';
const FREIGHT_EXPORT_ENDPOINT =
  import.meta.env.VITE_FREIGHT_EXPORT_ENDPOINT || (LOGISTICS_API_BASE ? `${LOGISTICS_API_BASE}/freight-export` : '');

const INCOTERMS = ['EXW', 'FOB', 'CIF', 'DAP', 'DDP'];
const MODES = ['Air', 'Sea', 'Road'];
const CARGO_TYPES = ['General', 'Perishable', 'Hazardous', 'Oversized'];

export default function FreightCalculatorPage() {
  const { user, profile, signOut } = useAuth();
  const { t } = useI18n();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

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
    const weightValue = Number(weight);
    const volumeValue = Number(volume);
    const hasWeight = Number.isFinite(weightValue) && weightValue > 0;
    const hasVolume = Number.isFinite(volumeValue) && volumeValue > 0;
    return origin.trim() && destination.trim() && (hasWeight || hasVolume);
  }, [origin, destination, weight, volume]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!FREIGHT_EXPORT_ENDPOINT) {
      toast.error(t('logisticsTools.errors.apiNotConfigured'));
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
        throw new Error(data?.error || t('logisticsTools.errors.freightFailed'));
      }
      setQuoteResult(data?.data || data);
    } catch (error: any) {
      toast.error(error.message || t('logisticsTools.errors.freightFailed'));
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
          <div className="freight-calc__header" style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
              {t('logisticsTools.titles.freight')}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>
              {t('logisticsTools.subtitles.freight')}
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.freight.origin')}</label>
                  <input
                    value={origin}
                    onChange={(event) => setOrigin(event.target.value)}
                    placeholder={t('logisticsTools.freight.exampleOrigin')}
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.freight.destination')}</label>
                  <input
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder={t('logisticsTools.freight.exampleDestination')}
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.freight.mode')}</label>
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.freight.incoterm')}</label>
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.freight.cargoType')}</label>
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.freight.readyDate')}</label>
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.freight.totalWeight')}</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.1"
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.freight.totalVolume')}</label>
                  <input
                    type="number"
                    value={volume}
                    onChange={(event) => setVolume(event.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.freight.packages')}</label>
                  <input
                    type="number"
                    value={packagesCount}
                    onChange={(event) => setPackagesCount(event.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.freight.cargoValue')}</label>
                  <input
                    type="number"
                    value={cargoValue}
                    onChange={(event) => setCargoValue(event.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
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
                <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.freight.notes')}</label>
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
                {isSubmitting ? t('logisticsTools.freight.submitting') : t('logisticsTools.freight.submit')}
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
                {t('logisticsTools.freight.resultTitle')}
              </h3>
              {quoteResult ? (
                <div style={{ color: '#E2E8F0', fontSize: '14px', lineHeight: 1.6 }}>
                  <div>{t('logisticsTools.freight.origin')}: {quoteResult.origin || origin}</div>
                  <div>{t('logisticsTools.freight.destination')}: {quoteResult.destination || destination}</div>
                  <div>{t('logisticsTools.freight.mode')}: {quoteResult.mode || mode}</div>
                  <div>{t('logisticsTools.freight.total')}: {quoteResult.total ?? '—'} {quoteResult.currency || 'USD'}</div>
                  <div>{t('logisticsTools.freight.chargeableWeight')}: {quoteResult.chargeableWeight ?? '—'} kg</div>
                  {quoteResult.insurance != null && (
                    <div>{t('logisticsTools.freight.insurance')}: {quoteResult.insurance} {quoteResult.currency || 'USD'}</div>
                  )}
                  <div>
                    {t('logisticsTools.freight.eta')}:{' '}
                    {quoteResult.etaStart && quoteResult.etaEnd
                      ? `${new Date(quoteResult.etaStart).toLocaleDateString()} - ${new Date(quoteResult.etaEnd).toLocaleDateString()}`
                      : '—'}
                  </div>
                  {quoteResult.breakdown && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#94A3B8' }}>
                      {t('logisticsTools.freight.breakdown')}: Base {quoteResult.breakdown.baseCharge ?? 0} ·
                      Fuel {quoteResult.breakdown.fuelSurcharge ?? 0} ·
                      Handling {quoteResult.breakdown.handling ?? 0} ·
                      Docs {quoteResult.breakdown.documentation ?? 0}
                    </div>
                  )}
                  {quoteResult.referenceId && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748B' }}>
                      {t('logisticsTools.common.reference')}: {quoteResult.referenceId}
                    </div>
                  )}
                  <div style={{ marginTop: '12px', color: '#94A3B8' }}>
                    {quoteResult.summary || t('logisticsTools.common.quoteReady')}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '13px' }}>
                  {t('logisticsTools.freight.resultPlaceholder')}
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
