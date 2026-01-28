import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Rocket, 
  Users, 
  Store, 
  Calendar,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import { useEventStats } from '../hooks/useEventStats';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const { baseStats } = useEventStats(eventId || undefined);

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
              🎉 Your Event is Live!
            </h1>

            {/* Subtitle */}
            <p className="text-xl" style={{ color: '#94A3B8' }}>
              Your event page is now public and ready for registrations.
            </p>
          </div>

          {/* QUICK STATS ROW */}
          <div className="grid grid-cols-3 gap-6 mb-10">
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
              Go to Dashboard Event
            </button>
          </div>

          {/* Success Tip */}
          <div 
            className="mt-8 p-4 rounded-lg flex items-start gap-3"
            style={{ 
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
          >
            <Sparkles size={20} style={{ color: '#8B5CF6', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <p className="text-sm" style={{ color: '#E2E8F0', lineHeight: '1.6' }}>
                <strong style={{ color: '#FFFFFF' }}>Pro Tip:</strong> Share your event page on social media and start engaging with early registrants to build momentum!
              </p>
            </div>
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