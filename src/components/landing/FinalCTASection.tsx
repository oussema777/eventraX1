import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';
import { useI18n } from '../../i18n/I18nContext';

interface FinalCTASectionProps {
  onCreateEventClick?: () => void;
}

export default function FinalCTASection({ onCreateEventClick }: FinalCTASectionProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleClick = () => {
    if (onCreateEventClick) {
      onCreateEventClick();
      return;
    }
    navigate(ROUTES.WIZARD_STEP_1);
  };

  return (
    <section
      style={{
        backgroundColor: '#0684F5',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle tonal variation */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(255, 255, 255, 0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
        className="cta-container"
      >
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw + 0.5rem, 2.75rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#fff',
            marginBottom: '16px',
            letterSpacing: '-0.01em',
          }}
        >
          {t('landing.finalCta.title', { defaultValue: 'Ready to Create Your First Event?' })}
        </h2>

        <p
          style={{
            fontSize: '1.0625rem',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '36px',
            maxWidth: '480px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {t('landing.finalCta.subtitle', { defaultValue: 'Join thousands of event organizers using Eventra' })}
        </p>

        <button
          onClick={handleClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 36px',
            height: '52px',
            borderRadius: '10px',
            backgroundColor: '#fff',
            color: '#0684F5',
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {t('landing.finalCta.button', { defaultValue: 'Get Started Free' })}
          <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .cta-container {
            padding: 96px 48px !important;
          }
        }
      `}</style>
    </section>
  );
}
