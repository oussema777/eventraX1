import { Check, Tag, DollarSign } from 'lucide-react';
import { useState } from 'react';
import EditModule from './EditModule';
import { useI18n } from '../../../i18n/I18nContext';

interface TicketCard {
  name: string;
  price: string;
  popular: boolean;
  features: string[];
}

interface TicketsBlockProps {
  showEditControls?: boolean;
  brandColor?: string;
  buttonRadius?: number;
  tickets?: TicketCard[];
  onRegister?: () => void;
}

export default function TicketsBlock({ showEditControls = true, brandColor, buttonRadius, tickets: ticketData, onRegister }: TicketsBlockProps) {
  const { t, tList } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const accentColor = brandColor || '#635BFF';
  const baseRadius = Number.isFinite(buttonRadius) ? buttonRadius : 12;
  const defaultTickets = tList<TicketCard>('wizard.designStudio.tickets.samples', []);
  const tickets = ticketData && ticketData.length > 0 ? ticketData : defaultTickets;

  return (
    <div
      style={{ padding: '80px 40px', backgroundColor: '#FFFFFF', position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module */}
      {isHovered && showEditControls && (
        <EditModule
          blockName={t('wizard.designStudio.tickets.blockName')}
          quickActions={[
            {
              icon: <Tag size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.tickets.actions.manage')
            },
            {
              icon: <DollarSign size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.tickets.actions.editPricing')
            }
          ]}
        />
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#1A1D1F', marginBottom: '12px' }}>
            {t('wizard.designStudio.tickets.title')}
          </h2>
          <p style={{ fontSize: '16px', color: '#6F767E' }}>
            {t('wizard.designStudio.tickets.subtitle')}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            position: 'relative'
          }}
        >
          {tickets.map((ticket, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#FAFBFC',
                border: ticket.popular ? `3px solid ${accentColor}` : '2px solid #E9EAEB',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                position: 'relative',
                transform: ticket.popular ? 'scale(1.05)' : 'scale(1)',
                zIndex: ticket.popular ? 5 : 1,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = ticket.popular
                  ? '0px 4px 12px rgba(99, 91, 255, 0.2)'
                  : 'none';
              }}
            >
              {/* Popular Badge */}
              {ticket.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    height: '28px',
                    padding: '0 16px',
                    backgroundColor: accentColor,
                    borderRadius: '14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('wizard.designStudio.tickets.mostPopular')}
                </div>
              )}

              {/* Tier Name */}
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1A1D1F',
                  marginBottom: '12px',
                  marginTop: ticket.popular ? '8px' : '0'
                }}
              >
                {ticket.name}
              </div>

              {/* Price */}
              <div style={{ fontSize: '48px', fontWeight: 700, color: '#1A1D1F', marginBottom: '8px' }}>
                {ticket.price}
              </div>

              {/* Billing Period */}
              <div style={{ fontSize: '14px', color: '#9A9FA5', marginBottom: '24px' }}>
                {t('wizard.designStudio.tickets.perPerson')}
              </div>

              {/* Features List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  textAlign: 'left',
                  marginBottom: '24px'
                }}
              >
                {ticket.features.map((feature, featureIdx) => (
                  <div
                    key={featureIdx}
                    style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}
                  >
                    <Check size={16} style={{ color: '#1F7A3E', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '14px', color: '#6F767E', lineHeight: 1.5 }}>
                      {feature}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={onRegister}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: ticket.popular ? accentColor : '#FFFFFF',
                  border: ticket.popular ? 'none' : `2px solid ${accentColor}`,
                  borderRadius: `${baseRadius}px`,
                  fontSize: '15px',
                  fontWeight: 700,
                  color: ticket.popular ? '#FFFFFF' : accentColor,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = ticket.popular ? accentColor : '#F8F7FF';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = ticket.popular ? accentColor : '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {t('wizard.designStudio.tickets.select')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
