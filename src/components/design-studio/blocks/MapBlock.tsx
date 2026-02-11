import { useState } from 'react';
import { MapPin, Navigation, Map as MapIcon, Crown } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface MapBlockProps {
  brandColor?: string;
  settings?: {
    title?: string;
    subtitle?: string;
    address?: string;
    venueName?: string;
    googleMapsEmbedUrl?: string;
    zoom?: number;
    showInfoCard?: boolean;
  };
  onEdit?: () => void;
  showEditControls?: boolean;
  isLocked?: boolean;
}

export default function MapBlock({
  brandColor = '#635BFF',
  settings,
  onEdit,
  showEditControls = true,
  isLocked = false
}: MapBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const title = settings?.title || 'Location & Venue';
  const subtitle = settings?.subtitle || 'Join us for an unforgettable experience at the heart of the city.';
  const venueName = settings?.venueName || 'Event Venue';
  const address = settings?.address || '123 Event Street, City, Country';
  
  // Default embed URL for a placeholder
  const embedUrl = settings?.googleMapsEmbedUrl;

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        width: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module */}
      {isHovered && showEditControls && !isLocked && (
        <EditModule 
          blockName="Location Map" 
          onEdit={onEdit} 
          quickActions={[
            { icon: <MapPin size={16} />, label: 'Update Address', onClick: onEdit },
            { icon: <Navigation size={16} />, label: 'Embed Map', onClick: onEdit }
          ]}
        />
      )}

      {/* Header Section */}
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '42px', fontWeight: 900, color: '#111827', marginBottom: '16px', letterSpacing: '-0.02em' }}>{title}</h2>
        <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>{subtitle}</p>
      </div>

      {/* Map Content */}
      <div style={{ position: 'relative', height: '550px', width: '100%', backgroundColor: '#F3F4F6' }}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Event Location"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', backgroundColor: '#F9FAFB' }}>
            <MapIcon size={64} style={{ marginBottom: '24px', opacity: 0.15 }} />
            <p style={{ fontWeight: 600 }}>Interactive Map Placeholder</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Click edit to add your Google Maps embed URL.</p>
          </div>
        )}

        {/* Floating Info Card */}
        {settings?.showInfoCard !== false && (
          <div style={{ 
            position: 'absolute', 
            top: '40px', 
            left: '40px', 
            zIndex: 10,
            width: '340px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '16px', 
                backgroundColor: brandColor + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}
            >
              <MapPin size={28} style={{ color: brandColor }} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>{venueName}</h3>
            <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: '1.6', marginBottom: '28px' }}>
              {address}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: brandColor,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: `0 8px 20px ${brandColor}30`
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Navigation size={18} />
              Get Directions
            </a>
          </div>
        )}
      </div>
    </div>
  );
}