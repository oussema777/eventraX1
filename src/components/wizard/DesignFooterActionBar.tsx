import { ArrowRight, ChevronDown, RotateCcw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';

export default function DesignFooterActionBar() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const baseRoute = eventId ? `/create/details/${eventId}` : ROUTES.WIZARD_STEP_1;
  const nextRoute = eventId ? `/create/registration/${eventId}` : ROUTES.WIZARD_STEP_1;

  const handleContinue = () => {
    navigate(nextRoute);
  };

  const handleBack = () => {
    navigate(baseRoute);
  };

  return (
    <div 
      className="footer-action-bar fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        borderColor: 'var(--border)',
        boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.2)',
        backgroundColor: 'var(--card)'
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .footer-action-bar-inner { 
            flex-direction: column !important; 
            gap: 1rem !important; 
            padding: 1rem !important;
          }
          .footer-action-bar-left, .footer-action-bar-right, .footer-action-bar-center {
            width: 100% !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }
          .footer-action-bar-left button, .footer-action-bar-right button, .footer-action-bar-center {
            flex: 1 1 auto !important;
            min-width: 120px !important;
            justify-content: center !important;
          }
          .footer-divider { display: none !important; }
        }
      `}</style>
      <div className="footer-action-bar-inner px-10 py-6 flex items-center justify-between max-w-[1440px] mx-auto">
        {/* Left Side */}
        <div className="footer-action-bar-left flex items-center gap-3">
          {/* Skip Design Studio Link */}
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Skip Design Studio →
          </button>
          
          <div className="footer-divider w-px h-6" style={{ backgroundColor: 'var(--border)' }} />
          
          {/* Quick Actions Dropdown */}
          <div className="relative">
            <button
              className="h-11 px-4 rounded-lg border flex items-center gap-2 transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--foreground)'
              }}
            >
              <span className="text-sm">Preview on Device</span>
              <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          </div>

          {/* Save as Template */}
          <button
            className="h-11 px-6 rounded-lg border transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--foreground)'
            }}
          >
            Save as Template
          </button>
        </div>

        {/* Center */}
        <button
          className="footer-action-bar-center flex items-center gap-2 transition-opacity hover:opacity-80"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <RotateCcw size={16} />
          <span className="text-sm">Reset to Default</span>
        </button>

        {/* Right Side */}
        <div className="footer-action-bar-right flex items-center gap-3">
          <button
            onClick={handleBack}
            className="h-11 px-6 rounded-lg border transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--foreground)'
            }}
          >
            Back to Details
          </button>

          <button
            onClick={handleContinue}
            className="h-11 px-6 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontWeight: 600,
              border: 'none'
            }}
          >
            Save & Continue
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
