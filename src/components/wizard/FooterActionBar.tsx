import { ArrowRight, Check, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';
import { useI18n } from '../../i18n/I18nContext';

interface FooterActionBarProps {
  currentStep: number;
  onBack: () => void;
  onContinue: () => void;
  onSaveDraft?: () => void;
  isBackDisabled?: boolean;
}

export default function FooterActionBar({ 
  currentStep, 
  onBack, 
  onContinue, 
  onSaveDraft,
  isBackDisabled = false 
}: FooterActionBarProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
      return;
    }
    navigate(ROUTES.WIZARD_STEP_1);
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft();
      return;
    }
    navigate(ROUTES.DRAFT_SAVED);
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
            onClick={handleSaveDraft}
            className="h-11 px-6 rounded-lg transition-colors hover:opacity-80"
            style={{
              color: 'var(--muted-foreground)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border)'
            }}
          >
            {t('wizard.common.saveDraft')}
          </button>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--success)', fontWeight: 500 }}>
            <Save size={14} />
            <span>{t('wizard.footer.draftSavedHint', { minutes: 2 })}</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="footer-action-bar-right flex items-center gap-3">
          <button
            onClick={onBack}
            disabled={isBackDisabled}
            className="h-11 px-6 rounded-lg transition-all"
            style={{
              color: 'var(--muted-foreground)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border)',
              opacity: isBackDisabled ? 0.4 : 1,
              cursor: isBackDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            {t('wizard.common.back')}
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
