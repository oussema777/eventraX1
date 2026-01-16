import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
}

export default function SuccessToast({ message, isVisible, onHide }: SuccessToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onHide, 300); // Wait for fade out animation
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible && !show) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 transition-all duration-300"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(10px)'
      }}
    >
      <div 
        className="flex items-center gap-3 px-5 py-3 rounded-lg"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #E5E7EB'
        }}
      >
        <div 
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
        >
          <CheckCircle size={14} style={{ color: 'var(--success)' }} />
        </div>
        <span 
          className="text-sm"
          style={{ color: '#0B2641', fontWeight: 600 }}
        >
          {message}
        </span>
      </div>
    </div>
  );
}
