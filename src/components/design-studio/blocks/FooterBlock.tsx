import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Link2, Settings } from 'lucide-react';
import { useState } from 'react';
import EditModule from './EditModule';
import { useI18n } from '../../../i18n/I18nContext';

interface FooterBlockProps {
  showEditControls?: boolean;
  brandColor?: string;
  event?: {
    name?: string;
    tagline?: string;
    location_address?: string;
  };
  settings?: {
    copyrightText?: string;
    contactEmail?: string;
    contactPhone?: string;
    showSocialLinks?: boolean;
    socialUrls?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
    quickLinks?: Array<{ label: string; url: string }>;
  };
}

export default function FooterBlock({ showEditControls = true, brandColor, event, settings }: FooterBlockProps) {
  const { t, tList } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const accentColor = brandColor || '#635BFF';
  const eventName = event?.name || t('wizard.designStudio.footer.eventName');
  const eventTagline = event?.tagline || t('wizard.designStudio.footer.tagline');
  const eventLocation = event?.location_address || t('wizard.designStudio.footer.location');
  
  const defaultQuickLinks = tList<string>('wizard.designStudio.footer.quickLinks', []).map(label => ({ label, url: '#' }));
  // If settings exist, use them (even if empty). Fallback to defaults only if settings are completely missing.
  const quickLinks = settings ? (settings.quickLinks || []) : defaultQuickLinks;
  
  const copyright = settings?.copyrightText || t('wizard.designStudio.footer.copyright');
  const showSocials = settings?.showSocialLinks !== false;
  const email = settings?.contactEmail || t('wizard.designStudio.footer.contact.email');
  const phone = settings?.contactPhone || t('wizard.designStudio.footer.contact.phone');
  const socialUrls = settings?.socialUrls || {};

  // Social icons map
  const socialIcons = [
    { Icon: Facebook, key: 'facebook', url: socialUrls.facebook },
    { Icon: Twitter, key: 'twitter', url: socialUrls.twitter },
    { Icon: Linkedin, key: 'linkedin', url: socialUrls.linkedin },
    { Icon: Instagram, key: 'instagram', url: socialUrls.instagram }
  ];

  // If no settings are present, show all icons as placeholders. Otherwise, only show configured ones.
  const activeSocials = settings ? socialIcons.filter(s => s.url) : socialIcons;

  return (
    <div
      style={{ padding: '60px 40px', backgroundColor: '#1A1D1F', position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module */}
      {isHovered && showEditControls && (
        <EditModule
          blockName={t('wizard.designStudio.footer.blockName')}
          quickActions={[
            {
              icon: <Settings size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.footer.actions.settings')
            }
          ]}
        />
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '48px',
            marginBottom: '48px'
          }}
        >
          {/* Column 1: Event Info */}
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
              {eventName}
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px' }}>
              {eventTagline}
            </p>

            {/* Social Links */}
            {showSocials && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {activeSocials.map((social, idx) => {
                  const { Icon, url } = social;
                  return (
                    <a
                      key={idx}
                      href={url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        color: '#FFFFFF',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = accentColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '20px' }}>
              {t('wizard.designStudio.footer.quickLinksTitle')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quickLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '20px' }}>
              {t('wizard.designStudio.footer.contactTitle')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: Mail, text: email },
                { icon: Phone, text: phone },
                { icon: MapPin, text: eventLocation }
              ].map((contact, idx) => {
                const Icon = contact.icon;
                return (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Icon size={20} style={{ color: 'rgba(255, 255, 255, 0.5)', flexShrink: 0 }} />
                    <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {contact.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
          >
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
            {copyright}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
            {t('wizard.designStudio.footer.poweredBy')}{' '}
            <a
              href="#"
              style={{
                color: accentColor,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = accentColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = accentColor;
              }}
            >
              {t('wizard.designStudio.footer.brandName')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
