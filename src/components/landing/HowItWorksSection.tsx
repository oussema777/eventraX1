import { FileText, Palette, UserPlus, Rocket } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function HowItWorksSection() {
  const { t, tList } = useI18n();
  const stepContent = tList<{ title: string; description: string }>('landing.howItWorks.steps');

  const steps = [
    { icon: FileText, title: stepContent[0]?.title, description: stepContent[0]?.description },
    { icon: Palette, title: stepContent[1]?.title, description: stepContent[1]?.description },
    { icon: UserPlus, title: stepContent[2]?.title, description: stepContent[2]?.description },
    { icon: Rocket, title: stepContent[3]?.title, description: stepContent[3]?.description },
  ];

  return (
    <section style={{ backgroundColor: '#0B2641' }}>
      <div
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '96px 24px' }}
        className="hiw-container"
      >
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0684F5',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            How it works
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#F1F5F9',
              letterSpacing: '-0.01em',
            }}
          >
            {t('landing.howItWorks.title', { defaultValue: 'Create Events in 4 Simple Steps' })}
          </h2>
        </div>

        {/* Steps: horizontal timeline */}
        <div className="hiw-steps" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} style={{ position: 'relative' }}>
                {/* Connector line (visible on desktop between items) */}
                {index < steps.length - 1 && (
                  <div
                    className="hiw-connector"
                    style={{
                      display: 'none',
                      position: 'absolute',
                      top: '28px',
                      left: 'calc(50% + 28px)',
                      right: 'calc(-50% + 28px)',
                      height: '2px',
                      background: 'linear-gradient(90deg, rgba(6, 132, 245, 0.3), rgba(6, 132, 245, 0.08))',
                    }}
                  />
                )}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {/* Number + Icon combined */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      backgroundColor: index === 0 ? '#0684F5' : 'rgba(6, 132, 245, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                      position: 'relative',
                    }}
                  >
                    <Icon
                      size={24}
                      style={{ color: index === 0 ? '#fff' : '#0684F5' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#0B2641',
                        border: '2px solid rgba(6, 132, 245, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#0684F5',
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#F1F5F9',
                      marginBottom: '8px',
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      color: 'rgba(148, 163, 184, 0.7)',
                      maxWidth: '240px',
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

      <style>{`
        @media (min-width: 768px) {
          .hiw-steps {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 0 !important;
          }
          .hiw-connector {
            display: block !important;
          }
          .hiw-container {
            padding: 96px 48px !important;
          }
        }
      `}</style>
    </section>
  );
}
