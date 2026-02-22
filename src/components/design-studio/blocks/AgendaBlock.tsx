import { useEffect, useState } from 'react';
import { User, MapPin, Calendar, Plus, Check, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import EditModule from './EditModule';
import { useI18n } from '../../../i18n/I18nContext';

interface AgendaDay {
  day: number;
  label: string;
}

interface SpeakerDetail {
  id: string;
  name: string;
  title?: string;
  company?: string;
  avatarUrl?: string;
}

interface AgendaSession {
  id: string;
  day: number;
  time: string;
  duration: string;
  title: string;
  description?: string;
  speaker?: string; // Legacy field
  speaker_details?: SpeakerDetail[];
  location?: string;
  tags?: string[];
  is_selected?: boolean;
}

interface AgendaBlockProps {
  showEditControls?: boolean;
  brandColor?: string;
  buttonRadius?: number;
  onEdit?: () => void;
  days?: AgendaDay[];
  sessions?: AgendaSession[];
  onToggleSession?: (sessionId: string) => void;
  isRegistered?: boolean;
}

export default function AgendaBlock({ 
  showEditControls = true, 
  brandColor, 
  buttonRadius, 
  onEdit, 
  days, 
  sessions,
  onToggleSession,
  isRegistered = false
}: AgendaBlockProps) {
  const { t, tList } = useI18n();
  const accentColor = brandColor || '#635BFF';
  const baseRadius = Number.isFinite(buttonRadius) ? buttonRadius : 12;
  const defaultDays = tList<AgendaDay>('wizard.designStudio.agenda.days', []);
  const agendaSessions = sessions !== undefined ? sessions : [];
  const agendaDays = days && days.length > 0 ? days : defaultDays;
  const [activeDay, setActiveDay] = useState(agendaDays[0]?.day || 1);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (agendaDays.length > 0 && !agendaDays.find(d => d.day === activeDay)) {
      setActiveDay(agendaDays[0]?.day || 1);
    }
  }, [agendaDays]);

  return (
    <div
      className="agenda-block-container"
      style={{
        padding: 'clamp(40px, 8vw, 80px) clamp(16px, 5vw, 40px)',
        backgroundColor: '#FAFBFC',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .agenda-session-card {
          display: grid;
          gap: 24px;
          grid-template-columns: 120px 1fr auto;
          background-color: #FFFFFF;
          padding: 24px;
          border-radius: 12px;
          transition: all 0.2s ease;
          border: 1px solid #F1F2F4;
        }

        .agenda-session-title {
          font-size: 18px;
          font-weight: 700;
          color: #1A1D1F;
          margin-bottom: 8px;
          line-height: 1.4;
          word-break: break-word;
        }

        .session-action-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #E9EAEB;
          background: #FFFFFF;
          color: #6F767E;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .session-action-btn.selected {
          background-color: #10B981;
          color: #FFFFFF;
          border-color: #10B981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        @media (max-width: 640px) {
          .agenda-session-card {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 20px;
          }
          .agenda-session-time-group {
            display: flex;
            align-items: baseline;
            gap: 12px;
            border-bottom: 1px solid #F4F4F4;
            padding-bottom: 12px;
          }
          .agenda-session-title {
            font-size: 16px;
          }
          .session-action-mobile {
             order: -1;
             display: flex;
             justify-content: flex-end;
             margin-bottom: -40px;
          }
        }
      `}</style>
      {/* Edit Module */}
      {isHovered && showEditControls && (
        <EditModule
          blockName={t('wizard.designStudio.agenda.blockName')}
          onEdit={onEdit}
          quickActions={[
            {
              icon: <Plus size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.agenda.actions.addSession'),
              onClick: onEdit
            },
            {
              icon: <Calendar size={16} style={{ color: '#FFFFFF' }} />,
              label: t('wizard.designStudio.agenda.actions.manageSchedule'),
              onClick: onEdit
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
              key={session.id || idx}
              className="agenda-session-card"
              style={{
                borderLeft: `4px solid ${session.is_selected ? '#10B981' : accentColor}`,
                boxShadow: session.is_selected ? '0px 4px 16px rgba(16, 185, 129, 0.1)' : 'none'
              }}
            >
              {/* Time */}
              <div className="agenda-session-time-group">
                <div style={{ fontSize: '16px', fontWeight: 700, color: accentColor, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} />
                  {session.time}
                </div>
                <div style={{ fontSize: '13px', color: '#9A9FA5' }}>
                  {session.duration}
                </div>
              </div>

              {/* Session Info */}
              <div style={{ minWidth: 0 }}>
                <div className="agenda-session-title">
                  {session.title}
                </div>

                {/* Better Speaker Display */}
                {(session.speaker_details && session.speaker_details.length > 0) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {session.speaker_details.map((spk) => (
                      <div key={spk.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#F1F2F4' }}>
                          {spk.avatarUrl ? (
                            <img src={spk.avatarUrl} alt={spk.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: accentColor, color: '#FFF' }}>
                              <User size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1D1F' }}>{spk.name}</div>
                          <div style={{ fontSize: '12px', color: '#6F767E' }}>{spk.title} {spk.company ? `@ ${spk.company}` : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : session.speaker ? (
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
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.speaker}</span>
                  </div>
                ) : null}

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
                    <span style={{ wordBreak: 'break-word' }}>{session.location}</span>
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

              {/* Action Button */}
              {isRegistered && onToggleSession && (
                <div className="session-action-mobile">
                  <button 
                    className={`session-action-btn ${session.is_selected ? 'selected' : ''}`}
                    onClick={() => onToggleSession(session.id)}
                    title={session.is_selected ? 'Remove from schedule' : 'Add to schedule'}
                  >
                    {session.is_selected ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
