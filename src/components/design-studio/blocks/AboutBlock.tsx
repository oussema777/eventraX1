import { Check, Image, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import EditModule from './EditModule';
import { useI18n } from '../../../i18n/I18nContext';

interface AboutBlockProps {
  showEditControls?: boolean;
  brandColor?: string;
  onEdit?: () => void;
  event?: {
    name?: string;
    tagline?: string;
    description?: string;
    features?: string[];
    image?: string;
  };
}

const COLLAPSED_HEIGHT = 320; // px — roughly 6-7 lines of text + heading

export default function AboutBlock({ showEditControls = true, brandColor, onEdit, event }: AboutBlockProps) {
  const { t, tList } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const accentColor = brandColor || '#635BFF';

  // Check if content overflows the collapsed height
  useEffect(() => {
    if (contentRef.current) {
      setNeedsTruncation(contentRef.current.scrollHeight > COLLAPSED_HEIGHT + 40);
    }
  }, [event?.description, event?.tagline, event?.features]);
  const heading = event?.name
    ? t('wizard.designStudio.about.headingWithName', { name: event.name })
    : t('wizard.designStudio.about.heading');
  const primaryText = event?.description || t('wizard.designStudio.about.primaryText');
  const secondaryText = event?.tagline || t('wizard.designStudio.about.secondaryText');
  
  // Use event features if available, otherwise show no features (empty) instead of static defaults
  const features = event?.features || [];

  return (
    <div
      style={{ padding: 'clamp(40px, 8vw, 80px) clamp(16px, 5vw, 40px)', backgroundColor: '#FFFFFF', position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module */}
      {isHovered && showEditControls && (
        <EditModule
          blockName={t('wizard.designStudio.about.blockName')}
          onEdit={onEdit}
          quickActions={[
            {
              icon: <Image size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.about.actions.changeImage'),
              onClick: onEdit
            },
            {
              icon: <FileText size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.about.actions.editContent'),
              onClick: onEdit
            }
          ]}
        />
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
          gap: 'clamp(24px, 5vw, 60px)',
          maxWidth: '1200px',
          margin: '0 auto',
          alignItems: 'stretch'
        }}
      >
        {/* Image */}
        <div style={{ display: 'flex', minHeight: '300px' }}>
          {event?.image ? (
            <img
              src={event.image}
              alt="Event About"
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '16px',
                objectFit: 'cover',
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)'
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
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
          )}
        </div>

        {/* Content */}
        <div>
          <div
            ref={contentRef}
            style={{
              maxHeight: needsTruncation && !isExpanded ? `${COLLAPSED_HEIGHT}px` : undefined,
              overflow: 'hidden',
              position: 'relative',
              transition: 'max-height 0.4s ease'
            }}
          >
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

            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#1A1D1F', marginBottom: '20px' }}>
              {heading}
            </h2>

            {primaryText.includes('<') ? (
              <div
                style={{
                  fontSize: '16px',
                  color: '#6F767E',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(primaryText, {
                    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'p', 'div'],
                  })
                }}
              />
            ) : (
              <p
                style={{
                  fontSize: '16px',
                  color: '#6F767E',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                  whiteSpace: 'pre-line'
                }}
              >
                {primaryText}
              </p>
            )}

            <p
              style={{
                fontSize: '16px',
                color: '#6F767E',
                lineHeight: 1.6,
                marginBottom: '24px',
                whiteSpace: 'pre-line'
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

            {/* Fade gradient overlay when collapsed */}
            {needsTruncation && !isExpanded && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '80px',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
                  pointerEvents: 'none'
                }}
              />
            )}
          </div>

          {/* Read More / Show Less button */}
          {needsTruncation && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '16px',
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: accentColor,
                backgroundColor: `${accentColor}10`,
                border: `1px solid ${accentColor}25`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${accentColor}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${accentColor}10`;
              }}
            >
              {isExpanded ? t('wizard.designStudio.about.showLess', { defaultValue: 'Show Less' }) : t('wizard.designStudio.about.readMore', { defaultValue: 'Read More' })}
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
