import { Palette, Users, BarChart3, ArrowRight, Type, Image, Layers, Mail, CheckCircle2, UserPlus, TrendingUp, Eye, MousePointerClick } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

/* ── Product mockup: Design Studio ──────────────────────────── */
function DesignStudioMockup() {
  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0D2E4D 0%, #0F3558 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.5)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.5)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.5)' }} />
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)' }}>Design Studio</span>
      </div>

      <div style={{ display: 'flex', height: 'calc(100% - 34px)' }}>
        {/* Left: Block palette */}
        <div
          style={{
            width: '44px',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '10px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          {[Type, Image, Layers, Users].map((Icon, i) => (
            <div
              key={i}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: i === 0 ? 'rgba(6, 132, 245, 0.15)' : 'transparent',
              }}
            >
              <Icon size={14} style={{ color: i === 0 ? '#0684F5' : 'rgba(255, 255, 255, 0.2)' }} />
            </div>
          ))}
        </div>

        {/* Center: Canvas preview */}
        <div style={{ flex: 1, padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Hero block preview */}
          <div
            style={{
              flex: 1,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(6, 132, 245, 0.12) 0%, rgba(6, 132, 245, 0.04) 100%)',
              border: '1.5px dashed rgba(6, 132, 245, 0.3)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <div style={{ width: '70%', height: '10px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
            <div style={{ width: '50%', height: '7px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ width: '28%', height: '20px', borderRadius: '5px', backgroundColor: '#0684F5', marginTop: '4px', opacity: 0.6 }} />
          </div>

          {/* Speakers block preview */}
          <div
            style={{
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', marginLeft: 0 }}>
              {['#0684F5', '#10B981', '#F59E0B'].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    opacity: 0.4,
                    border: '2px solid #0F3558',
                    marginLeft: i > 0 ? '-6px' : 0,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)' }}>3 speakers</span>
          </div>
        </div>

        {/* Right: Properties panel */}
        <div
          className="feature-props-panel"
          style={{
            width: '110px',
            borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '12px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Properties
          </span>
          {/* Color swatches */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['#0684F5', '#10B981', '#F59E0B', '#EF4444'].map((c) => (
              <div
                key={c}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  backgroundColor: c,
                  opacity: 0.5,
                  border: c === '#0684F5' ? '1.5px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            ))}
          </div>
          {/* Mini inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['Title', 'Subtitle'].map((label) => (
              <div key={label}>
                <span style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.25)', display: 'block', marginBottom: '3px' }}>{label}</span>
                <div
                  style={{
                    height: '22px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Product mockup: Registration Hub ───────────────────────── */
function RegistrationMockup() {
  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0D2E4D 0%, #0F3558 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.5)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.5)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.5)' }} />
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)' }}>Registration</span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { label: 'Registered', value: '248', icon: UserPlus, color: '#10B981' },
            { label: 'Confirmed', value: '189', icon: CheckCircle2, color: '#0684F5' },
            { label: 'Pending', value: '59', icon: Mail, color: '#F59E0B' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                <stat.icon size={11} style={{ color: stat.color, opacity: 0.7 }} />
                <span style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {stat.label}
                </span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#F1F5F9' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Attendee list */}
        <div
          style={{
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              gap: '16px',
            }}
          >
            {['Name', 'Email', 'Status'].map((h) => (
              <span key={h} style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.25)', textTransform: 'uppercase', letterSpacing: '0.04em', flex: h === 'Email' ? 1.5 : 1 }}>
                {h}
              </span>
            ))}
          </div>
          {/* Rows */}
          {[
            { name: 'Sarah K.', email: 'sarah@tech...', status: 'confirmed', color: '#10B981' },
            { name: 'Ahmed B.', email: 'ahmed@inn...', status: 'confirmed', color: '#10B981' },
            { name: 'Marie L.', email: 'marie@glo...', status: 'pending', color: '#F59E0B' },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                padding: '8px 12px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                borderBottom: i < 2 ? '1px solid rgba(255, 255, 255, 0.03)' : 'none',
              }}
            >
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'rgba(6, 132, 245, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '8px', fontWeight: 600, color: '#0684F5' }}>{row.name[0]}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>{row.name}</span>
              </div>
              <span style={{ flex: 1.5, fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)' }}>{row.email}</span>
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: `${row.color}15`,
                    color: row.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}
                >
                  {row.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Product mockup: Analytics Suite ────────────────────────── */
function AnalyticsMockup() {
  const barHeights = [35, 55, 45, 70, 60, 85, 75];

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0D2E4D 0%, #0F3558 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.5)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.5)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.5)' }} />
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)' }}>Analytics</span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Metric cards */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { label: 'Views', value: '12.4K', change: '+18%', icon: Eye, color: '#0684F5' },
            { label: 'Registrations', value: '842', change: '+24%', icon: TrendingUp, color: '#10B981' },
            { label: 'Click Rate', value: '6.2%', change: '+3%', icon: MousePointerClick, color: '#F59E0B' },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <m.icon size={12} style={{ color: m.color, opacity: 0.6 }} />
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#10B981' }}>{m.change}</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#F1F5F9', display: 'block' }}>{m.value}</span>
              <span style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div
          style={{
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)' }}>Registrations this week</span>
            <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.25)' }}>Mon - Sun</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
            {barHeights.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  borderRadius: '4px 4px 2px 2px',
                  backgroundColor: i === barHeights.length - 2 ? '#F59E0B' : 'rgba(245, 158, 11, 0.2)',
                  transition: 'background-color 0.2s ease',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '8px', color: 'rgba(255, 255, 255, 0.2)' }}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Features Section ──────────────────────────────────── */
export default function FeaturesSection() {
  const { t, tList } = useI18n();
  const featureContent = tList<{ title: string; description: string }>('landing.features.items');

  const features = [
    {
      icon: Palette,
      title: featureContent[0]?.title,
      description: featureContent[0]?.description,
      color: '#0684F5',
      number: '01',
      mockup: <DesignStudioMockup />,
    },
    {
      icon: Users,
      title: featureContent[1]?.title,
      description: featureContent[1]?.description,
      color: '#10B981',
      number: '02',
      mockup: <RegistrationMockup />,
    },
    {
      icon: BarChart3,
      title: featureContent[2]?.title,
      description: featureContent[2]?.description,
      color: '#F59E0B',
      number: '03',
      mockup: <AnalyticsMockup />,
    },
  ];

  return (
    <section style={{ backgroundColor: '#091D33' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '96px 24px' }} className="features-container">
        {/* Section header */}
        <div style={{ marginBottom: '64px', maxWidth: '480px' }}>
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
            {t('landing.features.title', { defaultValue: 'Everything You Need to Succeed' })}
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
            {t('landing.features.subtitle', { defaultValue: 'Powerful tools for professional event management' })}
          </h2>
        </div>

        {/* Features: staggered rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isReversed = index % 2 === 1;

            return (
              <div
                key={index}
                className="feature-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '32px',
                  alignItems: 'center',
                  padding: '32px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
              >
                {/* Text content */}
                <div
                  style={{
                    order: isReversed ? 2 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                  className={isReversed ? 'feature-content-reversed' : 'feature-content'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: feature.color,
                        opacity: 0.5,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {feature.number}
                    </span>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: `${feature.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={20} style={{ color: feature.color }} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.375rem', fontWeight: 600, color: '#F1F5F9', lineHeight: 1.3 }}>
                    {feature.title}
                  </h3>

                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(148, 163, 184, 0.8)', maxWidth: '440px' }}>
                    {feature.description}
                  </p>

                  <button
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: feature.color,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '4px',
                      transition: 'gap 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.gap = '12px'; }}
                    onMouseLeave={e => { e.currentTarget.style.gap = '8px'; }}
                  >
                    {t('landing.features.cta', { defaultValue: 'Learn more' })}
                    <ArrowRight size={15} />
                  </button>
                </div>

                {/* Product mockup */}
                <div
                  style={{
                    order: isReversed ? 1 : 2,
                    minHeight: '280px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
                  }}
                  className={isReversed ? 'feature-visual-reversed' : 'feature-visual'}
                >
                  {feature.mockup}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .feature-row {
            grid-template-columns: 1fr 1.1fr !important;
          }
          .feature-content-reversed {
            order: 2 !important;
          }
          .feature-visual-reversed {
            order: 1 !important;
          }
          .features-container {
            padding: 96px 48px !important;
          }
        }
        @media (max-width: 767px) {
          .feature-content, .feature-content-reversed {
            order: 1 !important;
          }
          .feature-visual, .feature-visual-reversed {
            order: 2 !important;
          }
          .feature-props-panel {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
