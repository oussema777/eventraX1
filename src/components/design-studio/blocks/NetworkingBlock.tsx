import { useState } from 'react';
import { Users, Handshake, MessageSquare, Zap, ArrowRight } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface NetworkingBlockProps {
  brandColor?: string;
  buttonRadius?: number;
  settings?: {
    title?: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    showStats?: boolean;
  };
  onEdit?: () => void;
  showEditControls?: boolean;
  isLocked?: boolean;
  onNavigate?: () => void;
}

export default function NetworkingBlock({
  brandColor = '#635BFF',
  buttonRadius = 12,
  settings,
  onEdit,
  showEditControls = true,
  isLocked = false,
  onNavigate
}: NetworkingBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const title = settings?.title || 'Unlock High-Value B2B Connections';
  const subtitle = settings?.subtitle || 'AI-Powered Matchmaking & 1-on-1 Meetings';
  const description = settings?.description || 'Our platform facilitates meaningful business relationships. Browse the attendee list, identify key stakeholders, and schedule meetings before the event even starts.';
  const ctaText = settings?.ctaText || 'Explore Networking Center';

  const stats = [
    { icon: <Users size={20} />, label: 'Participants', value: '500+' },
    { icon: <Handshake size={20} />, label: 'Meetings', value: '200+' },
    { icon: <Zap size={20} />, label: 'Match Rate', value: '85%' }
  ];

  return (
    <div
      className="networking-block"
      style={{
        position: 'relative',
        padding: '100px 40px',
        backgroundColor: '#0B2641',
        width: '100%',
        color: '#FFFFFF',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .networking-block__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .networking-block__title {
          font-size: 48px;
          font-weight: 900;
          color: #FFFFFF;
          margin-bottom: 24px;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .networking-block__stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .networking-block {
            padding: 60px 24px !important;
          }
          .networking-block__grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .networking-block__title {
            font-size: 36px;
          }
        }

        @media (max-width: 640px) {
          .networking-block__stats {
            grid-template-columns: 1fr;
          }
          .networking-block__title {
            font-size: 28px;
          }
        }
      `}</style>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: `radial-gradient(circle, ${brandColor}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '300px', height: '300px', background: `radial-gradient(circle, ${brandColor}10 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Edit Module */}
      {isHovered && showEditControls && !isLocked && (
        <EditModule 
          blockName="B2B Networking" 
          onEdit={onEdit} 
        />
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="networking-block__grid">
          
          {/* Left Side: Content */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', backgroundColor: `${brandColor}20`, color: brandColor, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>
              <MessageSquare size={14} />
              Networking Live
            </div>
            
            <h2 className="networking-block__title">
              {title}
            </h2>
            
            <p style={{ fontSize: '20px', fontWeight: 600, color: brandColor, marginBottom: '16px' }}>
              {subtitle}
            </p>
            
            <p style={{ fontSize: '18px', color: '#94A3B8', lineHeight: '1.7', marginBottom: '40px' }}>
              {description}
            </p>

            <button
              onClick={() => onNavigate?.()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '18px 36px',
                borderRadius: `${buttonRadius}px`,
                backgroundColor: brandColor,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 15px 30px -5px ${brandColor}40`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 20px 40px -5px ${brandColor}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 15px 30px -5px ${brandColor}40`;
              }}
            >
              {ctaText}
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Right Side: Stats / Visual */}
          <div className="networking-block__stats">
            {stats.map((stat, idx) => (
              <div 
                key={idx}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '24px',
                  padding: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = `${brandColor}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: `${brandColor}15`, color: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
            
            {/* CTA Box */}
            <div 
              style={{
                background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
                borderRadius: '24px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={() => onNavigate?.()}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Zap size={20} fill="currentColor" />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Ready to network?</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>Join the community</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
