import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { createNotification } from '../../lib/notifications';

interface BookMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  recipient: { id: string; name: string };
  existingMeeting?: any; // Optional: for rescheduling
}

const MEETINGS_TABLE = 'b2b_meetings';

export default function BookMeetingModal({ isOpen, onClose, currentUser, recipient, existingMeeting }: BookMeetingModalProps) {
  const [meetingType, setMeetingType] = useState<'video' | 'in-person' | 'hybrid' | ''>('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingEventId, setMeetingEventId] = useState<string | null>(null);
  const [meetingSessionId, setMeetingSessionId] = useState<string | null>(null);
  const [meetingEditId, setMeetingEditId] = useState<string | null>(null);
  const [meetingMessage, setMeetingMessage] = useState('');
  
  // Data State
  const [eventCatalog, setEventCatalog] = useState<any[]>([]);
  const [eventSessions, setEventSessions] = useState<any[]>([]);
  const [eventMeetingCounts, setEventMeetingCounts] = useState<Record<string, number>>({});
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Filters
  const [eventFilterCountry, setEventFilterCountry] = useState('');
  const [eventFilterDate, setEventFilterDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadEventData();
      if (existingMeeting) {
        setMeetingEditId(existingMeeting.id);
        setMeetingType(existingMeeting.meetingFormat || '');
        if (existingMeeting.startAt) {
          const date = new Date(existingMeeting.startAt);
          setMeetingDate(date.toISOString().slice(0, 10));
          setMeetingTime(date.toTimeString().slice(0, 5));
        }
        setMeetingEventId(existingMeeting.eventId || null);
        setMeetingSessionId(existingMeeting.sessionId || null);
      } else {
        resetForm();
      }
    }
  }, [isOpen, existingMeeting]);

  const resetForm = () => {
    setMeetingType('');
    setMeetingDate('');
    setMeetingTime('');
    setMeetingEventId(null);
    setMeetingSessionId(null);
    setMeetingEditId(null);
    setMeetingMessage('');
  };

  const loadEventData = async () => {
    setIsLoadingEvents(true);
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('id, name, start_date, location, city, country, event_type, status')
        .eq('status', 'published');

      const catalog = (eventData || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        startDate: e.start_date,
        location: e.city || e.location || 'Online',
        country: e.country || '',
        format: e.event_type === 'virtual' ? 'Online' : 'In-person',
        capacity: 100 // Mock capacity for now
      }));
      setEventCatalog(catalog);

      // Fetch sessions for these events
      const eventIds = catalog.map(e => e.id);
      if (eventIds.length > 0) {
        const { data: sessionData } = await supabase
          .from('event_sessions')
          .select('id, event_id, title, starts_at, ends_at, capacity, location')
          .in('event_id', eventIds);
        
        setEventSessions((sessionData || []).map((s: any) => ({
          id: s.id,
          eventId: s.event_id,
          title: s.title,
          startsAt: s.starts_at,
          endsAt: s.ends_at,
          capacity: s.capacity,
          location: s.location
        })));

        // Fetch meeting counts (mock or real)
        const { data: meetingsData } = await supabase
          .from(MEETINGS_TABLE)
          .select('event_id')
          .in('event_id', eventIds);
        
        const counts: Record<string, number> = {};
        (meetingsData || []).forEach((m: any) => {
          if (m.event_id) counts[m.event_id] = (counts[m.event_id] || 0) + 1;
        });
        setEventMeetingCounts(counts);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser?.id || !recipient?.id) return;
    if (!meetingType) {
      toast.error('Select a meeting type.');
      return;
    }

    const isVirtual = meetingType === 'video';
    if (isVirtual && (!meetingDate || !meetingTime)) {
      toast.error('Select a meeting date and time.');
      return;
    }
    if (!isVirtual && !meetingEventId) {
      toast.error('Select an event for in-person or hybrid meetings.');
      return;
    }
    if (!isVirtual && !meetingSessionId) {
      toast.error('Select a meeting slot.');
      return;
    }

    let startAt: Date;
    let endAt: Date;
    let location = 'Video Call';

    if (isVirtual) {
      startAt = new Date(`${meetingDate}T${meetingTime}:00`);
      if (Number.isNaN(startAt.getTime())) {
        toast.error('Invalid meeting date/time.');
        return;
      }
      endAt = new Date(startAt.getTime() + 30 * 60000); // 30 min default
    } else {
      const slot = eventSessions.find((session) => session.id === meetingSessionId);
      if (!slot?.startsAt) {
        toast.error('Selected slot has no time assigned.');
        return;
      }
      startAt = new Date(slot.startsAt);
      endAt = slot.endsAt ? new Date(slot.endsAt) : new Date(startAt.getTime() + 30 * 60000);
      location = slot.location || eventCatalog.find((event) => event.id === meetingEventId)?.location || 'On-site';
    }

    const payload = {
      organizer_id: currentUser.id,
      profile_a_id: currentUser.id,
      profile_b_id: recipient.id,
      event_id: isVirtual ? null : meetingEventId,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      meeting_type: isVirtual ? 'video' : 'in-person',
      location,
      status: 'pending',
      meta: {
        meeting_format: meetingType,
        session_id: isVirtual ? null : meetingSessionId,
        message: meetingMessage
      }
    };

    try {
      if (meetingEditId) {
        const { error } = await supabase.from(MEETINGS_TABLE).update(payload).eq('id', meetingEditId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(MEETINGS_TABLE).insert([payload]);
        if (error) throw error;
      }

      try {
        await createNotification({
          recipient_id: recipient.id,
          type: 'action',
          title: meetingEditId ? 'Meeting rescheduled' : 'Meeting requested',
          body: `${currentUser.full_name || currentUser.email} ${meetingEditId ? 'rescheduled' : 'scheduled'} a meeting with you.`,
          action_url: '/my-networking',
          actor_id: currentUser.id
        });
      } catch (notifyError) {
        console.warn('Failed to send notification (likely RLS):', notifyError);
      }

      toast.success(meetingEditId ? 'Meeting rescheduled' : 'Meeting requested');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule meeting');
    }
  };

  // Filter Logic
  const eventCountries = useMemo(() => {
    return Array.from(new Set(eventCatalog.map((e) => e.country).filter(Boolean)));
  }, [eventCatalog]);

  const filteredEventCatalog = useMemo(() => {
    return eventCatalog.filter((event) => {
      if (eventFilterCountry && event.country !== eventFilterCountry) return false;
      if (eventFilterDate && event.startDate && !event.startDate.startsWith(eventFilterDate)) return false;
      // Exclude passed events if needed, but keeping for now
      return true;
    });
  }, [eventCatalog, eventFilterCountry, eventFilterDate]);

  const filteredEventSessions = useMemo(() => {
    if (!meetingEventId) return [];
    return eventSessions
      .filter((session) => session.eventId === meetingEventId)
      .sort((a, b) => (a.startsAt > b.startsAt ? 1 : -1));
  }, [eventSessions, meetingEventId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-xl"
        style={{
          width: '720px',
          backgroundColor: '#1E3A5F',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0px 10px 40px rgba(0,0,0,0.5)',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
        >
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
              {meetingEditId ? 'Reschedule Meeting' : 'Schedule Meeting'}
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
              With {recipient.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={(event) => { event.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={(event) => { event.currentTarget.style.color = '#94A3B8'; }}
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-6 py-5" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="mb-5">
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '10px' }}>Meeting Type</p>
            <div className="flex items-center gap-3">
              {[
                { id: 'video', label: 'Online' },
                { id: 'in-person', label: 'In-person' },
                { id: 'hybrid', label: 'Hybrid' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setMeetingType(option.id as any)}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: meetingType === option.id ? '#0684F5' : 'rgba(255,255,255,0.05)',
                    color: meetingType === option.id ? '#FFFFFF' : '#94A3B8',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {meetingType && meetingType !== 'video' && (
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Filter by country</label>
                  <select
                    value={eventFilterCountry}
                    onChange={(event) => setEventFilterCountry(event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border outline-none mt-1"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  >
                    <option value="">All Countries</option>
                    {eventCountries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Filter by date</label>
                  <input
                    type="date"
                    value={eventFilterDate}
                    onChange={(event) => setEventFilterDate(event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border outline-none mt-1"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {isLoadingEvents && (
                  <div style={{ color: '#94A3B8', fontSize: '13px' }}>Loading events...</div>
                )}
                {!isLoadingEvents && filteredEventCatalog.length === 0 && (
                  <div style={{ color: '#94A3B8', fontSize: '13px' }}>
                    No events available for in-person meetings.
                  </div>
                )}
                {!isLoadingEvents &&
                  filteredEventCatalog.map((event) => {
                    const capacity = event.capacity || null;
                    const used = eventMeetingCounts[event.id] || 0;
                    const remaining = capacity ? Math.max(capacity - used, 0) : null;
                    const isFull = remaining !== null && remaining <= 0;
                    return (
                      <button
                        key={event.id}
                        onClick={() => {
                          if (isFull) return;
                          setMeetingEventId(event.id);
                          setMeetingSessionId(null);
                          if (!meetingDate && event.startDate) {
                            setMeetingDate(new Date(event.startDate).toISOString().slice(0, 10));
                          }
                          if (!meetingTime && event.startDate) {
                            setMeetingTime(new Date(event.startDate).toTimeString().slice(0, 5));
                          }
                        }}
                        className="w-full text-left rounded-lg p-3 transition-colors"
                        style={{
                          backgroundColor:
                            meetingEventId === event.id ? 'rgba(6, 132, 245, 0.15)' : 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          opacity: isFull ? 0.5 : 1
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{event.name}</p>
                            <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                              {event.location || 'On-site'} • {event.format || 'In-person'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {remaining !== null ? (
                              <p style={{ fontSize: '12px', color: remaining > 0 ? '#10B981' : '#EF4444' }}>
                                {remaining} slots left
                              </p>
                            ) : (
                              <p style={{ fontSize: '12px', color: '#94A3B8' }}>No capacity limit</p>
                            )}
                            {isFull && (
                              <p style={{ fontSize: '11px', color: '#EF4444' }}>Full</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>

              {meetingEventId && (
                <div className="mt-4">
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Meeting Slot</label>
                  <select
                    value={meetingSessionId || ''}
                    onChange={(event) => setMeetingSessionId(event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border outline-none mt-1"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  >
                    <option value="">Select a slot</option>
                    {filteredEventSessions.map((session) => {
                      const start = session.startsAt ? new Date(session.startsAt) : null;
                      const end = session.endsAt ? new Date(session.endsAt) : null;
                      const slotLabel = start
                        ? `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}${end ? ` - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}`
                        : 'TBD';
                      const remaining =
                        session.capacity ? Math.max(session.capacity - (session.attendees || 0), 0) : null;
                      return (
                        <option key={session.id} value={session.id} disabled={remaining !== null && remaining <= 0}>
                          {slotLabel} • {session.title}
                          {remaining !== null ? ` (${remaining} left)` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
          )}

          {meetingType === 'video' && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8' }}>Meeting Date</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(event) => setMeetingDate(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border outline-none mt-1"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8' }}>Meeting Time</label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(event) => setMeetingTime(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border outline-none mt-1"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          )}

          <div className="mt-5">
            <label style={{ fontSize: '13px', color: '#94A3B8', display: 'block', marginBottom: '8px' }}>
              Message (Optional)
            </label>
            <textarea
              value={meetingMessage}
              onChange={(e) => setMeetingMessage(e.target.value)}
              placeholder="Add a message to your meeting request..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.2)'
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              event.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = 'transparent';
              event.currentTarget.style.color = '#94A3B8';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: '#0684F5',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = '#0570D6';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = '#0684F5';
            }}
          >
            {meetingEditId ? 'Reschedule Meeting' : 'Schedule Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
}
