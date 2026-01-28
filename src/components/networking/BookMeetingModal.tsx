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
  existingMeeting?: any;
  eventId?: string;
}

const MEETINGS_TABLE = 'event_b2b_meetings';

export default function BookMeetingModal({ isOpen, onClose, currentUser, recipient, existingMeeting, eventId }: BookMeetingModalProps) {
  const [meetingType, setMeetingType] = useState<'video' | 'in-person' | 'hybrid' | ''>('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingEventId, setMeetingEventId] = useState<string | null>(eventId || null);
  const [meetingSessionId, setMeetingSessionId] = useState<string | null>(null);
  const [meetingEditId, setMeetingEditId] = useState<string | null>(null);
  const [meetingMessage, setMeetingMessage] = useState('');
  
  // Logistics State
  const [venueConfig, setVenueConfig] = useState<any>(null);
  const [generatedSlots, setGeneratedSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  
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
        setMeetingEventId(existingMeeting.eventId || eventId || null);
        setMeetingSessionId(existingMeeting.sessionId || null);
      } else {
        resetForm();
      }
    }
  }, [isOpen, existingMeeting, eventId]);

  const resetForm = () => {
    setMeetingType('');
    setMeetingDate('');
    setMeetingTime('');
    setMeetingEventId(eventId || null);
    setMeetingSessionId(null);
    setMeetingEditId(null);
    setMeetingMessage('');
    setGeneratedSlots([]);
    setSelectedSlot(null);
  };

  const loadEventData = async () => {
    setIsLoadingEvents(true);
    try {
      // 1. Fetch Event Details
      const { data: eventData } = await supabase
        .from('events')
        .select('id, name, start_date, end_date, location, city, country, event_type, status')
        .eq('id', eventId || '')
        .maybeSingle();

      if (eventData) {
        setEventCatalog([{
          id: eventData.id,
          name: eventData.name,
          startDate: eventData.start_date,
          endDate: eventData.end_date,
          location: eventData.city || eventData.location || 'Online',
          country: eventData.country || '',
          format: eventData.event_type === 'virtual' ? 'Online' : 'In-person',
          capacity: 100
        }]);
      }

      // 2. Fetch Venue Config
      if (eventId) {
        const { data: settings } = await supabase
          .from('event_b2b_settings')
          .select('venue_config')
          .eq('event_id', eventId)
          .maybeSingle();
        
        if (settings?.venue_config) {
          setVenueConfig(settings.venue_config);
        }
      }

    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const generateSlots = async (dateStr: string) => {
    if (!venueConfig || !eventId) return;
    setIsLoadingEvents(true);
    
    try {
      const matchingSchedules = venueConfig.schedules?.filter((s: any) => s.date === dateStr) || [];
      if (matchingSchedules.length === 0) {
        setGeneratedSlots([]);
        setIsLoadingEvents(false);
        return;
      }

      const duration = venueConfig.slotDuration || 30;
      const tables = venueConfig.tableCount || 10;
      
      // Fetch existing meetings for this date once
      const nextDay = new Date(dateStr);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const { data: existing } = await supabase
        .from('event_b2b_meetings')
        .select('start_at, location')
        .eq('event_id', eventId)
        .eq('status', 'confirmed') 
        .gte('start_at', `${dateStr}T00:00:00`)
        .lt('start_at', nextDay.toISOString().split('T')[0] + 'T00:00:00');

      const counts: Record<string, number> = {};
      const occupiedTables: Record<string, Set<number>> = {}; 

      (existing || []).forEach((m: any) => {
        const key = new Date(m.start_at).toISOString();
        counts[key] = (counts[key] || 0) + 1;
        if (m.location) {
          const match = m.location.match(/(\d+)$/);
          if (match) {
            if (!occupiedTables[key]) occupiedTables[key] = new Set();
            occupiedTables[key].add(parseInt(match[1]));
          }
        }
      });

      const allSlots: any[] = [];

      matchingSchedules.forEach((schedule: any) => {
        const start = new Date(`${dateStr}T${schedule.start}:00`);
        const end = new Date(`${dateStr}T${schedule.end}:00`);
        let current = new Date(start);

        while (current < end) {
          const slotIso = current.toISOString();
          const booked = counts[slotIso] || 0;
          const availableCount = tables - booked;
          
          const occupied = occupiedTables[slotIso] || new Set();
          const availableTables = [];
          for (let i = 1; i <= tables; i++) {
            if (!occupied.has(i)) {
              const num = i < 10 ? `0${i}` : `${i}`;
              availableTables.push(`${venueConfig.tablePrefix || 'Table-'}${num}`);
            }
          }
          if (availableTables.length < availableCount) {
               for (let k = availableTables.length; k < availableCount; k++) {
                   availableTables.push(`${venueConfig.tablePrefix || 'Table-'}${k+1}`);
               }
          }

          allSlots.push({
            time: current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            iso: slotIso,
            available: availableCount,
            total: tables,
            nextTable: availableTables[0]
          });
          current = new Date(current.getTime() + duration * 60000);
        }
      });

      // Sort all slots by time across all blocks
      allSlots.sort((a, b) => a.iso.localeCompare(b.iso));
      setGeneratedSlots(allSlots);
    } catch (e) {
      console.error(e);
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

    let startAt: Date;
    let endAt: Date;
    let location = 'Video Call';

    if (meetingType === 'video') {
       if (!meetingDate || !meetingTime) { toast.error('Select date/time'); return; }
       startAt = new Date(`${meetingDate}T${meetingTime}:00`);
       if (Number.isNaN(startAt.getTime())) {
        toast.error('Invalid meeting date/time.');
        return;
      }
       endAt = new Date(startAt.getTime() + 30 * 60000);
    } else {
       // In-person logic using generated slots
       if (!selectedSlot) {
         toast.error('Please select a time slot.');
         return;
       }
       startAt = new Date(selectedSlot.iso);
       const duration = venueConfig?.slotDuration || 30;
       endAt = new Date(startAt.getTime() + duration * 60000);
       location = selectedSlot.nextTable || `Networking Area`; 
    }

    // Resolve Attendee IDs
    const targetEventId = isVirtual(meetingType) ? (meetingEventId || eventCatalog[0]?.id) : (eventId || meetingEventId);
    
    if (!targetEventId) {
        toast.error("Event context missing.");
        return;
    }

    try {
        const [resA, resB] = await Promise.all([
            supabase.from('event_attendees').select('id').eq('event_id', targetEventId).eq('profile_id', currentUser.id).single(),
            supabase.from('event_attendees').select('id').eq('event_id', targetEventId).eq('profile_id', recipient.id).single()
        ]);

        if (resA.error || resB.error) {
            console.error(resA.error, resB.error);
            toast.error("Could not verify registration for one or both users.");
            return;
        }

        const payload = {
          attendee_a_id: resA.data.id,
          attendee_b_id: resB.data.id,
          event_id: targetEventId,
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
          location,
          status: 'confirmed',
          meta: {
            meeting_type: meetingType === 'video' ? 'video' : 'in-person',
            meeting_format: meetingType,
            session_id: meetingType === 'video' ? null : meetingSessionId,
            message: meetingMessage
          }
        };

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

  const isVirtual = (type: string) => type === 'video';

  // Filter Logic
  const eventCountries = useMemo(() => {
    return Array.from(new Set(eventCatalog.map((e) => e.country).filter(Boolean)));
  }, [eventCatalog]);

  const filteredEventCatalog = useMemo(() => {
    return eventCatalog.filter((event) => {
      if (eventFilterCountry && event.country !== eventFilterCountry) return false;
      if (eventFilterDate && event.startDate && !event.startDate.startsWith(eventFilterDate)) return false;
      return true;
    });
  }, [eventCatalog, eventFilterCountry, eventFilterDate]);

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
              {/* Date Selection */}
              <div className="mb-4">
                <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '8px' }}>Select Date</label>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {venueConfig?.schedules?.map((s: any) => {
                    const isSelected = meetingDate === s.date;
                    return (
                      <button
                        key={s.date}
                        onClick={() => {
                          setMeetingDate(s.date);
                          setSelectedSlot(null);
                          generateSlots(s.date);
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#0684F5' : 'rgba(255,255,255,0.05)',
                          border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                          color: isSelected ? '#FFFFFF' : '#94A3B8',
                          fontSize: '13px',
                          fontWeight: 500,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </button>
                    );
                  })}
                  {!venueConfig && <p style={{color: '#94A3B8', fontSize: '13px'}}>No networking schedule configured by organizer.</p>}
                </div>
              </div>

              {/* Slots Grid */}
              {meetingDate && (
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '8px' }}>Select Time Slot</label>
                  {isLoadingEvents ? (
                    <div style={{ color: '#94A3B8', fontSize: '13px' }}>Loading slots...</div>
                  ) : generatedSlots.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {generatedSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          disabled={slot.available <= 0}
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: selectedSlot?.iso === slot.iso ? '#0684F5' : slot.available > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                            border: selectedSlot?.iso === slot.iso ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            color: selectedSlot?.iso === slot.iso ? '#FFFFFF' : slot.available > 0 ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: slot.available > 0 ? 'pointer' : 'not-allowed',
                            position: 'relative'
                          }}
                        >
                          {slot.time}
                          {slot.available <= 3 && slot.available > 0 && (
                            <span style={{ position: 'absolute', top: -4, right: -4, fontSize: '9px', backgroundColor: '#F59E0B', color: '#000', padding: '1px 4px', borderRadius: '4px' }}>
                              {slot.available} left
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#94A3B8', fontSize: '13px' }}>No slots available for this date.</p>
                  )}
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