import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useI18n } from '../../i18n/I18nContext';
import AddEditSpeakerModal from '../wizard/modals/AddEditSpeakerModal';
import {
  Users, CheckCircle, Calendar, FileText, Star, Mail, Upload,
  Plus, Search, Filter, Grid3x3, List, ChevronDown, MoreVertical,
  Eye, Edit2, Clock, AlertCircle, Download, Send, Trash2, Crown,
  MapPin, Linkedin, Globe, Phone, Copy, X, Bell
} from 'lucide-react';
import type { ViewMode, ActiveTab, FilterType, SpeakerType, SpeakerStatus, MaterialStatus, Speaker, SessionSummary } from './speakers/types';
import { formatDateLabel, formatTimeLabel, formatDurationLabel, formatRelativeTime, escapeCsv } from './speakers/types';
import { SpeakerCard, SpeakersListView, BySessionView, MaterialsTrackingView, CommunicationLogView, AnalyticsView } from './speakers/SpeakersList';
import { ComposeMessageModal, StatusUpdateModal, AssignSpeakersModal, SpeakerDetailModal } from './speakers/SpeakerForm';

export default function EventSpeakersTab({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all-speakers');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedSpeakers, setSelectedSpeakers] = useState<Set<string>>(new Set());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'sessions' | 'materials' | 'communication' | 'analytics'>('overview');
  const navigate = useNavigate();
  const importInputRef = useRef<HTMLInputElement | null>(null);

    // Sample speaker data
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [openSpeakerMenuId, setOpenSpeakerMenuId] = useState<string | null>(null);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [composeRecipients, setComposeRecipients] = useState<Speaker[]>([]);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [composeChannel, setComposeChannel] = useState<'email' | 'in_app' | 'sms' | 'push'>('email');
  const [composeSending, setComposeSending] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusDraft, setStatusDraft] = useState<SpeakerStatus>('confirmed');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<SessionSummary | null>(null);
  const [assignSelection, setAssignSelection] = useState<Set<string>>(new Set());
  const [assignSaving, setAssignSaving] = useState(false);
  const [commRefreshKey, setCommRefreshKey] = useState(0);

  const normalizeMaterials = (value: any): Speaker['materials'] => {
    if (typeof value === 'string' && value.trim()) {
      try {
        value = JSON.parse(value);
      } catch {
        value = null;
      }
    }
    if (!value || typeof value !== 'object') {
      return { submitted: false, status: 'pending' };
    }
    const statusRaw = typeof value.status === 'string' ? value.status.toLowerCase() : '';
    const submitted = Boolean(value.submitted) || statusRaw === 'submitted';
    let status: MaterialStatus = 'pending';
    if (statusRaw === 'submitted') status = 'submitted';
    if (statusRaw === 'overdue') status = 'overdue';
    if (!statusRaw && submitted) status = 'submitted';

    const deadline = typeof value.deadline === 'string' ? value.deadline : (typeof value.due_date === 'string' ? value.due_date : undefined);
    const size = typeof value.size === 'string' ? value.size : (typeof value.file_size === 'string' ? value.file_size : undefined);
    const type = typeof value.type === 'string' ? value.type : undefined;
    const fileUrl = typeof value.file_url === 'string' ? value.file_url : (typeof value.url === 'string' ? value.url : undefined);

    return {
      submitted,
      status,
      deadline,
      size,
      type,
      fileUrl
    };
  };

  const normalizeExpertise = (value: any) => {
    if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item));
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map((item) => String(item));
      } catch {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const normalizeSessions = (value: any) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  };

  const normalizeSessionType = (value: any) => {
    const raw = String(value || '').toLowerCase();
    if (raw.includes('keynote')) return 'keynote';
    if (raw.includes('workshop')) return 'workshop';
    if (raw.includes('panel')) return 'panel';
    return 'panel';
  };


  const mapRowToSpeaker = (row: any): Speaker => {
    const name = row.full_name ?? row.name ?? '';
    const jobTitle = row.title ?? row.job_title ?? '';
    const company = row.company ?? '';
    const email = row.email ?? '';
    const phone = row.phone ?? '';
    const photo = row.avatar_url ?? row.photo_url ?? row.photo ?? 'https://upload.wikimedia.org/wikipedia/commons/5/59/User-avatar.svg';
    const type = (row.type ?? 'regular') as SpeakerType;
    const status = (row.status ?? 'pending') as SpeakerStatus;
    const bio = row.bio ?? '';
    const expertise = normalizeExpertise(row.expertise);
    const normalizedExpertise = expertise.length ? expertise : normalizeExpertise(row.tags);
    const sessions = normalizeSessions(row.sessions);
    const materials = normalizeMaterials(row.materials);
    const rating = typeof row.rating === 'number' ? row.rating : Number(row.rating) || 0;
    const expectedAttendance = row.expected_attendance ?? '';
    const linkedin = row.linkedin_url ?? row.linkedin ?? '';
    const twitter = row.twitter_url ?? row.twitter ?? '';
    const website = row.website ?? '';
    const created_at = row.created_at ?? undefined;
    const updated_at = row.updated_at ?? undefined;

    return {
      id: String(row.id),
      name,
      jobTitle,
      company,
      email,
      phone,
      photo,
      type,
      status,
      bio,
      expertise: normalizedExpertise,
      sessions,
      materials,
      rating,
      expectedAttendance,
      linkedin,
      twitter,
      website,
      isNew: Boolean(row.is_new),
      created_at,
      updated_at
    };
  };

  const fetchSpeakers = async () => {
    setIsLoading(true);
    setLoadError(null);

    const [speakersRes, sessionsRes] = await Promise.all([
      supabase
        .from('event_speakers')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false }),
      supabase
        .from('event_sessions')
        .select('*')
        .eq('event_id', eventId)
        .order('starts_at', { ascending: true })
    ]);

    if (speakersRes.error) {
      setLoadError(speakersRes.error.message || 'Failed to load speakers');
      setSpeakers([]);
      setSessions([]);
      setIsLoading(false);
      return;
    }

    if (sessionsRes.error) {
      setLoadError(sessionsRes.error.message || 'Failed to load sessions');
      setSpeakers([]);
      setSessions([]);
      setIsLoading(false);
      return;
    }

    const speakerRows = speakersRes.data || [];
    const sessionRows = sessionsRes.data || [];

    const baseSpeakers = speakerRows.map(mapRowToSpeaker);
    const sessionInfoById = new Map<string, { id: string; name: string; date: string; time: string }>();
    sessionRows.forEach((row: any) => {
      const id = String(row.id);
      const name = row.title || 'Untitled Session';
      const date = formatDateLabel(row.starts_at);
      const time = `${formatTimeLabel(row.starts_at)} - ${formatTimeLabel(row.ends_at)}`;
      sessionInfoById.set(id, { id, name, date, time });
    });

    const speakerSessionsMap = new Map<string, Speaker['sessions']>();
    const sessionSpeakerIdsMap = new Map<string, Set<string>>();

    speakerRows.forEach((row: any) => {
      const speakerId = String(row.id);
      const sessionList = normalizeSessions(row.sessions);
      if (!sessionList.length) return;
      sessionList.forEach((session: any) => {
        if (!session) return;
        const sessionId = String(session.id || '');
        if (!sessionId) return;
        const info = sessionInfoById.get(sessionId) || {
          id: sessionId,
          name: session.name || 'Session',
          date: session.date || 'TBD',
          time: session.time || 'TBD'
        };
        const existing = speakerSessionsMap.get(speakerId) || [];
        if (!existing.find((s) => s.id === sessionId)) {
          existing.push({
            id: info.id,
            name: info.name,
            date: info.date,
            time: info.time,
            role: session.role || 'Speaker'
          });
          speakerSessionsMap.set(speakerId, existing);
        }
        const speakerSet = sessionSpeakerIdsMap.get(sessionId) || new Set<string>();
        speakerSet.add(speakerId);
        sessionSpeakerIdsMap.set(sessionId, speakerSet);
      });
    });

    sessionRows.forEach((row: any) => {
      const sessionId = String(row.id);
      const speakerIds = Array.isArray(row.speaker_ids) ? row.speaker_ids : [];
      speakerIds.forEach((id: any) => {
        if (!id) return;
        const speakerId = String(id);
        const info = sessionInfoById.get(sessionId) || {
          id: sessionId,
          name: row.title || 'Session',
          date: formatDateLabel(row.starts_at),
          time: `${formatTimeLabel(row.starts_at)} - ${formatTimeLabel(row.ends_at)}`
        };
        const existing = speakerSessionsMap.get(speakerId) || [];
        if (!existing.find((s) => s.id === sessionId)) {
          existing.push({
            id: info.id,
            name: info.name,
            date: info.date,
            time: info.time,
            role: 'Speaker'
          });
          speakerSessionsMap.set(speakerId, existing);
        }
        const speakerSet = sessionSpeakerIdsMap.get(sessionId) || new Set<string>();
        speakerSet.add(speakerId);
        sessionSpeakerIdsMap.set(sessionId, speakerSet);
      });
    });

    const hydratedSpeakers = baseSpeakers.map((speaker) => ({
      ...speaker,
      sessions: speakerSessionsMap.get(speaker.id) || []
    }));

    const hydratedById = new Map(hydratedSpeakers.map((speaker) => [speaker.id, speaker]));

    const mappedSessions: SessionSummary[] = sessionRows.map((row: any) => {
      const sessionId = String(row.id);
      const speakerIds = Array.from(sessionSpeakerIdsMap.get(sessionId) || new Set<string>());
      const sessionSpeakers = speakerIds.map((id) => hydratedById.get(id)).filter(Boolean) as Speaker[];
      const date = formatDateLabel(row.starts_at);
      const time = `${formatTimeLabel(row.starts_at)} - ${formatTimeLabel(row.ends_at)}`;
      const duration = formatDurationLabel(row.starts_at, row.ends_at);
      const capacity = Number.isFinite(Number(row.capacity)) ? Number(row.capacity) : 0;
      const attendees = Number.isFinite(Number(row.attendees)) ? Number(row.attendees) : 0;
      const expected = capacity ? `${capacity} capacity` : attendees ? `${attendees} expected` : 'TBD';

      return {
        id: sessionId,
        name: row.title || 'Untitled Session',
        date,
        time,
        location: row.location || 'TBD',
        type: normalizeSessionType(row.type),
        duration,
        expected,
        speakers: sessionSpeakers,
        speakerIds,
        attendees,
        capacity
      };
    });

    setSpeakers(hydratedSpeakers);
    setSessions(mappedSessions);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSpeakers();
  }, [eventId]);

  useEffect(() => {
    if (!openSpeakerMenuId) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) {
        setOpenSpeakerMenuId(null);
        return;
      }
      if (target.closest('[data-speaker-menu]')) return;
      setOpenSpeakerMenuId(null);
    };
    document?.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openSpeakerMenuId]);



  const getSpeakerTypeLabel = (type: SpeakerType): string => {
    const labels = {
      keynote: t('manageEvent.speakers.allSpeakers.filters.keynote'),
      panel: t('manageEvent.speakers.allSpeakers.filters.panel'),
      workshop: t('manageEvent.speakers.allSpeakers.filters.workshop'),
      regular: 'Regular'
    };
    return labels[type] || 'Regular';
  };

  const getSpeakerTypeColor = (type: SpeakerType): string => {
    const colors = {
      keynote: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      panel: '#0684F5',
      workshop: '#8B5CF6',
      regular: '#6B7280'
    };
    return colors[type];
  };

  const getStatusColor = (status: SpeakerStatus): { bg: string; text: string } => {
    const colors = {
      confirmed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
      pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
      declined: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' }
    };
    return colors[status];
  };

  const getMaterialStatusColor = (status: MaterialStatus): { text: string; icon: any } => {
    const colors = {
      submitted: { text: '#10B981', icon: CheckCircle },
      pending: { text: '#F59E0B', icon: Clock },
      overdue: { text: '#EF4444', icon: AlertCircle }
    };
    return colors[status];
  };

  const filteredSpeakers = speakers.filter((speaker) => {
    if (filter === 'keynote' && speaker.type !== 'keynote') return false;
    if (filter === 'panel' && speaker.type !== 'panel') return false;
    if (filter === 'workshop' && speaker.type !== 'workshop') return false;
    if (filter === 'confirmed' && speaker.status !== 'confirmed') return false;
    if (filter === 'pending' && speaker.status !== 'pending') return false;
    if (filter === 'all') {
      // keep all
    }

    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    const haystack = [
      speaker.name,
      speaker.email,
      speaker.company,
      speaker.jobTitle
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  });

  const selectedSpeakerList = useMemo(
    () => speakers.filter((speaker) => selectedSpeakers.has(speaker.id)),
    [speakers, selectedSpeakers]
  );

  const visibleSpeakers = useMemo(() => {
    const list = [...filteredSpeakers];
    list.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filteredSpeakers, sortOrder]);

  const handleSelectSpeaker = (id: string) => {
    const newSelected = new Set(selectedSpeakers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSpeakers(newSelected);
  };

  const handleViewSpeaker = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setDetailTab('overview');
    setShowDetailModal(true);
  };

  const stats = {
    total: speakers.length,
    confirmed: speakers.filter((s) => s.status === 'confirmed').length,
    pending: speakers.filter((s) => s.status === 'pending').length,
    keynote: speakers.filter((s) => s.type === 'keynote').length,
    panel: speakers.filter((s) => s.type === 'panel').length,
    workshop: speakers.filter((s) => s.type === 'workshop').length,
    regular: speakers.filter((s) => s.type === 'regular').length,
    materialsSubmitted: speakers.filter((s) => s.materials.submitted).length,
    materialsPending: speakers.filter((s) => !s.materials.submitted).length,
    averageRating: speakers.length
      ? (speakers.reduce((sum, s) => sum + s.rating, 0) / speakers.length).toFixed(1)
      : '0.0'
  };
  const sessionStats = {
    total: sessions.length,
    assigned: sessions.filter((s) => s.speakers.length > 0).length
  };

  const openAddSpeaker = () => {
    setEditingSpeaker(null);
    setShowAddModal(true);
  };

  const openEditSpeaker = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
    setShowAddModal(true);
  };

  const openCompose = (recipients: Speaker[], subject?: string) => {
    setComposeRecipients(recipients);
    setComposeSubject(subject || '');
    setComposeMessage('');
    setComposeChannel('email');
    setShowComposeModal(true);
  };

  const createNotification = async (payload: {
    title: string;
    message: string;
    channel: 'email' | 'in_app' | 'sms' | 'push';
    audience: Record<string, any>;
  }) => {
    if (!eventId) return false;
    const { title, message, channel, audience } = payload;
    if (!title.trim() || !message.trim()) {
      toast.error(t('manageEvent.agenda.toasts.notifRequired'));
      return false;
    }
    const { error } = await supabase.from('event_notifications').insert({
      event_id: eventId,
      created_by: user?.id || null,
      title: title.trim(),
      message: message.trim(),
      channel,
      status: 'sent',
      audience
    } as any);
    if (error) {
      toast.error(t('manageEvent.speakers.toasts.notifError'));
      return false;
    }
    setCommRefreshKey((prev) => prev + 1);
    return true;
  };

  const sendCompose = async () => {
    if (!composeRecipients.length) {
      toast.error(t('manageEvent.speakers.toasts.selectRecipient'));
      return;
    }
    setComposeSending(true);
    const audience = composeRecipients.length === speakers.length
      ? { type: 'all_speakers' }
      : { type: 'speaker', speaker_ids: composeRecipients.map((s) => s.id) };
    const ok = await createNotification({
      title: composeSubject || 'Event update',
      message: composeMessage,
      channel: composeChannel,
      audience: { ...audience, category: 'update' }
    });
    setComposeSending(false);
    if (ok) {
      toast.success(t('manageEvent.speakers.toasts.notifSuccess'));
      setShowComposeModal(false);
    }
  };

  const sendMaterialReminders = async (targets: Speaker[]) => {
    if (!targets.length) {
      toast.error(t('manageEvent.speakers.toasts.noMaterials'));
      return;
    }
    const audience = targets.length === speakers.length
      ? { type: 'all_speakers' }
      : { type: 'speaker', speaker_ids: targets.map((s) => s.id) };
    const ok = await createNotification({
      title: 'Reminder: Submit speaker materials',
      message: 'Please upload your presentation materials so we can finalize the agenda.',
      channel: 'email',
      audience: { ...audience, category: 'reminder', reminder_type: 'materials' }
    });
    if (ok) toast.success(t('manageEvent.speakers.toasts.reminderSent'));
  };

  const handleDeleteSpeaker = async (speaker: Speaker) => {
    if (!window.confirm(t('manageEvent.speakers.toasts.removeConfirm', { name: speaker.name })))
 return;
    const { error } = await supabase.from('event_speakers').delete().eq('id', speaker.id);
    if (error) {
      toast.error(t('manageEvent.speakers.toasts.removeError'));
      return;
    }
    toast.success(t('manageEvent.speakers.toasts.removeSuccess'));
    if (selectedSpeaker?.id === speaker.id) {
      setShowDetailModal(false);
      setSelectedSpeaker(null);
    }
    fetchSpeakers();
  };

  const deleteSelected = async () => {
    const ids = Array.from(selectedSpeakers);
    if (ids.length === 0) return;
    if (!window.confirm(t('manageEvent.speakers.toasts.deleteConfirm', { count: ids.length })))
 return;

    const { error } = await supabase.from('event_speakers').delete().in('id', ids);
    if (error) {
      toast.error(t('manageEvent.speakers.toasts.deleteError'));
      return;
    }

    toast.success(t('manageEvent.speakers.toasts.deleteSuccess'));
    setSelectedSpeakers(new Set());
    fetchSpeakers();
  };

  const exportSpeakers = (rows: Speaker[]) => {
    if (!rows.length) {
      toast.error(t('manageEvent.speakers.toasts.noExport'));
      return;
    }
    const headers = [
      'Name',
      'Email',
      'Title',
      'Company',
      'Type',
      'Status',
      'Phone',
      'LinkedIn',
      'Twitter',
      'Website'
    ];
    const lines = rows.map((speaker) => ([
      speaker.name,
      speaker.email,
      speaker.jobTitle,
      speaker.company,
      speaker.type,
      speaker.status,
      speaker.phone || '',
      speaker.linkedin || '',
      speaker.twitter || '',
      speaker.website || ''
    ].map((value) => escapeCsv(String(value || ''))).join(',')));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-${eventId}-speakers.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const applyStatusChange = async () => {
    const ids = Array.from(selectedSpeakers);
    if (!ids.length) return;
    setStatusUpdating(true);
    const { error } = await supabase
      .from('event_speakers')
      .update({ status: statusDraft })
      .in('id', ids);
    setStatusUpdating(false);
    if (error) {
      toast.error(t('manageEvent.speakers.toasts.statusUpdateError'));
      return;
    }
    await createNotification({
      title: 'Speaker status updated',
      message: `Updated ${ids.length} speaker(s) to ${statusDraft}.`,
      channel: 'in_app',
      audience: { type: 'speaker', speaker_ids: ids, category: 'status' }
    });
    toast.success(t('manageEvent.speakers.toasts.statusUpdateSuccess'));
    setStatusModalOpen(false);
    setSelectedSpeakers(new Set());
    fetchSpeakers();
  };

  const openAssignModal = (session: SessionSummary) => {
    setActiveSession(session);
    setAssignSelection(new Set(session.speakerIds));
    setAssignModalOpen(true);
  };

  const saveSessionSpeakers = async () => {
    if (!activeSession) return;
    setAssignSaving(true);
    const speakerIds = Array.from(assignSelection);
    const { error } = await supabase
      .from('event_sessions')
      .update({ speaker_ids: speakerIds })
      .eq('id', activeSession.id);
    setAssignSaving(false);
    if (error) {
      toast.error(t('manageEvent.speakers.toasts.assignError'));
      return;
    }
    toast.success(t('manageEvent.speakers.toasts.assignSuccess'));
    setAssignModalOpen(false);
    fetchSpeakers();
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type.includes('csv');
    if (!isCsv) {
      toast.error(t('manageEvent.speakers.toasts.csvError'));
      event.target.value = '';
      return;
    }
    const text = await file.text();
    const rows = (() => {
      const output: string[][] = [];
      let current = '';
      let row: string[] = [];
      let inQuotes = false;
      for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (char === '"') {
          if (inQuotes && text[i + 1] === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
          continue;
        }
        if (char === ',' && !inQuotes) {
          row.push(current);
          current = '';
          continue;
        }
        if ((char === '\n' || char === '\r') && !inQuotes) {
          if (char === '\r' && text[i + 1] === '\n') i += 1;
          row.push(current);
          if (row.some((cell) => cell.trim() !== '')) {
            output.push(row);
          }
          row = [];
          current = '';
          continue;
        }
        current += char;
      }
      if (current || row.length) {
        row.push(current);
        if (row.some((cell) => cell.trim() !== '')) {
          output.push(row);
        }
      }
      return output;
    })();

    if (rows.length < 2) {
      toast.error(t('manageEvent.speakers.toasts.csvEmpty'));
      event.target.value = '';
      return;
    }

    const headers = rows[0].map((header) => header.trim().toLowerCase());
    if (headers.length && headers[0].startsWith('\ufeff')) {
      headers[0] = headers[0].replace(/^\ufeff/, '');
    }
    const getValue = (record: string[], keys: string[]) => {
      for (const key of keys) {
        const idx = headers.indexOf(key);
        if (idx >= 0) return (record[idx] || '').trim();
      }
      return '';
    };

    const payloads = rows.slice(1).map((record) => {
      const name = getValue(record, ['name', 'full_name', 'full name']);
      const email = getValue(record, ['email', 'email_address', 'email address']);
      const title = getValue(record, ['title', 'job_title', 'job title']);
      const company = getValue(record, ['company', 'organization', 'organisation']);
      const bio = getValue(record, ['bio', 'biography', 'about']);
      const phone = getValue(record, ['phone', 'phone_number', 'phone number']);
      const linkedin = getValue(record, ['linkedin', 'linkedin_url', 'linkedin url']);
      const twitter = getValue(record, ['twitter', 'twitter_url', 'twitter url']);
      const website = getValue(record, ['website', 'website_url', 'website url']);
      const type = getValue(record, ['type', 'speaker_type', 'speaker type']) || 'regular';
      const status = getValue(record, ['status', 'speaker_status', 'speaker status']) || 'pending';
      const expertiseRaw = getValue(record, ['expertise', 'tags', 'topics']);
      const expectedAttendance = getValue(record, ['expected_attendance', 'expected attendance']);

      const expertise = expertiseRaw
        ? expertiseRaw.split(',').map((item) => item.trim()).filter(Boolean)
        : [];

      return {
        event_id: eventId,
        full_name: name,
        email,
        title,
        company,
        bio,
        phone,
        linkedin_url: linkedin,
        twitter_url: twitter,
        website_url: website,
        type,
        status,
        expertise,
        tags: expertise,
        expected_attendance: expectedAttendance
      };
    }).filter((payload) => payload.full_name);

    if (!payloads.length) {
      toast.error(t('manageEvent.speakers.toasts.importEmpty'));
      event.target.value = '';
      return;
    }

    const { error } = await supabase.from('event_speakers').insert(payloads as any);
    if (error) {
      toast.error(t('manageEvent.speakers.toasts.importError'));
      event.target.value = '';
      return;
    }

    toast.success(t('manageEvent.speakers.toasts.importSuccess'));
    event.target.value = '';
    fetchSpeakers();
  };

  const toModalSpeaker = (speaker: Speaker) => ({
    id: speaker.id,
    name: speaker.name,
    title: speaker.jobTitle,
    company: speaker.company,
    bio: speaker.bio,
    shortBio: speaker.bio?.slice(0, 150) || '',
    email: speaker.email,
    phone: speaker.phone,
    photo: speaker.photo,
    linkedin: speaker.linkedin,
    twitter: speaker.twitter,
    website: speaker.website,
    type: speaker.type,
    status: speaker.status,
    tags: speaker.expertise,
    sessions: speaker.sessions.length,
    expectedAttendees: speaker.expectedAttendance
  });

  const handleSaveSpeaker = async (data: any) => {
    if (!data?.name?.trim()) {
      toast.error(t('manageEvent.speakers.toasts.nameRequired'));
      return;
    }
    const payload = {
      event_id: eventId,
      full_name: data.name.trim(),
      title: data.title || '',
      company: data.company || '',
      bio: data.bio || '',
      email: data.email || '',
      phone: data.phone || '',
      avatar_url: data.photo || '',
      linkedin_url: data.linkedin || '',
      twitter_url: data.twitter || '',
      website_url: data.website || '',
      type: data.type || 'regular',
      status: data.status || 'pending',
      expertise: Array.isArray(data.tags) ? data.tags : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      expected_attendance: data.expectedAttendees || ''
    };

    if (editingSpeaker?.id) {
      const { event_id, ...updatePayload } = payload;
      const { error } = await supabase
        .from('event_speakers')
        .update(updatePayload)
        .eq('id', editingSpeaker.id);
      if (error) {
        toast.error(t('manageEvent.speakers.toasts.updateError'));
        return;
      }
      toast.success(t('manageEvent.speakers.toasts.updateSuccess'));
    } else {
      const { error } = await supabase
        .from('event_speakers')
        .insert(payload);
      if (error) {
        toast.error(t('manageEvent.speakers.toasts.addError'));
        return;
      }
      toast.success(t('manageEvent.speakers.toasts.addSuccess'));
    }

    fetchSpeakers();
  };


  const handleDownloadTemplate = () => {
    const headers = ['Full Name', 'Email', 'Title', 'Company', 'Bio', 'Phone', 'Type', 'Status', 'Expertise', 'LinkedIn URL', 'Twitter URL', 'Website URL'];
    const example = ['John Doe', 'john@example.com', 'Senior Developer', 'Acme Corp', 'Expert in React', '+123456789', 'keynote', 'confirmed', 'React, TypeScript, Node.js', 'https://linkedin.com/in/johndoe', 'https://twitter.com/johndoe', 'https://johndoe.com'];
    const csvContent = [headers.join(','), example.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'speaker_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="event-speakers" style={{ padding: '32px 40px 80px', backgroundColor: '#0B2641', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 600px) {
          .event-speakers {
            padding: 24px 16px 80px;
          }

          .event-speakers__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .event-speakers__actions {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-speakers__actions button {
            width: 100%;
            justify-content: center;
          }

          .event-speakers__stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px;
          }

          .event-speakers__tabs {
            flex-wrap: wrap;
            justify-content: flex-start;
          }

          .event-speakers__filter-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .event-speakers__filter-tabs {
            flex-wrap: wrap;
          }

          .event-speakers__filter-controls {
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-speakers__search {
            width: 100%;
          }

          .event-speakers__search input {
            width: 100% !important;
          }

          .event-speakers__grid {
            grid-template-columns: 1fr !important;
            gap: 16px;
          }

          .event-speakers__grid-empty {
            min-height: 280px !important;
            padding: 24px !important;
          }

          .event-speakers__list-header {
            display: none !important;
          }

          .event-speakers__list-row {
            display: flex !important;
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
            height: auto !important;
            padding: 16px !important;
            grid-template-columns: 1fr !important;
          }

          .event-speakers__list-row > * {
            width: 100%;
          }

          .event-speakers__list-actions {
            align-self: flex-start;
          }

          .event-speakers [style*="gridTemplateColumns"]:not(.event-speakers__stats) {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 400px) {
          .event-speakers {
            padding: 20px 12px 72px;
          }

          .event-speakers__stats {
            grid-template-columns: 1fr !important;
          }

          .event-speakers__filter-controls > * {
            width: 100%;
          }

          .event-speakers__list-row {
            padding: 14px !important;
          }

          .event-speakers [style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {/* PAGE HEADER */}
      <div className="event-speakers__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
            {t('manageEvent.speakers.header.title')}
          </h1>
          <p style={{ fontSize: '16px', color: '#94A3B8' }}>
            {t('manageEvent.speakers.header.subtitle')}
          </p>
        </div>

        <div className="event-speakers__actions" style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleDownloadTemplate}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: 'transparent',
              border: '1px solid #FFFFFF',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Download size={18} />
            CSV Template
          </button>

          <button
            onClick={handleImportClick}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: 'transparent',
              border: '1px solid #FFFFFF',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Upload size={18} />
            {t('manageEvent.speakers.header.import')}
          </button>

          <button
            onClick={openAddSpeaker}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: '#0684F5',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={18} />
            {t('manageEvent.speakers.header.add')}
          </button>
        </div>
      </div>
      <input
        ref={importInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />

      {/*SPEAKER STATS DASHBOARD*/}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,132,245,0.15) 100%)',
          padding: '28px 32px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '32px'
        }}
      >
        <div className="event-speakers__stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '24px' }}>
          {/* Total Speakers */}
          <div>
            <Users size={32} style={{ color: '#8B5CF6', marginBottom: '12px', filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' }} />
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.speakers.stats.total')}
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', lineHeight: 1 }}>
              {stats.total}
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.speakers.stats.keynoteCount', { count: stats.keynote })}, {t('manageEvent.speakers.stats.regularCount', { count: stats.regular })}
            </p>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: '#F59E0B',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              {t('manageEvent.speakers.stats.pendingCount', { count: stats.pending })}
            </span>
          </div>

          {/* Confirmed Speakers */}
          <div>
            <CheckCircle size={32} style={{ color: '#10B981', marginBottom: '12px', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' }} />
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.speakers.stats.confirmed')}
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', lineHeight: 1 }}>
              {stats.confirmed}
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.speakers.stats.confirmedPct', { percent: stats.total ? Math.round((stats.confirmed / stats.total) * 100) : 0 })}
            </p>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div
                style={{
                  width: `${stats.total ? (stats.confirmed / stats.total) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#10B981',
                  borderRadius: '2px'
                }}
              />
            </div>
          </div>

          {/* Sessions Covered */}
          <div>
            <Calendar size={32} style={{ color: '#0684F5', marginBottom: '12px', filter: 'drop-shadow(0 0 8px rgba(6,132,245,0.5))' }} />
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.speakers.stats.sessionsAssigned')}
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', lineHeight: 1 }}>
              {sessionStats.assigned}/{sessionStats.total}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <CheckCircle size={14} style={{ color: sessionStats.total && sessionStats.assigned === sessionStats.total ? '#10B981' : '#F59E0B' }} />
              <p style={{ fontSize: '12px', color: sessionStats.total && sessionStats.assigned === sessionStats.total ? '#10B981' : '#F59E0B' }}>
                {sessionStats.total === 0
                  ? t('manageEvent.speakers.stats.noSessions')
                  : sessionStats.assigned === sessionStats.total
                  ? t('manageEvent.speakers.stats.allAssigned')
                  : t('manageEvent.speakers.stats.needSpeakers', { count: sessionStats.total - sessionStats.assigned })}
              </p>
            </div>
          </div>

          {/* Keynote Speakers */}
          <div>
            <Star size={32} style={{ color: '#F59E0B', marginBottom: '12px', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' }} />
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              Keynote Speakers
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', lineHeight: 1 }}>
              {stats.keynote}
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              Confirmed Keynotes
            </p>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div
                style={{
                  width: `${stats.total ? (stats.keynote / stats.total) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#F59E0B',
                  borderRadius: '2px'
                }}
              />
            </div>
          </div>

          {/* Regular Speakers */}
          <div>
            <Users size={32} style={{ color: '#0684F5', marginBottom: '12px', filter: 'drop-shadow(0 0 8px rgba(6,132,245,0.5))' }} />
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              Guest Speakers
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', lineHeight: 1 }}>
              {stats.regular}
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              Standard Guest Speakers
            </p>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div
                style={{
                  width: `${stats.total ? (stats.regular / stats.total) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#0684F5',
                  borderRadius: '2px'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABNAVIGATION BAR */}
      <div
        className="event-speakers__tabs"
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '8px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          gap: '8px'
        }}
      >
        {[ 
          { id: 'all-speakers', label: t('manageEvent.speakers.tabs.all') },
          { id: 'by-session', label: t('manageEvent.speakers.tabs.bySession') }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === tab.id ? '#0684F5' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === tab.id ? '#FFFFFF' : '#94A3B8',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              ...(activeTab === tab.id && { boxShadow: '0 0 20px rgba(6,132,245,0.3)' })
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'all-speakers' && (
        <>
          {/* FILTER & ACTIONS BAR */}
          <div
            className="event-speakers__filter-bar"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '20px 24px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {/* Left - Filter tabs */}
            <div className="event-speakers__filter-tabs" style={{ display: 'flex', gap: '8px' }}>
              {[ 
                { id: 'all', label: t('manageEvent.speakers.allSpeakers.filters.all'), badge: stats.total },
                { id: 'keynote', label: t('manageEvent.speakers.allSpeakers.filters.keynote'), badge: stats.keynote, icon: Star },
                { id: 'panel', label: t('manageEvent.speakers.allSpeakers.filters.panel'), badge: stats.panel },
                { id: 'workshop', label: t('manageEvent.speakers.allSpeakers.filters.workshop'), badge: stats.workshop },
                { id: 'confirmed', label: t('manageEvent.speakers.allSpeakers.filters.confirmed'), badge: stats.confirmed },
                { id: 'pending', label: t('manageEvent.speakers.allSpeakers.filters.pending'), badge: stats.pending }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id as FilterType)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: filter === item.id ? '#0684F5' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: filter === item.id ? '#FFFFFF' : '#94A3B8',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {Icon && <Icon size={14} />}
                    {item.label}
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '10px',
                        backgroundColor: filter === item.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right - Controls */}
            <div className="event-speakers__filter-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="event-speakers__search" style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder={t('manageEvent.speakers.allSpeakers.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '280px',
                    height: '40px',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Filter size={18} />
              </button>

              <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: viewMode === 'grid' ? '#0684F5' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: viewMode === 'grid' ? '#FFFFFF' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: viewMode === 'list' ? '#0684F5' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: viewMode === 'list' ? '#FFFFFF' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <List size={16} />
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {t('manageEvent.speakers.allSpeakers.sort', { order: sortOrder === 'asc' ? t('manageEvent.speakers.allSpeakers.sortAsc') : t('manageEvent.speakers.allSpeakers.sortDesc') })}
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </div>

          {(isLoading || loadError) && (
            <div style={{ marginBottom: '16px', color: loadError ? '#F59E0B' : '#94A3B8', fontSize: '14px' }}>
              {isLoading ? t('manageEvent.loading') : loadError}
            </div>
          )}

          {/* SPEAKERS GRID/LIST VIEW */}
          {viewMode === 'grid' ? (
            <div className="event-speakers__grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {visibleSpeakers.map(speaker => (
                <SpeakerCard
                  key={speaker.id}
                  speaker={speaker}
                  onView={() => handleViewSpeaker(speaker)}
                  onSelect={() => handleSelectSpeaker(speaker.id)}
                  isSelected={selectedSpeakers.has(speaker.id)}
                  onContact={() => openCompose([speaker])}
                  onEdit={() => openEditSpeaker(speaker)}
                  onRemove={() => handleDeleteSpeaker(speaker)}
                  onEmail={() => openCompose([speaker])}
                  menuOpen={openSpeakerMenuId === speaker.id}
                  onMenuToggle={() => setOpenSpeakerMenuId((prev) => (prev === speaker.id ? null : speaker.id))}
                />
              ))}

              {/* Empty State Card */}
              <button
                onClick={openAddSpeaker}
                className="event-speakers__grid-empty"
                style={{
                  padding: '40px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '2px dashed #6B7280',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minHeight: '500px'
                }}
              >
                <Plus size={64} style={{ color: '#6B7280' }} />
                <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('manageEvent.speakers.allSpeakers.empty.title')}
                </h4>
                <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                  {t('manageEvent.speakers.allSpeakers.empty.subtitle')}
                </p>
                <span
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#0684F5',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  {t('manageEvent.speakers.allSpeakers.empty.cta')}
                </span>
              </button>
            </div>
          ) : (
            <SpeakersListView
              speakers={visibleSpeakers}
              selectedSpeakers={selectedSpeakers}
              onSelect={handleSelectSpeaker}
              onView={handleViewSpeaker}
              onEmail={(speaker) => openCompose([speaker])}
              onEdit={(speaker) => openEditSpeaker(speaker)}
              onRemove={(speaker) => handleDeleteSpeaker(speaker)}
              openMenuId={openSpeakerMenuId}
              onMenuToggle={(id) => setOpenSpeakerMenuId((prev) => (prev === id ? null : id))}
            />
          )}
        </>
      )}

      {activeTab === 'by-session' && (
        <BySessionView
          sessions={sessions}
          onAssign={openAssignModal}
          onContact={openCompose}
          onView={handleViewSpeaker}
          onAddSession={() => navigate(`/create/registration/${eventId}?substep=3.5`)}
        />
      )}

      {/* MODALS */}
      {/* MODALS */}
      {showDetailModal && selectedSpeaker && (
        <SpeakerDetailModal
          speaker={selectedSpeaker}
          activeTab={detailTab}
          onTabChange={setDetailTab}
          onEdit={() => {
            setShowDetailModal(false);
            openEditSpeaker(selectedSpeaker);
          }}
          onEmail={() => openCompose([selectedSpeaker])}
          onRemove={() => handleDeleteSpeaker(selectedSpeaker)}
          onCopyEmail={() => {
            if (!selectedSpeaker.email) {
              toast.error(t('manageEvent.speakers.toasts.noEmail'));
              return;
            }
            navigator.clipboard.writeText(selectedSpeaker.email);
            toast.success(t('manageEvent.speakers.toasts.emailCopied'));
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSpeaker(null);
          }}
        />
      )}
      <AddEditSpeakerModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingSpeaker(null);
        }}
        onSave={handleSaveSpeaker}
        speaker={editingSpeaker ? toModalSpeaker(editingSpeaker) : null}
      />

      {showComposeModal && (
        <ComposeMessageModal
          isOpen={showComposeModal}
          onClose={() => setShowComposeModal(false)}
          recipients={composeRecipients}
          subject={composeSubject}
          message={composeMessage}
          channel={composeChannel}
          onSubjectChange={setComposeSubject}
          onMessageChange={setComposeMessage}
          onChannelChange={setComposeChannel}
          onSend={sendCompose}
          isSending={composeSending}
        />
      )}

      {statusModalOpen && (
        <StatusUpdateModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          status={statusDraft}
          onStatusChange={setStatusDraft}
          onSave={applyStatusChange}
          isSaving={statusUpdating}
          count={selectedSpeakers.size}
        />
      )}

      {assignModalOpen && (
        <AssignSpeakersModal
          isOpen={assignModalOpen}
          session={activeSession}
          speakers={speakers}
          selection={assignSelection}
          onToggle={(id) => {
            setAssignSelection((prev) => {
              const next = new Set(prev);
              if (next.has(id)) {
                next.delete(id);
              } else {
                next.add(id);
              }
              return next;
            });
          }}
          onClose={() => setAssignModalOpen(false)}
          onSave={saveSessionSpeakers}
          isSaving={assignSaving}
        />
      )}
    </div>
  );
}
