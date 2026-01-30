import { useState, useMemo } from 'react';
import { Calendar, Users, Clock, TrendingUp, MapPin, Search, Filter, Download, Grid3x3, List, Plus, MoreVertical, Edit, Eye, Check, Star, Wrench, Coffee, X, ChevronDown, Tag, Code, Mic, GraduationCap, MoreHorizontal, Crown, FileText, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { useSessions, Session as SessionData } from '../../hooks/useSessions';
import { useSpeakers, Speaker as SpeakerData } from '../../hooks/useSpeakers';
import { toast } from 'sonner';
import { usePlan } from '../../hooks/usePlan';
import { useI18n } from '../../i18n/I18nContext';
import { useEventWizard } from '../../hooks/useEventWizard';
import { escapeHTML, escapeCSV } from '../../utils/security';

type ViewMode = 'timeline' | 'list';
type SessionType = 'keynote' | 'workshop' | 'panel' | 'break' | 'hackathon' | 'pitching' | 'training' | 'other';
type SessionStatus = 'confirmed' | 'tentative';

interface Session extends Omit<SessionData, 'startTime' | 'endTime' | 'speakers'> {
  // UI specific fields or overrides
  date: string;
  startTime: string; // Formatted time
  endTime: string;   // Formatted time
  speakers: SpeakerData[];
  rawStartTime: string; // ISO
  rawEndTime: string; // ISO
}

interface SessionsTabProps {
  eventId?: string;
  eventStartDate?: string;
  eventEndDate?: string;
}

export default function SessionsTab({ eventId, eventStartDate, eventEndDate }: SessionsTabProps) {
  const { t } = useI18n();
  const { sessions: rawSessions, isLoading: sessionsLoading, createSession, updateSession, deleteSession } = useSessions(eventId);
  const { speakers: allSpeakers, isLoading: speakersLoading } = useSpeakers();
  const { isPro: hasPro } = usePlan();
  const { eventData, isLoading: eventLoading } = useEventWizard(eventId);
  const eventMaxCapacity = eventData?.capacity_limit;
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Custom venues state (persisted in local storage for the wizard session)
  const [customVenues, setCustomVenues] = useState<string[]>(() => {
    if (!eventId) return [];
    const saved = localStorage.getItem(`wizard_custom_venues_${eventId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // State for modal
  const [showNewVenueInput, setShowNewVenueInput] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueCapacity, setNewVenueCapacity] = useState('');
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const [selectedSpeakersForSession, setSelectedSpeakersForSession] = useState<SpeakerData[]>([]);

  // Process and map data
  const sessions: Session[] = useMemo(() => {
    return rawSessions.map(s => {
      const startDate = new Date(s.startTime);
      const endDate = new Date(s.endTime);
      
      const sessionSpeakers = allSpeakers.filter(speaker => s.speakers.includes(speaker.id));

      return {
        ...s,
        rawStartTime: s.startTime,
        rawEndTime: s.endTime,
        date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        startTime: startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        endTime: endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        speakers: sessionSpeakers,
        type: s.type as any // Cast to internal type
      };
    });
  }, [rawSessions, allSpeakers]);

  // Extract unique days for filter
  const availableDays = useMemo(() => {
    const days = new Set<string>();
    sessions.forEach(s => {
       const dateStr = new Date(s.rawStartTime).toDateString();
       days.add(dateStr);
    });
    return Array.from(days).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [sessions]);

  // Extract unique venues including custom ones
  const availableVenues = useMemo(() => {
    const venues = new Set<string>(customVenues);
    sessions.forEach(s => {
      if (s.venue) venues.add(s.venue);
    });
    return Array.from(venues).sort();
  }, [sessions, customVenues]);

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const matchesDay = selectedDay === 'all' || new Date(session.rawStartTime).toDateString() === selectedDay;
    const matchesType = selectedType === 'all' || session.type === selectedType;
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          session.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDay && matchesType && matchesSearch;
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => 
    new Date(a.rawStartTime).getTime() - new Date(b.rawStartTime).getTime()
  );

  // Group by time slots for timeline view
  const timelineGroups = useMemo(() => {
    const groups: { time: string; sessions: Session[]; rawTime: number }[] = [];
    sortedSessions.forEach(session => {
      const existingGroup = groups.find(g => g.rawTime === new Date(session.rawStartTime).getTime());
      
      if (existingGroup) {
        existingGroup.sessions.push(session);
      } else {
        groups.push({
          time: session.startTime,
          rawTime: new Date(session.rawStartTime).getTime(),
          sessions: [session]
        });
      }
    });
    return groups;
  }, [sortedSessions]);

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setSelectedSpeakersForSession(session.speakers);
    setShowAddModal(true);
  };

  const handleCreateNew = () => {
    setEditingSession(null);
    setSelectedSpeakersForSession([]);
    setShowAddModal(true);
  };

  const handleSaveSessionData = async (data: any) => {
    try {
      let savedRecord;
      if (editingSession) {
        savedRecord = await updateSession(editingSession.id, data);
      } else {
        savedRecord = await createSession(data);
      }
      
      // If a new venue was used, add it to our custom list if not already there
      // Note: createSession returns the raw DB record, where venue is called 'location'
      const venueName = savedRecord?.location || data.venue;
      if (venueName && eventId) {
        setCustomVenues(prev => {
          if (!prev.includes(venueName)) {
            const updated = [...prev, venueName];
            localStorage.setItem(`wizard_custom_venues_${eventId}`, JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }

      setShowAddModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (window.confirm(t('wizard.step3.sessions.confirmDelete'))) {
      await deleteSession(id);
    }
  };

  if (sessionsLoading || speakersLoading || eventLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="sessions-container" style={{ backgroundColor: '#0B2641', minHeight: 'calc(100vh - 200px)', padding: '40px', paddingBottom: '80px' }}>
      <style>{`
        @media (max-width: 768px) {
          .sessions-container { padding: 16px !important; }
          .sessions-header { flex-direction: column !important; gap: 16px !important; align-items: stretch !important; }
          .sessions-header-actions { width: 100% !important; justify-content: space-between !important; }
          .sessions-controls-row { flex-direction: column !important; gap: 16px !important; align-items: stretch !important; }
          .sessions-filters { flex-wrap: wrap !important; width: 100% !important; gap: 12px !important; }
          .sessions-filter-select { flex: 1 !important; min-width: 140px !important; }
          .sessions-actions { width: 100% !important; flex-direction: column !important; gap: 12px !important; }
          .sessions-search { width: 100% !important; }
          .sessions-search input { width: 100% !important; }
          .sessions-export-btn { width: 100% !important; justify-content: center !important; }
          
          /* Timeline Items */
          .timeline-item { flex-direction: column !important; gap: 12px !important; }
          .timeline-time-label { width: 100% !important; flex-shrink: 0 !important; margin-bottom: 4px !important; }
          .timeline-cards-grid { grid-template-columns: 1fr !important; }
          .add-session-placeholder { width: 100% !important; }
          
          /* Session Card */
          .session-card-container { padding: 16px !important; }
          .session-card-flex { flex-direction: column !important; gap: 16px !important; }
          .session-card-content { flex: auto !important; width: 100% !important; }
          .session-card-sidebar { flex: auto !important; width: 100% !important; margin-top: 0 !important; }
          .session-card-title { fontSize: 18px !important; }
          .session-header-row { flex-wrap: wrap !important; }
          .session-info-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .session-compact-info { flex-wrap: wrap !important; gap: 8px !important; }
          .session-speakers-list { gap: 8px !important; }
          .session-speaker-pill { width: 100% !important; }
          
          /* List View */
          .session-list-view { overflow-x: auto !important; }
          .session-list-table { min-width: 800px !important; }
        }
        @media (max-width: 500px) {
          .sessions-container { padding: 0.5rem !important; }
          .session-card-container { padding: 12px !important; }
          .session-info-grid { gap: 8px !important; }
        }
      `}</style>

      {/* Main Container */} 
      <div 
        className="rounded-xl border p-8 sessions-container-inner" 
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          borderColor: 'rgba(255,255,255,0.1)', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' 
        }}
      >
        {/* Page Header */} 
        <div className="sessions-header flex items-start justify-between" style={{ marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('wizard.step3.sessions.title')}
            </h2>
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>
              {t('wizard.step3.sessions.subtitle')}
            </p>
          </div>
          
          <div className="sessions-header-actions flex items-center gap-3">
            {/* Add Session Button */} 
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 transition-all justify-center"
              style={{
                height: '44px',
                padding: '0 20px',
                backgroundColor: '#0684F5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0570D6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0684F5';
              }}
            >
              <Plus size={18} />
              {t('wizard.step3.sessions.actions.addSession')}
            </button>
          </div>
        </div>

        {/* Filter Bar with Dropdowns */} 
        <div className="sessions-controls-row flex items-center justify-between" style={{ marginBottom: '24px' }}>
          {/* Filters - Compact Dropdowns */} 
          <div className="sessions-filters flex items-center gap-3">
            {/* Day Dropdown */} 
            <select
              className="sessions-filter-select"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={{
                height: '44px',
                padding: '0 36px 0 16px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#FFFFFF',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgb(148,163,184)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px'
              }}
            >
              <option value="all">{t('wizard.step3.sessions.filters.allDays')}</option>
              {availableDays.map((day) => (
                <option key={day} value={day}>
                  {new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </option>
              ))}
            </select>

            {/* Type Dropdown */} 
            <select
              className="sessions-filter-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                height: '44px',
                padding: '0 36px 0 16px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#FFFFFF',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgb(148,163,184)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px'
              }}
            >
              <option value="all">{t('wizard.step3.sessions.filters.allTypes')}</option>
              <option value="keynote">{t('wizard.step3.sessions.types.keynote')}</option>
              <option value="workshop">{t('wizard.step3.sessions.types.workshop')}</option>
              <option value="panel">{t('wizard.step3.sessions.types.panel')}</option>
              <option value="break">{t('wizard.step3.sessions.types.break')}</option>
              <option value="hackathon">{t('wizard.step3.sessions.types.hackathon')}</option>
              <option value="pitching">{t('wizard.step3.sessions.types.pitching')}</option>
              <option value="training">{t('wizard.step3.sessions.types.training')}</option>
              <option value="other">{t('wizard.step3.sessions.types.other')}</option>
            </select>
          </div>

          {/* Controls */} 
          <div className="sessions-actions flex items-center gap-3">
            {/* Search */} 
            <div className="sessions-search relative">
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder={t('wizard.step3.sessions.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '280px',
                  height: '44px',
                  padding: '0 16px 0 44px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  outline: 'none'
                }}
              />
            </div>

            {/* Export Button */} 
            <button
              onClick={() => setShowExportModal(true)}
              className="sessions-export-btn flex items-center gap-2 transition-all"
              style={{
                height: '44px',
                padding: '0 16px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: '#FFFFFF',
                whiteSpace: 'nowrap'
              }}
            >
              <Download size={18} />
              {t('wizard.step3.sessions.actions.exportSchedule')}
            </button>
          </div>
        </div>

        {/* Divider */} 
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="timeline-view">
            {timelineGroups.length > 0 ? (
              timelineGroups.map((group, index) => (
                <div key={index} className="timeline-item flex items-start gap-6 mb-10">
                  <div className="timeline-time-label" style={{ width: '100px', flexShrink: 0 }}>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
                      {group.time}
                    </p>
                  </div>
                  <div className="timeline-cards-grid grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                    {group.sessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onEdit={() => handleEditSession(session)}
                        onDelete={() => handleDeleteSession(session.id)}
                        compact={group.sessions.length > 1}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
               <div className="text-center py-12 text-slate-400">
                  {t('wizard.step3.sessions.empty.timeline')}
               </div>
            )}
          </div>
        )}

        {/* List View */} 
        {viewMode === 'list' && (
        <div className="session-list-view rounded-xl border overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="session-list-table">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              {/* Table Header */} 
              <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <tr>
                  <th style={{ width: '3%', padding: '16px', textAlign: 'left' }}>
                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                  </th>
                  <th style={{ width: '35%', padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                    {t('wizard.step3.sessions.table.session')}
                  </th>
                  <th style={{ width: '18%', padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                    {t('wizard.step3.sessions.table.dateTime')}
                  </th>
                  <th style={{ width: '15%', padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                    {t('wizard.step3.sessions.table.venue')}
                  </th>
                  <th style={{ width: '20%', padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                    {t('wizard.step3.sessions.table.attendees')}
                  </th>
                  <th style={{ width: '9%', padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                    {t('wizard.step3.sessions.table.actions')}
                  </th>
                </tr>
              </thead>

              {/* Table Body */} 
              <tbody>
                {sortedSessions.length > 0 ? (
                    sortedSessions.map((session) => (
                    <SessionTableRow 
                        key={session.id} 
                        session={session} 
                        onEdit={() => handleEditSession(session)} 
                        onDelete={() => handleDeleteSession(session.id)}
                    />
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                            {t('wizard.step3.sessions.empty.title')}
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* Add/Edit Session Modal */} 
      {showAddModal && (
        <AddSessionModal 
          onClose={() => setShowAddModal(false)} 
          showNewVenueInput={showNewVenueInput}
          setShowNewVenueInput={setShowNewVenueInput}
          newVenueName={newVenueName}
          setNewVenueName={setNewVenueName}
          newVenueCapacity={newVenueCapacity}
          setNewVenueCapacity={setNewVenueCapacity}
          showSpeakerModal={showSpeakerModal}
          setShowSpeakerModal={setShowSpeakerModal}
          selectedSpeakersForSession={selectedSpeakersForSession}
          setSelectedSpeakersForSession={setSelectedSpeakersForSession}
          onSave={handleSaveSessionData}
          initialData={editingSession}
          allSpeakers={allSpeakers}
          availableVenues={availableVenues}
          eventStartDate={eventStartDate}
          eventEndDate={eventEndDate}
          onSaveVenue={(venue) => {
            if (!customVenues.includes(venue) && eventId) {
              const updated = [...customVenues, venue];
              setCustomVenues(updated);
              localStorage.setItem(`wizard_custom_venues_${eventId}`, JSON.stringify(updated));
            }
          }}
          eventMaxCapacity={eventMaxCapacity}
          existingSessions={sessions}
        />
      )}

      {/* Speaker Selection Modal */} 
      {showSpeakerModal && (
        <SpeakerSelectionModal
          onClose={() => setShowSpeakerModal(false)}
          selectedSpeakers={selectedSpeakersForSession}
          setSelectedSpeakers={setSelectedSpeakersForSession}
          allSpeakers={allSpeakers}
        />
      )}

      {/* Export Modal */} 
      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} sessions={sessions} />
      )}
    </div>
  );
}

// Session Card Component
interface SessionCardProps {
  session: Session;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}

function SessionCard({ session, onEdit, onDelete, compact = false }: SessionCardProps) {
  const { t } = useI18n();
  const [checkInEnabled, setCheckInEnabled] = useState(session.enableCheckIn);
  const [hasPro] = useState(false); // Simulate Pro status

  const colors = {
    keynote: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
    workshop: { bg: '#EDE9FE', border: '#8B5CF6', text: '#5B21B6' },
    panel: { bg: '#DBEAFE', border: '#0684F5', text: '#1E40AF' },
    break: { bg: '#F3F4F6', border: '#6B7280', text: '#374151' },
    hackathon: { bg: '#DCFCE7', border: '#10B981', text: '#065F46' },
    pitching: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
    training: { bg: '#E0E7FF', border: '#6366F1', text: '#312E81' },
    other: { bg: '#F3F4F6', border: '#9CA3AF', text: '#374151' }
  };

  const color = colors[session.type] || colors.other;
  const typeLabels: Record<SessionType, string> = {
    keynote: t('wizard.step3.sessions.types.keynote'),
    workshop: t('wizard.step3.sessions.types.workshop'),
    panel: t('wizard.step3.sessions.types.panel'),
    break: t('wizard.step3.sessions.types.break'),
    hackathon: t('wizard.step3.sessions.types.hackathon'),
    pitching: t('wizard.step3.sessions.types.pitching'),
    training: t('wizard.step3.sessions.types.training'),
    other: t('wizard.step3.sessions.types.other')
  };

  return (
    <div
      className="session-card-container flex-1 rounded-lg transition-all"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderLeft: `4px solid ${color.border}`,
        padding: compact ? '20px' : '24px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="session-card-flex flex gap-6">
        {/* Left Section */} 
        <div className="session-card-content" style={{ flex: compact ? 1 : '0 0 70%' }}>
          {/* Header Row */} 
          <div className="session-header-row flex items-start justify-between gap-3" style={{ marginBottom: '12px' }}>
            <div className="flex items-center gap-3 flex-1">
              {/* Type Badge */} 
              <div
                className="session-type-badge flex items-center gap-1"
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: color.bg,
                  color: color.text,
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  flexShrink: 0
                }}
              >
                {session.type === 'keynote' && <Star size={12} />}
                {session.type === 'workshop' && <Wrench size={12} />}
                {session.type === 'panel' && <Users size={12} />}
                {session.type === 'break' && <Coffee size={12} />}
                {session.type === 'hackathon' && <Code size={12} />}
                {session.type === 'pitching' && <Mic size={12} />}
                {session.type === 'training' && <GraduationCap size={12} />}
                {session.type === 'other' && <MoreHorizontal size={12} />}
                <span>{typeLabels[session.type] || session.type}</span>
              </div>

              {/* Title */} 
              <h3 className="session-card-title" style={{ fontSize: compact ? '18px' : '24px', fontWeight: 600, color: '#0B2641' }}>
                {session.title}
              </h3>
            </div>

            {/* Action Buttons (Inline) */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all border border-gray-200"
                title={t('wizard.step3.sessions.card.edit')}
              >
                <Edit size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all border border-red-200"
                title={t('wizard.step3.sessions.card.delete')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Info Grid */} 
          {!compact && (
            <div className="session-info-grid grid grid-cols-2 gap-5" style={{ marginBottom: '12px' }}>
              {/* Time */} 
              <div className="session-info-item">
                <div className="flex items-center gap-2" style={{ marginBottom: '2px' }}>
                  <Clock size={16} style={{ color: '#6B7280' }} />
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>
                    {session.startTime} - {session.endTime}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  {t('wizard.step3.sessions.card.duration', { minutes: session.duration })}
                </p>
              </div>

              {/* Venue */} 
              <div className="session-info-item">
                <div className="flex items-center gap-2" style={{ marginBottom: '2px' }}>
                  <MapPin size={16} style={{ color: '#6B7280' }} />
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>
                    {session.venue || t('wizard.step3.sessions.card.noVenue')}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  {t('wizard.step3.sessions.card.capacity', { count: session.capacity })}
                </p>
              </div>
            </div>
          )}

          {/* Compact Info */} 
          {compact && (
            <div className="session-compact-info flex items-center gap-4" style={{ marginBottom: '12px' }}>
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: '#6B7280' }} />
                <span style={{ fontSize: '13px', color: '#6B7280' }}>
                  {session.startTime} - {session.endTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: '#6B7280' }} />
                <span style={{ fontSize: '13px', color: '#6B7280' }}>
                  {session.venue || t('wizard.step3.sessions.card.tbd')}
                </span>
              </div>
            </div>
          )}

          {/* Description */} 
          {!compact && (
            <div style={{ marginBottom: '12px' }}>
              <p className="session-description" style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                {session.description}
              </p>
            </div>
          )}

          {/* Tags */} 
          {session.tags.length > 0 && (
            <div className="session-tags-container flex flex-wrap items-center gap-2" style={{ marginBottom: compact ? '12px' : '16px' }}>
              {session.tags.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: '#EFF6FF',
                    color: '#0684F5',
                    fontSize: '10px',
                    fontWeight: 500
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Speakers */} 
          {session.speakers.length > 0 && (
            <div className="session-speakers-section" style={{ paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '8px' }}>
                {t('wizard.step3.sessions.card.speakersLabel', { count: session.speakers.length })}
              </p>
              <div className="session-speakers-list flex flex-wrap items-center gap-3">
                {session.speakers.slice(0, compact ? 1 : 3).map((speaker, i) => (
                  <div
                    key={i}
                    className="session-speaker-pill flex items-center gap-2"
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#F3F4F6',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#0684F5',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      {speaker.photo ? (
                        <img src={speaker.photo} alt={speaker.full_name || speaker.name || 'Speaker'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (speaker.full_name || speaker.name || 'S').charAt(0)
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0B2641' }}>{speaker.full_name || speaker.name || 'Untitled Speaker'}</p>
                      <p style={{ fontSize: '12px', color: '#6B7280' }}>{speaker.title || 'No Title'}</p>
                    </div>
                  </div>
                ))}
                {session.speakers.length > (compact ? 1 : 3) && (
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    {t('wizard.step3.sessions.card.moreSpeakers', { count: session.speakers.length - (compact ? 1 : 3) })}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Simplified Actions */} 
        {!compact && (
          <div className="session-card-sidebar" style={{ flex: '0 0 30%' }}>
            <div className="session-card-sidebar-inner rounded-lg p-4" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              {/* Edit Session Button */} 
              <button
                onClick={onEdit}
                className="session-edit-btn flex items-center justify-center gap-2 transition-all"
                style={{
                  width: '100%',
                  height: '36px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0B2641',
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <Edit size={14} />
                {t('wizard.step3.sessions.card.edit')}
              </button>

              {/* Session Check-in Toggle - PRO ONLY */} 
              <div 
                className="session-pro-toggle relative p-3 rounded-lg border" 
                style={{ 
                  backgroundColor: hasPro ? '#FFFFFF' : 'rgba(245, 158, 11, 0.1)',
                  borderColor: hasPro ? '#E5E7EB' : '#F59E0B'
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#0B2641' }}>
                        {t('wizard.step3.sessions.card.checkInTitle')}
                      </span>
                      <span 
                        className="px-1.5 py-0.5 rounded text-xs flex items-center gap-1"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '9px'
                        }}
                      >
                        <Crown size={9} />
                        PRO
                      </span>
                    </div>
                    <p style={{ fontSize: '10px', color: '#6B7280' }}>
                      {t('wizard.step3.sessions.card.checkInHelper')}
                    </p>
                  </div>
                  <label className="relative inline-block" style={{ width: '36px', height: '20px' }}>
                    <input
                      type="checkbox"
                      checked={checkInEnabled}
                      onChange={(e) => {
                        if (hasPro) {
                          setCheckInEnabled(e.target.checked);
                        }
                      }}
                      disabled={!hasPro}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        cursor: hasPro ? 'pointer' : 'not-allowed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: checkInEnabled && hasPro ? '#0684F5' : '#D1D5DB',
                        transition: '0.4s',
                        borderRadius: '20px'
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '14px',
                          width: '14px',
                          left: checkInEnabled && hasPro ? '19px' : '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '0.4s',
                          borderRadius: '50%'
                        }}
                      />
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Session Table Row Component (for List View)
interface SessionTableRowProps {
  session: Session;
  onEdit: () => void;
  onDelete: () => void;
}

function SessionTableRow({ session, onEdit, onDelete }: SessionTableRowProps) {
  const { t } = useI18n();
  const color = {
    keynote: '#F59E0B',
    workshop: '#8B5CF6',
    panel: '#0684F5',
    break: '#6B7280',
    hackathon: '#10B981',
    pitching: '#EF4444',
    training: '#6366F1',
    other: '#9CA3AF'
  }[session.type] || '#9CA3AF';

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <td style={{ padding: '16px' }}>
        <input type="checkbox" style={{ cursor: 'pointer' }} />
      </td>
      <td style={{ padding: '16px' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '4px', height: '40px', backgroundColor: color, borderRadius: '2px' }} />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
              {session.title}
            </h4>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>
              {session.speakers.length > 0 ? session.speakers.map(s => s.name).join(', ') : t('wizard.step3.sessions.table.noSpeakers')}
            </p>
          </div>
        </div>
      </td>
      <td style={{ padding: '16px' }}>
        <p style={{ fontSize: '13px', color: '#FFFFFF', marginBottom: '4px' }}>
          {session.date}
        </p>
        <p style={{ fontSize: '12px', color: '#94A3B8' }}>
          {session.startTime} - {session.endTime}
        </p>
      </td>
      <td style={{ padding: '16px' }}>
        <p style={{ fontSize: '13px', color: '#FFFFFF' }}>{session.venue || t('wizard.step3.sessions.card.tbd')}</p>
      </td>
      <td style={{ padding: '16px' }}>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                {session.registered} / {session.capacity}
              </span>
              <span style={{ fontSize: '12px', color: '#FFFFFF' }}>
                {session.capacity > 0 ? Math.round((session.registered / session.capacity) * 100) : 0}%
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="h-full"
                style={{
                  width: `${session.capacity > 0 ? (session.registered / session.capacity) * 100 : 0}%`,
                  backgroundColor: (session.registered / session.capacity) > 0.9 ? '#EF4444' : '#0684F5',
                  transition: 'width 0.3s'
                }}
              />
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: '16px', textAlign: 'center' }}>
        <div className="flex items-center justify-center gap-2">
            <button
            onClick={onEdit}
            className="transition-colors p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white"
            >
            <Edit size={16} />
            </button>
            <button
            onClick={onDelete}
            className="transition-colors p-2 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500"
            >
            <Trash2 size={16} />
            </button>
        </div>
      </td>
    </tr>
  );
}

// Add/Edit Session Modal Component
interface AddSessionModalProps {
  onClose: () => void;
  showNewVenueInput: boolean;
  setShowNewVenueInput: (show: boolean) => void;
  newVenueName: string;
  setNewVenueName: (name: string) => void;
  newVenueCapacity: string;
  setNewVenueCapacity: (capacity: string) => void;
  showSpeakerModal: boolean;
  setShowSpeakerModal: (show: boolean) => void;
  selectedSpeakersForSession: SpeakerData[];
  setSelectedSpeakersForSession: (speakers: SpeakerData[]) => void;
  onSave: (data: any) => void;
  initialData: Session | null;
  allSpeakers: SpeakerData[];
  availableVenues: string[];
  eventStartDate?: string;
  eventEndDate?: string;
  onSaveVenue?: (venue: string) => void;
  eventMaxCapacity?: number;
  existingSessions?: Session[];
}

function AddSessionModal({
  onClose, 
  showNewVenueInput,
  setShowNewVenueInput,
  newVenueName,
  setNewVenueName,
  newVenueCapacity,
  setNewVenueCapacity,
  showSpeakerModal,
  setShowSpeakerModal,
  selectedSpeakersForSession,
  setSelectedSpeakersForSession,
  onSave,
  initialData,
  allSpeakers,
  availableVenues,
  eventStartDate,
  eventEndDate,
  onSaveVenue,
  eventMaxCapacity,
  existingSessions = []
}: AddSessionModalProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'details' | 'speakers' | 'advanced'>('details');
  const [sessionType, setSessionType] = useState<SessionType>(initialData?.type as SessionType || 'keynote');
  const [customTypeValue, setCustomTypeValue] = useState('');
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  
  // Robust date formatting for HTML inputs (YYYY-MM-DD)
  const formatDateForInput = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    // Use UTC methods to avoid timezone shifts for date-only strings
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const minDate = formatDateForInput(eventStartDate);
  const maxDate = formatDateForInput(eventEndDate);

  // Generate list of valid dates between start and end
  const availableDates = useMemo(() => {
    if (!eventStartDate || !eventEndDate) return [];
    const dates = [];
    let curr = new Date(eventStartDate);
    const last = new Date(eventEndDate);
    // Normalize to UTC midnight for comparison
    curr.setUTCHours(0, 0, 0, 0);
    last.setUTCHours(0, 0, 0, 0);
    
    while (curr <= last) {
      dates.push(formatDateForInput(curr.toISOString()));
      curr.setUTCDate(curr.getUTCDate() + 1);
    }
    return dates;
  }, [eventStartDate, eventEndDate]);

  // Parse initial dates
  const initialDate = initialData ? new Date(initialData.rawStartTime) : null;
  const initialEndDate = initialData ? new Date(initialData.rawEndTime) : null;

  const [date, setDate] = useState(initialDate ? formatDateForInput(initialDate.toISOString()) : '');
  const [startTime, setStartTime] = useState(initialDate ? initialDate.toTimeString().slice(0, 5) : '');
  const [endTime, setEndTime] = useState(initialEndDate ? initialEndDate.toTimeString().slice(0, 5) : '');

  const [selectedVenue, setSelectedVenue] = useState(initialData?.venue || '');
  const [capacity, setCapacity] = useState(initialData?.capacity?.toString() || '');
  
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  // Pro feature states
  const [sessionStatus, setSessionStatus] = useState<'confirmed' | 'tentative'>(initialData?.status || 'confirmed');
  const [showInPublicSchedule, setShowInPublicSchedule] = useState(initialData?.showInPublicSchedule ?? true);
  const [enableCheckIn, setEnableCheckIn] = useState(initialData?.enableCheckIn ?? false);
  const [selectedCustomForm, setSelectedCustomForm] = useState<string>(initialData?.customFormId || '');
  const [capacityError, setCapacityError] = useState('');
  
  // Simulate PRO status
  const hasPro = false;
  const [showProModal, setShowProModal] = useState(false);

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCapacity(val);
    
    if (val && eventMaxCapacity) {
      const currentVal = parseInt(val, 10);
      
      // Check 1: Individual session capacity > Event capacity
      if (currentVal > eventMaxCapacity) {
        setCapacityError('Max Capacity should not be more than the max. attendees');
        return;
      }

      // Check 2: Sum of all sessions > Event capacity
      // Filter out current session from existing sessions if editing
      const otherSessions = existingSessions.filter(s => s.id !== initialData?.id);
      const otherSessionsTotal = otherSessions.reduce((sum, s) => sum + (s.capacity || 0), 0);
      
      if (currentVal + otherSessionsTotal > eventMaxCapacity) {
        setCapacityError(`Total session capacity (${currentVal + otherSessionsTotal}) exceeds event capacity (${eventMaxCapacity})`);
        return;
      }

      setCapacityError('');
    } else {
      setCapacityError('');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedVenue(value);
    if (value === 'add_new') {
      setShowNewVenueInput(true);
    } else {
      setShowNewVenueInput(false);
    }
  };

  const handleSaveNewVenue = () => {
    if(newVenueName) {
        setSelectedVenue(newVenueName);
        if(newVenueCapacity) setCapacity(newVenueCapacity);
        onSaveVenue?.(newVenueName);
        setShowNewVenueInput(false);
        setNewVenueName('');
        setNewVenueCapacity('');
    }
  };

  const handleCancelNewVenue = () => {
    setShowNewVenueInput(false);
    setNewVenueName('');
    setNewVenueCapacity('');
    // Don't reset selectedVenue if we were editing
  };

  const handleRemoveSpeaker = (speakerId: string) => {
    setSelectedSpeakersForSession(selectedSpeakersForSession.filter(s => s.id !== speakerId));
  };

  const handleSaveClick = () => {
      // If we are currently adding a new venue via the inline form, save it first
      let finalVenue = selectedVenue;
      if (showNewVenueInput && newVenueName) {
        handleSaveNewVenue();
        finalVenue = newVenueName;
      }

      // Validation
      if (!title || !date || !startTime || !endTime) {
          toast.error(t('wizard.step3.sessions.modal.requiredFields'));
          return;
      }

      if (capacityError) {
          toast.error(capacityError);
          return;
      }

      // Construct Date objects
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      if (endDateTime <= startDateTime) {
          toast.error(t('wizard.step3.sessions.modal.errors.timeRange', "Oops! The session can't end before it starts. Please check your times."));
          return;
      }

      // Frontend Conflict Check for clearer notification
      if (finalVenue && finalVenue !== 'TBD' && finalVenue !== '') {
        const start = startDateTime.getTime();
        const end = endDateTime.getTime();

        const conflict = existingSessions.find(s => {
          if (initialData && s.id === initialData.id) return false;
          if (s.venue !== finalVenue) return false;
          if (s.status === 'cancelled') return false;

          const sStart = new Date(s.rawStartTime).getTime();
          const sEnd = new Date(s.rawEndTime).getTime();
          return (start < sEnd && end > sStart);
        });

        if (conflict) {
          toast.error(
            <div className="flex flex-col gap-1">
              <span className="font-bold text-red-600">Schedule Conflict detected!</span>
              <span className="text-sm">The room <span className="font-semibold">"{finalVenue}"</span> is already occupied by <span className="font-semibold">"{conflict.title}"</span> during this time.</span>
            </div>,
            { duration: 5000 }
          );
          return;
        }
      }

      const payload = {
        title,
        description,
        type: sessionType === 'other' ? (customTypeValue || 'other') : sessionType,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        venue: finalVenue,
        capacity: parseInt(capacity) || 0,
        tags,
        speakers: selectedSpeakersForSession.map(s => s.id),
        status: sessionStatus,
        enableCheckIn,
        showInPublicSchedule,
        customFormId: selectedCustomForm
      };
      
      onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[900px] rounded-xl"
        style={{
          backgroundColor: '#0B2641',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */} 
        <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
              {initialData ? t('wizard.step3.sessions.modal.titleEdit') : t('wizard.step3.sessions.modal.titleCreate')}
            </h2>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              {t('wizard.step3.sessions.modal.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: '#94A3B8',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */} 
        <div className="flex border-b px-6" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {(['details', 'speakers', 'advanced'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className="relative px-6 py-4 transition-colors"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: activeTab === tab ? '#0684F5' : '#94A3B8',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {t(`wizard.step3.sessions.modal.tabs.${tab}`)}
              {activeTab === tab && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#0684F5'
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */} 
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="flex flex-col gap-6">
              {/* Session Type */} 
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px', display: 'block' }}>
                  {t('wizard.step3.sessions.modal.sessionType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[ 
                    { type: 'keynote' as SessionType, icon: Star, label: t('wizard.step3.sessions.types.keynote'), desc: t('wizard.step3.sessions.modal.typeDescriptions.keynote'), color: '#F59E0B' },
                    { type: 'workshop' as SessionType, icon: Wrench, label: t('wizard.step3.sessions.types.workshop'), desc: t('wizard.step3.sessions.modal.typeDescriptions.workshop'), color: '#8B5CF6' },
                    { type: 'panel' as SessionType, icon: Users, label: t('wizard.step3.sessions.types.panel'), desc: t('wizard.step3.sessions.modal.typeDescriptions.panel'), color: '#0684F5' },
                    { type: 'break' as SessionType, icon: Coffee, label: t('wizard.step3.sessions.types.break'), desc: t('wizard.step3.sessions.modal.typeDescriptions.break'), color: '#6B7280' },
                    { type: 'hackathon' as SessionType, icon: Code, label: t('wizard.step3.sessions.types.hackathon'), desc: t('wizard.step3.sessions.modal.typeDescriptions.hackathon'), color: '#10B981' },
                    { type: 'pitching' as SessionType, icon: Mic, label: t('wizard.step3.sessions.types.pitching'), desc: t('wizard.step3.sessions.modal.typeDescriptions.pitching'), color: '#EF4444' },
                    { type: 'training' as SessionType, icon: GraduationCap, label: t('wizard.step3.sessions.types.training'), desc: t('wizard.step3.sessions.modal.typeDescriptions.training'), color: '#6366F1' },
                    { type: 'other' as SessionType, icon: MoreHorizontal, label: t('wizard.step3.sessions.types.other'), desc: t('wizard.step3.sessions.modal.typeDescriptions.other'), color: '#9CA3AF' }
                  ].map(({ type, icon: Icon, label, desc, color }) => (
                    <button
                      key={type}
                      onClick={() => setSessionType(type)}
                      className="flex items-start gap-3 p-3 rounded-lg transition-all"
                      style={{
                        border: `2px solid ${sessionType === type ? color : 'rgba(255,255,255,0.2)'}`,
                        backgroundColor: sessionType === type ? `${color}20` : 'rgba(255,255,255,0.05)',
                        cursor: 'pointer'
                      }}
                    >
                      <Icon size={20} style={{ color, flexShrink: 0 }} />
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                          {label}
                        </p>
                        <p style={{ fontSize: '11px', color: '#94A3B8' }}>{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Custom Type Input - Show when "Other" is selected */} 
                {sessionType === 'other' && (
                  <div style={{ marginTop: '16px' }}>
                    <label htmlFor="custom-type" style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                      {t('wizard.step3.sessions.modal.customType')}
                    </label>
                    <input
                      id="custom-type"
                      type="text"
                      placeholder={t('wizard.step3.sessions.modal.customTypePlaceholder')}
                      value={customTypeValue}
                      onChange={(e) => setCustomTypeValue(e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1.5px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Session Title */} 
              <div>
                <label htmlFor="session-title" style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('wizard.step3.sessions.modal.sessionTitle')}
                </label>
                <input
                  id="session-title"
                  type="text"
                  placeholder={t('wizard.step3.sessions.modal.sessionTitlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Session Description */} 
              <div>
                <label htmlFor="session-desc" style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('wizard.step3.sessions.modal.description')}
                </label>
                <textarea
                  id="session-desc"
                  rows={4}
                  placeholder={t('wizard.step3.sessions.modal.descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Date & Time */} 
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('wizard.step3.sessions.modal.date', 'Session Date')}
                  </label>
                  {availableDates.length > 0 ? (
                    <select
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1.5px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgb(148,163,184)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="" disabled>{t('wizard.step3.sessions.modal.selectDate', 'Select Date')}</option>
                      {availableDates.map(d => (
                        <option key={d} value={d} style={{ backgroundColor: '#0B2641' }}>
                          {new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="date"
                      type="date"
                      value={date}
                      min={minDate}
                      max={maxDate}
                      onChange={(e) => setDate(e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1.5px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  )}
                </div>
                <div>
                  <label htmlFor="start-time" style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('wizard.step3.sessions.modal.startTime')}
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="end-time" style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('wizard.step3.sessions.modal.endTime')}
                  </label>
                  <input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Venue - WITH INLINE ADD NEW FUNCTIONALITY */} 
              <div>
                <label htmlFor="venue" style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('wizard.step3.sessions.modal.venue')}
                </label>
                <select
                  id="venue"
                  value={selectedVenue}
                  onChange={handleVenueChange}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">{t('wizard.step3.sessions.modal.venuePlaceholder')}</option>
                  {availableVenues.map(v => (
                      <option key={v} value={v}>{v}</option>
                  ))}
                  <option value="add_new">{t('wizard.step3.sessions.modal.addNewVenue')}</option>
                </select>

                {/* Inline New Venue Input */} 
                {showNewVenueInput && (
                  <div 
                    className="mt-3 p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: 'rgba(6, 132, 245, 0.1)',
                      borderColor: '#0684F5'
                    }}
                  >
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0684F5', marginBottom: '12px' }}>
                      {t('wizard.step3.sessions.modal.addNewVenueTitle')}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                          {t('wizard.step3.sessions.modal.newVenueName')}
                        </label>
                        <input
                          type="text"
                          placeholder={t('wizard.step3.sessions.modal.newVenueNamePlaceholder')}
                          value={newVenueName}
                          onChange={(e) => setNewVenueName(e.target.value)}
                          style={{
                            width: '100%',
                            height: '40px',
                            padding: '0 12px',
                            fontSize: '13px',
                            color: '#FFFFFF',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                          {t('wizard.step3.sessions.modal.newVenueCapacity')}
                        </label>
                        <input
                          type="number"
                          placeholder={t('wizard.step3.sessions.modal.newVenueCapacityPlaceholder')}
                          value={newVenueCapacity}
                          onChange={(e) => setNewVenueCapacity(e.target.value)}
                          style={{
                            width: '100%',
                            height: '40px',
                            padding: '0 12px',
                            fontSize: '13px',
                            color: '#FFFFFF',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={handleSaveNewVenue}
                        className="flex-1 px-3 py-2 rounded transition-colors"
                        style={{
                          backgroundColor: '#0684F5',
                          border: 'none',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {t('wizard.step3.sessions.modal.saveVenue')}
                      </button>
                      <button
                        onClick={handleCancelNewVenue}
                        className="flex-1 px-3 py-2 rounded transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {t('wizard.step3.sessions.modal.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Capacity */} 
              <div>
                <label htmlFor="capacity" style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('wizard.step3.sessions.modal.capacity')}
                </label>
                <input
                  id="capacity"
                  type="text"
                  inputMode="numeric"
                  placeholder={t('wizard.step3.sessions.modal.capacityPlaceholder')}
                  value={capacity}
                  onChange={handleCapacityChange}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${capacityError ? '#EF4444' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
                {capacityError && (
                  <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                    {capacityError}
                  </p>
                )}
              </div>

              {/* Tags */} 
              <div>
                <label htmlFor="tags" style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('wizard.step3.sessions.modal.tags')}
                </label>
                <div className="flex flex-wrap gap-2" style={{ marginBottom: '8px' }}>
                  {tags.map((tag, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: 'rgba(6, 132, 245, 0.2)',
                        border: '1px solid #0684F5'
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#0684F5' }}>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#0684F5',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  id="tags"
                  type="text"
                  placeholder={t('wizard.step3.sessions.modal.tagsPlaceholder')}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'speakers' && (
            <div className="flex flex-col gap-6">
              {/* Selected Speakers */} 
              {selectedSpeakersForSession.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>
                    {t('wizard.step3.sessions.modal.selectedSpeakers', { count: selectedSpeakersForSession.length })}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedSpeakersForSession.map((speaker) => (
                      <div
                        key={speaker.id}
                        className="flex items-center justify-between p-4 rounded-lg"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#0684F5',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              fontWeight: 600
                            }}
                          >
                            {speaker.photo ? (
                                <img src={speaker.photo} alt={speaker.full_name || speaker.name || 'Speaker'} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                (speaker.full_name || speaker.name || 'S').charAt(0)
                            )}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                              {speaker.full_name || speaker.name || 'Untitled Speaker'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                              {t('wizard.step3.sessions.modal.speakerLine', { title: speaker.title || 'No Title', company: speaker.company || 'No Company' })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSpeaker(speaker.id)}
                          className="p-2 rounded transition-colors"
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Speaker Button */} 
              <div className="text-center py-8">
                {selectedSpeakersForSession.length === 0 && (
                  <>
                    <Users size={48} style={{ color: '#94A3B8', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '16px' }}>
                      {t('wizard.step3.sessions.modal.noSpeakersAssigned')}
                    </p>
                  </>
                )}
                <button
                  onClick={() => setShowSpeakerModal(true)}
                  className="flex items-center gap-2 mx-auto transition-all"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#0684F5',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={18} />
                  {selectedSpeakersForSession.length > 0
                    ? t('wizard.step3.sessions.modal.addMoreSpeakers')
                    : t('wizard.step3.sessions.modal.addSpeaker')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="flex flex-col gap-6">
              {/* Session Status - REMOVED CANCELLED */} 
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px', display: 'block' }}>
                  {t('wizard.step3.sessions.modal.sessionStatus')}
                </label>
                <div className="flex gap-3">
                  {[ 
                    { value: 'confirmed' as const, label: t('wizard.step3.sessions.status.confirmed'), color: '#10B981' },
                    { value: 'tentative' as const, label: t('wizard.step3.sessions.status.tentative'), color: '#F59E0B' }
                  ].map(({ value, label, color }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all"
                      style={{
                        border: `2px solid ${sessionStatus === value ? color : 'rgba(255,255,255,0.2)'}`,
                        flex: 1,
                        backgroundColor: sessionStatus === value ? `${color}20` : 'rgba(255,255,255,0.05)'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="status" 
                        value={value} 
                        checked={sessionStatus === value}
                        onChange={() => setSessionStatus(value)} 
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                        <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Visibility Toggles - PRO Features */} 
              <div className="flex flex-col gap-3">
                <div 
                  className="relative p-4 rounded-lg border-2" 
                  style={{ 
                    backgroundColor: hasPro ? 'rgba(255,255,255,0.05)' : 'rgba(245, 158, 11, 0.15)',
                    borderColor: hasPro ? 'rgba(255,255,255,0.2)' : '#F59E0B',
                    opacity: hasPro ? 1 : 0.9
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{t('wizard.step3.sessions.modal.showInPublic')}</span>
                      <span 
                        className="px-1.5 py-0.5 rounded text-xs flex items-center gap-1"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: 'white',
                          fontWeight: 700
                        }}
                      >
                        <Crown size={10} />
                        PRO
                      </span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={showInPublicSchedule}
                      onChange={(e) => {
                        if (hasPro) {
                          setShowInPublicSchedule(e.target.checked);
                        } else {
                          setShowProModal(true);
                        }
                      }}
                      disabled={!hasPro}
                      style={{ width: '44px', height: '24px', cursor: hasPro ? 'pointer' : 'not-allowed' }} 
                    />
                  </div>
                </div>

                {/* REMOVED: "Allow session to be favorited by attendees" */} 

                <div 
                  className="relative p-4 rounded-lg border-2" 
                  style={{ 
                    backgroundColor: hasPro ? 'rgba(255,255,255,0.05)' : 'rgba(245, 158, 11, 0.15)',
                    borderColor: hasPro ? 'rgba(255,255,255,0.2)' : '#F59E0B',
                    opacity: hasPro ? 1 : 0.9
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{t('wizard.step3.sessions.modal.enableCheckIn')}</span>
                      <span 
                        className="px-1.5 py-0.5 rounded text-xs flex items-center gap-1"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: 'white',
                          fontWeight: 700
                        }}
                      >
                        <Crown size={10} />
                        PRO
                      </span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={enableCheckIn}
                      onChange={(e) => {
                        if (hasPro) {
                          setEnableCheckIn(e.target.checked);
                        } else {
                          setShowProModal(true);
                        }
                      }}
                      disabled={!hasPro}
                      style={{ width: '44px', height: '24px', cursor: hasPro ? 'pointer' : 'not-allowed' }} 
                    />
                  </div>
                </div>
              </div>

              {/* Post-Session Custom Form - PRO Feature */} 
              <div 
                className="p-4 rounded-lg border-2" 
                style={{ 
                  backgroundColor: hasPro ? 'rgba(255,255,255,0.05)' : 'rgba(245, 158, 11, 0.15)',
                  borderColor: hasPro ? 'rgba(255,255,255,0.2)' : '#F59E0B',
                  opacity: hasPro ? 1 : 0.9
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} style={{ color: '#0684F5' }} />
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>
                    {t('wizard.step3.sessions.modal.postSessionSurvey')}
                  </label>
                  <span 
                    className="px-1.5 py-0.5 rounded text-xs flex items-center gap-1"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      color: 'white',
                      fontWeight: 700
                    }}
                  >
                    <Crown size={10} />
                    PRO
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px' }}>
                  {t('wizard.step3.sessions.modal.postSessionSurveyHelper')}
                </p>
                <select
                  value={selectedCustomForm}
                  onChange={(e) => {
                    if (hasPro) {
                      setSelectedCustomForm(e.target.value);
                    } else {
                      setShowProModal(true);
                    }
                  }}
                  disabled={!hasPro}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    backgroundColor: hasPro ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                    cursor: hasPro ? 'pointer' : 'not-allowed',
                    appearance: 'none'
                  }}
                >
                  <option value="">{t('wizard.step3.sessions.modal.postSessionSurveyNone')}</option>
                  <option value="feedback-1">{t('wizard.step3.sessions.modal.postSessionSurveyOptions.sessionFeedback')}</option>
                  <option value="feedback-2">{t('wizard.step3.sessions.modal.postSessionSurveyOptions.speakerEvaluation')}</option>
                  <option value="feedback-3">{t('wizard.step3.sessions.modal.postSessionSurveyOptions.contentRating')}</option>
                  <option value="custom-1">{t('wizard.step3.sessions.modal.postSessionSurveyOptions.customOne')}</option>
                  <option value="custom-2">{t('wizard.step3.sessions.modal.postSessionSurveyOptions.customTwo')}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */} 
        <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {t('wizard.step3.sessions.modal.cancel')}
          </button>
          <button
            onClick={handleSaveClick}
            disabled={!!capacityError}
            className="px-5 py-2.5 rounded-lg transition-colors"
            style={{
              backgroundColor: capacityError ? '#94A3B8' : '#0684F5',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 500,
              cursor: capacityError ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!capacityError) e.currentTarget.style.backgroundColor = '#0570D6';
            }}
            onMouseLeave={(e) => {
              if (!capacityError) e.currentTarget.style.backgroundColor = '#0684F5';
            }}
          >
            {initialData ? t('wizard.step3.sessions.modal.saveChanges') : t('wizard.step3.sessions.modal.createSession')}
          </button>
        </div>

        {/* Pro Modal */} 
        {showProModal && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '12px'
            }}
            onClick={() => setShowProModal(false)}
          >
            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: '#0B2641',
                border: '2px solid #F59E0B',
                maxWidth: '400px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Crown size={32} style={{ color: '#F59E0B' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('wizard.step3.sessions.proModal.title')}
                </h3>
              </div>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '20px' }}>
                {t('wizard.step3.sessions.proModal.subtitle')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {t('wizard.step3.sessions.modal.cancel')}
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('wizard.step3.sessions.proModal.upgrade')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Speaker Selection Modal Component
interface SpeakerSelectionModalProps {
  onClose: () => void;
  selectedSpeakers: SpeakerData[];
  setSelectedSpeakers: (speakers: SpeakerData[]) => void;
  allSpeakers: SpeakerData[];
}

function SpeakerSelectionModal({ onClose, selectedSpeakers, setSelectedSpeakers, allSpeakers }: SpeakerSelectionModalProps) {
  const { t } = useI18n();
  const [tempSelected, setTempSelected] = useState<SpeakerData[]>(selectedSpeakers);

  const handleToggleSpeaker = (speaker: SpeakerData) => {
    if (tempSelected.find(s => s.id === speaker.id)) {
      setTempSelected(tempSelected.filter(s => s.id !== speaker.id));
    } else {
      setTempSelected([...tempSelected, speaker]);
    }
  };

  const handleSave = () => {
    setSelectedSpeakers(tempSelected);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[600px] rounded-xl"
        style={{
          backgroundColor: '#0B2641',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */} 
        <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
              {t('wizard.step3.sessions.modal.selectSpeakers')}
            </h2>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              {t('wizard.step3.sessions.modal.selectSpeakersSubtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: '#94A3B8',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Speaker List */} 
        <div className="p-6">
          <div className="flex flex-col gap-3">
            {allSpeakers.length > 0 ? (
                allSpeakers.map((speaker) => {
                const isSelected = tempSelected.find(s => s.id === speaker.id);
                return (
                    <label
                    key={speaker.id}
                    className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all"
                    style={{
                        backgroundColor: isSelected ? 'rgba(6, 132, 245, 0.15)' : 'rgba(255,255,255,0.05)',
                        border: `2px solid ${isSelected ? '#0684F5' : 'rgba(255,255,255,0.1)'}`,
                    }}
                    >
                    <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => handleToggleSpeaker(speaker)}
                        style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                        }}
                    />
                    <div
                        style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#0684F5',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 600
                        }}
                    >
                        {speaker.photo ? (
                            <img src={speaker.photo} alt={speaker.full_name || speaker.name || 'Speaker'} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            (speaker.full_name || speaker.name || 'S').charAt(0)
                        )}
                    </div>
                    <div className="flex-1">
                        <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                        {speaker.full_name || speaker.name || 'Untitled Speaker'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                        {speaker.title || 'No Title'} • {speaker.company || 'No Company'}
                        </p>
                    </div>
                    {isSelected && (
                        <CheckCircle2 size={20} style={{ color: '#0684F5' }} />
                    )}
                    </label>
                );
                })
            ) : (
                <div className="text-center py-8 text-slate-400">
                    {t('wizard.step3.sessions.modal.noSpeakersFound')}
                </div>
            )}
          </div>
        </div>

        {/* Modal Footer */} 
        <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>
            {t('wizard.step3.sessions.modal.selectedCount', { count: tempSelected.length })}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg transition-colors"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {t('wizard.step3.sessions.modal.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-lg transition-colors"
              style={{
                backgroundColor: '#0684F5',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0570D6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0684F5';
              }}
            >
              {t('wizard.step3.sessions.modal.saveSelection')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export Modal Component
interface ExportModalProps {
  onClose: () => void;
  sessions: Session[];
}

function ExportModal({ onClose, sessions }: ExportModalProps) {
  const { t } = useI18n();

  const handleExportCSV = () => {
    if (sessions.length === 0) {
      toast.info('No sessions to export');
      return;
    }

    const headers = ['Title', 'Type', 'Date', 'Start Time', 'End Time', 'Venue', 'Speakers', 'Capacity', 'Description'];
    const rows = sessions.map(s => [
      escapeCSV(s.title),
      escapeCSV(s.type),
      escapeCSV(s.date),
      escapeCSV(s.startTime),
      escapeCSV(s.endTime),
      escapeCSV(s.venue || 'TBD'),
      escapeCSV(s.speakers.map(sp => sp.full_name || (sp as any).name).join('; ')),
      s.capacity,
      escapeCSV(s.description.replace(/,/g, ';'))
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'event-schedule.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Schedule exported as CSV');
    onClose();
  };

  const handleExportPDF = () => {
    if (sessions.length === 0) {
      toast.info('No sessions to export');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to export PDF');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Event Schedule - PDF Export</title>
        <style>
          body { font-family: 'Inter', sans-serif; color: #1A1D1F; padding: 40px; }
          .header { margin-bottom: 40px; border-bottom: 2px solid #0684F5; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #0B2641; font-size: 28px; }
          .header p { margin: 5px 0 0; color: #6F767E; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #F4F5F6; text-align: left; padding: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6F767E; border-bottom: 1px solid #E9EAEB; }
          td { padding: 12px; font-size: 14px; border-bottom: 1px solid #E9EAEB; vertical-align: top; }
          .session-title { font-weight: 700; color: #0B2641; margin-bottom: 4px; }
          .session-type { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: #E0E7FF; color: #0684F5; }
          .speaker-list { color: #6F767E; font-size: 13px; }
          .time-cell { white-space: nowrap; font-weight: 500; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Event Schedule</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th width="15%">Time</th>
              <th width="40%">Session Details</th>
              <th width="20%">Speakers</th>
              <th width="25%">Venue</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.map(s => `
              <tr>
                <td class="time-cell">
                  <div>${escapeHTML(s.date)}</div>
                  <div style="color: #6F767E; font-size: 12px;">${escapeHTML(s.startTime)} - ${escapeHTML(s.endTime)}</div>
                </td>
                <td>
                  <div class="session-title">${escapeHTML(s.title)}</div>
                  <div class="session-type">${escapeHTML(s.type)}</div>
                  <div style="margin-top: 8px; font-size: 12px; color: #6F767E;">${escapeHTML(s.description)}</div>
                </td>
                <td>
                  <div class="speaker-list">
                    ${s.speakers.map(sp => escapeHTML(sp.full_name || (sp as any).name)).join('<br>')}
                  </div>
                </td>
                <td>
                  <div style="font-weight: 500;">${escapeHTML(s.venue || 'TBD')}</div>
                  <div style="font-size: 12px; color: #6F767E;">Capacity: ${s.capacity}</div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            // Optional: window.close();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] rounded-xl p-6"
        style={{
          backgroundColor: '#0B2641',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>{t('wizard.step3.sessions.export.title')}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        
        <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '20px' }}>
          {t('wizard.step3.sessions.export.subtitle')}
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleExportCSV}
            className="p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-white/10"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
          >
            <span>{t('wizard.step3.sessions.export.csv')}</span>
            <Download size={16} />
          </button>
          <button 
            onClick={handleExportPDF}
            className="p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-white/10"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
          >
            <span>{t('wizard.step3.sessions.export.pdf')}</span>
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}