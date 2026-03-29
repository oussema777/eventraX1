import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Plus,
  Download,
  Search,
  Filter,
  ChevronDown,
  Eye,
  MoreVertical,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Calendar,
  Mail,
  Edit,
  RefreshCw,
  QrCode,
  Trash,
  Phone,
  Linkedin,
  Utensils,
  Accessibility,
  User,
  Copy,
  Ticket,
  Save,
  ArrowLeft,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  Shield,
  UserCheck,
  BarChart3,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';
import { createNotification } from '../../lib/notifications';
import { useI18n } from '../../i18n/I18nContext';

interface CustomField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface Session {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
}

export default function EventAttendeesTab({ eventId }: { eventId: string }) {
  const { t } = useI18n();
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // View State
  const [isAdding, setIsAdding] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'recent' | 'name' | 'status' | 'checkin' | 'ticket'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventCapacity, setEventCapacity] = useState<number | null>(null);
  const [eventName, setEventName] = useState('');

  // New Attendee Form State
  const [formFields, setFormFields] = useState<CustomField[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState('approved');
  const [showSessions, setShowSessions] = useState(false);
  const [importing, setImporting] = useState(false);

  // Export state
  const [exportType, setExportType] = useState<'attendees' | 'form_responses' | 'full'>('attendees');
  const [exporting, setExporting] = useState(false);

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const listAnchorRef = useRef<HTMLDivElement | null>(null);

  const formatReg = (ts: string | null | undefined) => {
    if (!ts) return { regDate: '', regTime: '' };
    const d = new Date(ts);
    const regDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const regTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return { regDate, regTime };
  };

  const formatCheckIn = (ts: string | null | undefined) => {
    if (!ts) return '';
    const d = new Date(ts);
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${date}, ${time}`;
  };

  const loadAttendees = async () => {
    if (!eventId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load attendees:', error);
      toast.error(t('manageEvent.attendees.toasts.loadError'));
      setAttendees([]);
      setLoading(false);
      return;
    }
    const mapped = (data || []).map((row: any) => {
      const reg = formatReg(row.created_at);
      return {
        id: row.id,
        profileId: row.profile_id || row.profileId || null,
        createdAt: row.created_at,
        name: row.name || row.meta?.name || '',
        email: row.email || row.meta?.email || '',
        company: row.company || row.meta?.company || '',
        photo: row.photo_url || row.meta?.photo || '',
        ticketType: row.ticket_type || row.meta?.ticketType || 'General Admission',
        ticketColor: row.ticket_color || row.meta?.ticketColor || '#9CA3AF',
        price: typeof row.price === 'number' ? row.price : Number(row.price || row.meta?.price || 0),
        regDate: reg.regDate,
        regTime: reg.regTime,
        status: (row.status || 'pending').toLowerCase(),
        checkedIn: !!row.checked_in,
        checkInAt: row.check_in_at,
        checkInTime: row.check_in_at ? formatCheckIn(row.check_in_at) : '',
        isVIP: !!row.is_vip,
        phone: row.phone || row.meta?.phone || '',
        country: row.meta?.country || '',
        confirmationCode: row.confirmation_code || row.meta?.confirmationCode || '',
        meta: row.meta || {}
      };
    });
    setAttendees(mapped);
    setLoading(false);
  };

  const loadEventMetadata = async () => {
    try {
      const { data: forms } = await supabase
        .from('event_forms')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'active');

      const registrationForm = forms?.find(f => f.form_type === 'registration') || forms?.find(f => f.is_default);

      const defaultFields = [
        { id: 'full_name', type: 'text', label: 'Full Name', required: true },
        { id: 'email', type: 'email', label: 'Email Address', required: true }
      ];

      if (registrationForm?.schema?.fields) {
        const custom = registrationForm.schema.fields.filter((f: any) =>
          f.label !== 'Full Name' && f.label !== 'Email Address'
        );
        setFormFields([...defaultFields, ...custom]);
      } else {
        setFormFields(defaultFields);
      }

      const { data: sessionData } = await supabase
        .from('event_sessions')
        .select('*')
        .eq('event_id', eventId)
        .order('starts_at', { ascending: true });
      setSessions(sessionData || []);

      const { data: ticketData } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId);
      setTickets(ticketData || []);
      if (ticketData && ticketData.length > 0) {
        setSelectedTicketId(ticketData[0].id);
      }

      const { data: eventData } = await supabase
        .from('events')
        .select('capacity_limit,name')
        .eq('id', eventId)
        .maybeSingle();
      if (eventData) {
        setEventCapacity(eventData.capacity_limit ?? null);
        setEventName(eventData.name || '');
      }

    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  useEffect(() => {
    loadAttendees();
    loadEventMetadata();
  }, [eventId]);

  const generateConfirmationCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'EV-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleAddAttendee = async () => {
    const name = formData['Full Name'];
    const email = formData['Email Address'];

    if (!name || !email) {
      toast.error('Full Name and Email are required');
      return;
    }

    const missing = formFields.filter(f => f.required && !formData[f.label]);
    if (missing.length > 0) {
      toast.error(`Missing required field: ${missing[0].label}`);
      return;
    }

    try {
      const ticket = tickets.find(t => t.id === selectedTicketId);
      const confirmationCode = generateConfirmationCode();
      const metaData = { ...formData, confirmationCode };

      const { data: newAttendee, error } = await supabase
        .from('event_attendees')
        .insert([{
          event_id: eventId,
          name: name,
          email: email,
          ticket_type: ticket?.name || 'General Admission',
          ticket_color: '#0684F5',
          price: ticket?.price || 0,
          status: registrationStatus,
          checked_in: false,
          confirmation_code: confirmationCode,
          meta: metaData
        }])
        .select()
        .single();

      if (error) throw error;

      if (selectedSessions.size > 0 && newAttendee) {
        const sessionInserts = Array.from(selectedSessions).map(sessionId => ({
          attendee_id: newAttendee.id,
          session_id: sessionId
        }));
        await supabase.from('event_attendee_sessions').insert(sessionInserts);
      }

      toast.success('Attendee added successfully');
      setIsAdding(false);
      setFormData({});
      setSelectedSessions(new Set());
      loadAttendees();
    } catch (error) {
      console.error('Error adding attendee:', error);
      toast.error('Failed to add attendee');
    }
  };

  const updateAttendee = async (id: string, patch: any) => {
    const payload: any = { ...patch };
    if ('checkedIn' in patch) {
      payload.checked_in = !!patch.checkedIn;
      delete payload.checkedIn;
      if (payload.checked_in && !payload.check_in_at) {
        payload.check_in_at = new Date().toISOString();
      }
      if (!payload.checked_in) {
        payload.check_in_at = null;
      }
    }
    const { data, error } = await supabase
      .from('event_attendees')
      .update(payload)
      .eq('id', id)
      .eq('event_id', eventId)
      .select('id');
    if (error) {
      toast.error(t('manageEvent.attendees.toasts.saveError'));
      return false;
    }
    loadAttendees();
    return true;
  };

  const deleteAttendee = async (id: string) => {
    const { error } = await supabase
      .from('event_attendees')
      .delete()
      .eq('id', id)
      .eq('event_id', eventId);
    if (error) {
      toast.error(t('manageEvent.attendees.toasts.deleteError'));
      return false;
    }
    loadAttendees();
    return true;
  };

  /* ──── EXPORT FUNCTIONS ──── */
  const escapeCSV = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v);
    const needs = /[",\n\r]/.test(s);
    const out = s.replace(/"/g, '""');
    return needs ? `"${out}"` : out;
  };

  const downloadCSV = (filename: string, header: string[], rows: string[][]) => {
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rows = data || [];

      if (exportType === 'attendees') {
        const header = ['Name', 'Email', 'Company', 'Phone', 'Ticket Type', 'Price', 'Status', 'Checked In', 'Check-in Time', 'Confirmation Code', 'Registered At', 'VIP'];
        const csvRows = rows.map(r => [
          escapeCSV(r.name || r.meta?.name),
          escapeCSV(r.email || r.meta?.email),
          escapeCSV(r.company || r.meta?.company),
          escapeCSV(r.phone || r.meta?.phone),
          escapeCSV(r.ticket_type),
          escapeCSV(r.price),
          escapeCSV(r.status),
          escapeCSV(r.checked_in ? 'Yes' : 'No'),
          escapeCSV(r.check_in_at || ''),
          escapeCSV(r.confirmation_code || r.meta?.confirmationCode),
          escapeCSV(r.created_at),
          escapeCSV(r.is_vip ? 'Yes' : 'No')
        ]);
        downloadCSV(`attendees-export-${new Date().toISOString().slice(0, 10)}.csv`, header, csvRows);
        toast.success('Attendees exported successfully');

      } else if (exportType === 'form_responses') {
        // Collect all unique meta keys across all attendees
        const allMetaKeys = new Set<string>();
        const systemKeys = new Set([
          'name', 'email', 'company', 'phone', 'ticketType', 'ticketColor', 'price',
          'isNew', 'photo', 'photo_url', 'fullName'
        ]);
        rows.forEach(r => {
          if (r.meta && typeof r.meta === 'object') {
            Object.keys(r.meta).forEach(k => {
              if (!systemKeys.has(k) && !k.startsWith('_')) {
                allMetaKeys.add(k);
              }
            });
          }
        });
        const metaKeysArr = Array.from(allMetaKeys).sort();
        const header = ['Name', 'Email', 'Confirmation Code', ...metaKeysArr];
        const csvRows = rows.map(r => {
          const meta = r.meta || {};
          return [
            escapeCSV(r.name || meta.name),
            escapeCSV(r.email || meta.email),
            escapeCSV(r.confirmation_code || meta.confirmationCode || ''),
            ...metaKeysArr.map(k => {
              const val = meta[k];
              if (val === null || val === undefined) return '';
              if (typeof val === 'object') return escapeCSV(JSON.stringify(val));
              return escapeCSV(val);
            })
          ];
        });
        downloadCSV(`form-responses-export-${new Date().toISOString().slice(0, 10)}.csv`, header, csvRows);
        toast.success('Form responses exported successfully');

      } else {
        // Full export: attendee info + all meta
        const allMetaKeys = new Set<string>();
        rows.forEach(r => {
          if (r.meta && typeof r.meta === 'object') {
            Object.keys(r.meta).forEach(k => {
              if (!k.startsWith('_')) allMetaKeys.add(k);
            });
          }
        });
        const metaKeysArr = Array.from(allMetaKeys).sort();
        const header = ['Name', 'Email', 'Company', 'Phone', 'Ticket Type', 'Price', 'Status', 'Checked In', 'Check-in Time', 'Confirmation Code', 'Registered At', 'VIP', ...metaKeysArr];
        const csvRows = rows.map(r => {
          const meta = r.meta || {};
          return [
            escapeCSV(r.name || meta.name),
            escapeCSV(r.email || meta.email),
            escapeCSV(r.company || meta.company),
            escapeCSV(r.phone || meta.phone),
            escapeCSV(r.ticket_type),
            escapeCSV(r.price),
            escapeCSV(r.status),
            escapeCSV(r.checked_in ? 'Yes' : 'No'),
            escapeCSV(r.check_in_at || ''),
            escapeCSV(r.confirmation_code || meta.confirmationCode),
            escapeCSV(r.created_at),
            escapeCSV(r.is_vip ? 'Yes' : 'No'),
            ...metaKeysArr.map(k => {
              const val = meta[k];
              if (val === null || val === undefined) return '';
              if (typeof val === 'object') return escapeCSV(JSON.stringify(val));
              return escapeCSV(val);
            })
          ];
        });
        downloadCSV(`full-attendee-export-${new Date().toISOString().slice(0, 10)}.csv`, header, csvRows);
        toast.success('Full data exported successfully');
      }

      setShowExportModal(false);
    } catch (e) {
      console.error('Export error:', e);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const sortLabels: Record<string, string> = {
    recent: t('manageEvent.attendees.filters.sortOptions.recent'),
    name: t('manageEvent.attendees.filters.sortOptions.name'),
    status: t('manageEvent.attendees.filters.sortOptions.status'),
    checkin: t('manageEvent.attendees.filters.sortOptions.checkin'),
    ticket: t('manageEvent.attendees.filters.sortOptions.ticket')
  };

  const handleSortClick = () => {
    const order: Array<'recent' | 'name' | 'status' | 'checkin' | 'ticket'> = ['recent', 'name', 'status', 'checkin', 'ticket'];
    const idx = order.indexOf(sortOption);
    const next = order[(idx + 1) % order.length];
    setSortOption(next);
  };

  const handleReviewPending = () => {
    setActiveFilterTab('pending');
    setSearchTerm('');
    setCurrentPage(1);
    listAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      approved: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', color: '#10B981', icon: CheckCircle, label: t('manageEvent.attendees.filters.approved') },
      pending: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#F59E0B', icon: Clock, label: t('manageEvent.attendees.filters.pending') },
      declined: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#EF4444', icon: XCircle, label: t('manageEvent.attendees.filters.declined') }
    };
    const key = (status || 'pending').toLowerCase() as keyof typeof configs;
    return configs[key] || configs.pending;
  };

  const counts = useMemo(() => {
    const total = attendees.length;
    const approved = attendees.filter((a) => a.status === 'approved').length;
    const pending = attendees.filter((a) => a.status === 'pending').length;
    const declined = attendees.filter((a) => a.status === 'declined').length;
    const checkedIn = attendees.filter((a) => a.checkedIn).length;
    const vip = attendees.filter((a) => a.isVIP).length;
    const noShows = attendees.filter((a) => a.status === 'approved' && !a.checkedIn).length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = attendees.filter((a) => a.createdAt && new Date(a.createdAt) >= weekAgo).length;
    return { total, approved, pending, declined, checkedIn, vip, noShows, thisWeek };
  }, [attendees]);

  const pageSize = 50;

  const filteredAttendees = useMemo(() => {
    let list = attendees;
    if (activeFilterTab === 'approved') list = list.filter((a) => a.status === 'approved');
    else if (activeFilterTab === 'pending') list = list.filter((a) => a.status === 'pending');
    else if (activeFilterTab === 'declined') list = list.filter((a) => a.status === 'declined');
    else if (activeFilterTab === 'checkedIn') list = list.filter((a) => a.checkedIn);
    else if (activeFilterTab === 'vip') list = list.filter((a) => a.isVIP);
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((a) =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.ticketType || '').toLowerCase().includes(q) ||
        (a.company || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [attendees, activeFilterTab, searchTerm]);

  const sortedAttendees = useMemo(() => {
    const list = [...filteredAttendees];
    if (sortOption === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOption === 'status') {
      list.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    } else if (sortOption === 'checkin') {
      list.sort((a, b) => {
        const checkDiff = Number(!!b.checkedIn) - Number(!!a.checkedIn);
        if (checkDiff !== 0) return checkDiff;
        return new Date(b.checkInAt || 0).getTime() - new Date(a.checkInAt || 0).getTime();
      });
    } else if (sortOption === 'ticket') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return list;
  }, [filteredAttendees, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedAttendees.length / pageSize));
  const visibleAttendees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAttendees.slice(start, start + pageSize);
  }, [sortedAttendees, currentPage, pageSize]);

  const startIndex = sortedAttendees.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, sortedAttendees.length);
  const attendanceRate = counts.total ? Math.round((counts.checkedIn / counts.total) * 100) : 0;
  const capacityPercent = eventCapacity ? Math.min(Math.round((counts.total / eventCapacity) * 100), 100) : null;

  // Collect unique form field count for stats
  const formFieldCount = useMemo(() => {
    const allKeys = new Set<string>();
    const systemKeys = new Set(['name', 'email', 'company', 'phone', 'ticketType', 'ticketColor', 'price', 'isNew', 'photo', 'photo_url', 'fullName', 'confirmationCode', 'Full Name', 'Email Address']);
    attendees.forEach(a => {
      if (a.meta && typeof a.meta === 'object') {
        Object.keys(a.meta).forEach(k => {
          if (!systemKeys.has(k) && !k.startsWith('_') && typeof a.meta[k] !== 'object') allKeys.add(k);
        });
      }
    });
    return allKeys.size;
  }, [attendees]);

  return (
    <div
      className="event-attendees"
      style={{ backgroundColor: '#0B2641', minHeight: '100vh' }}
      onClick={() => setOpenDropdownId(null)}
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .att-animate { animation: fadeInUp 0.3s ease-out; }
        .att-capacity-bar { transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      <div className="w-full" style={{ maxWidth: '1600px', margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* ═══════════════════ PAGE HEADER ═══════════════════ */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              {t('manageEvent.attendees.header.title')}
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B' }}>
              {t('manageEvent.attendees.header.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              style={{
                height: '42px',
                padding: '0 18px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              <Download size={16} />
              Export
            </button>

            {/* Refresh */}
            <button
              onClick={() => loadAttendees()}
              style={{
                width: '42px',
                height: '42px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
            >
              <RefreshCw size={16} />
            </button>

            {/* Add Attendee */}
            <button
              onClick={() => setIsAdding(!isAdding)}
              style={{
                height: '42px',
                padding: '0 20px',
                backgroundColor: isAdding ? 'rgba(255,255,255,0.06)' : '#10B981',
                border: isAdding ? '1px solid rgba(255,255,255,0.12)' : 'none',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: isAdding ? 'none' : '0 4px 12px rgba(16,185,129,0.25)'
              }}
            >
              {isAdding ? <X size={16} /> : <Plus size={16} />}
              {isAdding ? 'Cancel' : 'Add Attendee'}
            </button>
          </div>
        </div>

        {/* ═══════════════════ INLINE ADD FORM ═══════════════════ */}
        {isAdding && (
          <div className="att-animate" style={{ marginBottom: '28px', backgroundColor: '#0D243B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0B2236', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                <Plus size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Manual Registration</h3>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Ticket & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Ticket Type</label>
                    <div style={{ position: 'relative' }}>
                      <Ticket size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                      <select
                        value={selectedTicketId}
                        onChange={(e) => setSelectedTicketId(e.target.value)}
                        style={{ width: '100%', height: '44px', backgroundColor: '#162C46', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', paddingLeft: '40px', paddingRight: '36px', color: '#FFFFFF', fontSize: '13px', appearance: 'none' as any, cursor: 'pointer', outline: 'none' }}
                      >
                        {tickets.map(t => (
                          <option key={t.id} value={t.id}>{t.name} - ${t.price}</option>
                        ))}
                        {tickets.length === 0 && <option value="">General Admission</option>}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Initial Status</label>
                    <div style={{ position: 'relative' }}>
                      <CheckCircle size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                      <select
                        value={registrationStatus}
                        onChange={(e) => setRegistrationStatus(e.target.value)}
                        style={{ width: '100%', height: '44px', backgroundColor: '#162C46', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', paddingLeft: '40px', paddingRight: '36px', color: '#FFFFFF', fontSize: '13px', appearance: 'none' as any, cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '4px 0 20px' }} />

                {/* Form Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  {formFields.map((field) => (
                    <div key={field.id} style={field.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                        {field.label} {field.required && <span style={{ color: '#10B981' }}>*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          value={formData[field.label] || ''}
                          onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                          style={{ width: '100%', minHeight: '100px', backgroundColor: '#162C46', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: '#FFFFFF', fontSize: '13px', resize: 'none', outline: 'none' }}
                        />
                      ) : field.type === 'dropdown' ? (
                        <div style={{ position: 'relative' }}>
                          <select
                            value={formData[field.label] || ''}
                            onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                            style={{ width: '100%', height: '44px', backgroundColor: '#162C46', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0 36px 0 14px', color: '#FFFFFF', fontSize: '13px', appearance: 'none' as any, cursor: 'pointer', outline: 'none' }}
                          >
                            <option value="">Select option...</option>
                            {field.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                        </div>
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }}>
                            {field.type === 'email' ? <Mail size={15} /> : <User size={15} />}
                          </div>
                          <input
                            type={field.type === 'email' ? 'email' : 'text'}
                            placeholder={field.label}
                            value={formData[field.label] || ''}
                            onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                            style={{ width: '100%', height: '44px', backgroundColor: '#162C46', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', paddingLeft: '40px', paddingRight: '14px', color: '#FFFFFF', fontSize: '13px', outline: 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Sessions */}
                <div>
                  <button
                    onClick={() => setShowSessions(!showSessions)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: '#162C46',
                      border: '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      color: '#FFFFFF'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                        <Calendar size={16} />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Pre-assign Sessions</span>
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>Optional: Choose sessions for this attendee</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {selectedSessions.size > 0 && (
                        <span style={{ fontSize: '10px', backgroundColor: '#10B981', color: '#FFFFFF', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>{selectedSessions.size}</span>
                      )}
                      {showSessions ? <ChevronUp size={16} style={{ color: '#64748B' }} /> : <ChevronDown size={16} style={{ color: '#64748B' }} />}
                    </div>
                  </button>
                  {showSessions && (
                    <div className="custom-scrollbar" style={{ marginTop: '8px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px', maxHeight: '250px', overflowY: 'auto', backgroundColor: '#0B2236' }}>
                      {sessions.length === 0 ? (
                        <p style={{ textAlign: 'center', fontSize: '12px', color: '#475569', padding: '24px 0' }}>No sessions available.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                          {sessions.map(session => {
                            const isSelected = selectedSessions.has(session.id);
                            return (
                              <div
                                key={session.id}
                                onClick={() => { const next = new Set(selectedSessions); if (isSelected) next.delete(session.id); else next.add(session.id); setSelectedSessions(next); }}
                                style={{
                                  padding: '12px',
                                  borderRadius: '10px',
                                  border: isSelected ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.05)',
                                  backgroundColor: isSelected ? 'rgba(16,185,129,0.08)' : 'transparent',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '10px',
                                  transition: 'all 0.15s'
                                }}
                              >
                                <div style={{
                                  marginTop: '2px', width: '20px', height: '20px', borderRadius: '50%',
                                  border: isSelected ? '2px solid #10B981' : '2px solid #475569',
                                  backgroundColor: isSelected ? '#10B981' : 'transparent',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                  {isSelected && <Check size={12} style={{ color: '#FFFFFF', strokeWidth: 3 }} />}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <p style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#FFFFFF' : '#CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.title}</p>
                                  <p style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{new Date(session.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#0B2236', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsAdding(false)}
                style={{ padding: '0 20px', height: '40px', borderRadius: '10px', backgroundColor: 'transparent', border: 'none', color: '#64748B', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Discard
              </button>
              <button
                onClick={handleAddAttendee}
                style={{ padding: '0 28px', height: '40px', borderRadius: '10px', backgroundColor: '#10B981', border: 'none', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
              >
                <Save size={16} />
                Save Registration
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════ STATS GRID ═══════════════════ */}
        {!isAdding && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {/* Total Registrations */}
            <div style={{ backgroundColor: '#0D243B', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(6,132,245,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} style={{ color: '#0684F5' }} />
                </div>
                {capacityPercent !== null && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: capacityPercent >= 90 ? '#EF4444' : capacityPercent >= 70 ? '#F59E0B' : '#10B981', padding: '3px 10px', borderRadius: '20px', backgroundColor: capacityPercent >= 90 ? 'rgba(239,68,68,0.12)' : capacityPercent >= 70 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)' }}>
                    {capacityPercent}% capacity
                  </span>
                )}
              </div>
              <p style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.02em' }}>{counts.total}</p>
              <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Registrations</p>
              {capacityPercent !== null && (
                <div style={{ marginTop: '12px', height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div className="att-capacity-bar" style={{ height: '100%', width: `${capacityPercent}%`, backgroundColor: capacityPercent >= 90 ? '#EF4444' : capacityPercent >= 70 ? '#F59E0B' : '#0684F5', borderRadius: '2px' }} />
                </div>
              )}
            </div>

            {/* Pending Review */}
            <div
              onClick={counts.pending > 0 ? handleReviewPending : undefined}
              style={{ backgroundColor: '#0D243B', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', cursor: counts.pending > 0 ? 'pointer' : 'default', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (counts.pending > 0) e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; }}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} style={{ color: '#F59E0B' }} />
                </div>
                {counts.pending > 0 && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#F59E0B' }}>Review</span>
                )}
              </div>
              <p style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.02em' }}>{counts.pending}</p>
              <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Pending Review</p>
            </div>

            {/* Attendance Rate */}
            <div style={{ backgroundColor: '#0D243B', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={20} style={{ color: '#10B981' }} />
                </div>
              </div>
              <p style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.02em' }}>{attendanceRate}%</p>
              <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{counts.checkedIn} Checked In</p>
              <div style={{ marginTop: '12px', height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                <div className="att-capacity-bar" style={{ height: '100%', width: `${attendanceRate}%`, backgroundColor: '#10B981', borderRadius: '2px' }} />
              </div>
            </div>

            {/* This Week / VIP */}
            <div style={{ backgroundColor: '#0D243B', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(168,85,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} style={{ color: '#A855F7' }} />
                </div>
              </div>
              <p style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.02em' }}>+{counts.thisWeek}</p>
              <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>This Week</p>
              {counts.vip > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={12} style={{ color: '#F59E0B' }} />
                  <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 700 }}>{counts.vip} VIP</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════ FILTERS & SEARCH ═══════════════════ */}
        <div ref={listAnchorRef} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Filter tabs */}
            <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
              {[
                { key: 'all', label: 'All', count: counts.total },
                { key: 'approved', label: 'Approved', count: counts.approved },
                { key: 'pending', label: 'Pending', count: counts.pending },
                { key: 'declined', label: 'Declined', count: counts.declined },
                { key: 'checkedIn', label: 'Checked In', count: counts.checkedIn },
                { key: 'vip', label: 'VIP', count: counts.vip }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveFilterTab(tab.key); setCurrentPage(1); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: activeFilterTab === tab.key ? 700 : 500,
                    backgroundColor: activeFilterTab === tab.key ? '#0684F5' : 'transparent',
                    color: activeFilterTab === tab.key ? '#FFFFFF' : '#64748B',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {tab.key === 'vip' && <Star size={12} />}
                  {tab.label}
                  {tab.key !== 'all' && (
                    <span style={{ fontSize: '10px', opacity: 0.7 }}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Search + Sort */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                  type="text"
                  placeholder="Search by name, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', height: '42px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', paddingLeft: '40px', paddingRight: searchTerm ? '36px' : '14px', color: '#FFFFFF', fontSize: '13px', outline: 'none' }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0 }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={handleSortClick}
                style={{
                  height: '42px',
                  padding: '0 16px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: '#CBD5E1',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                Sort: {sortLabels[sortOption]}
                <ChevronDown size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════ ATTENDEES TABLE ═══════════════════ */}
        <div style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0D243B', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
          {loading ? (
            <div style={{ padding: '64px 0', textAlign: 'center' }}>
              <Loader2 size={28} style={{ color: '#0684F5', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#64748B', fontSize: '13px' }}>Loading attendees...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : visibleAttendees.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} style={{ color: '#334155' }} />
              </div>
              <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>No attendees found</p>
              <p style={{ color: '#334155', fontSize: '12px' }}>Try adjusting your filters or add a new attendee</p>
            </div>
          ) : (
            <>
              {/* ── Desktop Table ── */}
              <div className="hidden sm:block" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attendee</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ticket</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Check-in</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAttendees.map((att, idx) => {
                      const statusConfig = getStatusBadge(att.status);
                      return (
                        <tr
                          key={att.id}
                          onClick={() => { setSelectedAttendee(att); setShowDetailModal(true); }}
                          style={{ borderBottom: idx !== visibleAttendees.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', transition: 'background-color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {att.photo ? (
                                <img
                                  src={att.photo}
                                  alt={att.name}
                                  style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.08)', flexShrink: 0 }}
                                />
                              ) : (
                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0684F5, #0B5FCC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                                  {att.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                              )}
                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px', display: 'block' }}>{att.name}</span>
                                  {att.isVIP && <Star size={12} style={{ color: '#F59E0B', flexShrink: 0 }} fill="#F59E0B" />}
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{att.email}</div>
                                {att.company && (
                                  <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>{att.company}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: att.ticketColor, flexShrink: 0 }} />
                              <div>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#CBD5E1' }}>{att.ticketType}</span>
                                <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{att.regDate}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                              backgroundColor: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}`
                            }}>
                              <statusConfig.icon size={11} /> {statusConfig.label}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {att.checkedIn ? (
                              <div>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#10B981', fontSize: '12px', fontWeight: 700 }}>
                                  <Check size={13} strokeWidth={3} /> Yes
                                </span>
                                {att.checkInTime && (
                                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{att.checkInTime}</div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: '#334155', fontSize: '12px' }}>&mdash;</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              {att.status !== 'approved' && (
                                <button onClick={(e) => { e.stopPropagation(); updateAttendee(att.id, { status: 'approved' }); toast.success('Attendee approved'); }}
                                  style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                  Approve
                                </button>
                              )}
                              {att.status !== 'declined' && (
                                <button onClick={(e) => { e.stopPropagation(); updateAttendee(att.id, { status: 'declined' }); toast.error('Registration declined'); }}
                                  style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                  Decline
                                </button>
                              )}
                              <div style={{ position: 'relative' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === att.id ? null : att.id); }}
                                  style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: openDropdownId === att.id ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: openDropdownId === att.id ? '#FFFFFF' : '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <MoreVertical size={15} />
                                </button>
                                {openDropdownId === att.id && (
                                  <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', marginTop: '6px', width: '192px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', zIndex: 50, overflow: 'hidden' }}>
                                    <button onClick={() => { updateAttendee(att.id, { checkedIn: !att.checkedIn }); toast.success(att.checkedIn ? 'Check-in cancelled' : 'Attendee checked in'); setOpenDropdownId(null); }}
                                      style={{ width: '100%', padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' }}
                                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0FDF4'}
                                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      <QrCode size={16} style={{ color: '#10B981' }} /> {att.checkedIn ? 'Cancel Check-in' : 'Manual Check-in'}
                                    </button>
                                    <button onClick={() => { if (confirm('Remove this attendee?')) { deleteAttendee(att.id); toast.success('Attendee removed'); } setOpenDropdownId(null); }}
                                      style={{ width: '100%', padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, backgroundColor: 'transparent', border: 'none', borderTop: '1px solid #F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' }}
                                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      <Trash size={16} style={{ color: '#EF4444' }} /> Delete Attendee
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile Card List ── */}
              <div className="sm:hidden">
                {visibleAttendees.map((att, idx) => {
                  const statusConfig = getStatusBadge(att.status);
                  return (
                    <div
                      key={att.id}
                      onClick={() => { setSelectedAttendee(att); setShowDetailModal(true); }}
                      style={{ padding: '16px', borderBottom: idx !== visibleAttendees.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        {att.photo ? (
                          <img src={att.photo} alt={att.name} style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.08)', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0684F5, #0B5FCC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>
                            {att.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</p>
                                {att.isVIP && <Star size={11} fill="#F59E0B" style={{ color: '#F59E0B', flexShrink: 0 }} />}
                              </div>
                              <p style={{ fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.email}</p>
                            </div>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === att.id ? null : att.id); }}
                                style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <MoreVertical size={16} />
                              </button>
                              {openDropdownId === att.id && (
                                <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', width: '192px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', zIndex: 50, overflow: 'hidden' }}>
                                  <button onClick={() => { updateAttendee(att.id, { status: att.status === 'approved' ? 'pending' : 'approved' }); setOpenDropdownId(null); }}
                                    style={{ width: '100%', padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' }}>
                                    <CheckCircle size={16} style={{ color: '#10B981' }} /> {att.status === 'approved' ? 'Set Pending' : 'Approve'}
                                  </button>
                                  <button onClick={() => { updateAttendee(att.id, { checkedIn: !att.checkedIn }); setOpenDropdownId(null); }}
                                    style={{ width: '100%', padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, backgroundColor: 'transparent', border: 'none', borderTop: '1px solid #F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' }}>
                                    <QrCode size={16} style={{ color: '#0684F5' }} /> {att.checkedIn ? 'Cancel Check-in' : 'Check In'}
                                  </button>
                                  <button onClick={() => { if (confirm('Remove this attendee?')) { deleteAttendee(att.id); } setOpenDropdownId(null); }}
                                    style={{ width: '100%', padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, backgroundColor: 'transparent', border: 'none', borderTop: '1px solid #F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' }}>
                                    <Trash size={16} style={{ color: '#EF4444' }} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '10px', fontWeight: 600, borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: att.ticketColor }} />
                              {att.ticketType}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, backgroundColor: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}>
                              <statusConfig.icon size={9} /> {statusConfig.label}
                            </span>
                            {att.checkedIn && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <Check size={9} strokeWidth={3} /> Checked In
                              </span>
                            )}
                          </div>
                          {att.company && (
                            <p style={{ fontSize: '11px', color: '#334155', marginTop: '6px' }}>{att.company} {att.regDate && `· ${att.regDate}`}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ═══════════════════ PAGINATION ═══════════════════ */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            {startIndex}–{endIndex} of {sortedAttendees.length}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
              style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#FFFFFF', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1 }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ padding: '6px 14px', backgroundColor: '#0684F5', color: '#FFFFFF', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}>{currentPage}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}
              style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#FFFFFF', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.3 : 1 }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ═══════════════════ DETAIL MODAL ═══════════════════ */}
        {showDetailModal && selectedAttendee && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowDetailModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="custom-scrollbar"
              style={{ backgroundColor: '#0B2641', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                  {selectedAttendee.photo ? (
                    <img src={selectedAttendee.photo} alt={selectedAttendee.name} style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #0684F5, #0B5FCC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>
                      {selectedAttendee.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedAttendee.name}</h3>
                    <p style={{ fontSize: '13px', color: '#64748B' }}>{selectedAttendee.ticketType}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} style={{ padding: '8px', color: '#64748B', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', flexShrink: 0 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="custom-scrollbar" style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                  <div>
                    <h4 style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '16px' }}>Core Information</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>Email</label>
                        <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-all' }}>
                          <Mail size={14} style={{ color: '#0684F5', flexShrink: 0 }} /> {selectedAttendee.email}
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>Company</label>
                        <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>{selectedAttendee.company || 'Not provided'}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>Phone</label>
                        <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={14} style={{ color: '#0684F5', flexShrink: 0 }} /> {selectedAttendee.phone || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '16px' }}>Additional Data</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {Object.entries(selectedAttendee.meta || {}).map(([key, value]) => {
                        if (['name', 'email', 'company', 'phone', 'confirmationCode', 'ticketType', 'ticketColor', 'price'].includes(key)) return null;
                        const isUrl = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
                        const isFile = isUrl && ((value as string).includes('/submissions/') || (value as string).match(/\.(pdf|jpg|jpeg|png|doc|docx)$/i));
                        return (
                          <div key={key}>
                            <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>{key}</label>
                            {isFile ? (
                              <a href={value as string} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0684F5', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                                <Download size={14} /> View Attachment
                              </a>
                            ) : isUrl ? (
                              <a href={value as string} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0684F5', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                                View Link
                              </a>
                            ) : (
                              <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{String(value)}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Status Row */}
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Status</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: selectedAttendee.status === 'approved' ? '#10B981' : selectedAttendee.status === 'declined' ? '#EF4444' : '#F59E0B' }}>
                      {selectedAttendee.status.toUpperCase()}
                    </p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Check-In</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: selectedAttendee.checkedIn ? '#10B981' : '#475569' }}>
                      {selectedAttendee.checkedIn ? 'YES' : 'NO'}
                    </p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Registered</p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{selectedAttendee.regDate}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: 'rgba(255,255,255,0.03)', flexShrink: 0, flexWrap: 'wrap' }}>
                <button
                  onClick={() => { updateAttendee(selectedAttendee.id, { checkedIn: !selectedAttendee.checkedIn }); setShowDetailModal(false); }}
                  style={{ padding: '0 18px', height: '40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {selectedAttendee.checkedIn ? 'Uncheck Attendee' : 'Manual Check-in'}
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{ padding: '0 24px', height: '40px', backgroundColor: '#0684F5', border: 'none', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════ EXPORT MODAL ═══════════════════ */}
        {showExportModal && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowExportModal(false)}
          >
            <div
              className="att-animate"
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: '#0D243B', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
            >
              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(6,132,245,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Download size={20} style={{ color: '#0684F5' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>Export Data</h3>
                    <p style={{ fontSize: '13px', color: '#64748B' }}>{counts.total} attendees available</p>
                  </div>
                </div>
                <button onClick={() => setShowExportModal(false)} style={{ padding: '8px', color: '#64748B', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Export Options */}
              <div style={{ padding: '24px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Choose export type</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Attendees Basic */}
                  <div
                    onClick={() => setExportType('attendees')}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: exportType === 'attendees' ? '2px solid #0684F5' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: exportType === 'attendees' ? 'rgba(6,132,245,0.08)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(6,132,245,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={18} style={{ color: '#0684F5' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>Attendee List</p>
                      <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>Names, emails, companies, tickets, status, check-in data</p>
                    </div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: exportType === 'attendees' ? '2px solid #0684F5' : '2px solid #334155', backgroundColor: exportType === 'attendees' ? '#0684F5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      {exportType === 'attendees' && <Check size={12} style={{ color: '#FFFFFF', strokeWidth: 3 }} />}
                    </div>
                  </div>

                  {/* Form Responses */}
                  <div
                    onClick={() => setExportType('form_responses')}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: exportType === 'form_responses' ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: exportType === 'form_responses' ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} style={{ color: '#8B5CF6' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>Registration Form Responses</p>
                      <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>All custom form field answers from registration{formFieldCount > 0 ? ` (${formFieldCount} custom fields detected)` : ''}</p>
                    </div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: exportType === 'form_responses' ? '2px solid #8B5CF6' : '2px solid #334155', backgroundColor: exportType === 'form_responses' ? '#8B5CF6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      {exportType === 'form_responses' && <Check size={12} style={{ color: '#FFFFFF', strokeWidth: 3 }} />}
                    </div>
                  </div>

                  {/* Full Export */}
                  <div
                    onClick={() => setExportType('full')}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: exportType === 'full' ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: exportType === 'full' ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileSpreadsheet size={18} style={{ color: '#10B981' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>Full Export</p>
                      <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>Everything: attendee info + all form responses + metadata</p>
                    </div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: exportType === 'full' ? '2px solid #10B981' : '2px solid #334155', backgroundColor: exportType === 'full' ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      {exportType === 'full' && <Check size={12} style={{ color: '#FFFFFF', strokeWidth: 3 }} />}
                    </div>
                  </div>
                </div>

                {/* Format info */}
                <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileSpreadsheet size={16} style={{ color: '#64748B', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#64748B' }}>
                    Exports as <strong style={{ color: '#94A3B8' }}>CSV</strong> format — compatible with Excel, Google Sheets, and other spreadsheet tools
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowExportModal(false)}
                  style={{ padding: '0 18px', height: '42px', borderRadius: '10px', backgroundColor: 'transparent', border: 'none', color: '#64748B', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  style={{
                    padding: '0 24px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: exportType === 'form_responses' ? '#8B5CF6' : exportType === 'full' ? '#10B981' : '#0684F5',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: exporting ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: exporting ? 0.7 : 1,
                    boxShadow: `0 4px 12px ${exportType === 'form_responses' ? 'rgba(139,92,246,0.25)' : exportType === 'full' ? 'rgba(16,185,129,0.25)' : 'rgba(6,132,245,0.25)'}`
                  }}
                >
                  {exporting ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Export CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
