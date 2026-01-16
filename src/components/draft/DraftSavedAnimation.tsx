import { Save } from 'lucide-react';

export default function DraftSavedAnimation() {
  return (
    <div className="relative mb-8 flex justify-center">
      {/* Animated Save Icon */}
      <div 
        className="relative w-30 h-30 rounded-full flex items-center justify-center animate-scale-in"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        <Save size={64} style={{ color: 'white', strokeWidth: 2 }} />
        
        {/* Ripple Effect */}
        <div 
          className="absolute inset-0 rounded-full animate-ripple"
          style={{ 
            border: '3px solid var(--primary)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 rounded-full animate-ripple"
          style={{ 
            border: '3px solid var(--primary)',
            opacity: 0,
            animationDelay: '0.5s'
          }}
        />
      </div>

      <style>{`
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

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-ripple {
          animation: ripple 1.5s ease-out infinite;
        }
      `}</style>
    </div>
  );
}
