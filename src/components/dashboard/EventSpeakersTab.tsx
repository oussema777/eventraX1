import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { useI18n } from '../../i18n/I18nContext';
import AddEditSpeakerModal from '../wizard/modals/AddEditSpeakerModal';
import {
  Users,
  CheckCircle,
  Calendar,
  FileText,
  Star,
  Mail,
  Upload,
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  MoreVertical,
  Eye,
  Edit2,
  Clock,
  AlertCircle,
  Download,
  Send,
  Trash2,
  Crown,
  MapPin,
  Linkedin,
  Globe,
  Phone,
  Copy,
  X,
  Bell
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type ActiveTab = 'all-speakers' | 'by-session' | 'materials' | 'communication' | 'analytics';
type FilterType = 'all' | 'keynote' | 'panel' | 'workshop' | 'confirmed' | 'pending';
type SpeakerType = 'keynote' | 'panel' | 'workshop' | 'regular';
type SpeakerStatus = 'confirmed' | 'pending' | 'declined';
type MaterialStatus = 'submitted' | 'pending' | 'overdue';

interface Speaker {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  photo: string;
  type: SpeakerType;
  status: SpeakerStatus;
  bio: string;
  expertise: string[];
  sessions: {
    id: string;
    name: string;
    date: string;
    time: string;
    role: string;
  }[];
  materials: {
    submitted: boolean;
    status: MaterialStatus;
    deadline?: string;
    size?: string;
    type?: string;
    fileUrl?: string;
  };
  rating: number;
  expectedAttendance: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  isNew?: boolean;
  created_at?: string;
  updated_at?: string;
}

function ComposeMessageModal({
  isOpen,
  onClose,
  recipients,
  subject,
  message,
  channel,
  onSubjectChange,
  onMessageChange,
  onChannelChange,
  onSend,
  isSending
}: {
  isOpen: boolean;
  onClose: () => void;
  recipients: Speaker[];
  subject: string;
  message: string;
  channel: 'email' | 'in_app' | 'sms' | 'push';
  onSubjectChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onChannelChange: (value: 'email' | 'in_app' | 'sms' | 'push') => void;
  onSend: () => void;
  isSending: boolean;
}) {
  const { t } = useI18n();
  if (!isOpen) return null;
  const recipientLabel = (() => {
    if (!recipients.length) return t('manageEvent.speakers.modals.compose.noRecipients');
    if (recipients.length === 1) return recipients[0].name;
    if (recipients.length === 2) return `${recipients[0].name}, ${recipients[1].name}`;
    return `${recipients[0].name}, ${recipients[1].name} (${t('manageEvent.speakers.modals.compose.others', { count: recipients.length - 2 })})`;
  })();

  return (
    <div
      className="fixed inset-0 z-[230] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(11, 38, 65, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[720px] rounded-2xl border"
        style={{ backgroundColor: '#0D3052', borderColor: 'rgba(255, 255, 255, 0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{t('manageEvent.speakers.modals.compose.title')}</div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>{recipientLabel}</div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.speakers.modals.compose.fields.subject')}</label>
            <input
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full rounded-lg px-4"
              style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.speakers.modals.compose.fields.channel')}</label>
            <select
              value={channel}
              onChange={(e) => onChannelChange(e.target.value as any)}
              className="w-full rounded-lg px-4"
              style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
            >
              <option value="email">Email</option>
              <option value="in_app">In-app</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.speakers.modals.compose.fields.message')}</label>
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              className="w-full rounded-lg px-4 py-3"
              style={{ minHeight: '140px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none', resize: 'none' }}
            />
          </div>
        </div>
        <div className="px-6 py-5 border-t flex items-center justify-end gap-3" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={onClose}
            className="px-5 rounded-lg border"
            style={{ height: '44px', backgroundColor: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            {t('manageEvent.speakers.modals.compose.actions.cancel')}
          </button>
          <button
            onClick={onSend}
            disabled={isSending}
            className="px-5 rounded-lg"
            style={{ height: '44px', backgroundColor: '#8B5CF6', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: isSending ? 'not-allowed' : 'pointer', opacity: isSending ? 0.7 : 1 }}
          >
            {isSending ? t('manageEvent.speakers.modals.compose.actions.sending') : t('manageEvent.speakers.modals.compose.actions.send')}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusUpdateModal({
  isOpen,
  onClose,
  status,
  onStatusChange,
  onSave,
  isSaving,
  count
}: {
  isOpen: boolean;
  onClose: () => void;
  status: SpeakerStatus;
  onStatusChange: (value: SpeakerStatus) => void;
  onSave: () => void;
  isSaving: boolean;
  count: number;
}) {
  const { t } = useI18n();
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(11, 38, 65, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl border"
        style={{ backgroundColor: '#0D3052', borderColor: 'rgba(255, 255, 255, 0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{t('manageEvent.speakers.modals.status.title')}</div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>{t('manageEvent.speakers.modals.status.count', { count }) }</div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.speakers.modals.status.fields.status')}</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as SpeakerStatus)}
            className="w-full rounded-lg px-4"
            style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
          >
            <option value="confirmed">{t('manageEvent.speakers.allSpeakers.filters.confirmed')}</option>
            <option value="pending">{t('manageEvent.speakers.allSpeakers.filters.pending')}</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <div className="px-6 py-5 border-t flex items-center justify-end gap-3" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={onClose}
            className="px-5 rounded-lg border"
            style={{ height: '44px', backgroundColor: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            {t('manageEvent.speakers.modals.status.actions.cancel')}
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-5 rounded-lg"
            style={{ height: '44px', backgroundColor: '#0684F5', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? t('manageEvent.speakers.modals.status.actions.saving') : t('manageEvent.speakers.modals.status.actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignSpeakersModal({
  isOpen,
  session,
  speakers,
  selection,
  onToggle,
  onClose,
  onSave,
  isSaving
}: {
  isOpen: boolean;
  session: SessionSummary | null;
  speakers: Speaker[];
  selection: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const { t } = useI18n();
  if (!isOpen || !session) return null;
  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(11, 38, 65, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[680px] rounded-2xl border"
        style={{ backgroundColor: '#0D3052', borderColor: 'rgba(255, 255, 255, 0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{t('manageEvent.speakers.modals.assign.title')}</div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>{session.name}</div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6" style={{ maxHeight: '420px', overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {speakers.length === 0 && (
              <div style={{ color: '#94A3B8' }}>{t('manageEvent.speakers.modals.assign.empty')}</div>
            )}
            {speakers.map((speaker) => {
              const isSelected = selection.has(speaker.id);
              return (
                <label
                  key={speaker.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(6,132,245,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isSelected ? '#0684F5' : 'rgba(255,255,255,0.1)'}`,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(speaker.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <img
                    src={speaker.photo}
                    alt={speaker.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>{speaker.name}</div>
                    <div style={{ color: '#94A3B8', fontSize: '12px' }}>{speaker.jobTitle}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        <div className="px-6 py-5 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <span style={{ fontSize: '13px', color: '#94A3B8' }}>{t('manageEvent.speakers.modals.assign.selected', { count: selection.size })}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 rounded-lg border"
              style={{ height: '44px', backgroundColor: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
            >
              {t('manageEvent.speakers.modals.assign.actions.cancel')}
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-5 rounded-lg"
              style={{ height: '44px', backgroundColor: '#0684F5', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
            >
              {isSaving ? t('manageEvent.speakers.modals.assign.actions.saving') : t('manageEvent.speakers.modals.assign.actions.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SessionSummary {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  type: string;
  duration: string;
  expected: string;
  speakers: Speaker[];
  speakerIds: string[];
  attendees?: number;
  capacity?: number;
}

const formatDateLabel = (iso?: string | null) => {
  if (!iso) return 'TBD';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTimeLabel = (iso?: string | null) => {
  if (!iso) return 'TBD';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const formatDurationLabel = (start?: string | null, end?: string | null) => {
  if (!start || !end) return 'TBD';
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 'TBD';
  const minutes = Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));
  if (!minutes) return 'TBD';
  if (minutes < 60) return `${minutes} minutes`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hrs}h ${mins}m` : `${hrs} hours`;
};

const formatRelativeTime = (iso?: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const escapeCsv = (value: string) => {
  if (value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  if (value.includes(',') || value.includes('\n')) {
    return `"${value}"`;
  }
  return value;
};

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
            onClick={() => openCompose(speakers, 'Event Update')}
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
            <Mail size={18} />
            {t('manageEvent.speakers.header.sendUpdate')}
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

          {/* Materials Status */}
          <div>
            <FileText size={32} style={{ color: '#F59E0B', marginBottom: '12px', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' }} />
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.speakers.stats.materialsSubmitted')}
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', lineHeight: 1 }}>
              {stats.materialsSubmitted}/{stats.confirmed}
            </p>
            <p style={{ fontSize: '12px', color: '#F59E0B', marginBottom: '8px' }}>
              {t('manageEvent.speakers.stats.pendingUploads', { count: stats.materialsPending })}
            </p>
            <button
              onClick={() => sendMaterialReminders(speakers.filter((s) => !s.materials.submitted))}
              style={{
                padding: '0',
                border: 'none',
                background: 'none',
                color: '#0684F5',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {t('manageEvent.speakers.stats.sendReminder')}
            </button>
          </div>

          {/* Engagement Score */}
          <div>
            <Star size={32} style={{ color: '#F59E0B', marginBottom: '12px', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' }} />
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.speakers.stats.rating')}
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', lineHeight: 1 }}>
              {stats.averageRating}/5
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.speakers.stats.basedOnFeedback')}
            </p>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={14}
                  fill={star <= parseFloat(stats.averageRating) ? '#F59E0B' : 'none'}
                  style={{ color: star <= parseFloat(stats.averageRating) ? '#F59E0B' : '#6B7280' }}
                />
              ))}
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
          { id: 'by-session', label: t('manageEvent.speakers.tabs.bySession') },
          { id: 'materials', label: t('manageEvent.speakers.tabs.materials') },
          { id: 'communication', label: t('manageEvent.speakers.tabs.communication') },
          { id: 'analytics', label: t('manageEvent.speakers.tabs.analytics') }
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
      {activeTab === 'materials' && (
        <MaterialsTrackingView
          speakers={speakers}
          onReminder={(speakerList) => sendMaterialReminders(speakerList)}
        />
      )}
      {activeTab === 'communication' && (
        <CommunicationLogView
          eventId={eventId}
          speakers={speakers}
          refreshKey={commRefreshKey}
        />
      )}
      {activeTab === 'analytics' && (
        <AnalyticsView
          speakers={speakers}
          sessions={sessions}
        />
      )}

            {/* Modals */}
      {/* FLOATING COMPOSE BUTTON */}
      <button
        onClick={() => openCompose(speakers)}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '56px',
          height: '56px',
          backgroundColor: '#0684F5',
          border: 'none',
          borderRadius: '50%',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0px 4px 16px rgba(6,132,245,0.4)',
          transition: 'all 0.2s',
          zIndex: 99
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0px 6px 24px rgba(6,132,245,0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0px 4px 16px rgba(6,132,245,0.4)';
        }}
      >
        <Mail size={24} />
      </button>

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

// Speaker Card Component
function SpeakerCard({ speaker, onView, onSelect, isSelected, onContact, onEdit, onRemove, onEmail, menuOpen, onMenuToggle }: {
  speaker: Speaker;
  onView: () => void;
  onSelect: () => void;
  isSelected: boolean;
  onContact: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onEmail: () => void;
  menuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const { t } = useI18n();
  const statusColors = {
    confirmed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
    pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
    declined: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' }
  };

  const typeColors = {
    keynote: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    panel: '#0684F5',
    workshop: '#8B5CF6',
    regular: '#6B7280'
  };

  return (
    <div
      onClick={onView}
      style={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.15)',
        overflow: 'visible',
        cursor: 'pointer',
        transition: 'all 0.3s',
        position: 'relative',
        opacity: speaker.status === 'pending' ? 0.9 : 1,
        zIndex: menuOpen ? 20 : 1
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header Section */}
      <div
        style={{
          height: '180px',
          background: speaker.type === 'keynote'
            ? 'linear-gradient(135deg, #8B5CF6 0%, #0684F5 100%)'
            : speaker.type === 'panel'
            ? 'linear-gradient(135deg, #0684F5 0%, #06B6D4 100%)'
            : speaker.type === 'workshop'
            ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
            : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(11,38,65,0.3) 0%, rgba(11,38,65,0.7) 100%)'
          }}
        />

        {/* Speaker Type Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '6px 12px',
            background: typeColors[speaker.type],
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0px 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          {speaker.type === 'keynote' && <Star size={12} style={{ color: '#FFFFFF' }} />}
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase' }}>
            {speaker.type === 'keynote' ? t('manageEvent.speakers.allSpeakers.badges.keynote') :
             speaker.type === 'panel' ? t('manageEvent.speakers.allSpeakers.badges.panel') :
             speaker.type === 'workshop' ? t('manageEvent.speakers.allSpeakers.badges.workshop') :
             'REGULAR SPEAKER'}
          </span>
        </div>

        {/* New Badge */}
        {speaker.isNew && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              width: '12px',
              height: '12px',
              backgroundColor: '#EF4444',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}
          />
        )}

        {/* VIP Crown for Keynote with Multiple Sessions */}
        {speaker.type === 'keynote' && speaker.sessions.length > 1 && (
          <Crown size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#F59E0B' }} />
        )}
      </div>

      {/* Profile Photo */}
      <div
        style={{
          position: 'absolute',
          top: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '4px solid #FFFFFF',
          boxShadow: '0px 4px 16px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          backgroundColor: '#0B2641'
        }}
      >
        <img src={speaker.photo} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '190px',
          left: '16px',
          width: '20px',
          height: '20px',
          cursor: 'pointer',
          accentColor: '#0684F5',
          zIndex: 10
        }}
      />

      {/* Content Section */}
      <div style={{ padding: '80px 24px 24px' }}>
        {/* Name & Title */}
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', textAlign: 'center', marginBottom: '4px' }}>
          {speaker.name}
        </h3>
        <p style={{ fontSize: '14px', color: '#94A3B8', textAlign: 'center', marginBottom: '2px' }}>
          {speaker.jobTitle}
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', marginBottom: '12px' }}>
          {speaker.company}
        </p>

        {/* Expertise Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
          {speaker.expertise.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(6,132,245,0.15)',
                color: '#0684F5',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '12px'
              }}
            >
              {tag}
            </span>
          ))}
          {speaker.expertise.length > 3 && (
            <span style={{ fontSize: '11px', color: '#0684F5' }}>
              +{speaker.expertise.length - 3} {t('manageEvent.speakers.allSpeakers.card.more')}
            </span>
          )}
        </div>

        {/* Session Assignment */}
        <div
          style={{
            padding: '16px 0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '12px'
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
            {t('manageEvent.speakers.allSpeakers.card.speakingAt')}:
          </p>
          <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
            <Calendar size={14} style={{ color: '#0684F5', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              {speaker.sessions.length > 0 ? (
                <>
                  <p style={{ fontSize: '13px', color: '#FFFFFF', marginBottom: '2px' }}>
                    {speaker.sessions[0]?.name} - {speaker.sessions[0]?.date}, {speaker.sessions[0]?.time}
                  </p>
                  {speaker.sessions?.length > 1 && (
                    <p style={{ fontSize: '12px', color: '#0684F5', marginTop: '4px' }}>
                      +{speaker.sessions?.length - 1} {t('manageEvent.speakers.allSpeakers.card.moreSessions')}
                    </p>
                  )}
                </>
              ) : (
                <p style={{ fontSize: '12px', color: '#94A3B8'}}>{t('manageEvent.speakers.allSpeakers.card.noSessions')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: (statusColors[speaker.status] || statusColors.pending).bg,
            borderRadius: '12px',
            marginBottom: '12px'
          }}
        >
          <CheckCircle size={12} style={{ color: (statusColors[speaker.status] || statusColors.pending).text }} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: (statusColors[speaker.status] || statusColors.pending).text, textTransform: 'capitalize' }}>
            {speaker.status}
          </span>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={12} style={{ color: '#94A3B8' }} />
            <span style={{ fontSize: '11px', color: speaker.materials.submitted ? '#10B981' : '#F59E0B' }}>
              {speaker.materials.submitted ? t('manageEvent.speakers.allSpeakers.card.materialsSubmitted') : t('manageEvent.speakers.allSpeakers.card.materialsPending')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} style={{ color: '#94A3B8' }} />
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
              {speaker.expectedAttendance ? `${speaker.expectedAttendance}` : t('manageEvent.header.tbd')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={12} style={{ color: '#F59E0B' }} />
            <span style={{ fontSize: '11px', color: '#FFFFFF' }}>
              {speaker.rating}/5
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(255,255,255,0.03)',
          display: 'flex',
          gap: '8px'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          style={{
            flex: 1,
            height: '36px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Eye size={14} />
          {t('manageEvent.speakers.allSpeakers.card.viewProfile')}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContact();
          }}
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Mail size={14} />
        </button>
        <div style={{ position: 'relative' }} data-speaker-menu>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle();
            }}
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '44px',
                width: '180px',
                backgroundColor: '#1E3A5F',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                boxShadow: '0px 6px 20px rgba(0,0,0,0.35)',
                overflow: 'hidden',
                zIndex: 60
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                  onMenuToggle();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Eye size={14} />
                {t('manageEvent.speakers.allSpeakers.card.viewProfile')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEmail();
                  onMenuToggle();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Mail size={14} />
                {t('manageEvent.speakers.allSpeakers.card.email')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  onMenuToggle();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Edit2 size={14} />
                {t('manageEvent.speakers.allSpeakers.card.edit')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                  onMenuToggle();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} />
                {t('manageEvent.speakers.allSpeakers.card.remove')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Speakers List View Component
function SpeakersListView({ speakers, selectedSpeakers, onSelect, onView, onEmail, onEdit, onRemove, openMenuId, onMenuToggle }: {
  speakers: Speaker[];
  selectedSpeakers: Set<string>;
  onSelect: (id: string) => void;
  onView: (speaker: Speaker) => void;
  onEmail: (speaker: Speaker) => void;
  onEdit: (speaker: Speaker) => void;
  onRemove: (speaker: Speaker) => void;
  openMenuId: string | null;
  onMenuToggle: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="event-speakers__list" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Table Header */}
      <div
        className="event-speakers__list-header"
        style={{
          display: 'grid',
          gridTemplateColumns: '4% 30% 10% 20% 12% 12% 8% 4%',
          padding: '16px 24px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div></div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.speakers.allSpeakers.card.speaker')}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Type</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Sessions</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Status</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Materials</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Rating</span>
        <div></div>
      </div>

      {/* Table Rows */}
      {speakers.map(speaker => {
        const statusColors = {
          confirmed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
          pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
          declined: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' }
        };

        return (
          <div
            key={speaker.id}
            className="event-speakers__list-row"
            onClick={() => onView(speaker)}
            style={{
              display: 'grid',
              gridTemplateColumns: '4% 30% 10% 20% 12% 12% 8% 4%',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* Checkbox */}
            <div>
              <input
                type="checkbox"
                checked={selectedSpeakers.has(speaker.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(speaker.id);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0684F5' }}
              />
            </div>

            {/* Speaker Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={speaker.photo}
                alt={speaker.name}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.15)',
                  objectFit: 'cover'
                }}
              />
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                  {speaker.name}
                </p>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>
                  {speaker.jobTitle}, {speaker.company}
                </p>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {speaker.expertise.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'rgba(6,132,245,0.15)',
                        color: '#0684F5',
                        fontSize: '10px',
                        borderRadius: '10px'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Type */}
            <div>
              <span
                style={{
                  padding: '4px 10px',
                  backgroundColor: speaker.type === 'keynote' ? 'rgba(245,158,11,0.15)' : 'rgba(6,132,245,0.15)',
                  color: speaker.type === 'keynote' ? '#F59E0B' : '#0684F5',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {speaker.type === 'keynote' && <Star size={10} />}
                {speaker.type.charAt(0).toUpperCase() + speaker.type.slice(1)}
              </span>
            </div>

            {/* Sessions */}
            <div>
              {speaker.sessions.length > 0 ? (
                <>
                  <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                    {speaker.sessions[0].name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {speaker.sessions[0].date}, {speaker.sessions[0].time}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t('manageEvent.speakers.allSpeakers.card.noSessions')}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <span
                style={{
                  padding: '6px 12px',
                  backgroundColor: statusColors[speaker.status].bg,
                  color: statusColors[speaker.status].text,
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textTransform: 'capitalize'
                }}
              >
                <CheckCircle size={12} />
                {speaker.status}
              </span>
            </div>

            {/* Materials */}
            <div>
              <span style={{ fontSize: '13px', color: speaker.materials.submitted ? '#10B981' : '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {speaker.materials.submitted ? <CheckCircle size={14} /> : <Clock size={14} />}
                {speaker.materials.submitted ? t('manageEvent.speakers.allSpeakers.card.materialsSubmitted') : t('manageEvent.speakers.allSpeakers.card.materialsPending')}
              </span>
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                {speaker.rating}
              </span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={12}
                    fill={star <= speaker.rating ? '#F59E0B' : 'none'}
                    style={{ color: star <= speaker.rating ? '#F59E0B' : '#6B7280' }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="event-speakers__list-actions" style={{ position: 'relative' }} data-speaker-menu>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuToggle(speaker.id);
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <MoreVertical size={16} />
                </button>
                {openMenuId === speaker.id && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '38px',
                      width: '180px',
                      backgroundColor: '#1E3A5F',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      boxShadow: '0px 6px 20px rgba(0,0,0,0.35)',
                      overflow: 'hidden',
                      zIndex: 30
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(speaker);
                        onMenuToggle(speaker.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={14} />
                      {t('manageEvent.speakers.allSpeakers.card.viewProfile')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEmail(speaker);
                        onMenuToggle(speaker.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Mail size={14} />
                      {t('manageEvent.speakers.allSpeakers.card.email')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(speaker);
                        onMenuToggle(speaker.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={14} />
                      {t('manageEvent.speakers.allSpeakers.card.edit')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(speaker);
                        onMenuToggle(speaker.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                      {t('manageEvent.speakers.allSpeakers.card.remove')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// By Session View Component
function BySessionView({
  sessions,
  onAssign,
  onContact,
  onView,
  onAddSession
}: {
  sessions: SessionSummary[];
  onAssign: (session: SessionSummary) => void;
  onContact: (recipients: Speaker[]) => void;
  onView: (speaker: Speaker) => void;
  onAddSession: () => void;
}) {
  const { t } = useI18n();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {!sessions.length && (
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px dashed rgba(255,255,255,0.2)',
            padding: '32px',
            textAlign: 'center',
            color: '#94A3B8'
          }}
        >
          {t('manageEvent.speakers.bySession.empty')}
        </div>
      )}
      {sessions.map(session => (
        <div key={session.id}>
          {/* Session Header */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '24px',
              borderRadius: '12px 12px 0 0',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Calendar size={28} style={{ color: '#0684F5' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                    {session.name}
                  </h3>
                  <span
                    style={{
                      padding: '4px 10px',
                      backgroundColor: session.type === 'keynote' ? 'rgba(245,158,11,0.15)' : session.type === 'workshop' ? 'rgba(139,92,246,0.15)' : 'rgba(6,132,245,0.15)',
                      color: session.type === 'keynote' ? '#F59E0B' : session.type === 'workshop' ? '#8B5CF6' : '#0684F5',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '12px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {session.type}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '4px' }}>
                  {session.date} {t('manageEvent.speakers.bySession.columns.dateTime')} {session.time}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} style={{ color: '#6B7280' }} />
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>{session.location}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                <Users size={16} style={{ color: '#FFFFFF' }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{session.expected}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                <Clock size={14} style={{ color: '#94A3B8' }} />
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>{session.duration}</span>
              </div>
            </div>
          </div>

          {/* Speaker Assignments */}
          <div
            style={{
              borderLeft: '4px solid #0684F5',
              backgroundColor: 'rgba(6,132,245,0.05)',
              padding: '20px 24px',
              borderRadius: '0 0 12px 12px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderTop: 'none'
            }}
          >
            {session.speakers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {session.speakers.map(speaker => (
                  <div
                    key={speaker.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img
                        src={speaker.photo}
                        alt={speaker.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.2)',
                          objectFit: 'cover'
                        }}
                      />
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                          {speaker.name}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '2px' }}>
                          {speaker.sessions.find(s => s.id === session.id)?.role || 'Primary Speaker'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6B7280' }}>
                          {speaker.company}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'rgba(16,185,129,0.15)',
                          color: '#10B981',
                          fontSize: '12px',
                          fontWeight: 500,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle size={12} />
                        Confirmed
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          color: speaker.materials.submitted ? '#10B981' : '#F59E0B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {speaker.materials.submitted ? t('manageEvent.speakers.allSpeakers.card.materialsSubmitted') : t('manageEvent.speakers.allSpeakers.card.materialsPending')}
                      </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => onContact([speaker])}
                            style={{
                              height: '36px',
                              padding: '0 16px',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {t('manageEvent.speakers.bySession.actions.contact')}
                          </button>
                          <button
                            onClick={() => onView(speaker)}
                            style={{
                              height: '36px',
                              padding: '0 16px',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {t('manageEvent.speakers.bySession.actions.view')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '16px' }}>
                  {t('manageEvent.speakers.stats.needSpeakers', { count: 1 })}
                </p>
                <button
                  onClick={() => onAssign(session)}
                  style={{
                    height: '40px',
                    padding: '0 20px',
                    backgroundColor: '#0684F5',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  {t('manageEvent.speakers.bySession.actions.assign')}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Session Button */}
      <button
        onClick={onAddSession}
        style={{
          width: '100%',
          height: '44px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <Plus size={18} />
        {t('manageEvent.speakers.bySession.actions.addSession')}
      </button>
    </div>
  );
}

// Materials Tracking View Component
function MaterialsTrackingView({ speakers, onReminder }: { speakers: Speaker[]; onReminder: (speakers: Speaker[]) => void }) {
  const { t } = useI18n();
  const materials = speakers.map((speaker) => {
    const materialType = speaker.materials.type || 'Materials';
    const deadline = speaker.materials.deadline || t('manageEvent.header.tbd');
    const size = speaker.materials.size || (speaker.materials.submitted ? 'Uploaded' : '-');
    return {
      speaker,
      materialType,
      status: speaker.materials.status,
      deadline,
      size,
      fileUrl: speaker.materials.fileUrl
    };
  });

  return (
    <div>
      {/* Materials Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div
          style={{
            padding: '24px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <CheckCircle size={32} style={{ color: '#10B981', marginBottom: '12px' }} />
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
            {materials.filter(m => m.status === 'submitted').length} {t('manageEvent.speakers.materials.status.submitted')}
          </p>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>
            {materials.length ? Math.round((materials.filter(m => m.status === 'submitted').length / materials.length) * 100) : 0}% completion
          </p>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div
              style={{
                width: `${materials.length ? (materials.filter(m => m.status === 'submitted').length / materials.length) * 100 : 0}%`,
                height: '100%',
                backgroundColor: '#10B981',
                borderRadius: '2px'
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: '24px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <Clock size={32} style={{ color: '#F59E0B', marginBottom: '12px' }} />
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
            {materials.filter(m => m.status === 'pending').length} {t('manageEvent.speakers.materials.status.pending')}
          </p>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>
            Awaiting uploads
          </p>
        </div>

        <div
          style={{
            padding: '24px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <AlertCircle size={32} style={{ color: '#EF4444', marginBottom: '12px' }} />
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
            {materials.filter(m => m.status === 'overdue').length} {t('manageEvent.speakers.materials.status.overdue')}
          </p>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>
            Deadline passed
          </p>
        </div>
      </div>

      {/* Materials Table */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '25% 20% 15% 12% 12% 10% 6%',
            padding: '16px 24px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.speakers.materials.columns.speaker')}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Session</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.speakers.materials.columns.presentation')}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.speakers.materials.columns.status')}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.speakers.materials.columns.deadline')}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Size</span>
          <div></div>
        </div>

        {/* Table Rows */}
        {materials.map(item => {
          const statusIcons: Record<MaterialStatus, any> = {
            submitted: CheckCircle,
            pending: Clock,
            overdue: AlertCircle
          };
          const StatusIcon = statusIcons[item.status];
          
          const statusColors: Record<MaterialStatus, string> = {
            submitted: '#10B981',
            pending: '#F59E0B',
            overdue: '#EF4444'
          };

          return (
            <div
              key={item.speaker.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '25% 20% 15% 12% 12% 10% 6%',
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                alignItems: 'center'
              }}
            >
              {/* Speaker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={item.speaker.photo}
                  alt={item.speaker.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.15)',
                    objectFit: 'cover'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>
                  {item.speaker.name}
                </span>
              </div>

              {/* Session */}
              <span style={{ fontSize: '14px', color: '#FFFFFF' }}>
                {item.speaker.sessions[0]?.name ? `${item.speaker.sessions[0].name.substring(0, 25)}...` : 'No session assigned'}
              </span>

              {/* Material Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} style={{ color: '#94A3B8' }} />
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>{item.materialType}</span>
              </div>

              {/* Status */}
              <span
                style={{
                  padding: '6px 12px',
                  backgroundColor: `${statusColors[item.status]}20`,
                  color: statusColors[item.status],
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textTransform: 'capitalize'
                }}
              >
                <StatusIcon size={12} />
                {item.status}
              </span>

              {/* Deadline */}
              <span
                style={{
                  fontSize: '13px',
                  color: item.status === 'overdue' ? '#EF4444' : '#94A3B8',
                  textDecoration: item.status === 'overdue' ? 'line-through' : 'none'
                }}
              >
                {item.deadline}
              </span>

              {/* Size */}
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                {item.size}
              </span>

              {/* Actions */}
              <div>
                {item.status === 'submitted' ? (
                  <button
                    onClick={() => {
                      if (item.fileUrl) {
                        window.open(item.fileUrl, '_blank', 'noopener');
                      } else {
                        toast.error('No file available');
                      }
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => onReminder([item.speaker])}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: item.status === 'overdue' ? '#EF4444' : '#F59E0B',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {t('manageEvent.speakers.materials.actions.remind')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Actions */}
      <button
        onClick={() => onReminder(speakers.filter((speaker) => !speaker.materials.submitted))}
        style={{
          width: '100%',
          height: '44px',
          marginTop: '24px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        <Send size={18} />
        {t('manageEvent.speakers.materials.actions.remindAll')}
      </button>
    </div>
  );
}

// Communication Log View Component
function CommunicationLogView({
  eventId,
  speakers,
  refreshKey
}: {
  eventId: string;
  speakers: Speaker[];
  refreshKey: number;
}) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<'all' | 'email' | 'reminder' | 'updates'>('all');
  const [range, setRange] = useState<'30' | '7' | 'all'>('30');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      setIsLoading(true);
      const query = supabase
        .from('event_notifications')
        .select('id,title,message,channel,created_at,audience,status')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .range(0, limit - 1);

      if (range !== 'all') {
        const days = range === '7' ? 7 : 30;
        const since = new Date();
        since.setDate(since.getDate() - days);
        query.gte('created_at', since.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        setItems([]);
        setIsLoading(false);
        toast.error('Failed to load communications');
        return;
      }
      setItems(data || []);
      setIsLoading(false);
    };
    load();
  }, [eventId, limit, range, refreshKey]);

  const speakerNameById = useMemo(() => {
    const map = new Map<string, string>();
    speakers.forEach((speaker) => map.set(speaker.id, speaker.name));
    return map;
  }, [speakers]);

  const resolveAudienceLabel = (audience: any) => {
    if (!audience || typeof audience !== 'object') {
      return 'Speakers';
    }
    if (audience.type === 'all_speakers') {
      return `All Speakers (${speakers.length} recipients)`;
    }
    const ids = Array.isArray(audience.speaker_ids) ? audience.speaker_ids : [];
    const speakerId = audience.speaker_id ? [audience.speaker_id] : [];
    const list = [...ids, ...speakerId].filter(Boolean);
    if (!list.length) return 'Speakers';
    const names = list.map((id) => speakerNameById.get(String(id)) || 'Unknown');
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} (+${names.length - 2} others)`;
  };

  const mappedItems = items.map((item) => {
    let audience: any = item.audience || {};
    if (typeof audience === 'string') {
      try {
        audience = JSON.parse(audience);
      } catch {
        audience = {};
      }
    }
    const type =
      audience.category === 'reminder' || audience.type === 'material_reminder' || audience.type === 'reminder'
        ? 'reminder'
        : audience.category === 'status' || audience.type === 'status'
        ? 'status'
        : item.channel === 'email'
        ? 'email'
        : 'updates';
    const icon =
      type === 'reminder' ? Bell : type === 'status' ? CheckCircle : Mail;
    const borderColor =
      type === 'reminder' ? '#F59E0B' : type === 'status' ? '#10B981' : '#0684F5';
    return {
      id: item.id,
      type,
      icon,
      title: item.title || 'Notification sent',
      to: resolveAudienceLabel(audience),
      subject: item.title || 'Notification sent',
      preview: item.message || '',
      time: formatRelativeTime(item.created_at),
      stats: '',
      borderColor,
      badge: type === 'reminder' ? 'AUTOMATED' : undefined
    };
  });

  const filtered = mappedItems.filter((item) => {
    if (filter === 'email' && item.type !== 'email') return false;
    if (filter === 'reminder' && item.type !== 'reminder') return false;
    if (filter === 'updates' && !['updates', 'status'].includes(item.type)) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query) ||
      item.preview.toLowerCase().includes(query) ||
      item.to.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '16px 24px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {[ 
            { key: 'all', label: 'All Communications' },
            { key: 'email', label: 'Emails' },
            { key: 'reminder', label: 'Reminders' },
            { key: 'updates', label: 'Updates' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as any)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === item.key ? '#0684F5' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: filter === item.key ? '#FFFFFF' : '#94A3B8',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            style={{
              height: '36px',
              padding: '0 12px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
            <option value="all">All time</option>
          </select>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search communications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                height: '36px',
                paddingLeft: '36px',
                paddingRight: '12px',
                width: '250px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isLoading && (
          <div style={{ color: '#94A3B8' }}>Loading communications...</div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div style={{ color: '#94A3B8' }}>No communications found.</div>
        )}
        {!isLoading && filtered.map(comm => {
          const Icon = comm.icon;
          return (
            <div
              key={comm.id}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: `4px solid ${comm.borderColor}`
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={20} style={{ color: comm.borderColor }} />
                  <span style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF' }}>
                    {comm.title}
                  </span>
                  {comm.badge && (
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'rgba(245,158,11,0.15)',
                        color: '#F59E0B',
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: '8px'
                      }}
                    >
                      {comm.badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>{comm.time}</span>
              </div>

              {/* Content */}
              {comm.to && (
                <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                  <strong style={{ color: '#FFFFFF' }}>To:</strong> {comm.to}
                </p>
              )}
              <p style={{ fontSize: '15px', color: '#FFFFFF', marginBottom: '8px' }}>
                <strong>Subject:</strong> {comm.subject}
              </p>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px', lineHeight: 1.5 }}>
                {comm.preview}
              </p>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    if (!comm.preview) {
                      toast.error('No message content');
                      return;
                    }
                    navigator.clipboard.writeText(`${comm.subject}\n\n${comm.preview}`);
                    toast.success('Message copied');
                  }}
                  style={{
                    padding: '0',
                    border: 'none',
                    background: 'none',
                    color: '#0684F5',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  View Full Email
                </button>
                {comm.stats && (
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    {comm.stats}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      <button
        onClick={() => setLimit((prev) => prev + 10)}
        style={{
          width: '100%',
          height: '44px',
          marginTop: '24px',
          backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Load More
      </button>
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ speakers, sessions }: { speakers: Speaker[]; sessions: SessionSummary[] }) {
  const { t } = useI18n();
  const sortedSpeakers = useMemo(() => {
    return [...speakers].sort((a, b) => b.rating - a.rating);
  }, [speakers]);

  const sessionMetrics = useMemo(() => {
    const totalCapacity = sessions.reduce((sum, session) => sum + (session.capacity || 0), 0);
    const totalAttendees = sessions.reduce((sum, session) => sum + (session.attendees || 0), 0);
    const fillRate = totalCapacity ? Math.round((totalAttendees / totalCapacity) * 100) : 0;
    return { totalCapacity, totalAttendees, fillRate };
  }, [sessions]);

  const engagementMetrics = useMemo(() => {
    const totalSpeakers = speakers.length;
    const confirmed = speakers.filter((s) => s.status === 'confirmed').length;
    const confirmationRate = totalSpeakers ? Math.round((confirmed / totalSpeakers) * 100) : 0;
    const materialRate = totalSpeakers ? Math.round((speakers.filter((s) => s.materials.submitted).length / totalSpeakers) * 100) : 0;
    const avgConfirmationDays = (() => {
      const confirmedSpeakers = speakers.filter((s) => s.status === 'confirmed' && s.created_at && s.updated_at);
      if (!confirmedSpeakers.length) return 0;
      const sum = confirmedSpeakers.reduce((acc, speaker) => {
        const start = new Date(speaker.created_at || '');
        const end = new Date(speaker.updated_at || '');
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return acc;
        return acc + Math.max(0, (end.getTime() - start.getTime()) / 86400000);
      }, 0);
      return Math.round((sum / confirmedSpeakers.length) * 10) / 10;
    })();
    return { confirmationRate, materialRate, avgConfirmationDays };
  }, [speakers]);

  const keywordItems = useMemo(() => {
    const counts = new Map<string, number>();
    speakers.forEach((speaker) => {
      const tags = [...(speaker.expertise || [])];
      tags.forEach((tag) => {
        const key = String(tag || '').trim();
        if (!key) return;
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return sorted.map(([word, count]) => ({
      word,
      size: 14 + count * 4
    }));
  }, [speakers]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
      {/* Speaker Performance Chart */}
      <div
        style={{
          gridColumn: '1 / -1',
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
          Speaker Ratings & Feedback
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedSpeakers.length === 0 && (
            <div style={{ color: '#94A3B8' }}>No speaker ratings yet.</div>
          )}
          {sortedSpeakers.slice(0, 5).map((speaker, index) => (
            <div key={speaker.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {index < 3 && (
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : '#CD7F32'
                      }}
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  )}
                  <span style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF' }}>
                    {speaker.name}
                  </span>
                </div>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                  {speaker.rating ? `${speaker.rating}/5` : '0/5'}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(speaker.rating / 5) * 100}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${speaker.rating < 4 ? '#F59E0B' : '#10B981'} 0%, ${speaker.rating < 4 ? '#D97706' : '#059669'} 100%)`,
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Attendance */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
          {t('manageEvent.speakers.analytics.popularity')}
        </h3>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          {sessions.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              No session attendance data yet
            </p>
          ) : (
            <>
              <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                {sessionMetrics.fillRate}%
              </p>
              <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                {sessionMetrics.totalAttendees} attendees across {sessions.length} sessions
              </p>
            </>
          )}
        </div>
      </div>

      {/* Material Submission Timeline */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
          {t('manageEvent.speakers.analytics.materialCompletion')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {speakers.slice(0, 5).map(speaker => (
            <div key={speaker.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{speaker.name}</span>
              <span
                style={{
                  padding: '4px 10px',
                  backgroundColor: speaker.materials.submitted ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: speaker.materials.submitted ? '#10B981' : '#F59E0B',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '12px'
                }}
              >
                {speaker.materials.submitted ? 'On Time' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Speaker Engagement */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
          Speaker Engagement
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>Email Open Rate</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>{engagementMetrics.confirmationRate}%</p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>Response Rate</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>{engagementMetrics.confirmationRate}%</p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>Material Submission</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>{engagementMetrics.materialRate}%</p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>Avg Confirmation Time</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>
              {engagementMetrics.avgConfirmationDays ? `${engagementMetrics.avgConfirmationDays}d` : '0d'}
            </p>
          </div>
        </div>
      </div>

      {/* Audience Feedback Keywords */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
          {t('manageEvent.speakers.analytics.feedbackTrends')}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {keywordItems.length === 0 && (
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>No feedback keywords yet</span>
          )}
          {keywordItems.map(item => (
            <span
              key={item.word}
              style={{
                fontSize: `${item.size}px`,
                fontWeight: 600,
                color: '#0684F5',
                opacity: 0.7 + (item.size / 100)
              }}
            >
              {item.word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Speaker Detail Modal Component
function SpeakerDetailModal({ speaker, activeTab, onTabChange, onEdit, onEmail, onRemove, onCopyEmail, onClose }: {
  speaker: Speaker;
  activeTab: 'overview' | 'sessions' | 'materials' | 'communication' | 'analytics';
  onTabChange: (tab: 'overview' | 'sessions' | 'materials' | 'communication' | 'analytics') => void;
  onEdit: () => void;
  onEmail: () => void;
  onRemove: () => void;
  onCopyEmail: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11,38,65,0.90)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '40px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '1000px',
          maxHeight: '90vh',
          backgroundColor: '#1E3A5F',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0px 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: speaker.type === 'keynote'
              ? 'linear-gradient(135deg, #8B5CF6 0%, #0684F5 100%)'
              : speaker.type === 'panel'
              ? 'linear-gradient(135deg, #0684F5 0%, #06B6D4 100%)'
              : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            padding: '40px',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
            position: 'relative'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <img
              src={speaker.photo}
              alt={speaker.name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid #FFFFFF',
                boxShadow: '0px 4px 16px rgba(0,0,0,0.3)',
                objectFit: 'cover'
              }}
            />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '32px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                {speaker.name}
              </h2>
              <p style={{ fontSize: '18px', color: '#E0E7FF', marginBottom: '12px' }}>
                {speaker.jobTitle}, {speaker.company}
              </p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {speaker.linkedin && (
                  <a
                    href={speaker.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      textDecoration: 'none'
                    }}
                  >
                    <Linkedin size={16} />
                  </a>
                )}
                {speaker.website && (
                  <a
                    href={speaker.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      textDecoration: 'none'
                    }}
                  >
                    <Globe size={16} />
                  </a>
                )}
              </div>
              <span
                style={{
                  padding: '8px 16px',
                  background: speaker.type === 'keynote'
                    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                    : '#0684F5',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {speaker.type === 'keynote' && <Star size={14} />}
                {speaker.type === 'keynote' ? t('manageEvent.speakers.allSpeakers.badges.keynote') : 
                 speaker.type === 'panel' ? t('manageEvent.speakers.allSpeakers.badges.panel') : 
                 speaker.type === 'workshop' ? t('manageEvent.speakers.allSpeakers.badges.workshop') : 
                 'REGULAR SPEAKER'}
              </span>
            </div>
            <span
              style={{
                padding: '8px 16px',
                backgroundColor: speaker.status === 'confirmed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                color: speaker.status === 'confirmed' ? '#10B981' : '#F59E0B',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'capitalize'
              }}
            >
              <CheckCircle size={16} />
              {speaker.status}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '16px 40px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {[ 
            { id: 'overview', label: t('manageEvent.speakers.detailModal.tabs.overview') },
            { id: 'sessions', label: t('manageEvent.speakers.detailModal.tabs.sessions') },
            { id: 'materials', label: t('manageEvent.speakers.detailModal.tabs.materials') },
            { id: 'communication', label: t('manageEvent.speakers.detailModal.tabs.communication') },
            { id: 'analytics', label: t('manageEvent.speakers.detailModal.tabs.analytics') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as typeof activeTab)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === tab.id ? '#0684F5' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeTab === tab.id ? '#FFFFFF' : '#94A3B8',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '40px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Biography */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('manageEvent.speakers.detailModal.overview.about')}
                </h3>
                <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.6 }}>
                  {speaker.bio}
                </p>
              </div>

              {/* Expertise & Topics */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('manageEvent.speakers.detailModal.overview.expertise')}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {speaker.expertise.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'rgba(6,132,245,0.15)',
                        color: '#0684F5',
                        fontSize: '14px',
                        fontWeight: 500,
                        borderRadius: '12px'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Speaking Experience */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('manageEvent.speakers.detailModal.overview.experience')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>{t('manageEvent.speakers.detailModal.overview.eventsSpoken')}</p>
                    <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>45+</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>{t('manageEvent.speakers.detailModal.overview.avgRating')}</p>
                    <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>{speaker.rating}/5</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>{t('manageEvent.speakers.detailModal.overview.yearsExperience')}</p>
                    <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>12 years</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('manageEvent.speakers.detailModal.overview.contact')}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mail size={18} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{speaker.email}</span>
                    <button
                      onClick={onCopyEmail}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: 'rgba(6,132,245,0.15)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#0684F5',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Copy size={12} />
                      {t('manageEvent.speakers.detailModal.overview.copy')}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Phone size={18} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{speaker.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {speaker.sessions.length === 0 && (
                <div style={{ color: '#94A3B8' }}>{t('manageEvent.speakers.detailModal.sessions.empty')}</div>
              )}
              {speaker.sessions.map(session => (
                <div
                  key={session.id}
                  style={{
                    padding: '24px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                    {session.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>
                    {session.date}, {session.time}
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(6,132,245,0.15)',
                        color: '#0684F5',
                        fontSize: '12px',
                        fontWeight: 500,
                        borderRadius: '12px'
                      }}
                    >
                      {session.role}
                    </span>
                    <span
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(16,185,129,0.15)',
                        color: '#10B981',
                        fontSize: '12px',
                        fontWeight: 500,
                        borderRadius: '12px'
                      }}
                    >
                      Confirmed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '24px 40px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <button
            onClick={onRemove}
            style={{
              padding: '0',
              border: 'none',
              background: 'none',
              color: '#EF4444',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {t('manageEvent.speakers.detailModal.footer.remove')}
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onEmail}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: 'transparent',
                border: '1px solid #FFFFFF',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Mail size={18} />
              {t('manageEvent.speakers.detailModal.footer.sendEmail')}
            </button>
            <button
              onClick={onEdit}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: '#0684F5',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Edit2 size={18} />
              {t('manageEvent.speakers.detailModal.footer.edit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
