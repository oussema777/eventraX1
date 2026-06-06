import { ArrowRight, Calendar, Users, Palette, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';
import { useI18n } from '../../i18n/I18nContext';

interface HeroSectionProps {
  onCreateEventClick?: () => void;
}

export default function HeroSection({ onCreateEventClick }: HeroSectionProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleCreateEvent = () => {
    if (onCreateEventClick) {
      onCreateEventClick();
      return;
    }
    navigate(ROUTES.WIZARD_STEP_1);
  };

  return (
    <section
      style={{
        marginTop: '72px',
        background: '#0B2641',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '60%',
          height: '140%',
          background: 'radial-gradient(ellipse at center, rgba(6, 132, 245, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px 96px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '64px',
          alignItems: 'center',
        }}
        className="hero-grid"
      >
        {/* Left: Copy */}
        <div style={{ maxWidth: '600px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '100px',
              backgroundColor: 'rgba(6, 132, 245, 0.12)',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
              }}
            />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#0684F5',
                letterSpacing: '0.04em',
              }}
            >
              {t('landing.hero.trustLine', { defaultValue: 'Trusted by 10,000+ event organizers' })}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 4vw + 1rem, 3.5rem)',
              fontWeight: 700,
              lineHeight: 1.12,
              color: '#F1F5F9',
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            {t('landing.hero.title', { defaultValue: 'Create Unforgettable Events' })}
          </h1>

          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.7,
              color: 'rgba(148, 163, 184, 0.9)',
              marginBottom: '36px',
              maxWidth: '480px',
            }}
          >
            {t('landing.hero.subtitle', { defaultValue: 'Professional event management platform trusted by businesses worldwide' })}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCreateEvent}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 32px',
                height: '52px',
                borderRadius: '10px',
                backgroundColor: '#0684F5',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, transform 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#0570D1';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#0684F5';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('landing.hero.primaryCta', { defaultValue: 'Create Event' })}
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate('/browse')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 24px',
                height: '52px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: 'rgba(148, 163, 184, 0.9)',
                fontSize: '15px',
                fontWeight: 500,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.color = '#F1F5F9';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = 'rgba(148, 163, 184, 0.9)';
              }}
            >
              {t('landing.hero.secondaryCta', { defaultValue: 'Browse Events' })}
            </button>
          </div>
        </div>

        {/* Right: Product preview */}
        <div className="hero-preview" style={{ position: 'relative' }}>
          <div
            style={{
              background: 'linear-gradient(145deg, #0D2E4D 0%, #0F3558 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Window chrome */}
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.6)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.6)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.6)' }} />
              <div
                style={{
                  flex: 1,
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  marginLeft: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '12px',
                }}
              >
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)' }}>eventra.app/create</span>
              </div>
            </div>

            {/* Product UI mockup */}
            <div style={{ padding: '24px' }}>
              {/* Sidebar + Content layout */}
              <div style={{ display: 'flex', gap: '20px' }}>
                {/* Mini sidebar */}
                <div
                  style={{
                    width: '48px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    alignItems: 'center',
                    paddingTop: '8px',
                  }}
                  className="hero-sidebar-mini"
                >
                  {[Calendar, Palette, Users, BarChart3].map((Icon, i) => (
                    <div
                      key={i}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: i === 0 ? 'rgba(6, 132, 245, 0.2)' : 'transparent',
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ color: i === 0 ? '#0684F5' : 'rgba(255, 255, 255, 0.25)' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Main content area */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#F1F5F9',
                      marginBottom: '16px',
                    }}
                  >
                    Event Details
                  </div>

                  {/* Form fields mockup */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '14px',
                      }}
                    >
                      <span style={{ fontSize: '13px', color: '#0684F5', fontWeight: 500 }}>
                        Provence Africa Connect 2026
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div
                        style={{
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '14px',
                        }}
                      >
                        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                          Jun 15, 2026
                        </span>
                      </div>
                      <div
                        style={{
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '14px',
                        }}
                      >
                        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                          Marseille, FR
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                          Setup progress
                        </span>
                        <span style={{ fontSize: '11px', color: '#0684F5', fontWeight: 600 }}>25%</span>
                      </div>
                      <div
                        style={{
                          height: '4px',
                          borderRadius: '2px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <div
                          style={{
                            width: '25%',
                            height: '100%',
                            borderRadius: '2px',
                            backgroundColor: '#0684F5',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr !important;
            padding: 96px 48px 112px !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 899px) {
          .hero-preview {
            max-width: 480px;
            margin: 0 auto;
          }
          .hero-sidebar-mini {
            display: none !important;
          }
        }
        @media (max-width: 500px) {
          .hero-grid {
            padding: 48px 16px 64px !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
