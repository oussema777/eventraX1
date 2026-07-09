import { FileText, Palette, UserPlus, Rocket, ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function HowItWorksSection() {
  const { t, tList } = useI18n();
  const stepContent = tList<{ title: string; description: string }>('landing.howItWorks.steps');
  const steps = [
    {
      number: 1,
      icon: FileText,
      title: stepContent[0]?.title,
      description: stepContent[0]?.description
    },
    {
      number: 2,
      icon: Palette,
      title: stepContent[1]?.title,
      description: stepContent[1]?.description
    },
    {
      number: 3,
      icon: UserPlus,
      title: stepContent[2]?.title,
      description: stepContent[2]?.description
    },
    {
      number: 4,
      icon: Rocket,
      title: stepContent[3]?.title,
      description: stepContent[3]?.description
    }
  ];

  return (
    <section 
      className="py-20 px-6 sm:px-10"
      style={{ backgroundColor: 'var(--gray-50)' }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-4xl mb-3"
            style={{ fontWeight: 600, color: 'var(--foreground)' }}
          >
            {t('landing.howItWorks.title')}
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connecting Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-6 z-0">
                    <ArrowRight 
                      size={24} 
                      className="text-gray-300"
                      style={{ transform: 'translateX(-50%)' }}
                    />
                  </div>
                )}

                {/* Step Card */}
                <div
                  className="relative z-10 rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Number Badge */}
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ 
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '24px'
                    }}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-3">
                    <Icon 
                      size={32} 
                      className="mx-auto"
                      style={{ color: '#6B7280' }}
                    />
                  </div>

                  {/* Title */}
                  <h3 
                    className="text-lg mb-2"
                    style={{ fontWeight: 600, color: '#0B2641' }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p 
                    className="text-sm"
                    style={{ 
                      color: '#6B7280',
                      lineHeight: 1.5
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
