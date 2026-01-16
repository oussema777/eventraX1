import { useEffect, useState } from 'react';
import { User, MapPin, Calendar, Plus } from 'lucide-react';
import EditModule from './EditModule';
import { useI18n } from '../../../i18n/I18nContext';

interface AgendaDay {
  day: number;
  label: string;
}

interface AgendaSession {
  day: number;
  time: string;
  duration: string;
  title: string;
  speaker?: string;
  location?: string;
  tags?: string[];
}

interface AgendaBlockProps {
  showEditControls?: boolean;
  brandColor?: string;
  buttonRadius?: number;
  days?: AgendaDay[];
  sessions?: AgendaSession[];
}

export default function AgendaBlock({ showEditControls = true, brandColor, buttonRadius, days, sessions }: AgendaBlockProps) {
  const { t, tList } = useI18n();
  const accentColor = brandColor || '#635BFF';
  const baseRadius = Number.isFinite(buttonRadius) ? buttonRadius : 12;
  const defaultDays = tList<AgendaDay>('wizard.designStudio.agenda.days', []);
  // Use provided sessions if available (even if empty), otherwise fallback to defaults only if undefined
  const agendaSessions = sessions !== undefined ? sessions : tList<AgendaSession>('wizard.designStudio.agenda.sessions', []);
  const agendaDays = days && days.length > 0 ? days : defaultDays;
  const [activeDay, setActiveDay] = useState(agendaDays[0]?.day || 1);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setActiveDay(agendaDays[0]?.day || 1);
  }, [agendaDays]);

  return (
    <div
      style={{
        padding: 'clamp(40px, 8vw, 80px) clamp(20px, 6vw, 40px)',
        backgroundColor: '#FAFBFC',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module */}
      {isHovered && showEditControls && (
        <EditModule
          blockName={t('wizard.designStudio.agenda.blockName')}
          quickActions={[
            {
              icon: <Plus size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.agenda.actions.addSession')
            },
            {
              icon: <Calendar size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.agenda.actions.manageSchedule')
            }
          ]}
        />
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: '#1A1D1F', marginBottom: '12px' }}>
            {t('wizard.designStudio.agenda.title')}
          </h2>
          <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: '#6F767E' }}>
            {t('wizard.designStudio.agenda.subtitle')}
          </p>
        </div>

        {/* Day Tabs */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
          {agendaDays.map((day) => (
            <button
              key={day.day}
              onClick={() => setActiveDay(day.day)}
              style={{
                height: '44px',
                padding: '0 24px',
                borderRadius: `${baseRadius}px`,
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeDay === day.day ? accentColor : '#FFFFFF',
                color: activeDay === day.day ? '#FFFFFF' : '#6F767E',
                border: activeDay === day.day ? 'none' : '2px solid #E9EAEB',
                boxShadow: activeDay === day.day ? '0px 4px 12px rgba(99, 91, 255, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (activeDay !== day.day) {
                  e.currentTarget.style.borderColor = accentColor;
                }
              }}
              onMouseLeave={(e) => {
                if (activeDay !== day.day) {
                  e.currentTarget.style.borderColor = '#E9EAEB';
                }
              }}
            >
              {day.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {agendaSessions.filter((session) => session.day === activeDay).map((session, idx) => (
            <div
              key={idx}
              className="grid gap-6 sm:grid-cols-[120px_1fr]"
              style={{
                backgroundColor: '#FFFFFF',
                padding: '24px',
                borderRadius: '12px',
                borderLeft: `4px solid ${accentColor}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0px 4px 16px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Time */}
                <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: accentColor, marginBottom: '4px' }}>
                  {session.time}
                </div>
                <div style={{ fontSize: '13px', color: '#9A9FA5' }}>
                  {session.duration}
                </div>
              </div>

              {/* Session Info */}
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A1D1F', marginBottom: '8px' }}>
                  {session.title}
                </div>

                {session.speaker && (
                  <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#6F767E',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  >
                    <User size={14} />
                    {session.speaker}
                  </div>
                )}

                {session.location && (
                  <div
                  style={{
                    fontSize: '13px',
                    color: '#9A9FA5',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  >
                    <MapPin size={12} />
                    {session.location}
                  </div>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(session.tags || []).map((tag, tagIdx) => (
                    <div
                      key={tagIdx}
                      style={{
                        height: '24px',
                        padding: '0 10px',
                        backgroundColor: 'rgba(99, 91, 255, 0.15)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: accentColor,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
