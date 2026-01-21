import { useState, useEffect } from 'react';
import { Users, Calendar, Mic, Store, ArrowRight, Check } from 'lucide-react';

interface LandingPageNavbarProps {
  activeSections: {
    attendees?: boolean;
    exhibitors?: boolean;
    speakers?: boolean;
    agenda?: boolean;
  };
  brandColor?: string;
  logoUrl?: string;
  isRegistered?: boolean;
  onNavigate: (section: string) => void;
  onRegister: () => void;
}

export default function LandingPageNavbar({ activeSections, brandColor = '#635BFF', logoUrl, isRegistered = false, onNavigate, onRegister }: LandingPageNavbarProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Threshold: 10px to trigger "stuck" state
      setIsSticky(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'sticky',
        top: '72px', // Always stick below the 72px main navbar
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        boxShadow: isSticky ? '0 4px 20px rgba(0,0,0,0.08)' : 'none'
      }}
    >
      <div className="landing-navbar-inner" style={{ maxWidth: '1200px', margin: '0 auto', height: isSticky ? '56px' : '72px', transition: 'height 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo / Home */}
        <div 
          onClick={() => onNavigate('landing')}
          style={{ padding: '0 24px', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ height: isSticky ? '28px' : '32px', maxWidth: '120px', objectFit: 'contain', transition: 'height 0.3s ease' }} />
          ) : (
            <div style={{ fontWeight: 800, fontSize: isSticky ? '16px' : '18px', color: '#111827', letterSpacing: '-0.02em', transition: 'font-size 0.3s ease' }}>Eventra</div>
          )}
        </div>

        {/* Navigation Links - Scrollable Container */}
        <div className="landing-navbar-scroll-area" style={{ flex: 1, overflowX: 'auto', display: 'flex', alignItems: 'center', height: '100%', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="landing-navbar-links" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '0 12px' }}>
            {activeSections.agenda && (
              <button onClick={() => onNavigate('agenda')} className="nav-item">
                <Calendar size={16} />
                <span className={isSticky ? 'hidden-text' : ''}>Agenda</span>
              </button>
            )}
            {activeSections.speakers && (
              <button onClick={() => onNavigate('speakers')} className="nav-item">
                <Mic size={16} />
                <span className={isSticky ? 'hidden-text' : ''}>Speakers</span>
              </button>
            )}
            {activeSections.exhibitors && (
              <button onClick={() => onNavigate('exhibitors')} className="nav-item">
                <Store size={16} />
                <span className={isSticky ? 'hidden-text' : ''}>Exhibitors</span>
              </button>
            )}
            {activeSections.attendees && (
              <button onClick={() => onNavigate('attendees')} className="nav-item">
                <Users size={16} />
                <span className={isSticky ? 'hidden-text' : ''}>Attendees</span>
              </button>
            )}
          </div>
        </div>

        {/* Action */}
        <div style={{ padding: '0 24px', flexShrink: 0, backgroundColor: '#FFFFFF' }}>
          {isRegistered ? (
            <div
              style={{
                height: isSticky ? '36px' : '40px',
                padding: '0 20px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                cursor: 'default',
                transition: 'height 0.3s ease'
              }}
            >
              <Check size={16} />
              <span className={isSticky ? 'hidden-text' : ''}>Registered</span>
            </div>
          ) : (
            <button
              onClick={onRegister}
              className="register-btn"
              style={{
                height: isSticky ? '36px' : '40px',
                padding: '0 20px',
                backgroundColor: brandColor,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: `0 4px 12px ${brandColor}40`,
                transition: 'all 0.3s ease'
              }}
            >
              <span>Register</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
      <style>{`
        .hidden-text {
          display: none;
        }
        .landing-navbar-scroll-area::-webkit-scrollbar {
          display: none;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 36px;
          padding: 0 16px;
          border-radius: 18px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          color: #4B5563;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .nav-item:hover {
          background-color: rgba(0, 0, 0, 0.04);
          color: #111827;
        }

        .nav-item:active {
          transform: scale(0.96);
        }

        .register-btn:active {
          transform: scale(0.96);
        }

        @media (max-width: 768px) {
          .landing-navbar-inner {
            padding: 0 !important;
          }
          .landing-navbar-links {
            padding: 0 16px !important;
            gap: 4px !important;
          }
          .nav-item span {
            /* Keep text visible on mobile for clarity, but maybe smaller? */
          }
        }
      `}</style>
    </div>
  );
}