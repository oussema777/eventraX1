import { useState, useEffect } from 'react';
import { Timer, Bell, Calendar, Crown } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface CountdownBlockProps {
  brandColor?: string;
  targetDate?: string;
  settings?: {
    title?: string;
    subtitle?: string;
    style?: 'minimal' | 'cards' | 'bold';
    showLabels?: boolean;
    buttonText?: string;
    buttonUrl?: string;
  };
  onEdit?: () => void;
  showEditControls?: boolean;
  isLocked?: boolean;
}

export default function CountdownBlock({
  brandColor = '#635BFF',
  targetDate,
  settings,
  onEdit,
  showEditControls = true,
  isLocked = false
}: CountdownBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calcTime = () => {
      // If no target date, show a default 30 days for preview
      const target = targetDate ? new Date(targetDate).getTime() : new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calcTime());
    const timer = setInterval(() => setTimeLeft(calcTime()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const title = settings?.title || 'Counting Down the Minutes';
  const subtitle = settings?.subtitle || 'Secure your spot before the clock runs out! This event is filling up fast.';

  const renderTimeUnit = (value: number, label: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div 
        style={{ 
          width: 'clamp(70px, 10vw, 110px)',
          height: 'clamp(70px, 10vw, 110px)',
          backgroundColor: '#FFFFFF',
          color: brandColor,
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 900,
          marginBottom: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.02)',
          fontVariantNumeric: 'tabular-nums'
        }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280' }}>
        {label}
      </span>
    </div>
  );

  return (
    <div
      style={{
        position: 'relative',
        padding: 'clamp(48px, 8vw, 100px) clamp(16px, 5vw, 40px)',
        backgroundColor: '#F9FAFB',
        width: '100%',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background decoration */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '-100px', 
          right: '-100px', 
          width: '400px', 
          height: '400px', 
          opacity: 0.03, 
          pointerEvents: 'none',
          color: brandColor 
        }}
      >
        <Timer size={400} />
      </div>

      {/* Edit Module */}
      {isHovered && showEditControls && !isLocked && (
        <EditModule 
          blockName="Countdown" 
          onEdit={onEdit} 
          quickActions={[
            { icon: <Calendar size={16} />, label: 'Set Date', onClick: onEdit },
            { icon: <Bell size={16} />, label: 'Style', onClick: onEdit }
          ]}
        />
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 900, color: '#111827', marginBottom: '16px', letterSpacing: '-0.02em' }}>{title}</h2>
        <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '64px', maxWidth: '600px', margin: '0 auto 64px', lineHeight: '1.6' }}>{subtitle}</p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(8px, 2vw, 24px)', marginBottom: '64px', flexWrap: 'wrap' }}>
          {renderTimeUnit(timeLeft.days, 'Days')}
          <div style={{ fontSize: '32px', fontWeight: 300, color: '#D1D5DB', marginTop: '-20px' }}>:</div>
          {renderTimeUnit(timeLeft.hours, 'Hours')}
          <div style={{ fontSize: '32px', fontWeight: 300, color: '#D1D5DB', marginTop: '-20px' }}>:</div>
          {renderTimeUnit(timeLeft.minutes, 'Mins')}
          <div style={{ fontSize: '32px', fontWeight: 300, color: '#D1D5DB', marginTop: '-20px' }}>:</div>
          {renderTimeUnit(timeLeft.seconds, 'Secs')}
        </div>

        {settings?.buttonText && (
          <button
            style={{ 
              padding: '18px 40px',
              borderRadius: '16px',
              backgroundColor: brandColor,
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '18px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: `0 15px 30px -5px ${brandColor}40`
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {settings.buttonText}
          </button>
        )}
      </div>
    </div>
  );
}