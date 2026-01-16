import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Filter,
  MoreVertical,
  Bell,
  Eye,
  Edit,
  Grid3x3,
  List,
  ChevronDown,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { useI18n } from '../../i18n/I18nContext';

interface EventScheduleTabProps {
  eventId?: string;
}

type SessionStatus = 'confirmed' | 'pending' | 'cancelled' | 'full';

interface Session {
  id: string;
  title: string;
  speaker: string;
  speakerPhoto: string;
  location: string;
  startTime: string;
  endTime: string;
  day: number;
  attendees: number;
  capacity: number;
  status: SessionStatus;
  track: string;
  description: string;
  starts_at: string | null;
  ends_at: string | null;
}

interface AttendeeRow {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  avatar_url: string | null;
  photo_url: string | null;
}

const fmtTime = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const parseTime = (t: string) => {
  const s = (t || '').trim();
  const m12 = s.match(/^([01]?\d|2[0-3])\s*[:.]\s*([0-5]\d)\s*(AM|PM)$/i);
  if (m12) {
    let h = Number(m12[1]);
    const min = Number(m12[2]);
    const ap = m12[3].toUpperCase();
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return { h, min };
  }
  const m24 = s.match(/^([01]?\d|2[0-3])\s*[:.]\s*([0-5]\d)$/);
  if (m24) return { h: Number(m24[1]), min: Number(m24[2]) };
  return null;
};

const buildTimestamp = (eventStartISO: string | null, day: number, timeStr: string) => {
  const p = parseTime(timeStr);
  if (!p) return null;
  const base = eventStartISO ? new Date(eventStartISO) : new Date();
  if (Number.isNaN(base.getTime())) return null;
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), 0, 0, 0));
  d.setUTCDate(d.getUTCDate() + Math.max(0, (day || 1) - 1));
  d.setUTCHours(p.h, p.min, 0, 0);
  return d.toISOString();
};

const getCapacityColor = (attendees: number, capacity: number) => {
  if (!capacity) return '#10B981';
  const percentage = (attendees / capacity) * 100;
  if (percentage >= 90) return '#EF4444';
  if (percentage >= 75) return '#F59E0B';
  return '#10B981';
};

