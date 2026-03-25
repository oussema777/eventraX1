import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Rocket,
  Users,
  Store,
  Calendar,
  LayoutDashboard,
  Link2,
  Copy,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye
} from 'lucide-react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import { useEventStats } from '../hooks/useEventStats';
import { toast } from 'sonner@2.0.3';

// Confetti component for celebration effect
function ConfettiAnimation() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 50,
      overflow: 'hidden'
    }}>
      {/* Confetti particles */}
      {Array.from({ length: 50 }).map((_, i) => {
        const colors = ['#0684F5', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomLeft = Math.random() * 100;
        const randomDelay = Math.random() * 2;
        const randomDuration = 2 + Math.random() * 2;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '-10px',
              left: `${randomLeft}%`,
              width: '10px',
              height: '10px',
              backgroundColor: randomColor,
              opacity: 0.7,
              animation: `confettiFall ${randomDuration}s linear ${randomDelay}s forwards`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        );
      })}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function EventLiveSuccess() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const { baseStats } = useEventStats(eventId || undefined);

  const previewUrl = eventId ? `${window.location.origin}/event/${eventId}/landing` : '';

  // Hide confetti after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleGoToDashboard = () => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      toast.success('Preview link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleOpenPreview = () => {
    if (eventId) {
      window.open(`/event/${eventId}/landing`, '_blank');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B2641' }}>
      {/* Confetti Animation */}
      {showConfetti && <ConfettiAnimation />}

      {/* Fixed Navigation */}
      <NavbarLoggedIn
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        currentPage="success"
      />

      {/* Main Content - Centered */}
      <main className="flex items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 72px)', paddingTop: '120px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '700px', width: '100%' }}>

          {/* SUCCESS MESSAGE */}
          <div className="text-center mb-10">
            {/* Animated Icon */}
            <div
              className="inline-flex items-center justify-center mb-6"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                animation: 'successPulse 2s ease-in-out infinite'
              }}
            >
              <Rocket
                size={56}
                style={{
                  color: '#FFFFFF',
                  animation: 'rocketShake 1s ease-in-out infinite'
                }}
              />
            </div>

            {/* Title */}
            <h1 className="text-4xl mb-4" style={{ fontWeight: 700, color: '#FFFFFF' }}>
              Your Event Has Been Published!
            </h1>

            {/* Subtitle */}
            <p className="text-lg" style={{ color: '#94A3B8', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' }}>
              Your event is now under review by our team. Once approved, it will appear publicly in Browse Events.
            </p>
          </div>

          {/* REVIEW STATUS BANNER */}
          <div
            className="mb-8 p-5 rounded-xl flex items-center gap-4"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)'
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)'
              }}
            >
              <Clock size={22} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#F59E0B', fontSize: '14px', marginBottom: '2px' }}>
                Pending Admin Approval
              </p>
              <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.5' }}>
                Your event is submitted and awaiting review. You'll be notified once it's approved.
              </p>
            </div>
          </div>

          {/* PREVIEW LINK CARD */}
          {eventId && (
            <div
              className="mb-8 rounded-xl overflow-hidden"
              style={{
                backgroundColor: 'rgba(6, 132, 245, 0.06)',
                border: '1px solid rgba(6, 132, 245, 0.2)'
              }}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(6, 132, 245, 0.15)'
                    }}
                  >
                    <Eye size={18} style={{ color: '#0684F5' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '15px' }}>Event Preview</p>
                    <p style={{ color: '#64748B', fontSize: '12px' }}>Share this link to preview your event before it goes live</p>
                  </div>
                </div>

                {/* URL bar */}
                <div
                  className="flex items-center gap-2 rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '4px'
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2">
                    <Link2 size={14} style={{ color: '#64748B', flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: '13px',
                        color: '#94A3B8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: 'monospace'
                      }}
                    >
                      {previewUrl}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 flex-shrink-0"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: copied ? '#10B981' : '#0684F5',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                  </button>
                </div>

                {/* Open preview button */}
                <button
                  onClick={handleOpenPreview}
                  className="w-full mt-3 flex items-center justify-center gap-2"
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(6, 132, 245, 0.25)',
                    backgroundColor: 'transparent',
                    color: '#0684F5',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <ExternalLink size={14} />
                  Open Event Preview
                </button>
              </div>
            </div>
          )}

          {/* QUICK STATS ROW */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Speakers */}
            <div
              className="p-6 rounded-xl text-center transition-transform hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}
            >
              <div
                className="inline-flex items-center justify-center mb-3"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)'
                }}
              >
                <Users size={24} style={{ color: '#8B5CF6' }} />
              </div>
              <div className="text-3xl mb-1" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                {baseStats.speakers}
              </div>
              <div className="text-sm" style={{ color: '#94A3B8' }}>
                Speakers
              </div>
            </div>

            {/* Exhibitors */}
            <div
              className="p-6 rounded-xl text-center transition-transform hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(6, 132, 245, 0.3)'
              }}
            >
              <div
                className="inline-flex items-center justify-center mb-3"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(6, 132, 245, 0.15)'
                }}
              >
                <Store size={24} style={{ color: '#0684F5' }} />
              </div>
              <div className="text-3xl mb-1" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                {baseStats.exhibitors}
              </div>
              <div className="text-sm" style={{ color: '#94A3B8' }}>
                Exhibitors
              </div>
            </div>

            {/* Sessions */}
            <div
              className="p-6 rounded-xl text-center transition-transform hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <div
                className="inline-flex items-center justify-center mb-3"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)'
                }}
              >
                <Calendar size={24} style={{ color: '#10B981' }} />
              </div>
              <div className="text-3xl mb-1" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                {baseStats.sessions}
              </div>
              <div className="text-sm" style={{ color: '#94A3B8' }}>
                Sessions
              </div>
            </div>
          </div>

          {/* NEXT ACTIONS */}
          <div className="space-y-4">
            {/* Primary Button - Go to Dashboard Event */}
            <button
              onClick={handleGoToDashboard}
              className="w-full h-14 rounded-lg flex items-center justify-center gap-3 transition-all"
              style={{
                background: 'linear-gradient(135deg, #0684F5 0%, #0369C1 100%)',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(6, 132, 245, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(6, 132, 245, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(6, 132, 245, 0.3)';
              }}
            >
              <LayoutDashboard size={20} />
              Go to Event Dashboard
            </button>
          </div>
        </div>
      </main>

      {/* Animations */}
      <style>{`
        @keyframes successPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 12px 40px rgba(16, 185, 129, 0.6);
          }
        }

        @keyframes rocketShake {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
}
