import { useState, useEffect, useRef } from 'react';
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
  ScanLine
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
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
        .order('created_at', { ascending: false });

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

  const filteredAttendees = attendees.filter(a => 
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isDesigningBadges) {
    return <BadgeEditorSimple eventId={eventId} onBack={() => setIsDesigningBadges(false)} />;
  }

  const approvedCount = attendees.filter(a => a.status === 'approved').length;
  const pendingCount = attendees.filter(a => a.status === 'pending').length;
  const checkedInCount = attendees.filter(a => a.checked_in).length;

  return (
    <div className="attendees-tab space-y-6">

      {/* ─── HEADER ─── */}
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t('wizard.step3.attendeesTab.title')}</h2>
            <p className="text-sm text-gray-400 mt-1">{t('wizard.step3.attendeesTab.subtitle')}</p>
          </div>
          {!isAdding && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDownloadTemplate}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 transition-all"
                title={t('wizard.step3.attendeesTab.csvTemplate')}
              >
                <Download size={16} />
              </button>
              <button
                onClick={handleExport}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 transition-all"
                title={t('wizard.step3.attendeesTab.actions.exportList')}
              >
                <Upload size={16} />
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-semibold border border-white/10 transition-all"
              >
                <Upload size={14} />
                <span className="hidden sm:inline">{t('wizard.step3.attendeesTab.actions.importCsv')}</span>
              </button>
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">{t('wizard.step3.attendeesTab.actions.addManually')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── STAT CARDS ─── */}
      {!isAdding && attendees.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><Users size={18} className="text-blue-400" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{attendees.length}</p>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.name')}s</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><UserCheck size={18} className="text-emerald-400" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{approvedCount}</p>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.approved')}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><Clock size={18} className="text-amber-400" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{pendingCount}</p>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.pending')}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><ScanLine size={18} className="text-purple-400" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{checkedInCount}</p>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.checkedIn')}</p>
              </div>
            </div>
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
        <div className="bg-[#0D243B] border border-white/10 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl ring-1 ring-white/5">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-white/10 flex items-center gap-3 bg-[#0B2236]">
            <button
              onClick={() => setIsAdding(false)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/5 hover:border-white/20 shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white truncate">{t('wizard.step3.attendeesTab.addForm.title')}</h3>
              <p className="text-xs text-gray-400 hidden sm:block">{t('wizard.step3.attendeesTab.addForm.subtitle')}</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
               {/* Ticket & Status */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">{t('wizard.step3.attendeesTab.addForm.ticketType')}</label>
                     <div className="relative group">
                        <Ticket size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0684F5] transition-colors" />
                        <select
                          className="w-full bg-[#162C46] border border-white/10 rounded-xl pl-12 pr-10 py-3.5 text-white text-sm focus:outline-none focus:border-[#0684F5] focus:ring-1 focus:ring-[#0684F5] transition-all appearance-none cursor-pointer hover:border-white/20"
                          value={selectedTicketId}
                          onChange={(e) => setSelectedTicketId(e.target.value)}
                        >
                           {tickets.map(t => (
                             <option key={t.id} value={t.id}>{t.name} • ${t.price}</option>
                           ))}
                           {tickets.length === 0 && <option value="">{t('wizard.step3.attendeesTab.addForm.generalAdmission')}</option>}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">{t('wizard.step3.attendeesTab.addForm.status')}</label>
                     <div className="relative group">
                        <CheckCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0684F5] transition-colors" />
                        <select
                          className="w-full bg-[#162C46] border border-white/10 rounded-xl pl-11 pr-10 py-3.5 text-white text-sm focus:outline-none focus:border-[#0684F5] focus:ring-1 focus:ring-[#0684F5] transition-all appearance-none cursor-pointer hover:border-white/20"
                          value={registrationStatus}
                          onChange={(e) => setRegistrationStatus(e.target.value)}
                        >
                           <option value="approved">{t('wizard.step3.attendeesTab.addForm.statusApproved')}</option>
                           <option value="pending">{t('wizard.step3.attendeesTab.addForm.statusPending')}</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                     </div>
                  </div>
               </div>

               <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

               {/* Form Fields */}
               <div className="space-y-4">
                  {formFields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                       <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                         {field.label} {field.required && <span className="text-emerald-500">*</span>}
                       </label>

                       {field.type === 'textarea' ? (
                         <textarea
                           className="w-full bg-[#162C46] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#0684F5] focus:ring-1 focus:ring-[#0684F5] transition-all resize-none placeholder-gray-600 min-h-[100px] hover:border-white/20"
                           placeholder={t('wizard.step3.attendeesTab.addForm.enterField', { field: field.label.toLowerCase() })}
                           value={formData[field.label] || ''}
                           onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                         />
                       ) : field.type === 'dropdown' ? (
                         <div className="relative">
                            <select
                              className="w-full bg-[#162C46] border border-white/10 rounded-xl pl-4 pr-10 py-3.5 text-white text-sm focus:outline-none focus:border-[#0684F5] focus:ring-1 focus:ring-[#0684F5] transition-all appearance-none cursor-pointer hover:border-white/20"
                              value={formData[field.label] || ''}
                              onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                            >
                              <option value="">{t('wizard.step3.attendeesTab.addForm.selectOption')}</option>
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
                              className="w-full bg-[#162C46] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#0684F5] focus:ring-1 focus:ring-[#0684F5] transition-all placeholder-gray-600 hover:border-white/20"
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

               {/* Collapsible Agenda Section */}
               <div>
                  <button
                    onClick={() => setShowSessions(!showSessions)}
                    className="flex items-center justify-between w-full p-3.5 rounded-xl bg-[#162C46] border border-white/5 hover:border-white/10 hover:bg-[#1c3756] transition-all group"
                  >
                     <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-[#0684F5]/10 text-[#0684F5] group-hover:bg-[#0684F5]/20 transition-colors shrink-0">
                           <Calendar size={16} />
                        </div>
                        <div className="text-left min-w-0">
                           <span className="block text-sm font-bold text-white group-hover:text-[#0684F5] transition-colors truncate">{t('wizard.step3.attendeesTab.addForm.assignSessions')}</span>
                           <span className="block text-xs text-gray-400 hidden sm:block">{t('wizard.step3.attendeesTab.addForm.assignSessionsDesc')}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 shrink-0 ml-2">
                        {selectedSessions.size > 0 && (
                           <span className="text-[10px] bg-[#0684F5] text-white px-2 py-0.5 rounded-full font-bold">
                              {selectedSessions.size}
                           </span>
                        )}
                        {showSessions ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                     </div>
                  </button>

                  {showSessions && (
                     <div className="mt-2 space-y-1.5 border border-white/10 rounded-xl p-2.5 max-h-[250px] overflow-y-auto bg-[#0B2236]">
                        {sessions.length === 0 ? (
                           <p className="text-center text-xs text-gray-500 py-6">{t('wizard.step3.attendeesTab.addForm.noSessions')}</p>
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
                                 className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                                   isSelected
                                     ? 'bg-[#0684F5]/10 border-[#0684F5]/40'
                                     : 'bg-transparent border-transparent hover:bg-white/5'
                                 }`}
                               >
                                 <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                                    isSelected ? 'bg-[#0684F5] border-[#0684F5]' : 'border-gray-600'
                                 }`}>
                                    {isSelected && <Check size={12} className="text-white" />}
                                 </div>
                                 <div className="min-w-0">
                                   <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                      {session.title}
                                   </p>
                                   <p className="text-xs text-gray-500 mt-0.5">
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
          <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-white/10 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#0B2236]">
            <button
              onClick={() => setIsAdding(false)}
              className="px-5 py-2.5 rounded-xl text-gray-300 font-medium hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all active:scale-[0.98] text-center text-sm"
            >
              {t('wizard.step3.attendeesTab.addForm.discardChanges')}
            </button>
            <button
              onClick={handleAddAttendee}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/20 text-sm"
            >
              <Save size={16} />
              {t('wizard.step3.attendeesTab.addForm.saveRegistration')}
            </button>
          </div>
        </div>
      )}

      {/* ─── ATTENDEE LIST ─── */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
        {/* Search Bar inside the list */}
        {!loading && attendees.length > 0 && (
          <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder={t('wizard.step3.attendeesTab.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-[#0684F5] transition-colors placeholder-gray-500"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-xs text-gray-500 mt-2 px-1">
                {filteredAttendees.length} / {attendees.length}
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-[#0684F5] rounded-full animate-spin mb-3" />
            <p className="text-gray-400 text-sm">{t('wizard.step3.attendeesTab.loading')}</p>
          </div>
        ) : attendees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 sm:p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5 ring-1 ring-white/10">
              <Users size={28} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('wizard.step3.attendeesTab.empty.title')}</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
              {t('wizard.step3.attendeesTab.empty.subtitle')}
            </p>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                {t('wizard.step3.attendeesTab.actions.addFirstAttendee')}
              </button>
            )}
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="p-10 text-center">
            <Search size={24} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No attendees match "{searchTerm}"</p>
          </div>
        ) : (
          <>
            {/* ─── Desktop Table ─── */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.name')}</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.ticket')}</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.status')}</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.checkedIn')}</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                            {attendee.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{attendee.name}</p>
                            <p className="text-xs text-gray-500 truncate">{attendee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-white/10 text-gray-300 border border-white/5">
                          {attendee.ticket_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                         {attendee.status === 'approved' ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                             <CheckCircle size={11} /> {t('wizard.step3.attendeesTab.table.approved')}
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                             <Clock size={11} /> {t('wizard.step3.attendeesTab.table.pending')}
                           </span>
                         )}
                      </td>
                      <td className="px-5 py-3.5">
                        {attendee.checked_in ? (
                          <span className="text-emerald-400 text-xs flex items-center gap-1.5 font-medium">
                            <CheckCircle size={13} /> {t('wizard.step3.attendeesTab.table.yes')}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">{t('wizard.step3.attendeesTab.table.no')}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="text-gray-500 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─── Tablet View (md only) ─── */}
            <div className="hidden md:block lg:hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.name')}</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.status')}</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('wizard.step3.attendeesTab.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                            {attendee.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{attendee.name}</p>
                            <p className="text-xs text-gray-500 truncate">{attendee.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded bg-white/10 text-gray-400 border border-white/5">
                              {attendee.ticket_type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          {attendee.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle size={10} /> {t('wizard.step3.attendeesTab.table.approved')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock size={10} /> {t('wizard.step3.attendeesTab.table.pending')}
                            </span>
                          )}
                          {attendee.checked_in && (
                            <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-medium w-fit">
                              <ScanLine size={10} /> {t('wizard.step3.attendeesTab.table.checkedIn')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-gray-500 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─── Mobile Card List ─── */}
            <div className="md:hidden divide-y divide-white/[0.06]">
              {filteredAttendees.map((attendee) => (
                <div key={attendee.id} className="p-4 hover:bg-white/[0.02] transition-colors active:bg-white/[0.04]">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                      {attendee.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{attendee.name}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{attendee.email}</p>
                        </div>
                        <button className="text-gray-500 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg shrink-0 -mt-0.5">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-white/10 text-gray-400 border border-white/5">
                          {attendee.ticket_type}
                        </span>
                        {attendee.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle size={9} /> {t('wizard.step3.attendeesTab.table.approved')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock size={9} /> {t('wizard.step3.attendeesTab.table.pending')}
                          </span>
                        )}
                        {attendee.checked_in && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
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
        <div>
          <div className="mb-4 flex items-center gap-3">
             <h3 className="text-lg font-semibold text-white whitespace-nowrap">{t('wizard.step3.attendeesTab.badges.title')}</h3>
             <div className="h-px bg-white/10 flex-1" />
          </div>

          <div
            className="p-5 sm:p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent hover:from-white/[0.07] transition-all cursor-pointer group"
            onClick={() => setIsDesigningBadges(true)}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#0684F5]/10 group-hover:bg-[#0684F5]/20 transition-colors shrink-0">
                <BadgeCheck size={22} className="text-[#0684F5]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-white group-hover:text-[#0684F5] transition-colors">{t('wizard.step3.attendeesTab.badges.designTitle')}</h4>
                <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{t('wizard.step3.attendeesTab.badges.designDesc')}</p>
              </div>
              <span className="text-[#0684F5] font-medium text-sm items-center gap-2 hidden sm:flex shrink-0">
                <CreditCard size={16} /> {t('wizard.step3.attendeesTab.badges.openEditor')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
