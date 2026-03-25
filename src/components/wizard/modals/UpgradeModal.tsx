import { useNavigate } from 'react-router-dom';
import { X, Lock, Check } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const navigate = useNavigate();
  const { t, tList } = useI18n();
  if (!isOpen) return null;

  const features = tList<string>('designStudio.modals.upgradeDesign.features', [
    'Hero video backgrounds',
    'Advanced content blocks',
    'Custom animations',
    'Priority support'
  ]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: '500px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-end p-4"
        >
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
          >
            <X size={20} style={{ color: '#6B7280' }} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 text-center">
          {/* Lock Icon */}
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
            }}
          >
            <Lock size={32} style={{ color: '#F59E0B' }} />
          </div>

          {/* Title */}
          <h2
            className="text-2xl mb-3"
            style={{ fontWeight: 600, color: '#0B2641' }}
          >
            {t('designStudio.modals.upgradeDesign.title')}
          </h2>

          {/* Description */}
          <p
            className="text-base mb-6"
            style={{ color: '#6B7280' }}
          >
            {t('designStudio.modals.upgradeDesign.description')}
          </p>

          {/* Features List */}
          <div className="mb-8 space-y-3">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 justify-center"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <Check size={14} style={{ color: 'white' }} />
                </div>
                <span className="text-sm" style={{ color: '#0B2641' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Upgrade Button */}
          <button
            className="w-full h-13 rounded-lg transition-opacity hover:opacity-90 mb-3"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '16px',
              padding: '16px'
            }}
            onClick={() => {
              onClose();
              navigate('/pricing');
            }}
          >
            {t('designStudio.modals.upgradeDesign.cta')}
          </button>

          {/* Learn More Link */}
          <button
            className="text-xs transition-opacity hover:opacity-80"
            style={{ color: '#0684F5', fontWeight: 500 }}
            onClick={() => {
              console.log('Navigate to learn more page');
            }}
          >
            {t('designStudio.modals.upgradeDesign.learnMore')}
          </button>

          {/* Maybe Later */}
          <div className="mt-4">
            <button
              className="text-xs transition-opacity hover:opacity-80"
              style={{ color: '#6B7280' }}
              onClick={onClose}
            >
              {t('designStudio.modals.upgradeDesign.maybeLater')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
