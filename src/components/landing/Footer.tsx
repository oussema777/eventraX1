import { Linkedin, Twitter, Facebook, Mail } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import Logo from '../ui/Logo';

export default function Footer() {
  const { t, tList } = useI18n();

  return (
    <footer style={{ backgroundColor: '#071A2E' }}>
      <div
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 40px' }}
        className="footer-container"
      >
        {/* Main grid */}
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '48px',
            marginBottom: '48px',
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Logo size="md" />
            </div>
            <p
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.65,
                color: 'rgba(148, 163, 184, 0.6)',
                maxWidth: '280px',
                marginBottom: '20px',
              }}
            >
              {t('landing.footer.description', { defaultValue: 'Professional event management platform for businesses worldwide' })}
            </p>
            {/* Social */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[Linkedin, Twitter, Facebook].map((Icon, i) => (
                <button
                  key={i}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  <Icon size={16} style={{ color: 'rgba(148, 163, 184, 0.5)' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'rgba(148, 163, 184, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '16px',
              }}
            >
              {t('landing.footer.product.title', { defaultValue: 'Product' })}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tList<string>('landing.footer.product.items').map((item) => (
                <li key={item}>
                  <button
                    style={{
                      fontSize: '0.875rem',
                      color: 'rgba(148, 163, 184, 0.7)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#F1F5F9'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148, 163, 184, 0.7)'; }}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'rgba(148, 163, 184, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '16px',
              }}
            >
              {t('landing.footer.company.title', { defaultValue: 'Company' })}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tList<string>('landing.footer.company.items').map((item) => (
                <li key={item}>
                  <button
                    style={{
                      fontSize: '0.875rem',
                      color: 'rgba(148, 163, 184, 0.7)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#F1F5F9'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148, 163, 184, 0.7)'; }}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'rgba(148, 163, 184, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '16px',
              }}
            >
              {t('landing.footer.newsletter.title', { defaultValue: 'Stay Updated' })}
            </h4>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'rgba(148, 163, 184, 0.5)',
                marginBottom: '12px',
                lineHeight: 1.5,
              }}
            >
              {t('landing.footer.newsletter.subtitle', { defaultValue: 'Get the latest news and updates' })}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder={t('landing.footer.newsletter.placeholder', { defaultValue: 'Your email' })}
                style={{
                  flex: 1,
                  height: '40px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#F1F5F9',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#0684F5',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0570D1'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0684F5'; }}
              >
                <Mail size={16} style={{ color: '#fff' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Divider + bottom */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
          }}
          className="footer-bottom"
        >
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(148, 163, 184, 0.35)',
            }}
          >
            {t('landing.footer.legal.copyright', { defaultValue: '\u00A9 2024 Eventra. All rights reserved.' })}
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              style={{
                fontSize: '0.8125rem',
                color: 'rgba(148, 163, 184, 0.35)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(148, 163, 184, 0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148, 163, 184, 0.35)'; }}
            >
              {t('landing.footer.legal.privacyPolicy', { defaultValue: 'Privacy Policy' })}
            </button>
            <button
              style={{
                fontSize: '0.8125rem',
                color: 'rgba(148, 163, 184, 0.35)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(148, 163, 184, 0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148, 163, 184, 0.35)'; }}
            >
              {t('landing.footer.legal.terms', { defaultValue: 'Terms of Service' })}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 1.5fr 1fr 1fr 1.2fr !important;
          }
          .footer-container {
            padding: 64px 48px 40px !important;
          }
          .footer-bottom {
            flex-direction: row !important;
            justify-content: space-between !important;
          }
        }
      `}</style>
    </footer>
  );
}
