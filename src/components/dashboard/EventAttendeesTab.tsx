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
      className="event-attendees p-8" 
      style={{ backgroundColor: '#0B2641', paddingBottom: '80px' }}
      onClick={() => setOpenDropdownId(null)}
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @media (max-width: 600px) {
          .event-attendees { padding: 20px 16px; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: '100%', width: '100%' }}>
        {/* PAGE HEADER */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('manageEvent.attendees.header.title')}
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>
              {t('manageEvent.attendees.header.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className={`flex items-center gap-2 px-6 h-[44px] rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95 ${
                isAdding 
                  ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' 
                  : 'bg-[#10B981] text-white hover:bg-[#0da06f] shadow-[#10B981]/20'
              }`}
            >
              {isAdding ? <X size={18} /> : <Plus size={18} />}
              {isAdding ? 'Cancel' : 'Add Attendee'}
            </button>
          </div>
        </div>

        {/* INLINE ADD FORM */}
        {isAdding && (
          <div className="mb-10 bg-[#0D243B] border border-white/10 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
            <div className="px-6 py-4 border-b border-white/10 bg-[#0B2236] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981]">
                  <Plus size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Manual Registration</h3>
              </div>
            </div>

            <div className="p-8">
              <div className="max-w-3xl mx-auto space-y-8">
                 {/* Ticket & Status */}
                 <div className="grid grid-cols-2 gap-6">
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

                 <div className="h-px bg-white/5 w-full"></div>

                 {/* Form Fields */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {formFields.map((field) => (
                      <div key={field.id} className={field.type === 'textarea' ? 'col-span-2 space-y-2' : 'col-span-1 space-y-2'}>
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
                           <div className="relative group">
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
                                className="w-full bg-[#162C46] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#0684F5] transition-colors placeholder-gray-600 pl-12"
                                placeholder={field.label}
                                value={formData[field.label] || ''}
                                onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                              />
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0684F5] transition-colors pointer-events-none">
                                 {field.type === 'email' ? <Mail size={18} /> : <User size={18} />}
                              </div>
                           </div>
                         )}
                      </div>
                    ))}
                 </div>

                 {/* Collapsible Agenda Section */}
                 <div className="pt-2">
                    <button 
                      onClick={() => setShowSessions(!showSessions)}
                      className="flex items-center justify-between w-full p-4 rounded-xl bg-[#162C46] border border-white/5 hover:border-white/10 transition-all group"
                    >
                       <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-[#10B981]/10 text-[#10B981] group-hover:bg-[#10B981]/20 transition-colors">
                             <Calendar size={18} />
                          </div>
                          <div className="text-left">
                             <span className="block text-sm font-bold text-white">Pre-assign Sessions</span>
                             <span className="block text-xs text-gray-400">Optional: Choose which sessions this attendee will attend</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          {selectedSessions.size > 0 && (
                             <span className="text-[10px] bg-[#10B981] text-white px-2.5 py-1 rounded-full font-bold shadow-md">
                                {selectedSessions.size} Assigned
                             </span>
                          )}
                          {showSessions ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                       </div>
                    </button>

                    {showSessions && (
                       <div className="mt-2 space-y-2 border border-white/10 rounded-xl p-3 max-h-[300px] overflow-y-auto bg-[#0B2236] custom-scrollbar">
                          {sessions.length === 0 ? (
                             <p className="text-center text-xs text-gray-500 py-6">No sessions available.</p>
                          ) : (
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {sessions.map(session => {
                                  const isSelected = selectedSessions.has(session.id);
                                  return (
                                    <div 
                                      key={session.id}
                                      onClick={() => {
                                        const next = new Set(selectedSessions);
                                        if (isSelected) next.delete(session.id);
                                        else next.add(session.id);
                                        setSelectedSessions(next);
                                      }}
                                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                                        isSelected 
                                          ? 'bg-[#10B981]/10 border-[#10B981]/50 shadow-sm' 
                                          : 'bg-transparent border-white/5 hover:bg-white/5'
                                      }`}
                                    >
                                      <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                         isSelected ? 'bg-[#10B981] border-[#10B981]' : 'border-gray-600'
                                      }`}>
                                         {isSelected && <Check size={12} className="text-white stroke-[3]" />}
                                      </div>
                                      <div className="min-w-0">
                                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                           {session.title}
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                          {new Date(session.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
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

            <div className="px-8 py-6 border-t border-white/10 flex justify-end gap-3 bg-[#0B2236]">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-6 py-2.5 rounded-xl text-gray-400 font-medium hover:text-white hover:bg-white/5 transition-colors border border-transparent"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleAddAttendee}
                className="px-12 py-2.5 bg-[#10B981] text-white rounded-xl font-bold hover:bg-[#0da06f] transition-all flex items-center gap-2 shadow-lg shadow-[#10B981]/25 active:scale-95"
              >
                <Save size={20} />
                Save Attendee Registration
              </button>
            </div>
          </div>
        )}

        {/* ATTENDEE STATS ROW */}
        {!isAdding && (
          <div className="grid grid-cols-4 gap-6 mb-8 stats-grid">
            {/* Total Attendees */}
            <div className="rounded-xl p-6 border bg-white/5 border-white/10">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-[#0684F5]/10">
                <Users size={24} style={{ color: '#0684F5' }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>Total</p>
              <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>{counts.total}</h3>
            </div>

            {/* Pending */}
            <div className="rounded-xl p-6 border bg-white/5 border-white/10">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-amber-500/10">
                <Clock size={24} style={{ color: '#F59E0B' }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>Pending</p>
              <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>{counts.pending}</h3>
            </div>

            {/* Checked In */}
            <div className="rounded-xl p-6 border bg-white/5 border-white/10">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-emerald-500/10">
                <CheckCircle size={24} style={{ color: '#10B981' }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>Attendance</p>
              <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>{attendanceRate}%</h3>
            </div>

            {/* Growth */}
            <div className="rounded-xl p-6 border bg-white/5 border-white/10">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-purple-500/10">
                <TrendingUp size={24} style={{ color: '#8B5CF6' }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>New This Week</p>
              <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>+{counts.thisWeek}</h3>
            </div>
          </div>
        )}

        {/* FILTER & ACTIONS BAR */}
        <div
          ref={listAnchorRef}
          className="rounded-xl p-5 mb-6 border bg-white/5 border-white/10"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'approved', 'pending', 'declined', 'checkedIn'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilterTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilterTab === tab ? 'bg-[#0684F5] text-white' : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, company..."
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 text-white text-sm outline-none focus:border-[#0684F5]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleSortClick}
                className="h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-white text-sm flex items-center gap-2"
              >
                Sort: {sortLabels[sortOption]}
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ATTENDEES TABLE */}
        <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0B2641]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Attendee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Check-in</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleAttendees.map((attendee) => {
                  const statusConfig = getStatusBadge(attendee.status);
                  return (
                    <tr key={attendee.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => { setSelectedAttendee(attendee); setShowDetailModal(true); }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {attendee.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{attendee.name}</div>
                            <div className="text-xs text-gray-400">{attendee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{attendee.ticketType}</div>
                        <div className="text-xs text-gray-400">{attendee.regDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}>
                          <statusConfig.icon size={12} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendee.checkedIn ? (
                          <div className="text-emerald-500 text-sm font-bold flex items-center gap-1.5">
                            <Check size={14} strokeWidth={3} /> Checked In
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm italic">Not yet</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/10">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-400">
            Showing {startIndex} to {endIndex} of {sortedAttendees.length} attendees
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 bg-[#0684F5] text-white rounded-lg font-bold text-sm">
              {currentPage}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
