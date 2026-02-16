import { useState } from 'react';
import { Building2, Plus, ExternalLink, Crown } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
  tier?: string;
}

interface SponsorPackage {
  id: string;
  name: string;
  value: number;
  benefits: string[];
  color: string;
}

interface SponsorsBlockProps {
  sponsors?: Sponsor[];
  packages?: SponsorPackage[];
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
  packages = [],
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
  
  // Define default tiers if no packages provided
  const defaultPackages = [
    { id: 'platinum', name: 'Platinum Sponsors', color: '#EFF6FF', textColor: '#2563EB' },
    { id: 'gold', name: 'Gold Sponsors', color: '#FFFBEB', textColor: '#D97706' },
    { id: 'silver', name: 'Silver Sponsors', color: '#F3F4F6', textColor: '#4B5563' },
    { id: 'bronze', name: 'Bronze Sponsors', color: '#FFF7ED', textColor: '#C2410C' }
  ];

  const displayPackages = packages.length > 0 
    ? packages.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color || '#F3F4F6',
        textColor: '#4B5563' // Default text color
      }))
    : defaultPackages;

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

        {/* Dynamic Tiers/Packages */}
        {displayPackages.map((pkg, idx) => {
          const tierSponsors = sponsors.filter(s => 
            s.tier?.toLowerCase() === pkg.id.toLowerCase() || 
            s.tier?.toLowerCase() === pkg.name.toLowerCase()
          );

          if (tierSponsors.length === 0) return null;

          // Determine grid size based on package order (first is largest)
          const gridSize = idx === 0 ? 'lg' : idx === 1 ? 'md' : 'sm';

          return (
            <div key={pkg.id} style={{ marginBottom: '60px' }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '4px 16px', 
                borderRadius: '100px', 
                backgroundColor: pkg.color.startsWith('#') ? `${pkg.color}20` : pkg.color, 
                color: pkg.textColor || pkg.color, 
                fontSize: '11px', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                marginBottom: '32px' 
              }}>
                {pkg.name}
              </div>
              {renderSponsorGrid(tierSponsors, gridSize)}
            </div>
          );
        })}

        {/* Catch-all for sponsors without a matching tier */}
        {(() => {
          const categorizedIds = new Set(
            displayPackages.flatMap(pkg => 
              sponsors.filter(s => 
                s.tier?.toLowerCase() === pkg.id.toLowerCase() || 
                s.tier?.toLowerCase() === pkg.name.toLowerCase()
              ).map(s => s.id)
            )
          );
          const uncategorizedSponsors = sponsors.filter(s => !categorizedIds.has(s.id));

          if (uncategorizedSponsors.length === 0 && sponsors.length > 0) return null;

          return (
            <div>
              {uncategorizedSponsors.length > 0 && (
                <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: '100px', backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px' }}>
                  Official Partners
                </div>
              )}
              
              {uncategorizedSponsors.length > 0 ? (
                renderSponsorGrid(uncategorizedSponsors, 'sm')
              ) : sponsors.length === 0 ? (
                <div style={{ padding: '60px', border: '2px dashed #E5E7EB', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                  <Building2 size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontWeight: 600 }}>No sponsors added yet.</p>
                  <p style={{ fontSize: '14px' }}>Click the gear icon to manage your partners.</p>
                </div>
              ) : null}
            </div>
          );
        })()}

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