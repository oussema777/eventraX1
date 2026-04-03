import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Download,
  Upload,
  Search,
  Printer,
  CreditCard,
  CheckCircle,
  Clock,
  MoreVertical,
  Calendar,
  X,
  User,
  Mail,
  Ticket,
  Check,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Save,
  ArrowLeft,
  UserCheck,
  UserX,
  ScanLine,
  TrendingUp,
  Filter,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';
import BadgeEditorSimple from './BadgeEditorSimple';
import ImportAttendeesModal from './modals/ImportAttendeesModal';

interface AttendeesTabProps {
  eventId: string;
}

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

export default function AttendeesTab({ eventId }: AttendeesTabProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // View State
  const [isAdding, setIsAdding] = useState(false);
  const [isDesigningBadges, setIsDesigningBadges] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'approved' | 'pending' | 'checked_in'>('all');

  // Dynamic Data
  const [formFields, setFormFields] = useState<CustomField[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tickets, setTickets] = useState<TicketType[]>([]);

  // New Attendee Form State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState('approved');
  const [showSessions, setShowSessions] = useState(false);

  useEffect(() => {
    fetchAttendees();
    fetchEventMetadata();
  }, [eventId]);

  const handleBulkImport = async (importedData: any[]) => {
    try {
      const payload = importedData.map(a => {
        const confirmationCode = generateConfirmationCode();
        return {
          event_id: eventId,
          name: a.name,
          email: a.email,
          ticket_type: a.ticket_type || 'General Admission',
          ticket_color: '#0684F5',
          price: 0,
          status: a.status || 'approved',
          checked_in: false,
          confirmation_code: confirmationCode,
          meta: {
            company: a.company,
            imported: true,
            importDate: new Date().toISOString(),
            confirmationCode
          }
        };
      });

      const { error } = await supabase
        .from('event_attendees')
        .upsert(payload, { onConflict: 'email,event_id' });

      if (error) throw error;

      toast.success(t('wizard.step3.attendeesTab.toasts.importSuccess', { count: payload.length }));
      fetchAttendees();
    } catch (error: any) {
      console.error('Bulk import failed:', error);
      toast.error(t('wizard.step3.attendeesTab.toasts.importFailed') + ': ' + (error.message || 'Unknown error'));
    }
  };

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      console.error('Error fetching attendees:', error);
      toast.error(t('manageEvent.attendees.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchEventMetadata = async () => {
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

    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

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
      toast.error(t('wizard.step3.attendeesTab.toasts.nameEmailRequired'));
      return;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('wizard.step3.attendeesTab.toasts.invalidEmail'));
      return;
    }

    const missing = formFields.filter(f => f.required && !formData[f.label]);
    if (missing.length > 0) {
      toast.error(t('wizard.step3.attendeesTab.toasts.missingField', { field: missing[0].label }));
      return;
    }

    try {
      const ticket = tickets.find(t => t.id === selectedTicketId);
      const confirmationCode = generateConfirmationCode();
      const metaData = { ...formData, confirmationCode };

      const { data: newAttendee, error } = await supabase
        .from('event_attendees')
        .insert([
          {
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
          }
        ])
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

      toast.success(t('wizard.step3.attendeesTab.toasts.addSuccess'));
      setIsAdding(false);
      setFormData({});
      setSelectedSessions(new Set());
      fetchAttendees();
    } catch (error: any) {
      console.error('Error adding attendee:', error);
      if (error.code === '23505') {
        toast.error(t('wizard.step3.attendeesTab.toasts.duplicateEmail'));
      } else {
        toast.error(t('wizard.step3.attendeesTab.toasts.addFailed'));
      }
    }
  };


  const handleDownloadTemplate = () => {
    const csvContent = "Full Name,Email Address,Ticket Type,Company,Status\nJohn Doe,john@example.com,VIP,Acme Inc,approved\nJane Smith,jane@example.com,General Admission,StartUp Co,pending";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "attendee_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (attendees.length === 0) {
      toast.info(t('wizard.step3.attendeesTab.toasts.noExport'));
      return;
    }
    const headers = ['Name', 'Email', 'Ticket Type', 'Status', 'Checked In', 'Confirmation Code'];
    const csvContent = [
      headers.join(','),
      ...attendees.map(a =>
        `"${a.name}","${a.email}","${a.ticket_type}","${a.status}","${a.checked_in ? 'Yes' : 'No'}","${a.confirmation_code || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${eventId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(t('wizard.step3.attendeesTab.toasts.exportStarted'));
  };

  const approvedCount = attendees.filter(a => a.status === 'approved').length;
  const pendingCount = attendees.filter(a => a.status === 'pending').length;
  const checkedInCount = attendees.filter(a => a.checked_in).length;

  const filteredAttendees = useMemo(() => {
    let list = attendees;
    // Filter by tab
    if (activeFilterTab === 'approved') list = list.filter(a => a.status === 'approved');
    else if (activeFilterTab === 'pending') list = list.filter(a => a.status === 'pending');
    else if (activeFilterTab === 'checked_in') list = list.filter(a => a.checked_in);
    // Filter by search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.ticket_type?.toLowerCase().includes(q) ||
        a.meta?.company?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [attendees, activeFilterTab, searchTerm]);

  const filterTabs = [
    { key: 'all' as const, label: 'All', count: attendees.length },
    { key: 'approved' as const, label: t('wizard.step3.attendeesTab.table.approved'), count: approvedCount },
    { key: 'pending' as const, label: t('wizard.step3.attendeesTab.table.pending'), count: pendingCount },
    { key: 'checked_in' as const, label: t('wizard.step3.attendeesTab.table.checkedIn'), count: checkedInCount },
  ];

  if (isDesigningBadges) {
    return <BadgeEditorSimple eventId={eventId} onBack={() => setIsDesigningBadges(false)} />;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 400px)' }}>
      <style>{`
        .att-animate { animation: attSlideIn 0.3s ease-out; }
        @keyframes attSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .att-row:hover { background-color: rgba(255,255,255,0.03) !important; }
        .att-capacity-bar { transition: width 0.6s ease-out; }
        .att-btn-secondary:hover { background-color: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.2) !important; }
        @media (max-width: 768px) {
          .att-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .att-header-actions { flex-wrap: wrap !important; }
          .att-toolbar { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .att-toolbar-search { width: 100% !important; }
        }
        @media (max-width: 480px) {
          .att-stat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── HEADER ─── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              {t('wizard.step3.attendeesTab.title')}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
              {t('wizard.step3.attendeesTab.subtitle')}
            </p>
          </div>
          {!isAdding && (
            <div className="att-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={handleDownloadTemplate}
                className="att-btn-secondary"
                style={{
                  height: '42px',
                  padding: '0 14px',
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
                title={t('wizard.step3.attendeesTab.csvTemplate')}
              >
                <FileText size={16} />
                <span className="hidden sm:inline">Template</span>
              </button>
              <button
                onClick={handleExport}
                className="att-btn-secondary"
                style={{
                  height: '42px',
                  padding: '0 14px',
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
                title={t('wizard.step3.attendeesTab.actions.exportList')}
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="att-btn-secondary"
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
              >
                <Upload size={16} />
                <span className="hidden sm:inline">{t('wizard.step3.attendeesTab.actions.importCsv')}</span>
              </button>
              <button
                onClick={() => setIsAdding(true)}
                style={{
                  height: '42px',
                  padding: '0 20px',
                  backgroundColor: '#10B981',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
                }}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">{t('wizard.step3.attendeesTab.actions.addManually')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── STAT CARDS ─── */}
      {!isAdding && (
        <div className="att-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {/* Total */}
          <div style={{
            backgroundColor: '#0D243B',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(6,132,245,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} style={{ color: '#0684F5' }} />
              </div>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.02em' }}>
              {attendees.length}
            </p>
            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              Total Registrations
            </p>
            {/* Subtle gradient accent */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #0684F5, transparent)' }} />
          </div>

          {/* Approved */}
          <div style={{
            backgroundColor: '#0D243B',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={20} style={{ color: '#10B981' }} />
              </div>
              {attendees.length > 0 && (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', padding: '3px 10px', borderRadius: '20px', backgroundColor: 'rgba(16,185,129,0.12)' }}>
                  {Math.round((approvedCount / attendees.length) * 100)}%
                </span>
              )}
            </div>
            <p style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.02em' }}>
              {approvedCount}
            </p>
            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              {t('wizard.step3.attendeesTab.table.approved')}
            </p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10B981, transparent)' }} />
          </div>

          {/* Pending */}
          <div style={{
            backgroundColor: '#0D243B',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} style={{ color: '#F59E0B' }} />
              </div>
              {pendingCount > 0 && (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', padding: '3px 10px', borderRadius: '20px', backgroundColor: 'rgba(245,158,11,0.12)' }}>
                  Needs review
                </span>
              )}
            </div>
            <p style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.02em' }}>
              {pendingCount}
            </p>
            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              {t('wizard.step3.attendeesTab.table.pending')}
            </p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #F59E0B, transparent)' }} />
          </div>

          {/* Checked In */}
          <div style={{
            backgroundColor: '#0D243B',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScanLine size={20} style={{ color: '#8B5CF6' }} />
              </div>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.02em' }}>
              {checkedInCount}
            </p>
            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              {t('wizard.step3.attendeesTab.table.checkedIn')}
            </p>
            {/* Progress bar for check-in */}
            {attendees.length > 0 && (
              <div style={{ marginTop: '12px', height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                <div className="att-capacity-bar" style={{ height: '100%', width: `${Math.round((checkedInCount / attendees.length) * 100)}%`, backgroundColor: '#8B5CF6', borderRadius: '2px' }} />
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #8B5CF6, transparent)' }} />
          </div>
        </div>
      )}

      {/* ─── IMPORT MODAL ─── */}
      <ImportAttendeesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
      />

      {/* ─── INLINE ADD FORM ─── */}
      {isAdding && (
        <div className="att-animate" style={{
          marginBottom: '28px',
          backgroundColor: '#0D243B',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: '#0B2236',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={() => setIsAdding(false)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                {t('wizard.step3.attendeesTab.addForm.title')}
              </h3>
              <p className="hidden sm:block" style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {t('wizard.step3.attendeesTab.addForm.subtitle')}
              </p>
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16,185,129,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981'
            }}>
              <Plus size={20} />
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              {/* Ticket & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', marginLeft: '2px' }}>
                    {t('wizard.step3.attendeesTab.addForm.ticketType')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Ticket size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                    <select
                      value={selectedTicketId}
                      onChange={(e) => setSelectedTicketId(e.target.value)}
                      style={{
                        width: '100%',
                        height: '46px',
                        backgroundColor: '#162C46',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        paddingLeft: '42px',
                        paddingRight: '40px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 500,
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none' as any
                      }}
                    >
                      {tickets.map(t => (
                        <option key={t.id} value={t.id}>{t.name} - ${t.price}</option>
                      ))}
                      {tickets.length === 0 && <option value="">{t('wizard.step3.attendeesTab.addForm.generalAdmission')}</option>}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', marginLeft: '2px' }}>
                    {t('wizard.step3.attendeesTab.addForm.status')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CheckCircle size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                    <select
                      value={registrationStatus}
                      onChange={(e) => setRegistrationStatus(e.target.value)}
                      style={{
                        width: '100%',
                        height: '46px',
                        backgroundColor: '#162C46',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        paddingLeft: '42px',
                        paddingRight: '40px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 500,
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none' as any
                      }}
                    >
                      <option value="approved">{t('wizard.step3.attendeesTab.addForm.statusApproved')}</option>
                      <option value="pending">{t('wizard.step3.attendeesTab.addForm.statusPending')}</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', margin: '0 0 24px' }} />

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formFields.map((field) => (
                  <div key={field.id}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', marginLeft: '2px' }}>
                      {field.label} {field.required && <span style={{ color: '#10B981' }}>*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        placeholder={t('wizard.step3.attendeesTab.addForm.enterField', { field: field.label.toLowerCase() })}
                        value={formData[field.label] || ''}
                        onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          backgroundColor: '#162C46',
                          border: '1.5px solid rgba(255,255,255,0.08)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    ) : field.type === 'dropdown' ? (
                      <div style={{ position: 'relative' }}>
                        <select
                          value={formData[field.label] || ''}
                          onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                          style={{
                            width: '100%',
                            height: '46px',
                            backgroundColor: '#162C46',
                            border: '1.5px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px',
                            paddingLeft: '16px',
                            paddingRight: '40px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none' as any
                          }}
                        >
                          <option value="">{t('wizard.step3.attendeesTab.addForm.selectOption')}</option>
                          {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }}>
                          {field.type === 'email' ? <Mail size={16} /> : <User size={16} />}
                        </div>
                        <input
                          type={field.type === 'email' ? 'email' : 'text'}
                          placeholder={field.label}
                          value={formData[field.label] || ''}
                          onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                          style={{
                            width: '100%',
                            height: '46px',
                            backgroundColor: '#162C46',
                            border: '1.5px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px',
                            paddingLeft: '42px',
                            paddingRight: '16px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Collapsible Agenda Section */}
              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={() => setShowSessions(!showSessions)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    backgroundColor: '#162C46',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(6,132,245,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={16} style={{ color: '#0684F5' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                        {t('wizard.step3.attendeesTab.addForm.assignSessions')}
                      </span>
                      <span className="hidden sm:block" style={{ display: 'block', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        {t('wizard.step3.attendeesTab.addForm.assignSessionsDesc')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedSessions.size > 0 && (
                      <span style={{ fontSize: '11px', backgroundColor: '#0684F5', color: '#FFFFFF', padding: '2px 10px', borderRadius: '20px', fontWeight: 700 }}>
                        {selectedSessions.size}
                      </span>
                    )}
                    {showSessions ? <ChevronUp size={16} style={{ color: '#64748B' }} /> : <ChevronDown size={16} style={{ color: '#64748B' }} />}
                  </div>
                </button>

                {showSessions && (
                  <div style={{
                    marginTop: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '8px',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    backgroundColor: '#0B2236'
                  }}>
                    {sessions.length === 0 ? (
                      <p style={{ textAlign: 'center', fontSize: '13px', color: '#475569', padding: '24px' }}>
                        {t('wizard.step3.attendeesTab.addForm.noSessions')}
                      </p>
                    ) : (
                      sessions.map(session => {
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
                            style={{
                              padding: '12px',
                              borderRadius: '10px',
                              border: `1.5px solid ${isSelected ? 'rgba(6,132,245,0.4)' : 'transparent'}`,
                              backgroundColor: isSelected ? 'rgba(6,132,245,0.08)' : 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              transition: 'all 0.15s',
                              marginBottom: '4px'
                            }}
                          >
                            <div style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '6px',
                              border: `2px solid ${isSelected ? '#0684F5' : 'rgba(255,255,255,0.2)'}`,
                              backgroundColor: isSelected ? '#0684F5' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '1px',
                              transition: 'all 0.15s'
                            }}>
                              {isSelected && <Check size={12} style={{ color: '#FFFFFF' }} />}
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? '#FFFFFF' : '#94A3B8' }}>
                                {session.title}
                              </p>
                              <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                                {new Date(session.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: '#0B2236',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setIsAdding(false)}
              className="att-btn-secondary"
              style={{
                height: '42px',
                padding: '0 20px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                color: '#94A3B8',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {t('wizard.step3.attendeesTab.addForm.discardChanges')}
            </button>
            <button
              onClick={handleAddAttendee}
              style={{
                height: '42px',
                padding: '0 24px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
                transition: 'all 0.2s'
              }}
            >
              <Save size={16} />
              {t('wizard.step3.attendeesTab.addForm.saveRegistration')}
            </button>
          </div>
        </div>
      )}

      {/* ─── ATTENDEE LIST ─── */}
      <div style={{
        backgroundColor: '#0D243B',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden'
      }}>
        {/* Toolbar: Filter Tabs + Search */}
        {!loading && (
          <div className="att-toolbar" style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            {/* Filter Tabs */}
            <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', flexShrink: 0 }}>
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilterTab(tab.key)}
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
                  {tab.label}
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            {attendees.length > 0 && (
              <div className="att-toolbar-search" style={{ flex: 1, minWidth: '200px', position: 'relative', maxWidth: '320px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                  type="text"
                  placeholder={t('wizard.step3.attendeesTab.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    paddingLeft: '40px',
                    paddingRight: searchTerm ? '36px' : '14px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#0684F5', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>{t('wizard.step3.attendeesTab.loading')}</p>
          </div>
        ) : attendees.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} style={{ color: '#334155' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('wizard.step3.attendeesTab.empty.title')}
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '360px', margin: '0 auto 24px' }}>
              {t('wizard.step3.attendeesTab.empty.subtitle')}
            </p>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                style={{
                  height: '42px',
                  padding: '0 20px',
                  backgroundColor: '#10B981',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
                }}
              >
                <Plus size={16} />
                {t('wizard.step3.attendeesTab.actions.addFirstAttendee')}
              </button>
            )}
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={24} style={{ color: '#334155' }} />
            </div>
            <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>No attendees found</p>
            <p style={{ color: '#334155', fontSize: '12px' }}>Try adjusting your filters or search</p>
          </div>
        ) : (
          <>
            {/* Results count bar */}
            {(searchTerm || activeFilterTab !== 'all') && (
              <div style={{ padding: '10px 20px', backgroundColor: 'rgba(6,132,245,0.06)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                  Showing {filteredAttendees.length} of {attendees.length} attendees
                </p>
                {(searchTerm || activeFilterTab !== 'all') && (
                  <button
                    onClick={() => { setSearchTerm(''); setActiveFilterTab('all'); }}
                    style={{ fontSize: '12px', color: '#0684F5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* ─── Desktop Table ─── */}
            <div className="hidden lg:block">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('wizard.step3.attendeesTab.table.name')}
                    </th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('wizard.step3.attendeesTab.table.ticket')}
                    </th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('wizard.step3.attendeesTab.table.status')}
                    </th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('wizard.step3.attendeesTab.table.checkedIn')}
                    </th>
                    <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('wizard.step3.attendeesTab.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((attendee, idx) => (
                    <tr key={attendee.id} className="att-row" style={{ borderBottom: idx < filteredAttendees.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined, transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0684F5 0%, #8B5CF6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {attendee.name?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {attendee.name}
                            </p>
                            <p style={{ fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {attendee.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: '#94A3B8',
                          border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                          <Ticket size={12} />
                          {attendee.ticket_type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {attendee.status === 'approved' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: 'rgba(16,185,129,0.15)',
                            color: '#10B981',
                            border: '1px solid rgba(16,185,129,0.3)'
                          }}>
                            <CheckCircle size={11} /> {t('wizard.step3.attendeesTab.table.approved')}
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: 'rgba(245,158,11,0.15)',
                            color: '#F59E0B',
                            border: '1px solid rgba(245,158,11,0.3)'
                          }}>
                            <Clock size={11} /> {t('wizard.step3.attendeesTab.table.pending')}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {attendee.checked_in ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
                            <CheckCircle size={14} /> {t('wizard.step3.attendeesTab.table.yes')}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#334155' }}>{t('wizard.step3.attendeesTab.table.no')}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#475569',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#FFFFFF'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─── Tablet View ─── */}
            <div className="hidden md:block lg:hidden">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('wizard.step3.attendeesTab.table.name')}</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('wizard.step3.attendeesTab.table.status')}</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('wizard.step3.attendeesTab.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((attendee, idx) => (
                    <tr key={attendee.id} className="att-row" style={{ borderBottom: idx < filteredAttendees.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined, transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0684F5 0%, #8B5CF6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {attendee.name?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{attendee.name}</p>
                            <p style={{ fontSize: '12px', color: '#475569' }}>{attendee.email}</p>
                            <span style={{
                              display: 'inline-block',
                              marginTop: '4px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              color: '#94A3B8'
                            }}>
                              {attendee.ticket_type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {attendee.status === 'approved' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                              <CheckCircle size={10} /> {t('wizard.step3.attendeesTab.table.approved')}
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                              <Clock size={10} /> {t('wizard.step3.attendeesTab.table.pending')}
                            </span>
                          )}
                          {attendee.checked_in && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#8B5CF6' }}>
                              <ScanLine size={10} /> {t('wizard.step3.attendeesTab.table.checkedIn')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#FFFFFF'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─── Mobile Card List ─── */}
            <div className="md:hidden">
              {filteredAttendees.map((attendee, idx) => (
                <div
                  key={attendee.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: idx < filteredAttendees.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                    transition: 'background-color 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0684F5 0%, #8B5CF6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '16px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {attendee.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {attendee.name}
                          </p>
                          <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {attendee.email}
                          </p>
                        </div>
                        <button
                          style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: '#94A3B8',
                          border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          {attendee.ticket_type}
                        </span>
                        {attendee.status === 'approved' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                            <CheckCircle size={9} /> {t('wizard.step3.attendeesTab.table.approved')}
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                            <Clock size={9} /> {t('wizard.step3.attendeesTab.table.pending')}
                          </span>
                        )}
                        {attendee.checked_in && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
                            <ScanLine size={9} /> {t('wizard.step3.attendeesTab.table.checkedIn')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── BADGES & CHECK-IN ─── */}
      {!isAdding && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
              {t('wizard.step3.attendeesTab.badges.title')}
            </h3>
            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', flex: 1 }} />
          </div>

          <div
            onClick={() => setIsDesigningBadges(true)}
            style={{
              padding: '20px 24px',
              backgroundColor: '#0D243B',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,132,245,0.3)'; e.currentTarget.style.backgroundColor = '#0E2844'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.backgroundColor = '#0D243B'; }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: 'rgba(6,132,245,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s'
            }}>
              <BadgeCheck size={24} style={{ color: '#0684F5' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                {t('wizard.step3.attendeesTab.badges.designTitle')}
              </h4>
              <p style={{ fontSize: '13px', color: '#64748B' }}>
                {t('wizard.step3.attendeesTab.badges.designDesc')}
              </p>
            </div>
            <div className="hidden sm:flex" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0684F5', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>
              <CreditCard size={16} />
              {t('wizard.step3.attendeesTab.badges.openEditor')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
