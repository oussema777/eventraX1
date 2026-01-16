import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useState } from 'react';
import EditModule from './EditModule';
import { useI18n } from '../../../i18n/I18nContext';

interface EventDetailsBlockProps {
  showEditControls?: boolean;
  brandColor?: string;
  event?: {
    start_date?: string;
    end_date?: string;
    location_address?: string;
    capacity_limit?: number;
  };
}

const formatDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString();
};

const formatTime = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function EventDetailsBlock({ showEditControls = true, brandColor, event }: EventDetailsBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const accentColor = brandColor || '#635BFF';
  const startDate = formatDate(event?.start_date);
  const endDate = formatDate(event?.end_date);
  const startTime = formatTime(event?.start_date);
  const endTime = formatTime(event?.end_date);
  const dateValue = startDate && endDate
    ? `${startDate} - ${endDate}`
    : startDate || t('wizard.designStudio.details.tbd');
  const capacityValue = event?.capacity_limit
    ? t('wizard.designStudio.details.capacityValue', { count: event.capacity_limit })
    : t('wizard.designStudio.details.openAttendance');

  const details = [
    {
      icon: Calendar,
      label: t('wizard.designStudio.details.labels.when'),
      value: dateValue,
      subtext: ''
    },
    {
      icon: MapPin,
      label: t('wizard.designStudio.details.labels.where'),
      value: event?.location_address || t('wizard.designStudio.details.tbd'),
      subtext: event?.location_address
        ? t('wizard.designStudio.details.locationSet')
        : t('wizard.designStudio.details.locationPending')
    }
  ];

  return (
    <div
      style={{ padding: '60px 40px', backgroundColor: '#FAFBFC', position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module */}
      {isHovered && showEditControls && (
        <EditModule
          blockName={t('wizard.designStudio.details.blockName')}
          quickActions={[
            {
              icon: <Calendar size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.details.actions.editDate')
            },
            {
              icon: <MapPin size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.details.actions.editLocation')
            },
            {
              icon: <Users size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.details.actions.editCapacity')
            }
          ]}
        />
      )}

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1A1D1F',
            textAlign: 'center',
            marginBottom: '48px'
          }}
        >
          {t('wizard.designStudio.details.title')}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}
        >
          {details.map((detail, idx) => {
            const Icon = detail.icon;

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '32px',
                  borderRadius: '16px',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(99, 91, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}
                >
                  <Icon size={28} style={{ color: accentColor }} />
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#9A9FA5',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px'
                  }}
                >
                  {detail.label}
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1A1D1F',
                    marginBottom: '4px'
                  }}
                >
                  {detail.value}
                </div>

                <div style={{ fontSize: '14px', color: '#6F767E' }}>
                  {detail.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
