import { ArrowRight, Edit2, Image, Type, Palette } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';

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
  onRegister
}: HeroBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const primaryColor = brandColor || '#635BFF';
  const secondaryColor = '#0B2641'; // Dark Navy default
  const radius = Number.isFinite(buttonRadius) ? buttonRadius : 12;
  const eventTitle = event?.name || t('wizard.designStudio.hero.title');
  const eventSubtitle = event?.tagline || event?.description || t('wizard.designStudio.hero.subtitle');
  const eventTypeLabel = (event?.event_type || t('wizard.designStudio.hero.category')).toUpperCase();

  return (
    <div
      style={{
        width: '100%',
        height: '600px',
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module - Shows on hover */}
      {isHovered && !isLocked && showEditControls && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 20,
            display: 'flex',
            gap: '8px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <button
            onClick={onEdit}
            title={t('wizard.designStudio.hero.actions.edit')}
            style={{
              height: '36px',
              padding: '0 14px',
              backgroundColor: 'rgba(11, 38, 65, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = primaryColor;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(11, 38, 65, 0.95)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Edit2 size={14} />
            {t('wizard.designStudio.hero.actions.editLabel')}
          </button>
          
          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              title={t('wizard.designStudio.hero.actions.changeBackground')}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(11, 38, 65, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(11, 38, 65, 0.95)';
              }}
            >
              <Image size={16} style={{ color: '#FFFFFF' }} />
            </button>
            <button
              title={t('wizard.designStudio.hero.actions.editText')}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(11, 38, 65, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(11, 38, 65, 0.95)';
              }}
            >
              <Type size={16} style={{ color: '#FFFFFF' }} />
            </button>
            <button
              title={t('wizard.designStudio.hero.actions.changeColors')}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(11, 38, 65, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(11, 38, 65, 0.95)';
              }}
            >
              <Palette size={16} style={{ color: '#FFFFFF' }} />
            </button>
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.1
        }}
      />

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
            {t('wizard.designStudio.hero.primaryCta')}
            <ArrowRight size={20} />
          </button>

          <button
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
            {t('wizard.designStudio.hero.secondaryCta')}
          </button>
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
