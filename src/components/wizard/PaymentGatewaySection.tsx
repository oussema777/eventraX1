import { useNavigate } from 'react-router-dom';
import { Crown, Check, Lock } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function PaymentGatewaySection() {
  const navigate = useNavigate();
  const { t, tList } = useI18n();
  const features = tList<string>('wizard.step4.payment.features', []);

  return (
    <div 
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
    >
      {/* Gold Banner */}
      <div 
        className="h-1"
        style={{ 
          background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)'
        }}
      />

      <div className="p-8 flex items-start justify-between gap-8">
        {/* Left Side */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 
              className="text-2xl"
              style={{ fontWeight: 600, color: '#0B2641' }}
            >
              {t('wizard.step4.payment.title')}
            </h2>
            <span 
              className="px-3 py-1 rounded-full text-xs flex items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: 'white',
                fontWeight: 700
              }}
            >
              <Crown size={12} />
              PRO
            </span>
          </div>

          <p 
            className="text-sm mb-6"
            style={{ color: '#6B7280' }}
          >
            {t('wizard.step4.payment.subtitle')}
          </p>

          {/* Feature List */}
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--success)' }}
                >
                  <Check size={12} style={{ color: 'white' }} />
                </div>
                <span className="text-sm" style={{ color: '#0B2641' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col items-center gap-3">
          <button
            className="h-[52px] px-8 rounded-xl flex items-center gap-2 transition-transform hover:scale-105 text-white"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(255, 165, 0, 0.3)'
            }}
            onClick={() => navigate('/pricing')}
          >
            <Lock size={20} />
            {t('wizard.step4.payment.upgrade')}
          </button>
          <span 
            className="text-sm"
            style={{ color: '#6B7280' }}
          >
            {t('wizard.step4.payment.price')}
          </span>
        </div>
      </div>
    </div>
  );
}
