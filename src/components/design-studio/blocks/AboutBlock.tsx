import { Check, Image, FileText } from 'lucide-react';
import { useState } from 'react';
import EditModule from './EditModule';
import { useI18n } from '../../../i18n/I18nContext';

interface AboutBlockProps {
  showEditControls?: boolean;
  brandColor?: string;
  event?: {
    name?: string;
    tagline?: string;
    description?: string;
    features?: string[];
  };
}

export default function AboutBlock({ showEditControls = true, brandColor, event }: AboutBlockProps) {
  const { t, tList } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const accentColor = brandColor || '#635BFF';
  const heading = event?.name
    ? t('wizard.designStudio.about.headingWithName', { name: event.name })
    : t('wizard.designStudio.about.heading');
  const primaryText = event?.description || t('wizard.designStudio.about.primaryText');
  const secondaryText = event?.tagline || t('wizard.designStudio.about.secondaryText');
  
  // Use event features if available, otherwise show no features (empty) instead of static defaults
  const features = event?.features || [];

  return (
    <div
      style={{ padding: '80px 40px', backgroundColor: '#FFFFFF', position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module */}
      {isHovered && showEditControls && (
        <EditModule
          blockName={t('wizard.designStudio.about.blockName')}
          quickActions={[
            {
              icon: <Image size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.about.actions.changeImage')
            },
            {
              icon: <FileText size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.about.actions.editContent')
            }
          ]}
        />
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '60px',
          maxWidth: '1200px',
          margin: '0 auto',
          alignItems: 'center'
        }}
      >
        {/* Image */}
        <div>
          <div
            style={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}
          >
            {t('wizard.designStudio.about.imagePlaceholder')}
          </div>
        </div>

        {/* Content */}
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: accentColor,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px'
            }}
          >
            {t('wizard.designStudio.about.eyebrow')}
          </div>

          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#1A1D1F', marginBottom: '20px' }}>
            {heading}
          </h2>

          <p
            style={{
              fontSize: '16px',
              color: '#6F767E',
              lineHeight: 1.6,
              marginBottom: '16px'
            }}
          >
            {primaryText}
          </p>

          <p
            style={{
              fontSize: '16px',
              color: '#6F767E',
              lineHeight: 1.6,
              marginBottom: '24px'
            }}
          >
            {secondaryText}
          </p>

          {/* Feature List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: `${accentColor}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${accentColor}30`
                  }}
                >
                  <Check size={20} style={{ color: accentColor }} />
                </div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#1A1D1F', paddingTop: '10px' }}>
                  {feature}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
