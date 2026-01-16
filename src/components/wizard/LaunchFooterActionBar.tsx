import { ArrowRight, Eye, Save, Rocket } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';
import { useI18n } from '../../i18n/I18nContext';

interface LaunchFooterActionBarProps {
  onPublish?: () => void;
  onSaveDraft?: () => void;
  onBack?: () => void;
  onPreview?: () => void;
}

export default function LaunchFooterActionBar({ onPublish, onSaveDraft, onBack, onPreview }: LaunchFooterActionBarProps) {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { t } = useI18n();
  const backRoute = eventId ? `/create/registration/${eventId}` : ROUTES.WIZARD_STEP_1;

  const handlePublish = () => {
    if (onPublish) {
      onPublish();
      return;
    }
    navigate(ROUTES.SUCCESS);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(backRoute);
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview();
      return;
    }
    console.log('Open preview modal or new tab');
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
          .footer-action-bar-left, .footer-action-bar-right, .footer-action-bar-center {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .footer-action-bar-left button, .footer-action-bar-right button, .footer-action-bar-center {
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
            <span>{t('wizard.launchFooter.allChangesSaved')}</span>
          </div>
        </div>

        {/* Center */}
        <button
          onClick={handlePreview}
          className="footer-action-bar-center h-11 px-6 rounded-lg border flex items-center gap-2 transition-colors hover:opacity-80"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--foreground)',
            fontWeight: 500
          }}
          >
            <Eye size={16} />
          {t('wizard.launchFooter.preview')}
        </button>

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
            {t('wizard.launchFooter.backToRegistration')}
          </button>

          <button
            onClick={handlePublish}
            className="h-[52px] px-8 rounded-xl flex items-center gap-2 transition-all hover:scale-105 text-white"
            style={{
              backgroundColor: 'var(--success)',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Rocket size={20} />
            {t('wizard.launchFooter.publish')}
          </button>
        </div>
      </div>
    </div>
  );
}
