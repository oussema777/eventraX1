import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SuccessAnimation() {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number; color: string }>>([]);

  useEffect(() => {
    // Generate confetti particles
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: ['#00D9FF', '#FF6B35', '#FF006B', '#FFD700', '#00FF9F'][Math.floor(Math.random() * 5)]
    }));
    setConfetti(particles);
  }, []);

  return (
    <div className="relative mb-8">
      {/* Confetti Particles */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-fall"
          style={{
            left: `${particle.left}%`,
            top: '-20px',
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            opacity: 0.8
          }}
        />
      ))}

      {/* Success Checkmark */}
      <div 
        className="relative w-30 h-30 rounded-full flex items-center justify-center animate-scale-in"
        style={{ backgroundColor: 'var(--success)' }}
      >
        <Check size={64} style={{ color: 'white', strokeWidth: 3 }} />
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(600px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fall {
          animation: fall linear forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
