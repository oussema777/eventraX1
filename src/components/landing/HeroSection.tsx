import { Plus, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';
import { useI18n } from '../../i18n/I18nContext';

interface HeroSectionProps {
  onCreateEventClick?: () => void;
}

export default function HeroSection({ onCreateEventClick }: HeroSectionProps) {
  const navigate = useNavigate();
  const { t, tList } = useI18n();

  const handleNavigate = (page: string) => {
    if (page === '03_Wizard_Step1_Details') {
      if (onCreateEventClick) {
        onCreateEventClick();
        return;
      }
      navigate(ROUTES.WIZARD_STEP_1);
    }
  };

  return (
    <section 
      className="relative flex items-center justify-center"
      style={{ 
        minHeight: '600px',
        marginTop: '72px',
        background: 'linear-gradient(135deg, rgba(0, 212, 212, 0.05) 0%, rgba(255, 87, 34, 0.05) 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-20 right-40 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
        />
        <div 
          className="absolute bottom-32 left-20 w-24 h-24 rounded-full opacity-20"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--warning) 100%)' }}
        />
        <div 
          className="absolute top-40 left-1/4 w-16 h-16 rounded-full opacity-15"
          style={{ background: 'var(--secondary)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 sm:px-10 text-center">
        <div className="flex flex-col items-center gap-6">
          {/* Headline */}
          <h1 
            className="text-4xl md:text-5xl max-w-3xl"
            style={{ 
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'var(--foreground)'
            }}
          >
            {t('landing.hero.title')}
          </h1>

          {/* Subheading */}
          <p 
            className="text-xl max-w-2xl"
            style={{ 
              color: 'var(--muted-foreground)',
              lineHeight: 1.6
            }}
          >
            {t('landing.hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex sm:flex-row items-center gap-4 mt-2">
            <button
              onClick={() => handleNavigate('03_Wizard_Step1_Details')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base transition-all duration-200 hover:scale-105 shadow-light hover:shadow-medium"
              style={{ 
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontWeight: 600,
                height: '56px'
              }}
            >
              <Plus size={20} />
              {t('landing.hero.primaryCta')}
            </button>

            <button
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base transition-all duration-200 hover:bg-gray-50"
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--foreground)',
                border: '2px solid var(--border)',
                fontWeight: 600,
                height: '56px'
              }}
            >
              <Play size={18} />
              {t('landing.hero.secondaryCta')}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {t('landing.hero.trustLine')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-50">
              {/* Company Logos - Placeholder */}
              {tList<string>('landing.hero.logos').map((logo) => (
                <div key={logo} className="px-6 py-2 rounded" style={{ backgroundColor: 'var(--gray-200)' }}>
                  <span className="text-xs" style={{ fontWeight: 600, color: 'var(--gray-600)' }}>{logo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