export default function EventScheduleTab({ eventId }: EventScheduleTabProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [selectedDay, setSelectedDay] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [eventStartISO, setEventStartISO] = useState<string | null>(null);
  const [eventEndISO, setEventEndISO] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [filterDraftTrack, setFilterDraftTrack] = useState<string>('');
  const [filterDraftRoom, setFilterDraftRoom] = useState<string>('');
  const [filterDraftStatus, setFilterDraftStatus] = useState<string>('');
  const [filterTrack, setFilterTrack] = useState<string>('');
  const [filterRoom, setFilterRoom] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);

  const [attendeesOpen, setAttendeesOpen] = useState(false);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifChannel, setNotifChannel] = useState<'in_app' | 'email' | 'sms' | 'push'>('in_app');
  const [notifSending, setNotifSending] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    speaker: '',
    speakerPhoto: '',
    location: '',
    track: '',
    status: 'confirmed' as SessionStatus,
    day: 1,
    startTime: '',
    endTime: '',
    capacity: 0,
    description: ''
  });

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case 'confirmed':
        return { label: t('manageEvent.agenda.status.confirmed'), color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', icon: CheckCircle };
      case 'full':
        return { label: t('manageEvent.agenda.status.full'), color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', icon: AlertCircle };
      case 'pending':
        return { label: t('manageEvent.agenda.status.pending'), color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.3)', icon: Clock };
      case 'cancelled':
        return { label: t('manageEvent.agenda.status.cancelled'), color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: XCircle };
      default:
        return { label: t('manageEvent.agenda.status.confirmed'), color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', icon: CheckCircle };
    }
  };

  useEffect(() => {
    if (!showFilterDropdown) return;
    const onDocClick = (e: MouseEvent) => {
      const el = dropdownRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setShowFilterDropdown(false);
    };
    document?.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showFilterDropdown]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!openRowMenuId) return;
      const target = e.target as HTMLElement | null;
      if (!target) {
        setOpenRowMenuId(null);
        return;
      }
      if (target.closest('[data-session-actions]')) return;
      setOpenRowMenuId(null);
    };
    document?.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openRowMenuId]);

  useEffect(() => {
    if (!eventId) return;
    const run = async () => {
      try {
        setIsLoading(true);

        const [{ data: ev }, { data: spk }, { data: sess }, { data: chk }, { data: regs }] = await Promise.all([
          supabase.from('events').select('start_date,end_date').eq('id', eventId).maybeSingle(),
          supabase.from('event_speakers').select('id,full_name,avatar_url').eq('event_id', eventId),
          supabase.from('event_sessions').select('*').eq('event_id', eventId).order('starts_at', { ascending: true }),
          supabase
            .from('event_checkins')
            .select('session_id,attendee_id')
            .eq('event_id', eventId)
            .eq('type', 'session')
            .not('session_id', 'is', null)
            .range(0, 4999),
          supabase
            .from('event_attendee_sessions')
            .select('session_id, attendee_id')
            .in('session_id', (await supabase.from('event_sessions').select('id').eq('event_id', eventId)).data?.map(s => s.id) || [])
        ]);

        const startISO = (ev as any)?.start_date ? new Date((ev as any).start_date).toISOString() : null;
        const endISO = (ev as any)?.end_date ? new Date((ev as any).end_date).toISOString() : null;
        setEventStartISO(startISO);
        setEventEndISO(endISO);

        const speakerById = new Map<string, { name: string; photo: string }>();
        (spk || []).forEach((r: any) => {
          speakerById.set(r.id, {
            name: r.full_name || 'TBD',
            photo: r.avatar_url || ''
          });
        });

        const checkinsSets = new Map<string, Set<string>>();
        (chk || []).forEach((r: any) => {
          const sid = r.session_id as string | null;
          const aid = r.attendee_id as string | null;
          if (!sid || !aid) return;
          const s = checkinsSets.get(sid) || new Set<string>();
          s.add(aid);
          checkinsSets.set(sid, s);
        });

        const registrationSets = new Map<string, Set<string>>();
        (regs || []).forEach((r: any) => {
          const sid = r.session_id as string | null;
          const aid = r.attendee_id as string | null;
          if (!sid || !aid) return;
          const s = registrationSets.get(sid) || new Set<string>();
          s.add(aid);
          registrationSets.set(sid, s);
        });

        const mapped: Session[] = (sess || []).map((row: any) => {
          const speakerIds: string[] = Array.isArray(row.speaker_ids) ? row.speaker_ids : [];
          const primarySpeaker = speakerIds.length ? speakerById.get(speakerIds[0]) : null;

          const speakerName = (row.speaker_name && String(row.speaker_name).trim()) ? String(row.speaker_name) : (primarySpeaker?.name || 'TBD');
          const speakerPhoto = (row.speaker_photo && String(row.speaker_photo).trim()) ? String(row.speaker_photo) : (primarySpeaker?.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80');

          const day = Number.isFinite(row.day) ? Number(row.day) : 1;

          const registeredCount = registrationSets.get(row.id)?.size || 0;
          const checkinCount = checkinsSets.get(row.id)?.size || 0;
          const attendees = registeredCount || checkinCount || (Number.isFinite(row.attendees) ? Number(row.attendees) : 0);
          const capacity = Number.isFinite(row.capacity) ? Number(row.capacity) : 0;

          let status: SessionStatus = (row.status || 'confirmed') as SessionStatus;
          if (status !== 'cancelled' && capacity && attendees >= capacity) status = 'full';
          if (!['confirmed', 'pending', 'cancelled', 'full'].includes(status)) status = 'confirmed';

          return {
            id: row.id,
            title: row.title || 'Untitled Session',
            speaker: speakerName,
            speakerPhoto,
            location: row.location || 'TBD',
            startTime: fmtTime(row.starts_at),
            endTime: fmtTime(row.ends_at),
            day: day || 1,
            attendees,
            capacity,
            status,
            track: row.track || '',
            description: row.description || '',
            starts_at: row.starts_at || null,
            ends_at: row.ends_at || null
          };
        });

        setSessions(mapped);

        const daysInSessions = Array.from(new Set(mapped.map(s => s.day))).filter(Boolean).sort((a, b) => a - b);
        const maxDayFromSessions = daysInSessions.length ? daysInSessions[daysInSessions.length - 1] : 1;
        let maxDay = maxDayFromSessions;
        if (startISO && endISO) {
          const a = new Date(startISO);
          const b = new Date(endISO);
          const diff = Math.round((Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()) - Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())) / 86400000) + 1;
          if (Number.isFinite(diff) && diff > maxDay) maxDay = diff;
        }
        if (!Number.isFinite(maxDay) || maxDay < 1) maxDay = 1;
        setSelectedDay(prev => Math.min(Math.max(1, prev), maxDay));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [eventId]);

  const dayButtons = useMemo(() => {
    let maxDay = 1;
    const daysInSessions = Array.from(new Set(sessions.map(s => s.day))).filter(Boolean).sort((a, b) => a - b);
    if (daysInSessions.length) maxDay = daysInSessions[daysInSessions.length - 1];
    if (eventStartISO && eventEndISO) {
      const a = new Date(eventStartISO);
      const b = new Date(eventEndISO);
      const diff = Math.round((Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()) - Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())) / 86400000) + 1;
      if (Number.isFinite(diff) && diff > maxDay) maxDay = diff;
    }
    if (!Number.isFinite(maxDay) || maxDay < 1) maxDay = 1;
    return Array.from({ length: maxDay }, (_, i) => i + 1).map((day) => {
      if (!eventStartISO) return { day, date: t('manageEvent.header.tbd') };
      const base = new Date(eventStartISO);
      if (Number.isNaN(base.getTime())) return { day, date: t('manageEvent.header.tbd') };
      const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), 0, 0, 0));
      d.setUTCDate(d.getUTCDate() + (day - 1));
      return { day, date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    });
  }, [eventStartISO, eventEndISO, sessions, t]);

  const trackOptions = useMemo(() => Array.from(new Set(sessions.map(s => (s.track || '').trim()).filter(Boolean))).sort(), [sessions]);
  const roomOptions = useMemo(() => Array.from(new Set(sessions.map(s => (s.location || '').trim()).filter(Boolean))).sort(), [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filterTrack && (s.track || '').trim() !== filterTrack) return false;
      if (filterRoom && (s.location || '').trim() !== filterRoom) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      return true;
    });
  }, [sessions, filterRoom, filterStatus, filterTrack]);

  const timeSlots = useMemo(() => {
    const slots: Record<string, Session[]> = {};
    const list = filteredSessions.filter(s => s.day === selectedDay);
    list.forEach((s) => {
      const key = `${s.startTime || t('manageEvent.header.tbd')} - ${s.endTime || t('manageEvent.header.tbd')}`;
      if (!slots[key]) slots[key] = [];
      slots[key].push(s);
    });
    return slots;
  }, [filteredSessions, selectedDay, t]);

  const stats = useMemo(() => {
    const total = filteredSessions.length;
    const confirmed = filteredSessions.filter(s => s.status === 'confirmed' || s.status === 'full').length;
    const confirmedPct = total ? Math.round((confirmed / total) * 100) : 0;
    const nearlyFull = filteredSessions.filter(s => s.capacity && (s.attendees / s.capacity) >= 0.9).length;
    const avg = (() => {
      const withCap = filteredSessions.filter(s => s.capacity > 0);
      if (!withCap.length) return 0;
      const sum = withCap.reduce((acc, s) => acc + Math.min(1, s.attendees / s.capacity), 0);
      return Math.round((sum / withCap.length) * 100);
    })();
    return { total, confirmed, confirmedPct, nearlyFull, avg };
  }, [filteredSessions]);

  const fetchSessionAttendees = async (sessionId: string) => {
    if (!eventId) return;
    try {
      setAttendeesLoading(true);
      // Fetch registrations first (primary source)
      const { data: regData, error: regError } = await supabase
        .from('event_attendee_sessions')
        .select('attendee_id, event_attendees(id,name,email,company,avatar_url,photo_url)')
        .eq('session_id', sessionId)
        .range(0, 499);

      if (regError) throw regError;

      // Also fetch check-ins to catch any walk-ins not in registration (edge case)
      const { data: checkinData, error: checkinError } = await supabase
        .from('event_checkins')
        .select('attendee_id, event_attendees(id,name,email,company,avatar_url,photo_url)')
        .eq('event_id', eventId)
        .eq('type', 'session')
        .eq('session_id', sessionId)
        .range(0, 499);
      
      if (checkinError) console.error('Error fetching checkins:', checkinError);

      const seen = new Set<string>();
      const rows: AttendeeRow[] = [];

      const processRow = (r: any) => {
        const a = r?.event_attendees;
        if (!a?.id) return;
        if (seen.has(a.id)) return;
        seen.add(a.id);
        rows.push({
          id: a.id,
          name: a.name,
          email: a.email || null,
          company: a.company || null,
          avatar_url: a.avatar_url || null,
          photo_url: a.photo_url || null
        });
      };

      (regData || []).forEach(processRow);
      (checkinData || []).forEach(processRow);

      setAttendees(rows);
    } catch (e) {
      console.error(e);
      setAttendees([]);
    } finally {
      setAttendeesLoading(false);
    }
  };

  const openAttendees = async (s: Session) => {
    setActiveSession(s);
    setAttendeesOpen(true);
    await fetchSessionAttendees(s.id);
  };

  const openNotification = (s: Session) => {
    setActiveSession(s);
    setNotifTitle(`Update: ${s.title}`);
    setNotifMessage('');
    setNotifChannel('in_app');
    setNotifOpen(true);
  };

  const sendNotification = async () => {
    if (!eventId || !activeSession) return;
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error(t('manageEvent.agenda.toasts.notifRequired'));
      return;
    }
    try {
      setNotifSending(true);
      const payload = {
        event_id: eventId,
        session_id: activeSession.id,
        created_by: user?.id || null,
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        channel: notifChannel,
        status: 'sent',
        audience: { type: 'session', session_id: activeSession.id }
      };
      const { data, error } = await supabase.from('event_notifications').insert(payload as any).select('*');
      if (error) throw error;
      if (!data || !data.length) throw new Error('No rows inserted');
      toast.success(t('manageEvent.agenda.toasts.notifSuccess'));
      setNotifOpen(false);
    } catch (e: any) {
      console.error(e);
      toast.error(t('manageEvent.agenda.toasts.notifError'));
    } finally {
      setNotifSending(false);
    }
  };

  const openEdit = (s: Session) => {
    setActiveSession(s);
    setEditForm({
      title: s.title,
      speaker: s.speaker,
      speakerPhoto: s.speakerPhoto,
      location: s.location === t('manageEvent.header.tbd') ? '' : s.location,
      track: s.track,
      status: s.status,
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      capacity: s.capacity || 0,
      description: s.description
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!eventId || !activeSession) return;
    if (!editForm.title.trim()) {
      toast.error(t('manageEvent.agenda.toasts.titleRequired'));
      return;
    }
    try {
      setEditSaving(true);
      const starts_at = buildTimestamp(eventStartISO, editForm.day, editForm.startTime);
      const ends_at = buildTimestamp(eventStartISO, editForm.day, editForm.endTime);
      const statusToStore = editForm.status === 'full' ? 'confirmed' : editForm.status;
      const payload: any = {
        title: editForm.title.trim(),
        description: editForm.description || '',
        location: editForm.location || '',
        track: editForm.track || '',
        status: statusToStore,
        day: editForm.day || 1,
        capacity: Number.isFinite(Number(editForm.capacity)) ? Number(editForm.capacity) : 0,
        speaker_name: editForm.speaker || '',
        speaker_photo: editForm.speakerPhoto || '',
        starts_at,
        ends_at
      };
      const { data, error } = await supabase
        .from('event_sessions')
        .update(payload)
        .eq('id', activeSession.id)
        .select('*');
      if (error) throw error;
      if (!data || !data.length) throw new Error('No rows updated');
      toast.success(t('manageEvent.agenda.toasts.updateSuccess'));
      setEditOpen(false);
      setIsLoading(true);
      const { data: sess, error: sessErr } = await supabase.from('event_sessions').select('*').eq('event_id', eventId).order('starts_at', { ascending: true });
      if (sessErr) throw sessErr;
      const refreshed: Session[] = (sess || []).map((row: any) => {
        const day = Number.isFinite(row.day) ? Number(row.day) : 1;
        const capacity = Number.isFinite(row.capacity) ? Number(row.capacity) : 0;
        const old = sessions.find(x => x.id === row.id);
        const attendees = old?.attendees || (Number.isFinite(row.attendees) ? Number(row.attendees) : 0);
        let status: SessionStatus = (row.status || 'confirmed') as SessionStatus;
        if (status !== 'cancelled' && capacity && attendees >= capacity) status = 'full';
        if (!['confirmed', 'pending', 'cancelled', 'full'].includes(status)) status = 'confirmed';
        return {
          id: row.id,
          title: row.title || 'Untitled Session',
          speaker: (row.speaker_name && String(row.speaker_name).trim()) ? String(row.speaker_name) : (old?.speaker || 'TBD'),
          speakerPhoto: (row.speaker_photo && String(row.speaker_photo).trim()) ? String(row.speaker_photo) : (old?.speakerPhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80'),
          location: row.location || 'TBD',
          startTime: fmtTime(row.starts_at),
          endTime: fmtTime(row.ends_at),
          day: day || 1,
          attendees,
          capacity,
          status,
          track: row.track || '',
          description: row.description || '',
          starts_at: row.starts_at || null,
          ends_at: row.ends_at || null
        };
      });
      setSessions(refreshed);
    } catch (e) {
      console.error(e);
      toast.error(t('manageEvent.agenda.toasts.updateError'));
    } finally {
      setEditSaving(false);
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm(t('wizard.step3.sessions.confirmDelete'))) return;
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('event_sessions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(t('wizard.step3.sessions.toasts.deleteSuccess') || 'Session deleted');
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete session');
    } finally {
      setIsLoading(false);
    }
  };

  const openScheduleBuilder = () => {
    if (!eventId) return;
    window.open(`/create/registration/${eventId}?substep=3.5`, '_blank');
  };

  if (!eventId) {
    return (
      <div className="rounded-xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}>
        Missing event id.
      </div>
    );
  }

  return (
    <div className="event-agenda">
      <style>{`
        @media (max-width: 600px) {
          .event-agenda__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .event-agenda__actions {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-agenda__actions > div,
          .event-agenda__actions > button {
            width: 100%;
          }

          .event-agenda__view-toggle {
            width: 100%;
          }

          .event-agenda__view-toggle button {
            width: 50%;
            justify-content: center;
          }

          .event-agenda__filter {
            width: 100%;
          }

          .event-agenda__filter button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 400px) {
          .event-agenda__view-toggle button {
            width: 100%;
          }
        }
      `}</style>
      <div>
        {/* HEADER */}
        <div className="event-agenda__header flex items-start justify-between mb-8">
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
              {t('manageEvent.agenda.header.title')}
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8' }}>
              {t('manageEvent.agenda.header.subtitle')}
            </p>
          </div>

          <div className="event-agenda__actions flex items-center gap-3">
            <div
              className="event-agenda__view-toggle flex rounded-lg border overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <button
                onClick={() => setViewMode('timeline')}
                className="flex items-center gap-2 px-4 py-2.5 transition-all"
                style={{
                  backgroundColor: viewMode === 'timeline' ? '#0684F5' : 'transparent',
                  color: viewMode === 'timeline' ? '#FFFFFF' : '#94A3B8',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Calendar size={16} />
                {t('manageEvent.agenda.viewModes.timeline')}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 px-4 py-2.5 transition-all"
                style={{
                  backgroundColor: viewMode === 'list' ? '#0684F5' : 'transparent',
                  color: viewMode === 'list' ? '#FFFFFF' : '#94A3B8',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <List size={16} />
                {t('manageEvent.agenda.viewModes.list')}
              </button>
            </div>

            <div className="event-agenda__filter relative" ref={dropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 rounded-lg border transition-colors"
                style={{
                  height: '44px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Filter size={16} />
                {t('manageEvent.agenda.filter.button')}
                <ChevronDown size={16} />
              </button>

              {showFilterDropdown && (
                <div
                  className="absolute right-0 mt-2 rounded-lg border shadow-lg"
                  style={{ width: '280px', backgroundColor: '#1E3A5F', borderColor: 'rgba(255, 255, 255, 0.15)', zIndex: 50 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4">
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                      {t('manageEvent.agenda.filter.title')}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                          {t('manageEvent.agenda.filter.track')}
                        </label>
                        <select
                          value={filterDraftTrack}
                          onChange={(e) => setFilterDraftTrack(e.target.value)}
                          className="w-full rounded px-3 py-2"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFFFFF', fontSize: '13px' }}
                        >
                          <option value="">{t('manageEvent.agenda.filter.allTracks')}</option>
                          {trackOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                          {t('manageEvent.agenda.filter.room')}
                        </label>
                        <select
                          value={filterDraftRoom}
                          onChange={(e) => setFilterDraftRoom(e.target.value)}
                          className="w-full rounded px-3 py-2"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFFFFF', fontSize: '13px' }}
                        >
                          <option value="">{t('manageEvent.agenda.filter.allRooms')}</option>
                          {roomOptions.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                          {t('manageEvent.agenda.filter.status')}
                        </label>
                        <select
                          value={filterDraftStatus}
                          onChange={(e) => setFilterDraftStatus(e.target.value)}
                          className="w-full rounded px-3 py-2"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFFFFF', fontSize: '13px' }}
                        >
                          <option value="">{t('manageEvent.agenda.filter.allStatus')}</option>
                          <option value="confirmed">{t('manageEvent.agenda.status.confirmed')}</option>
                          <option value="full">{t('manageEvent.agenda.status.full')}</option>
                          <option value="pending">{t('manageEvent.agenda.status.pending')}</option>
                          <option value="cancelled">{t('manageEvent.agenda.status.cancelled')}</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <button
                        className="flex-1 px-3 py-2 rounded"
                        style={{ backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => {
                          setFilterDraftTrack('');
                          setFilterDraftRoom('');
                          setFilterDraftStatus('');
                          setFilterTrack('');
                          setFilterRoom('');
                          setFilterStatus('');
                          setShowFilterDropdown(false);
                        }}
                      >
                        {t('manageEvent.agenda.filter.reset')}
                      </button>
                      <button
                        className="flex-1 px-3 py-2 rounded"
                        style={{ backgroundColor: '#0684F5', border: 'none', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => {
                          setFilterTrack(filterDraftTrack);
                          setFilterRoom(filterDraftRoom);
                          setFilterStatus(filterDraftStatus);
                          setShowFilterDropdown(false);
                        }}
                      >
                        {t('manageEvent.agenda.filter.apply')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              className="flex items-center gap-2 px-5 rounded-lg border transition-colors"
              style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              onClick={openScheduleBuilder}
            >
              <Edit size={16} />
              {t('manageEvent.agenda.builder')}
              <ExternalLink size={14} />
            </button>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(6, 132, 245, 0.15)' }}>
                <Calendar size={24} style={{ color: '#0684F5' }} />
              </div>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>{t('manageEvent.agenda.stats.total')}</p>
            <h3 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>{sessions.length}</h3>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t('manageEvent.agenda.stats.days', { count: dayButtons.length })}</p>
          </div>

          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                <CheckCircle size={24} style={{ color: '#10B981' }} />
              </div>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>{t('manageEvent.agenda.stats.confirmed')}</p>
            <h3 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              {sessions.filter(s => s.status === 'confirmed' || s.status === 'full').length}
            </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>
              {sessions.length ? Math.round((sessions.filter(s => s.status === 'confirmed' || s.status === 'full').length / sessions.length) * 100) : 0}% {t('manageEvent.agenda.stats.confirmed')}
            </p>
          </div>

          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
                <AlertCircle size={24} style={{ color: '#F59E0B' }} />
              </div>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>{t('manageEvent.agenda.stats.nearlyFull')}</p>
            <h3 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              {sessions.filter(s => s.capacity && (s.attendees / s.capacity) >= 0.9).length}
            </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t('manageEvent.agenda.stats.capacityHint')}</p>
          </div>

          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}>
                <Users size={24} style={{ color: '#8B5CF6' }} />
              </div>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>{t('manageEvent.agenda.stats.avgAttendance')}</p>
            <h3 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              {(() => {
                const withCap = sessions.filter(s => s.capacity > 0);
                if (!withCap.length) return 0;
                const sum = withCap.reduce((acc, s) => acc + Math.min(1, s.attendees / s.capacity), 0);
                return Math.round((sum / withCap.length) * 100);
              })()}%
            </h3>
            <div className="flex items-center gap-1" style={{ fontSize: '12px', color: '#10B981' }}>
              <TrendingUp size={12} />
              <span>{t('manageEvent.agenda.stats.attendanceHint')}</span>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#94A3B8' }}>
            {t('manageEvent.loading')}
          </div>
        )}

        {/* TIMELINE VIEW */}
        {viewMode === 'timeline' && !isLoading && (
          <div>
            <div className="flex items-center gap-2 mb-6" style={{ overflowX: 'auto' }}>
              {dayButtons.map(({ day, date }) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="px-6 py-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: selectedDay === day ? '#0684F5' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${selectedDay === day ? '#0684F5' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: selectedDay === day ? '#FFFFFF' : '#94A3B8',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('manageEvent.agenda.timeline.dayLabel', { day, date })}
                </button>
              ))}
            </div>

            <div className="space-y-8">
              {Object.entries(timeSlots).map(([timeSlot, sessionsInSlot]) => (
                <div key={timeSlot}>
                  <div className="flex items-center gap-3 mb-4">
                    <Clock size={18} style={{ color: '#6B7280' }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{timeSlot}</h3>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                  </div>

                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                    {sessionsInSlot.map((session) => {
                      const statusConfig = getStatusBadge(session.status);
                      const capacityColor = getCapacityColor(session.attendees, session.capacity);
                      const capacityPercentage = session.capacity ? (session.attendees / session.capacity) * 100 : 0;
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div
                          key={session.id}
                          className="rounded-xl p-4 border transition-all group"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            opacity: session.status === 'cancelled' ? 0.6 : 1
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(6, 132, 245, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px', lineHeight: '1.4' }}>{session.title}</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <img
                                  src={session.speakerPhoto}
                                  alt={session.speaker}
                                  className="rounded-full"
                                  style={{ width: '24px', height: '24px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                                />
                                <span style={{ fontSize: '14px', color: '#94A3B8' }}>{session.speaker}</span>
                                <span style={{ color: '#6B7280' }}>•</span>
                                <div className="flex items-center gap-1">
                                  <MapPin size={14} style={{ color: '#6B7280' }} />
                                  <span style={{ fontSize: '14px', color: '#94A3B8' }}>{session.location}</span>
                                </div>
                              </div>
                              {session.track && (
                                <span
                                  className="inline-block px-2 py-1 rounded text-xs"
                                  style={{ backgroundColor: 'rgba(6, 132, 245, 0.15)', color: '#0684F5', fontSize: '11px', fontWeight: 600 }}
                                >
                                  {session.track}
                                </span>
                              )}
                            </div>
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                              style={{
                                backgroundColor: statusConfig.bg,
                                border: `1px solid ${statusConfig.border}`,
                                color: statusConfig.color,
                                fontSize: '12px',
                                fontWeight: 600,
                                flexShrink: 0
                              }}
                            >
                              <StatusIcon size={12} />
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span style={{ fontSize: '13px', color: '#94A3B8' }}>{t('manageEvent.agenda.list.columns.attendees')}</span>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{session.attendees} / {session.capacity || 0}</span>
                            </div>
                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                              <div className="h-full transition-all" style={{ width: `${Math.min(capacityPercentage, 100)}%`, backgroundColor: capacityColor }} />
                            </div>
                          </div>

                          <div className="flex items-center gap-2" style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <button
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors"
                              style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                              onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                            >
                              <Trash2 size={14} />
                              {t('manageEvent.speakers.bulk.delete')}
                            </button>
                            <button
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors"
                              style={{ backgroundColor: 'rgba(6, 132, 245, 0.15)', border: '1px solid rgba(6, 132, 245, 0.3)', color: '#0684F5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                              onClick={(e) => { e.stopPropagation(); openAttendees(session); }}
                            >
                              <Eye size={14} />
                              {t('manageEvent.agenda.list.rowActions.viewAttendees')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!Object.keys(timeSlots).length && (
                <div className="rounded-xl p-8 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#94A3B8' }}>
                  {t('manageEvent.agenda.timeline.noSessions')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && !isLoading && (
          <div className="rounded-xl border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', overflowX: 'auto' }}>
            <div style={{ minWidth: '1200px' }}>
              <div className="flex items-center px-6 py-4 border-b" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div style={{ width: '15%', minWidth: '140px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.agenda.list.columns.time')}</div>
                <div style={{ width: '25%', minWidth: '250px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.agenda.list.columns.title')}</div>
                <div style={{ width: '15%', minWidth: '150px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.agenda.list.columns.speakers')}</div>
                <div style={{ width: '12%', minWidth: '120px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.agenda.list.columns.location')}</div>
                <div style={{ width: '15%', minWidth: '160px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.agenda.list.columns.capacity')}</div>
                <div style={{ width: '10%', minWidth: '110px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.agenda.list.columns.status')}</div>
                <div style={{ width: '8%', minWidth: '80px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.agenda.list.columns.actions')}</div>
              </div>

              {filteredSessions.filter(s => s.day === selectedDay).map((session) => {
                const statusConfig = getStatusBadge(session.status);
                const capacityColor = getCapacityColor(session.attendees, session.capacity);
                const capacityPercentage = session.capacity ? (session.attendees / session.capacity) * 100 : 0;
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={session.id}
                    className="flex items-center px-6 py-5 border-b transition-all"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)', opacity: session.status === 'cancelled' ? 0.6 : 1, cursor: 'pointer' }}
                    onClick={() => openEdit(session)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; }}
                  >
                    <div style={{ width: '15%', minWidth: '140px' }}>
                      <div className="flex items-center gap-2">
                        <Clock size={16} style={{ color: '#6B7280' }} />
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{session.startTime || 'TBD'}</p>
                          <p style={{ fontSize: '12px', color: '#94A3B8' }}>{session.endTime || 'TBD'}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ width: '25%', minWidth: '250px' }}>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{session.title}</p>
                      {session.track && (
                        <span className="inline-block px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(6, 132, 245, 0.15)', color: '#0684F5', fontSize: '11px', fontWeight: 600 }}>{session.track}</span>
                      )}
                    </div>

                    <div style={{ width: '15%', minWidth: '150px' }}>
                      <div className="flex items-center gap-2">
                        <img src={session.speakerPhoto} alt={session.speaker} className="rounded-full" style={{ width: '32px', height: '32px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.15)' }} />
                        <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{session.speaker}</span>
                      </div>
                    </div>

                    <div style={{ width: '12%', minWidth: '120px' }}>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} style={{ color: '#6B7280' }} />
                        <span style={{ fontSize: '14px', color: '#94A3B8' }}>{session.location}</span>
                      </div>
                    </div>

                    <div style={{ width: '15%', minWidth: '160px' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{session.attendees} / {session.capacity || 0}</span>
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>{Math.round(capacityPercentage)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <div className="h-full transition-all" style={{ width: `${Math.min(capacityPercentage, 100)}%`, backgroundColor: capacityColor }} />
                      </div>
                    </div>

                    <div style={{ width: '10%', minWidth: '110px' }}>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: statusConfig.bg, border: `1px solid ${statusConfig.border}`, color: statusConfig.color, fontSize: '12px', fontWeight: 600 }}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </div>

                    <div style={{ width: '8%', minWidth: '80px' }}>
                      <div className="relative" data-session-actions>
                        <button
                          className="flex items-center justify-center rounded-lg transition-colors"
                          style={{ width: '32px', height: '32px', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#FFFFFF', cursor: 'pointer' }}
                          onClick={(e) => { e.stopPropagation(); setOpenRowMenuId((prev) => (prev === session.id ? null : session.id)); }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openRowMenuId === session.id && (
                          <div
                            className="absolute right-0 mt-2 rounded-lg border shadow-lg overflow-hidden"
                            style={{ position:"fixed", width: '220px', backgroundColor: '#1E3A5F', borderColor: 'rgba(255, 255, 255, 0.15)', zIndex: 60 }}
                          >
                            <button
                              className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-red-500/10"
                              style={{ color: '#EF4444', fontSize: '13px', fontWeight: 600, backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                              onClick={(e) => { e.stopPropagation(); setOpenRowMenuId(null); handleDeleteSession(session.id); }}
                            >
                              <Trash2 size={14} /> {t('manageEvent.speakers.bulk.delete')}
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/5"
                              style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600, backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                              onClick={(e) => { e.stopPropagation(); setOpenRowMenuId(null); openAttendees(session); }}
                            >
                              <Eye size={14} /> {t('manageEvent.agenda.list.rowActions.viewAttendees')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {!filteredSessions.filter(s => s.day === selectedDay).length && (
                <div className="px-6 py-10" style={{ color: '#94A3B8' }}>
                  {t('manageEvent.agenda.timeline.noSessions')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODALS */}
        {attendeesOpen && activeSession && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(11, 38, 65, 0.85)' }}>
            <div className="w-full max-w-[820px] rounded-2xl border" style={{ backgroundColor: '#0D3052', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{t('manageEvent.agenda.modals.attendees.title')}</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>{activeSession.title}</div>
                </div>
                <button
                  onClick={() => { setAttendeesOpen(false); setAttendees([]); }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                {attendeesLoading ? (
                  <div style={{ color: '#94A3B8' }}>{t('manageEvent.agenda.modals.attendees.loading')}</div>
                ) : (
                  <div className="rounded-xl border" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                    <div className="flex px-5 py-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', color: '#94A3B8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                      <div style={{ width: '45%' }}>{t('manageEvent.agenda.modals.attendees.columns.attendee')}</div>
                      <div style={{ width: '35%' }}>{t('manageEvent.agenda.modals.attendees.columns.company')}</div>
                      <div style={{ width: '20%' }}>{t('manageEvent.agenda.modals.attendees.columns.email')}</div>
                    </div>
                    {attendees.map((a) => (
                      <div key={a.id} className="flex items-center px-5 py-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ width: '45%' }} className="flex items-center gap-3">
                          <img
                            src={a.avatar_url || a.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80'}
                            className="rounded-full"
                            style={{ width: '34px', height: '34px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                          />
                          <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>{a.name}</div>
                        </div>
                        <div style={{ width: '35%', color: '#94A3B8', fontSize: '14px' }}>{a.company || '—'}</div>
                        <div style={{ width: '20%', color: '#94A3B8', fontSize: '14px' }}>{a.email || '—'}</div>
                      </div>
                    ))}
                    {!attendees.length && (
                      <div className="px-5 py-6" style={{ color: '#94A3B8' }}>{t('manageEvent.agenda.modals.attendees.empty')}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {notifOpen && activeSession && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(11, 38, 65, 0.85)' }}>
            <div className="w-full max-w-[720px] rounded-2xl border" style={{ backgroundColor: '#0D3052', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{t('manageEvent.agenda.modals.notification.title')}</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>{activeSession.title}</div>
                </div>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.notification.fields.title')}</label>
                  <input
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.notification.fields.channel')}</label>
                  <select
                    value={notifChannel}
                    onChange={(e) => setNotifChannel(e.target.value as any)}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="in_app">{t('manageEvent.agenda.modals.notification.channels.inApp')}</option>
                    <option value="email">{t('manageEvent.agenda.modals.notification.channels.email')}</option>
                    <option value="sms">{t('manageEvent.agenda.modals.notification.channels.sms')}</option>
                    <option value="push">{t('manageEvent.agenda.modals.notification.channels.push')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.notification.fields.message')}</label>
                  <textarea
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full rounded-lg px-4 py-3"
                    style={{ minHeight: '140px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none', resize: 'none' }}
                  />
                </div>
              </div>
              <div className="px-6 py-5 border-t flex items-center justify-end gap-3" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="px-5 rounded-lg border"
                  style={{ height: '44px', backgroundColor: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {t('manageEvent.agenda.modals.notification.actions.cancel')}
                </button>
                <button
                  onClick={sendNotification}
                  disabled={notifSending}
                  className="px-5 rounded-lg"
                  style={{ height: '44px', backgroundColor: '#8B5CF6', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: notifSending ? 'not-allowed' : 'pointer', opacity: notifSending ? 0.7 : 1 }}
                >
                  {notifSending ? t('manageEvent.agenda.modals.notification.actions.sending') : t('manageEvent.agenda.modals.notification.actions.send')}
                </button>
              </div>
            </div>
          </div>
        )}

        {editOpen && activeSession && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(11, 38, 65, 0.85)' }}>
            <div className=" max-w-[860px] rounded-2xl border" style={{ backgroundColor: '#0D3052', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{t('manageEvent.agenda.modals.edit.title')}</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>{activeSession.title}</div>
                </div>
                <button
                  onClick={() => setEditOpen(false)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.edit.fields.title')}</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.edit.fields.speaker')}</label>
                  <input
                    value={editForm.speaker}
                    onChange={(e) => setEditForm((p) => ({ ...p, speaker: e.target.value }))}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.edit.fields.speakerPhoto')}</label>
                  <input
                    value={editForm.speakerPhoto}
                    onChange={(e) => setEditForm((p) => ({ ...p, speakerPhoto: e.target.value }))}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.edit.fields.location')}</label>
                  <input
                    value={editForm.location}
                    onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.edit.fields.track')}</label>
                  <input
                    value={editForm.track}
                    onChange={(e) => setEditForm((p) => ({ ...p, track: e.target.value }))}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.edit.fields.day')}</label>
                  <select
                    value={editForm.day}
                    onChange={(e) => setEditForm((p) => ({ ...p, day: Number(e.target.value) }))}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  >
                    {[1, 2, 3].map((day) => (
                      <option key={day} value={day}>Day {day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.edit.fields.startTime')}</label>
                  <input
                    value={editForm.startTime}
                    onChange={(e) => setEditForm((p) => ({ ...p, startTime: e.target.value }))}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.edit.fields.endTime')}</label>
                  <input
                    value={editForm.endTime}
                    onChange={(e) => setEditForm((p) => ({ ...p, endTime: e.target.value }))}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.edit.fields.capacity')}</label>
                  <input
                    type="number"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.edit.fields.status')}</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as any }))}
                    className="w-full rounded-lg px-4"
                    style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="confirmed">{t('manageEvent.agenda.status.confirmed')}</option>
                    <option value="pending">{t('manageEvent.agenda.status.pending')}</option>
                    <option value="cancelled">{t('manageEvent.agenda.status.cancelled')}</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.agenda.modals.edit.fields.description')}</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-lg px-4 py-3"
                    style={{ minHeight: '120px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none', resize: 'none' }}
                  />
                </div>
              </div>

              <div className="px-6 py-5 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <button
                  onClick={() => { setEditOpen(false); }}
                  className="px-5 rounded-lg border"
                  style={{ height: '44px', backgroundColor: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {t('manageEvent.agenda.modals.edit.actions.cancel')}
                </button>
                <button
                  onClick={saveEdit}
                  disabled={editSaving}
                  className="px-5 rounded-lg"
                  style={{ height: '44px', backgroundColor: '#0684F5', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: editSaving ? 'not-allowed' : 'pointer', opacity: editSaving ? 0.7 : 1 }}
                >
                  {editSaving ? t('manageEvent.agenda.modals.edit.actions.saving') : t('manageEvent.agenda.modals.edit.actions.save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
