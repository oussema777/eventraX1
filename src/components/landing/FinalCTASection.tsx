import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';
import { useI18n } from '../../i18n/I18nContext';

export default function FinalCTASection() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleNavigate = (page: string) => {
    if (page === '03_Wizard_Step1_Details') {
      navigate(ROUTES.WIZARD_STEP_1);
    }
  };

  return (
    <section 
      className="py-20 px-6 sm:px-10 text-center relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-white" />
        <div className="absolute bottom-10 left-20 w-48 h-48 rounded-full bg-white" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[800px] mx-auto">
        <h2 
          className="text-4xl md:text-5xl mb-4"
          style={{ 
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.2
          }}
        >
          {t('landing.finalCta.title')}
        </h2>

        <p 
          className="text-xl mb-8"
          style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.6
          }}
        >
          {t('landing.finalCta.subtitle')}
        </p>

        <button
          onClick={() => handleNavigate('03_Wizard_Step1_Details')}
          className="inline-flex items-center gap-3 px-10 py-4 rounded-lg text-lg transition-all duration-200 hover:scale-105 shadow-strong"
          style={{ 
            backgroundColor: 'white',
            color: 'var(--primary)',
            fontWeight: 700,
            height: '64px'
          }}
        >
          {t('landing.finalCta.button')}
          <ArrowRight size={24} />
        </button>
      </div>
    </section>
  );
}
