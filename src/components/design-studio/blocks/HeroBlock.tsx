import { ArrowRight, Image, Type, Palette } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface HeroBlockProps {
  isLocked?: boolean;
  onEdit?: () => void;
  showEditControls?: boolean;
  brandColor?: string;
  buttonRadius?: number;
  logoUrl?: string;
  event?: {
    name?: string;
    tagline?: string;
    description?: string;
    event_type?: string;
  };
  settings?: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    button1?: { text: string; url: string; visible: boolean };
    button2?: { text: string; url: string; visible: boolean };
  };
  onRegister?: () => void;
}

export default function HeroBlock({
  isLocked = false,
  onEdit,
  showEditControls = true,
  brandColor,
  buttonRadius,
  logoUrl,
  event,
  settings,
  onRegister
}: HeroBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const primaryColor = brandColor || '#635BFF';
  const secondaryColor = '#0B2641'; // Dark Navy default
  const radius = Number.isFinite(buttonRadius) ? buttonRadius : 12;
  
  // Resolve content: Settings > Event Data > Defaults
  const eventTitle = settings?.title || event?.name || t('wizard.designStudio.hero.title');
  const eventSubtitle = settings?.subtitle || event?.tagline || event?.description || t('wizard.designStudio.hero.subtitle');
  const eventTypeLabel = (event?.event_type || t('wizard.designStudio.hero.category')).toUpperCase();
  const bgImage = settings?.backgroundImage;

  // Button 1 Config (Primary)
  const btn1Text = settings?.button1?.text || t('wizard.designStudio.hero.primaryCta');
  const btn1Visible = settings?.button1?.visible !== false; // Default true

  // Button 2 Config (Secondary)
  const btn2Text = settings?.button2?.text || t('wizard.designStudio.hero.secondaryCta');
  const btn2Visible = settings?.button2?.visible !== false; // Default true

  return (
    <div
      style={{
        width: '100%',
        height: '600px',
        background: bgImage ? `url(${bgImage})` : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dark overlay for better text readability on images */}
      {bgImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 0
          }}
        />
      )}

      {/* Edit Module */}
      {isHovered && !isLocked && showEditControls && (
        <EditModule 
          blockName="Hero" 
          onEdit={onEdit} 
          quickActions={[
            { icon: <Image size={16} style={{ color: '#FFFFFF' }} />, label: 'Change Background', onClick: onEdit },
            { icon: <Type size={16} style={{ color: '#FFFFFF' }} />, label: 'Edit Text', onClick: onEdit },
            { icon: <Palette size={16} style={{ color: '#FFFFFF' }} />, label: 'Colors', onClick: onEdit }
          ]}
        />
      )}

      {/* Background Pattern */}
      {!bgImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.1
          }}
        />
      )}

      {/* Content */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '800px' }}>
        {/* Logo or Category Badge */}
        {logoUrl ? (
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <img 
              src={logoUrl} 
              alt="Event Logo" 
              style={{ 
                maxHeight: '80px', 
                maxWidth: '200px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
              }} 
            />
          </div>
        ) : (
          <div
            style={{
              height: '32px',
              padding: '0 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {eventTypeLabel}
          </div>
        )}

        {/* Event Title */}
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '16px',
            textShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
            lineHeight: 1.1
          }}
        >
          {eventTitle}
        </h1>

        {/* Event Subtitle */}
        <p
          style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}
        >
          {eventSubtitle}
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {btn1Visible && (
            <button
              onClick={onRegister}
              style={{
                height: '56px',
                padding: '0 32px',
                backgroundColor: '#FFFFFF',
                borderRadius: `${radius}px`,
                border: 'none',
                fontSize: '16px',
                fontWeight: 700,
                color: primaryColor,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8F7FF';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {btn1Text}
              <ArrowRight size={20} />
            </button>
          )}

          {btn2Visible && (
            <button
              onClick={() => {
                const url = settings?.button2?.url || '#details';
                if (url.startsWith('#')) {
                   // Local scroll or similar (implementation choice)
                } else if (url.startsWith('http')) {
                   window.open(url, '_blank');
                }
              }}
              style={{
                height: '56px',
                padding: '0 32px',
                backgroundColor: 'transparent',
                borderRadius: `${radius}px`,
                border: '2px solid rgba(255, 255, 255, 0.4)',
                fontSize: '16px',
                fontWeight: 700,
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {btn2Text}
            </button>
          )}
        </div>
      </div>

      {/* Lock Overlay for PRO blocks */}
      {isLocked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 15
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '4px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0px 8px 24px rgba(245, 158, 11, 0.3)'
              }}
            >
              🔒
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1D1F', marginBottom: '12px' }}>
              {t('wizard.designStudio.locked.title')}
            </h3>
            <p style={{ fontSize: '16px', color: '#6F767E', marginBottom: '24px' }}>
              {t('wizard.designStudio.locked.subtitle')}
            </p>
            <button
              style={{
                height: '48px',
                padding: '0 32px',
                backgroundColor: '#635BFF',
                borderRadius: '12px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 700,
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {t('wizard.designStudio.locked.cta')}
            </button>
            <p style={{ fontSize: '13px', color: '#9A9FA5', marginTop: '16px' }}>
              {t('wizard.designStudio.locked.note')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}