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
        padding: '100px 40px',
        backgroundColor: '#F9FAFB',
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '32px' 
        }}>
          {exhibitors.length > 0 ? (
            exhibitors.map((exhibitor) => (
              <div
                key={exhibitor.id}
                style={{
                  padding: '0',
                  borderRadius: '24px',
                  border: '1px solid #F3F4F6',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = brandColor + '40';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = '#F3F4F6';
                }}
              >
                {/* Logo Section */}
                <div style={{ 
                  height: '180px',
                  backgroundColor: '#F9FAFB',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '40px',
                  borderBottom: '1px solid #F3F4F6',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Subtle Background Pattern/Icon */}
                  <Building2 
                    style={{ 
                      position: 'absolute', 
                      right: '-10px', 
                      bottom: '-10px', 
                      opacity: 0.03, 
                      width: '120px', 
                      height: '120px',
                      transform: 'rotate(-15deg)'
                    }} 
                  />
                  
                  {exhibitor.logo ? (
                    <img 
                      src={exhibitor.logo} 
                      alt={exhibitor.name} 
                      style={{ 
                        maxHeight: '100%', 
                        maxWidth: '100%', 
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))'
                      }} 
                    />
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      color: brandColor
                    }}>
                      <Building2 size={40} />
                    </div>
                  )}

                  {/* Booth Badge */}
                  {exhibitor.boothNumber && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      padding: '6px 12px',
                      borderRadius: '100px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      zIndex: 2
                    }}>
                      <MapPin size={12} className="text-[#6B7280]" />
                      BOOTH {exhibitor.boothNumber}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '16px' }}>
                    {exhibitor.category && (
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        color: brandColor, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        {exhibitor.category}
                      </span>
                    )}
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: 800, 
                      color: '#111827', 
                      lineHeight: '1.2',
                      marginBottom: '8px'
                    }}>
                      {exhibitor.name}
                    </h3>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                    {exhibitor.website ? (
                      <a
                        href={exhibitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: '13px', 
                          fontWeight: 600, 
                          color: '#6B7280', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          textDecoration: 'none',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = brandColor}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Website
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Official Exhibitor</span>
                    )}
                    
                    <button style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: brandColor + '10',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: brandColor,
                      transition: 'all 0.2s'
                    }}>
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              gridColumn: '1 / -1', 
              padding: '80px 20px', 
              border: '2px dashed #E5E7EB', 
              borderRadius: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#9CA3AF',
              backgroundColor: '#F9FAFB'
            }}>
              <Building2 size={64} style={{ marginBottom: '20px', opacity: 0.2 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#4B5563', marginBottom: '8px' }}>No exhibitors found</h3>
              <p style={{ fontSize: '14px', maxWidth: '300px', textAlign: 'center', lineHeight: '1.5' }}>
                Exhibitors you add during the registration setup will automatically appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
