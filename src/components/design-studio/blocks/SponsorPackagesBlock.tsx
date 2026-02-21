import { useState } from 'react';
import { Crown, Check, ArrowRight, ShieldCheck, Zap, Star, Shield } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface SponsorPackage {
  id: string;
  name: string;
  value: number;
  benefits: string[];
  color: string;
}

interface SponsorPackagesBlockProps {
  packages?: SponsorPackage[];
  brandColor?: string;
  buttonRadius?: number;
  settings?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaUrl?: string;
    highlightedPackage?: string;
  };
  onEdit?: () => void;
  showEditControls?: boolean;
  isLocked?: boolean;
}

export default function SponsorPackagesBlock({
  packages = [],
  brandColor = '#635BFF',
  buttonRadius = 12,
  settings,
  onEdit,
  showEditControls = true,
  isLocked = false
}: SponsorPackagesBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const title = settings?.title || 'Sponsorship Opportunities';
  const subtitle = settings?.subtitle || 'Partner with us to gain exclusive exposure to our community of innovators and industry leaders.';

  // Default packages if none provided
  const defaultPackages: SponsorPackage[] = [
    {
      id: 'platinum',
      name: 'Platinum',
      value: 25000,
      color: '#C0C0C0',
      benefits: ['Logo on Website', '3 Speaking Slots', 'VIP Dinner Access', 'Social Media Mentions', 'Premium Placement']
    },
    {
      id: 'gold',
      name: 'Gold',
      value: 15000,
      color: '#FFD700',
      benefits: ['Logo Placement', '2 Speaking Slots', 'Attendee List Access', 'Marketing Materials']
    },
    {
      id: 'silver',
      name: 'Silver',
      value: 10000,
      color: '#A8A8A8',
      benefits: ['Logo Placement', 'Marketing Materials', 'Social Media Mention']
    }
  ];

  const displayPackages = packages.length > 0 ? packages : defaultPackages;

  const getPackageIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('platinum')) return <Crown size={24} />;
    if (n.includes('gold')) return <Star size={24} />;
    if (n.includes('silver')) return <ShieldCheck size={24} />;
    if (n.includes('bronze')) return <Shield size={24} />;
    return <Zap size={24} />;
  };

  return (
    <div
      className="sponsor-packages-block"
      style={{
        position: 'relative',
        padding: '100px 40px',
        backgroundColor: '#FFFFFF',
        width: '100%',
        fontFamily: 'inherit'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .sponsor-packages-block__title {
          font-size: 42px;
          font-weight: 900;
          color: #111827;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }
        .sponsor-packages-block__grid {
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
          gap: 32px;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .sponsor-packages-block {
            padding: 60px 24px !important;
          }
          .sponsor-packages-block__title {
            font-size: 32px;
          }
        }

        @media (max-width: 640px) {
          .sponsor-packages-block__grid {
            grid-template-columns: 1fr;
          }
          .sponsor-packages-block__title {
            font-size: 28px;
          }
        }
      `}</style>
      {/* Edit Module */}
      {isHovered && showEditControls && !isLocked && (
        <EditModule 
          blockName="Sponsorship Packages" 
          onEdit={onEdit} 
        />
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 className="sponsor-packages-block__title">
            {title}
          </h2>
          <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            {subtitle}
          </p>
        </div>

        <div className="sponsor-packages-block__grid">
          {displayPackages.map((pkg) => {
            const isHighlighted = settings?.highlightedPackage === pkg.id || pkg.id === 'gold';
            
            return (
              <div
                key={pkg.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  border: isHighlighted ? `2px solid ${brandColor}` : '1px solid #E5E7EB',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  boxShadow: isHighlighted ? `0 20px 25px -5px ${brandColor}15` : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
                  zIndex: isHighlighted ? 1 : 0
                }}
              >
                {isHighlighted && (
                  <div style={{
                    position: 'absolute',
                    top: '-16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: brandColor,
                    color: '#FFFFFF',
                    padding: '4px 16px',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ marginBottom: '32px' }}>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    borderRadius: '16px', 
                    backgroundColor: `${pkg.color}15`, 
                    color: pkg.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    {getPackageIcon(pkg.name)}
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                    {pkg.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 900, color: '#111827' }}>
                      ${pkg.value.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>
                      / package
                    </span>
                  </div>
                </div>

                <div style={{ flex: 1, marginBottom: '40px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    What's included:
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pkg.benefits.map((benefit, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '12px', fontSize: '15px', color: '#4B5563', lineHeight: '1.4' }}>
                        <div style={{ 
                          marginTop: '2px',
                          width: '18px', 
                          height: '18px', 
                          borderRadius: '50%', 
                          backgroundColor: '#DCFCE7', 
                          color: '#16A34A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => settings?.ctaUrl && window.open(settings.ctaUrl, '_blank')}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: `${buttonRadius}px`,
                    backgroundColor: isHighlighted ? brandColor : '#F3F4F6',
                    color: isHighlighted ? '#FFFFFF' : '#111827',
                    fontWeight: 700,
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isHighlighted ? brandColor : '#E5E7EB';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isHighlighted ? brandColor : '#F3F4F6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {settings?.ctaText || 'Get Started'}
                  <ArrowRight size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
