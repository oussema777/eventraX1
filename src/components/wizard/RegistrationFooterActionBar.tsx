import { ArrowRight, Eye, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';
import { useI18n } from '../../i18n/I18nContext';

export default function RegistrationFooterActionBar() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { t } = useI18n();
  const backRoute = eventId ? `/create/design/${eventId}` : ROUTES.WIZARD_STEP_1;
  const nextRoute = eventId ? `/create/launch/${eventId}` : ROUTES.WIZARD_STEP_1;

  const handleContinue = () => {
    navigate(nextRoute);
  };

  const handleBack = () => {
    navigate(backRoute);
  };

  return (
    <div 
      className="footer-action-bar fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        borderColor: 'var(--border)',
        boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.2)',
        backgroundColor: 'var(--card)'
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .footer-action-bar-inner { 
            flex-direction: column !important; 
            gap: 1rem !important; 
            padding: 1rem !important;
          }
          .footer-action-bar-left, .footer-action-bar-right {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .footer-action-bar-left button, .footer-action-bar-right button {
            flex: 1 !important;
            justify-content: center !important;
          }
        }
      `}</style>
      <div className="footer-action-bar-inner px-10 py-6 flex items-center justify-between max-w-[1440px] mx-auto">
        {/* Left Side */}
        <div className="footer-action-bar-left flex items-center gap-4">
          <button
            className="h-11 px-6 rounded-lg border transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--foreground)'
            }}
          >
            {t('wizard.common.saveDraft')}
          </button>
        </div>

        {/* Right Side */}
        <div className="footer-action-bar-right flex items-center gap-3">
          <button
            onClick={handleBack}
            className="h-11 px-6 rounded-lg border transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--foreground)'
            }}
          >
            {t('wizard.registrationFooter.backToDesign')}
          </button>

          <button
            onClick={handleContinue}
            className="h-11 px-6 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontWeight: 600,
              border: 'none'
            }}
          >
            {t('wizard.common.saveContinue')}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
