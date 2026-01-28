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
      className="footer-action-bar fixed bottom-0 right-0 z-40 border-t"
      style={{
        left: window.innerWidth > 768 ? '280px' : '0',
        borderColor: 'var(--border)',
        boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.2)',
        backgroundColor: 'var(--card)'
      }}
    >
      <style>{`
        @media (max-width: 1024px) {
          .footer-action-bar { left: 56px !important; }
        }
        @media (max-width: 768px) {
          .footer-action-bar { left: 0 !important; }
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
        {/* Left Side (Empty after removing Save Draft) */}
        <div className="footer-action-bar-left flex items-center gap-4">
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
