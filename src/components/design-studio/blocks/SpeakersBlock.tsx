import { Linkedin, Twitter, Globe, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import EditModule from './EditModule';
import { useI18n } from '../../../i18n/I18nContext';

interface SpeakerCard {
  name: string;
  title?: string;
  company?: string;
  avatarUrl?: string;
  color?: string;
}

interface SpeakersBlockProps {
  showEditControls?: boolean;
  brandColor?: string;
  onEdit?: () => void;
  speakers?: SpeakerCard[];
}

const getInitials = (name: string, fallback = 'SP') => {
  const parts = name.split(' ').filter(Boolean);
  if (!parts.length) return fallback;
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || '';
  return `${first}${second}`.toUpperCase();
};

export default function SpeakersBlock({ showEditControls = true, brandColor, onEdit, speakers: speakerData }: SpeakersBlockProps) {
  const { t, tList } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const accentColor = brandColor || '#635BFF';
  const fallbackSpeakers = tList<any>('wizard.designStudio.speakers.samples', []);
  // Use real data if available (even if empty), otherwise fallback to samples only if undefined
  const speakers = speakerData !== undefined ? speakerData : fallbackSpeakers;

  return (
    <div
      style={{ padding: '80px 40px', backgroundColor: '#FFFFFF', position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module */}
      {isHovered && showEditControls && (
        <EditModule
          blockName={t('wizard.designStudio.speakers.blockName')}
          onEdit={onEdit}
          quickActions={[
            {
              icon: <UserPlus size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.speakers.actions.add'),
              onClick: onEdit
            },
            {
              icon: <Users size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.speakers.actions.manage'),
              onClick: onEdit
            }
          ]}
        />
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#1A1D1F', marginBottom: '12px' }}>
            {t('wizard.designStudio.speakers.title')}
          </h2>
          <p style={{ fontSize: '16px', color: '#6F767E' }}>
            {t('wizard.designStudio.speakers.subtitle')}
          </p>
        </div>

        {/* Speakers Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}
        >
          {speakers.map((speaker, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#FAFBFC',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0, 0, 0, 0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: speaker.color || '#E0E7FF',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  margin: '0 auto 20px',
                  overflow: 'hidden'
                }}
              >
                {speaker.avatarUrl ? (
                  <img src={speaker.avatarUrl} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (speaker as any).avatar || getInitials(speaker.name, t('wizard.designStudio.speakers.initialsFallback'))
                )}
              </div>

              {/* Name */}
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A1D1F', marginBottom: '8px' }}>
                {speaker.name}
              </div>

              {/* Title */}
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#6F767E', marginBottom: '4px' }}>
                {speaker.title}
              </div>

              {/* Company */}
              {speaker.company && (
                <div style={{ fontSize: '13px', color: '#9A9FA5', marginBottom: '16px' }}>
                  {t('wizard.designStudio.speakers.companyAt', { company: speaker.company })}
                </div>
              )}

              {/* Social Links */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {[Linkedin, Twitter, Globe].map((Icon, iconIdx) => (
                  <button
                    key={iconIdx}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = accentColor;
                      const icon = e.currentTarget.querySelector('svg');
                      if (icon) (icon as any).style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      const icon = e.currentTarget.querySelector('svg');
                      if (icon) (icon as any).style.color = '#6F767E';
                    }}
                  >
                    <Icon size={14} style={{ color: '#6F767E' }} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
