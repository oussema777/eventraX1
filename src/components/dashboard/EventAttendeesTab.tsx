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
  ChevronUp
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
        meta: row.meta || {}
      };
    });
    setAttendees(mapped);
    setLoading(false);
  };

  const loadEventMetadata = async () => {
    try {
      // 1. Fetch Form Schema
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

      // 2. Fetch Sessions
      const { data: sessionData } = await supabase
        .from('event_sessions')
        .select('*')
        .eq('event_id', eventId)
        .order('starts_at', { ascending: true });
      setSessions(sessionData || []);

      // 3. Fetch Tickets
      const { data: ticketData } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId);
      setTickets(ticketData || []);
      if (ticketData && ticketData.length > 0) {
        setSelectedTicketId(ticketData[0].id);
      }

      // 4. Load Event Info
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

  return (
    <div
      className="event-attendees p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: '#0B2641', paddingBottom: '80px' }}
      onClick={() => setOpenDropdownId(null)}
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      <div className="w-full">
        {/* ─── PAGE HEADER ─── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-semibold text-white mb-1 sm:mb-2">
              {t('manageEvent.attendees.header.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              {t('manageEvent.attendees.header.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center justify-center gap-2 px-5 h-11 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95 shrink-0 ${
              isAdding
                ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                : 'bg-[#10B981] text-white hover:bg-[#0da06f] shadow-[#10B981]/20'
            }`}
          >
            {isAdding ? <X size={18} /> : <Plus size={18} />}
            <span>{isAdding ? 'Cancel' : 'Add Attendee'}</span>
          </button>
        </div>

        {/* ─── INLINE ADD FORM ─── */}
        {isAdding && (
          <div className="mb-8 sm:mb-10 bg-[#0D243B] border border-white/10 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
            <div className="px-4 sm:px-6 py-4 border-b border-white/10 bg-[#0B2236] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981] shrink-0">
                <Plus size={20} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Manual Registration</h3>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                 {/* Ticket & Status */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Ticket Type</label>
                       <div className="relative group">
                          <Ticket size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0684F5] transition-colors" />
                          <select
                            className="w-full bg-[#162C46] border border-white/10 rounded-xl pl-12 pr-10 py-3 text-white text-sm focus:outline-none focus:border-[#0684F5] transition-colors appearance-none cursor-pointer"
                            value={selectedTicketId}
                            onChange={(e) => setSelectedTicketId(e.target.value)}
                          >
                             {tickets.map(t => (
                               <option key={t.id} value={t.id}>{t.name} • ${t.price}</option>
                             ))}
                             {tickets.length === 0 && <option value="">General Admission</option>}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Initial Status</label>
                       <div className="relative group">
                          <CheckCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0684F5] transition-colors" />
                          <select
                            className="w-full bg-[#162C46] border border-white/10 rounded-xl pl-12 pr-10 py-3 text-white text-sm focus:outline-none focus:border-[#0684F5] transition-colors appearance-none cursor-pointer"
                            value={registrationStatus}
                            onChange={(e) => setRegistrationStatus(e.target.value)}
                          >
                             <option value="approved">Approved</option>
                             <option value="pending">Pending</option>
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                       </div>
                    </div>
                 </div>

                 <div className="h-px bg-white/5 w-full" />

                 {/* Form Fields */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {formFields.map((field) => (
                      <div key={field.id} className={`space-y-2 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                         <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                           {field.label} {field.required && <span className="text-emerald-500">*</span>}
                         </label>
                         {field.type === 'textarea' ? (
                           <textarea
                             className="w-full bg-[#162C46] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#0684F5] transition-colors resize-none placeholder-gray-600 min-h-[100px]"
                             placeholder={`Enter ${field.label.toLowerCase()}...`}
                             value={formData[field.label] || ''}
                             onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                           />
                         ) : field.type === 'dropdown' ? (
                           <div className="relative">
                              <select
                                className="w-full bg-[#162C46] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white text-sm focus:outline-none focus:border-[#0684F5] transition-colors appearance-none cursor-pointer"
                                value={formData[field.label] || ''}
                                onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                              >
                                <option value="">Select option...</option>
                                {field.options?.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                           </div>
                         ) : (
                           <div className="relative group">
                              <input
                                type={field.type === 'email' ? 'email' : 'text'}
                                className="w-full bg-[#162C46] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#0684F5] transition-colors placeholder-gray-600"
                                placeholder={field.label}
                                value={formData[field.label] || ''}
                                onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                              />
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0684F5] transition-colors pointer-events-none">
                                 {field.type === 'email' ? <Mail size={16} /> : <User size={16} />}
                              </div>
                           </div>
                         )}
                      </div>
                    ))}
                 </div>

                 {/* Sessions */}
                 <div>
                    <button
                      onClick={() => setShowSessions(!showSessions)}
                      className="flex items-center justify-between w-full p-3.5 rounded-xl bg-[#162C46] border border-white/5 hover:border-white/10 transition-all group"
                    >
                       <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981] shrink-0"><Calendar size={16} /></div>
                          <div className="text-left min-w-0">
                             <span className="block text-sm font-bold text-white truncate">Pre-assign Sessions</span>
                             <span className="block text-xs text-gray-400 hidden sm:block">Optional: Choose sessions for this attendee</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 shrink-0 ml-2">
                          {selectedSessions.size > 0 && (
                             <span className="text-[10px] bg-[#10B981] text-white px-2 py-0.5 rounded-full font-bold">{selectedSessions.size}</span>
                          )}
                          {showSessions ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                       </div>
                    </button>
                    {showSessions && (
                       <div className="mt-2 border border-white/10 rounded-xl p-2.5 max-h-[250px] overflow-y-auto bg-[#0B2236] custom-scrollbar">
                          {sessions.length === 0 ? (
                             <p className="text-center text-xs text-gray-500 py-6">No sessions available.</p>
                          ) : (
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {sessions.map(session => {
                                  const isSelected = selectedSessions.has(session.id);
                                  return (
                                    <div
                                      key={session.id}
                                      onClick={() => { const next = new Set(selectedSessions); if (isSelected) next.delete(session.id); else next.add(session.id); setSelectedSessions(next); }}
                                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${isSelected ? 'bg-[#10B981]/10 border-[#10B981]/50' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
                                    >
                                      <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#10B981] border-[#10B981]' : 'border-gray-600'}`}>
                                         {isSelected && <Check size={12} className="text-white stroke-[3]" />}
                                      </div>
                                      <div className="min-w-0">
                                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>{session.title}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{new Date(session.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
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

            <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-white/10 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#0B2236]">
              <button
                onClick={() => setIsAdding(false)}
                className="px-5 py-2.5 rounded-xl text-gray-400 font-medium hover:text-white hover:bg-white/5 transition-colors text-sm text-center"
              >
                Discard Changes
              </button>
              <button
                onClick={handleAddAttendee}
                className="px-6 sm:px-10 py-2.5 bg-[#10B981] text-white rounded-xl font-bold hover:bg-[#0da06f] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/25 active:scale-95 text-sm"
              >
                <Save size={18} />
                Save Registration
              </button>
            </div>
          </div>
        )}

        {/* ─── STATS ─── */}
        {!isAdding && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8">
            {[
              { icon: Users, color: '#0684F5', bgColor: 'rgba(6,132,245,0.12)', value: counts.total, label: 'Total' },
              { icon: Clock, color: '#F59E0B', bgColor: 'rgba(245,158,11,0.12)', value: counts.pending, label: 'Pending' },
              { icon: CheckCircle, color: '#10B981', bgColor: 'rgba(16,185,129,0.12)', value: `${attendanceRate}%`, label: 'Attendance' },
              { icon: TrendingUp, color: '#A855F7', bgColor: 'rgba(168,85,247,0.12)', value: `+${counts.thisWeek}`, label: 'This Week' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 border border-white/[0.08] bg-[#0D243B] hover:bg-[#0F2A45] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: stat.bgColor }}>
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-white leading-none">{stat.value}</p>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── FILTERS & SEARCH ─── */}
        <div ref={listAnchorRef} className="rounded-xl p-3 sm:p-4 mb-5 border bg-white/[0.03] border-white/10">
          <div className="flex flex-col gap-3">
            {/* Filter tabs - horizontally scrollable on mobile */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
              {['all', 'approved', 'pending', 'declined', 'checkedIn'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveFilterTab(tab); setCurrentPage(1); }}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                    activeFilterTab === tab ? 'bg-[#0684F5] text-white' : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {tab === 'checkedIn' ? 'Checked In' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab !== 'all' && (
                    <span className="ml-1.5 text-[10px] opacity-70">
                      {tab === 'approved' ? counts.approved : tab === 'pending' ? counts.pending : tab === 'declined' ? counts.declined : tab === 'checkedIn' ? counts.checkedIn : ''}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, company..."
                  className="w-full h-10 sm:h-11 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 text-white text-sm outline-none focus:border-[#0684F5] transition-colors placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>
                )}
              </div>
              <button
                onClick={handleSortClick}
                className="h-10 sm:h-11 px-3 sm:px-4 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm flex items-center gap-2 shrink-0 justify-center"
              >
                Sort: {sortLabels[sortOption]}
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── ATTENDEES LIST ─── */}
        <div className="rounded-xl border border-white/10 bg-[#0D243B] overflow-hidden shadow-lg">
          {visibleAttendees.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <Users size={28} className="text-gray-600" />
              </div>
              <p className="text-gray-400 text-sm font-medium">No attendees found</p>
              <p className="text-gray-600 text-xs mt-1">Try adjusting your filters or add a new attendee</p>
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Table (sm+) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Attendee</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ticket</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Check-in</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAttendees.map((attendee, idx) => {
                      const statusConfig = getStatusBadge(attendee.status);
                      return (
                        <tr
                          key={attendee.id}
                          className={`group cursor-pointer transition-colors hover:bg-white/[0.04] ${idx !== visibleAttendees.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
                          onClick={() => { setSelectedAttendee(attendee); setShowDetailModal(true); }}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0684F5] to-[#0B5FCC] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                                {attendee.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white truncate max-w-[180px]">{attendee.name}</div>
                                <div className="text-[11px] text-gray-500 truncate max-w-[180px]">{attendee.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-medium text-gray-300">{attendee.ticketType}</span>
                            <div className="text-[10px] text-gray-600 mt-0.5">{attendee.regDate}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}>
                              <statusConfig.icon size={11} /> {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {attendee.checkedIn ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold"><Check size={13} strokeWidth={3} /> Yes</span>
                            ) : (
                              <span className="text-gray-600 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              {attendee.status !== 'approved' && (
                                <button onClick={(e) => { e.stopPropagation(); updateAttendee(attendee.id, { status: 'approved' }); toast.success('Attendee approved'); }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-[11px] font-bold transition-all active:scale-95 border border-emerald-500/20">
                                  Approve
                                </button>
                              )}
                              {attendee.status !== 'declined' && (
                                <button onClick={(e) => { e.stopPropagation(); updateAttendee(attendee.id, { status: 'declined' }); toast.error('Registration declined'); }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 text-[11px] font-bold transition-all active:scale-95 border border-rose-500/20">
                                  Decline
                                </button>
                              )}
                              <div className="relative">
                                <button
                                  className={`p-1.5 rounded-lg transition-colors ${openDropdownId === attendee.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
                                  onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === attendee.id ? null : attendee.id); }}
                                >
                                  <MoreVertical size={15} />
                                </button>
                                {openDropdownId === attendee.id && (
                                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => { updateAttendee(attendee.id, { checkedIn: !attendee.checkedIn }); toast.success(attendee.checkedIn ? 'Check-in cancelled' : 'Attendee checked in'); setOpenDropdownId(null); }}
                                      style={{ color: '#0F172A' }} className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-emerald-50 flex items-center gap-2">
                                      <QrCode size={16} className="text-emerald-600" /> {attendee.checkedIn ? 'Cancel Check-in' : 'Manual Check-in'}
                                    </button>
                                    <button onClick={() => { if (confirm('Remove this attendee?')) { deleteAttendee(attendee.id); toast.success('Attendee removed'); } setOpenDropdownId(null); }}
                                      style={{ color: '#0F172A' }} className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-rose-50 flex items-center gap-2 border-t border-gray-100">
                                      <Trash size={16} className="text-rose-600" /> Delete Attendee
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

              {/* ─── Mobile Card List (phone only) ─── */}
              <div className="sm:hidden divide-y divide-white/[0.05]">
                {visibleAttendees.map((attendee) => {
                  const statusConfig = getStatusBadge(attendee.status);
                  return (
                    <div
                      key={attendee.id}
                      className="p-4 hover:bg-white/[0.02] transition-colors active:bg-white/[0.04] cursor-pointer"
                      onClick={() => { setSelectedAttendee(attendee); setShowDetailModal(true); }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0684F5] to-[#0B5FCC] flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                          {attendee.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{attendee.name}</p>
                              <p className="text-xs text-gray-500 truncate">{attendee.email}</p>
                            </div>
                            <div className="relative shrink-0">
                              <button
                                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === attendee.id ? null : attendee.id); }}
                              >
                                <MoreVertical size={16} />
                              </button>
                              {openDropdownId === attendee.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => { updateAttendee(attendee.id, { status: attendee.status === 'approved' ? 'pending' : 'approved' }); setOpenDropdownId(null); }}
                                    style={{ color: '#0F172A' }} className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-emerald-50 flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-600" /> {attendee.status === 'approved' ? 'Set Pending' : 'Approve'}
                                  </button>
                                  <button onClick={() => { updateAttendee(attendee.id, { checkedIn: !attendee.checkedIn }); setOpenDropdownId(null); }}
                                    style={{ color: '#0F172A' }} className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-blue-50 flex items-center gap-2 border-t border-gray-100">
                                    <QrCode size={16} className="text-blue-600" /> {attendee.checkedIn ? 'Cancel Check-in' : 'Check In'}
                                  </button>
                                  <button onClick={() => { if (confirm('Remove this attendee?')) { deleteAttendee(attendee.id); } setOpenDropdownId(null); }}
                                    style={{ color: '#0F172A' }} className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-rose-50 flex items-center gap-2 border-t border-gray-100">
                                    <Trash size={16} className="text-rose-600" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-white/10 text-gray-400 border border-white/5">
                              {attendee.ticketType}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}>
                              <statusConfig.icon size={9} /> {statusConfig.label}
                            </span>
                            {attendee.checkedIn && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Check size={9} strokeWidth={3} /> Checked In
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-600 mt-1.5">{attendee.regDate} {attendee.regTime && `• ${attendee.regTime}`}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ─── PAGINATION ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-3">
          <p className="text-xs sm:text-sm text-gray-400 order-2 sm:order-1">
            {startIndex}–{endIndex} of {sortedAttendees.length}
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={18} />
            </button>
            <span className="px-3.5 py-1.5 bg-[#0684F5] text-white rounded-lg font-bold text-sm">{currentPage}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ─── ATTENDEE DETAIL MODAL ─── */}
        {showDetailModal && selectedAttendee && (
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowDetailModal(false)}
          >
            <div
              className="bg-[#0B2641] border border-white/10 sm:rounded-2xl rounded-t-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0684F5]/20 flex items-center justify-center text-[#0684F5] shrink-0">
                    <User size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-white truncate">{selectedAttendee.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{selectedAttendee.ticketType}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 text-gray-400 hover:text-white transition-colors shrink-0">
                  <X size={22} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Core Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Email</label>
                        <div className="text-white text-sm font-medium flex items-center gap-2 break-all">
                          <Mail size={14} className="text-[#0684F5] shrink-0" /> {selectedAttendee.email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Company</label>
                        <div className="text-white text-sm font-medium">{selectedAttendee.company || 'Not provided'}</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Phone</label>
                        <div className="text-white text-sm font-medium flex items-center gap-2">
                          <Phone size={14} className="text-[#0684F5] shrink-0" /> {selectedAttendee.phone || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Additional Data</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedAttendee.meta || {}).map(([key, value]) => {
                        if (['name', 'email', 'company', 'phone', 'confirmationCode', 'ticketType', 'ticketColor', 'price'].includes(key)) return null;
                        const isUrl = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
                        const isFile = isUrl && ((value as string).includes('/submissions/') || (value as string).match(/\.(pdf|jpg|jpeg|png|doc|docx)$/i));
                        return (
                          <div key={key}>
                            <label className="block text-xs text-gray-500 mb-1">{key}</label>
                            {isFile ? (
                              <a href={value as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#0684F5] text-sm font-bold hover:underline">
                                <Download size={14} /> View Attachment
                              </a>
                            ) : isUrl ? (
                              <a href={value as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#0684F5] text-sm font-bold hover:underline">
                                View Link
                              </a>
                            ) : (
                              <div className="text-white text-sm font-medium whitespace-pre-wrap break-words">{String(value)}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Status Row */}
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-white/5 p-3 sm:p-4 rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Status</p>
                    <p className={`text-xs sm:text-sm font-bold ${selectedAttendee.status === 'approved' ? 'text-emerald-400' : selectedAttendee.status === 'declined' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {selectedAttendee.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 sm:p-4 rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Check-In</p>
                    <p className={`text-xs sm:text-sm font-bold ${selectedAttendee.checkedIn ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {selectedAttendee.checkedIn ? 'YES' : 'NO'}
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 sm:p-4 rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Registered</p>
                    <p className="text-white text-[11px] sm:text-xs font-bold">{selectedAttendee.regDate}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-white/10 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 bg-white/5 shrink-0">
                <button
                  onClick={() => { updateAttendee(selectedAttendee.id, { checkedIn: !selectedAttendee.checkedIn }); setShowDetailModal(false); }}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all text-center"
                >
                  {selectedAttendee.checkedIn ? 'Uncheck Attendee' : 'Manual Check-in'}
                </button>
                <button
                  className="px-6 py-2.5 bg-[#0684F5] text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all text-center"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
