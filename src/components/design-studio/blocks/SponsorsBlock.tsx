import { useState } from 'react';
import { Building2, Plus, ExternalLink, Crown } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
  tier?: 'platinum' | 'gold' | 'silver' | 'bronze';
}

interface SponsorsBlockProps {
  sponsors?: Sponsor[];
  brandColor?: string;
  settings?: {
    title?: string;
    subtitle?: string;
    layout?: 'grid' | 'rows';
    showBecomeSponsor?: boolean;
    becomeSponsorText?: string;
    becomeSponsorUrl?: string;
  };
  onEdit?: () => void;
  showEditControls?: boolean;
  isLocked?: boolean;
}

export default function SponsorsBlock({
  sponsors = [],
  brandColor = '#635BFF',
  settings,
  onEdit,
  showEditControls = true,
  isLocked = false
}: SponsorsBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const title = settings?.title || 'Our Official Partners';
  const subtitle = settings?.subtitle || 'Supported by leading organizations committed to innovation and excellence.';
  
  // Group sponsors by tier
  const platinumSponsors = sponsors.filter(s => s.tier === 'platinum');
  const goldSponsors = sponsors.filter(s => s.tier === 'gold');
  const otherSponsors = sponsors.filter(s => !s.tier || (s.tier !== 'platinum' && s.tier !== 'gold'));

  const renderSponsorGrid = (items: Sponsor[], size: 'lg' | 'md' | 'sm') => {
    if (items.length === 0) return null;
    
    const dimensions = {
      lg: { height: '140px', width: '260px' },
      md: { height: '100px', width: '200px' },
      sm: { height: '80px', width: '160px' }
    }[size];

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', marginBottom: '48px' }}>
        {items.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.website || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              height: dimensions.height, 
              width: dimensions.width,
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = brandColor + '30';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#F3F4F6';
            }}
          >
            {sponsor.logo ? (
              <img 
                src={sponsor.logo} 
                alt={sponsor.name} 
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'grayscale(100%)', opacity: 0.7, transition: 'all 0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'grayscale(0%)'; e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'grayscale(100%)'; e.currentTarget.style.opacity = '0.7'; }}
              />
            ) : (
              <div style={{ color: '#9CA3AF', fontWeight: 700, fontSize: '18px' }}>{sponsor.name}</div>
            )}
          </a>
        ))}
      </div>
    );
  };

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
          blockName="Sponsors" 
          onEdit={onEdit} 
          quickActions={[
            { icon: <Building2 size={16} />, label: 'Add Sponsor', onClick: onEdit },
            { icon: <Plus size={16} />, label: 'Manage Tiers', onClick: onEdit }
          ]}
        />
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '42px', fontWeight: 900, color: '#111827', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          {title}
        </h2>
        <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '64px', maxWidth: '700px', margin: '0 auto 64px', lineHeight: '1.6' }}>
          {subtitle}
        </p>

        {/* Tiers */}
        {platinumSponsors.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: '100px', backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px' }}>
              Platinum Sponsors
            </div>
            {renderSponsorGrid(platinumSponsors, 'lg')}
          </div>
        )}

        {goldSponsors.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: '100px', backgroundColor: '#FFFBEB', color: '#D97706', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px' }}>
              Gold Sponsors
            </div>
            {renderSponsorGrid(goldSponsors, 'md')}
          </div>
        )}

        {(otherSponsors.length > 0 || sponsors.length === 0) && (
          <div>
            {sponsors.length > 0 && (
              <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: '100px', backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px' }}>
                Official Partners
              </div>
            )}
            
            {sponsors.length > 0 ? (
              renderSponsorGrid(otherSponsors, 'sm')
            ) : (
              <div style={{ padding: '60px', border: '2px dashed #E5E7EB', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                <Building2 size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p style={{ fontWeight: 600 }}>No sponsors added yet.</p>
                <p style={{ fontSize: '14px' }}>Click the gear icon to manage your partners.</p>
              </div>
            )}
          </div>
        )}

        {/* Call to Action */}
        {settings?.showBecomeSponsor && (
          <div style={{ marginTop: '80px' }}>
            <button
              onClick={() => settings.becomeSponsorUrl && window.open(settings.becomeSponsorUrl, '_blank')}
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 32px',
                borderRadius: '14px',
                backgroundColor: brandColor,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: `0 10px 25px -5px ${brandColor}40`
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {settings.becomeSponsorText || 'Become a Sponsor'}
              <Plus size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}