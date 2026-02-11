import { useState } from 'react';
import { Building2, ExternalLink, MapPin } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface Exhibitor {
  id: string;
  name: string;
  logo?: string;
  boothNumber?: string;
  category?: string;
  website?: string;
}

interface ExhibitorsBlockProps {
  exhibitors?: Exhibitor[];
  brandColor?: string;
  settings?: {
    title?: string;
    subtitle?: string;
  };
  onEdit?: () => void;
  showEditControls?: boolean;
  isLocked?: boolean;
}

export default function ExhibitorsBlock({
  exhibitors = [],
  brandColor = '#635BFF',
  settings,
  onEdit,
  showEditControls = true,
  isLocked = false
}: ExhibitorsBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const title = settings?.title || 'Featured Exhibitors';
  const subtitle = settings?.subtitle || 'Discover the industry leaders participating in our event.';

  return (
    <div
      style={{
        position: 'relative',
        padding: '80px 40px',
        backgroundColor: '#FFFFFF',
        width: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module */}
      {isHovered && showEditControls && !isLocked && (
        <EditModule 
          blockName="Exhibitors" 
          onEdit={onEdit} 
          quickActions={[
            { icon: <Building2 size={16} />, label: 'Edit Content', onClick: onEdit }
          ]}
        />
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#1A1D1F', marginBottom: '16px' }}>{title}</h2>
          <p style={{ fontSize: '16px', color: '#6F767E', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>{subtitle}</p>
        </div>

        {/* Exhibitors Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {exhibitors.length > 0 ? (
            exhibitors.map((exhibitor) => (
              <div
                key={exhibitor.id}
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid #E9EAEB',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '12px', 
                  backgroundColor: '#F4F5F6', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {exhibitor.logo ? (
                    <img src={exhibitor.logo} alt={exhibitor.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
                  ) : (
                    <Building2 style={{ color: '#9A9FA5' }} size={24} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 700, 
                    color: '#1A1D1F', 
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {exhibitor.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {exhibitor.boothNumber && (
                      <span style={{ fontSize: '13px', color: brandColor, fontWeight: 600 }}>
                        Booth {exhibitor.boothNumber}
                      </span>
                    )}
                    {exhibitor.website && (
                      <a
                        href={exhibitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#9A9FA5', display: 'flex' }}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              gridColumn: '1 / -1', 
              padding: '60px 20px', 
              border: '2px dashed #E9EAEB', 
              borderRadius: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#9A9FA5' 
            }}>
              <Building2 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', fontWeight: 600 }}>No exhibitors found</p>
              <p style={{ fontSize: '14px' }}>Add exhibitors in Step 3 to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
