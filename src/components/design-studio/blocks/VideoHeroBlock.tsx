import { useState } from 'react';
import { Play, ArrowRight, Video, Crown } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface VideoHeroBlockProps {
  brandColor?: string;
  settings?: {
    title?: string;
    subtitle?: string;
    videoUrl?: string;
    videoType?: 'upload' | 'youtube' | 'vimeo';
    overlayOpacity?: number;
    buttonText?: string;
  };
  onEdit?: () => void;
  showEditControls?: boolean;
  isLocked?: boolean;
}

export default function VideoHeroBlock({
  brandColor = '#635BFF',
  settings,
  onEdit,
  showEditControls = true,
  isLocked = false
}: VideoHeroBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const title = settings?.title || 'Experience the Future of Events';
  const subtitle = settings?.subtitle || 'Join thousands of innovators for a three-day journey of discovery, connection, and growth.';
  
  // Default video if none provided
  const videoUrl = settings?.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-businessmen-and-businesswomen-in-a-meeting-room-4840-large.mp4';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '700px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#000000'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          src={videoUrl}
        />
        {/* Gradient Overlay */}
        <div 
          style={{ 
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)'
          }}
        />
      </div>

      {/* Edit Module */}
      {isHovered && showEditControls && !isLocked && (
        <EditModule 
          blockName="Video Hero" 
          onEdit={onEdit} 
          quickActions={[
            { icon: <Video size={16} />, label: 'Change Video', onClick: onEdit },
            { icon: <ArrowRight size={16} />, label: 'Edit Content', onClick: onEdit }
          ]}
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', padding: '0 40px', textAlign: 'center', color: '#FFFFFF' }}>
        <div 
          style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            border: '2px solid rgba(255, 255, 255, 0.3)', 
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            margin: '0 auto 40px',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Play size={32} fill="white" style={{ marginLeft: '4px' }} />
        </div>

        <h1 style={{ fontSize: '64px', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
          {title}
        </h1>
        
        <p style={{ fontSize: '22px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px', lineHeight: '1.6', fontWeight: 500 }}>
          {subtitle}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
          <button
            style={{ 
              padding: '20px 40px',
              borderRadius: '18px',
              backgroundColor: brandColor,
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '18px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: `0 20px 40px ${brandColor}40`
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {settings?.buttonText || 'Register Now'}
            <ArrowRight size={20} />
          </button>
          
          <button style={{ 
            padding: '20px 40px',
            borderRadius: '18px',
            backgroundColor: 'transparent',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '18px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            View Schedule
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
        <span>Scroll</span>
        <div style={{ width: '2px', height: '48px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '100px', overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '50%', backgroundColor: '#FFFFFF', borderRadius: '100px' }} className="animate-bounce" />
        </div>
      </div>
    </div>
  );
}