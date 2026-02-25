import { useState, useEffect } from 'react';
import { Users, Calendar, Mic, Store, ArrowRight, Check, Heart, Sparkles, Ticket } from 'lucide-react';

interface LandingPageNavbarProps {
  activeSections: {
    attendees?: boolean;
    exhibitors?: boolean;
    speakers?: boolean;
    agenda?: boolean;
    sponsors?: boolean;
    packages?: boolean;
    tickets?: boolean;
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
        top: 0, 
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
          className="logo-container"
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
                <Calendar size={18} className="nav-icon" />
                <span className="nav-label">Agenda</span>
              </button>
            )}
            {activeSections.speakers && (
              <button onClick={() => onNavigate('speakers')} className="nav-item">
                <Mic size={18} className="nav-icon" />
                <span className="nav-label">Speakers</span>
              </button>
            )}
            {activeSections.exhibitors && (
              <button onClick={() => onNavigate('exhibitors')} className="nav-item">
                <Store size={18} className="nav-icon" />
                <span className="nav-label">Exhibitors</span>
              </button>
            )}
            {activeSections.sponsors && (
              <button onClick={() => onNavigate('sponsors')} className="nav-item">
                <Heart size={18} className="nav-icon" />
                <span className="nav-label">Sponsors</span>
              </button>
            )}
            {activeSections.packages && (
              <button onClick={() => onNavigate('packages')} className="nav-item">
                <Sparkles size={18} className="nav-icon" />
                <span className="nav-label">Packages</span>
              </button>
            )}
            {activeSections.tickets && (
              <button onClick={() => onNavigate('tickets')} className="nav-item">
                <Ticket size={18} className="nav-icon" />
                <span className="nav-label">Tickets</span>
              </button>
            )}
            {activeSections.attendees && (
              <button onClick={() => onNavigate('attendees')} className="nav-item">
                <Sparkles size={18} className="nav-icon" />
                <span className="nav-label">B2B Networking</span>
              </button>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="action-container" style={{ padding: '0 24px', flexShrink: 0, backgroundColor: '#FFFFFF' }}>
          {isRegistered ? (
            <div
              className="action-btn"
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
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                cursor: 'default',
                transition: 'height 0.3s ease'
              }}
            >
              <Check size={18} />
              <span className="btn-text-mobile">Registered</span>
            </div>
          ) : (
            <button
              onClick={onRegister}
              className="register-btn action-btn"
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
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 4px 12px ${brandColor}40`,
                transition: 'all 0.3s ease'
              }}
            >
              <span className="btn-text-mobile">Register</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
      <style>{`
        .nav-icon {
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
            height: 56px !important;
          }
          .logo-container {
            padding: 0 12px !important;
          }
          .logo-container img {
            height: 24px !important;
            max-width: 90px !important;
          }
          .logo-container div {
            font-size: 15px !important;
          }
          .landing-navbar-links {
            padding: 0 4px !important;
            gap: 2px !important;
          }
          .nav-item {
            padding: 0 12px !important;
            gap: 0 !important;
            font-size: 13px !important;
          }
          .nav-label {
            display: none !important;
          }
          .nav-icon {
            display: block !important;
          }
          .action-container {
            padding: 0 12px !important;
          }
          .action-btn {
            padding: 0 !important;
            width: 36px !important;
            height: 36px !important;
            border-radius: 50% !important;
            gap: 0 !important;
          }
          .btn-text-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}