import { Palette, Users, BarChart3, ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function FeaturesSection() {
  const { t, tList } = useI18n();
  const featureContent = tList<{ title: string; description: string }>('landing.features.items');
  const features = [
    {
      icon: Palette,
      title: featureContent[0]?.title,
      description: featureContent[0]?.description,
      color: 'var(--primary)'
    },
    {
      icon: Users,
      title: featureContent[1]?.title,
      description: featureContent[1]?.description,
      color: 'var(--accent)'
    },
    {
      icon: BarChart3,
      title: featureContent[2]?.title,
      description: featureContent[2]?.description,
      color: 'var(--secondary)'
    }
  ];

  return (
    <section className="py-20 px-6 sm:px-10 bg-background">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-4xl mb-3"
            style={{ fontWeight: 600, color: 'var(--foreground)' }}
          >
            {t('landing.features.title')}
          </h2>
          <p 
            className="text-base max-w-2xl mx-auto"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {t('landing.features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="rounded-xl p-8 border transition-all duration-300 hover:scale-105 cursor-pointer group"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <Icon size={24} style={{ color: feature.color }} />
                </div>

                {/* Title */}
                <h3 
                  className="text-xl mb-3"
                  style={{ fontWeight: 600, color: '#0B2641' }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p 
                  className="text-base mb-4"
                  style={{ 
                    color: '#6B7280',
                    lineHeight: 1.6
                  }}
                >
                  {feature.description}
                </p>

                {/* Learn More Link */}
                <button 
                  className="inline-flex items-center gap-2 text-sm transition-all group-hover:gap-3"
                  style={{ 
                    color: feature.color,
                    fontWeight: 600
                  }}
                >
                  {t('landing.features.cta')}
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
