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
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';
import BadgeEditorSimple from './BadgeEditorSimple';

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
  const [importing, setImporting] = useState(false);
  
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAttendees();
    fetchEventMetadata();
  }, [eventId]);

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

      toast.success('Attendee added successfully');
      setIsAdding(false);
      setFormData({});
      setSelectedSessions(new Set());
      fetchAttendees();
    } catch (error) {
      console.error('Error adding attendee:', error);
      toast.error('Failed to add attendee');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').slice(1);
        const toInsert = rows.map(row => {
          const cols = row.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
          const [name, email, ticketType] = cols;
          if (!name || !email) return null;
          return {
            event_id: eventId,
            name,
            email,
            ticket_type: ticketType || 'General Admission',
            status: 'approved',
            confirmation_code: generateConfirmationCode()
          };
        }).filter(Boolean);

        if (toInsert.length > 0) {
          const { error } = await supabase.from('event_attendees').insert(toInsert);
          if (error) throw error;
          toast.success(`Imported ${toInsert.length} attendees`);
          fetchAttendees();
        } else {
          toast.warning('No valid rows found in CSV');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import attendees');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    if (attendees.length === 0) {
      toast.info('No attendees to export');
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
    toast.success('Export started');
  };

  const filteredAttendees = attendees.filter(a => 
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isDesigningBadges) {
    return <BadgeEditorSimple eventId={eventId} onBack={() => setIsDesigningBadges(false)} />;
  }

  return (
    <div className="attendees-tab space-y-8">
      
      {/* HEADER SECTION */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              Attendee Management
            </h2>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              Manage your guest list, registrations, and check-ins
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0684F5] transition-colors" />
                <input
                  type="text"
                  placeholder="Search attendees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    height: '42px',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    minWidth: '260px',
                    outline: 'none'
                  }}
                  className="focus:border-[#0684F5] transition-colors"
                />
             </div>
          </div>
        </div>

        {/* ACTIONS ROW (Add, Import, Export) */}
        {!isAdding && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              className="p-6 rounded-xl border border-dashed border-emerald-500/20 flex flex-col items-center justify-center text-center hover:bg-emerald-500/5 hover:border-emerald-500/50 transition-all cursor-pointer group"
              onClick={() => setIsAdding(true)}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-emerald-500/20">
                <Plus size={24} className="text-emerald-500" />
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-emerald-500 transition-colors">Add Manually</h3>
              <p className="text-sm text-gray-400">Register new attendee with form</p>
            </div>

            <div 
              className="p-6 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-center hover:bg-white/5 hover:border-[#0684F5]/50 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv" 
                onChange={handleFileUpload} 
              />
              <div className="w-12 h-12 rounded-full bg-[#0684F5]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-[#0684F5]/20">
                {importing ? <Clock size={24} className="text-[#0684F5] animate-spin" /> : <Upload size={24} className="text-[#0684F5]" />}
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-[#0684F5] transition-colors">Import CSV</h3>
              <p className="text-sm text-gray-400">Bulk upload list</p>
            </div>

            <div 
              className="p-6 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-center hover:bg-white/5 hover:border-purple-500/50 transition-all cursor-pointer group"
              onClick={handleExport}
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-purple-500/20">
                <Download size={24} className="text-purple-500" />
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-purple-500 transition-colors">Export List</h3>
              <p className="text-sm text-gray-400">Download CSV</p>
            </div>
          </div>
        )}

        {/* INLINE ADD FORM */}
        {isAdding && (
          <div className="mb-8 bg-[#0D243B] border border-white/10 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0B2236]">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="text-lg font-bold text-white">Add New Attendee</h3>
                  <p className="text-xs text-gray-400">Fill in details manually</p>
                </div>
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
                       <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Status</label>
                       <div className="relative group">
                          <CheckCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0684F5] transition-colors" />
                          <select 
                            className="w-full bg-[#162C46] border border-white/10 rounded-xl pl-11 pr-10 py-3 text-white text-sm focus:outline-none focus:border-[#0684F5] transition-colors appearance-none cursor-pointer"
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
                 <div className="space-y-5">
                    {formFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                         <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                           {field.label} {field.required && <span className="text-emerald-500">*</span>}
                         </label>
                         
                         {field.type === 'textarea' ? (
                           <div className="relative group">
                             <textarea
                               className="w-full bg-[#162C46] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#0684F5] transition-colors resize-none placeholder-gray-600 min-h-[100px]"
                               placeholder={`Enter ${field.label.toLowerCase()}...`}
                               value={formData[field.label] || ''}
                               onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                             />
                           </div>
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
                      className="flex items-center justify-between w-full p-4 rounded-xl bg-[#162C46] border border-white/5 hover:border-white/10 transition-colors group"
                    >
                       <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#0684F5]/10 text-[#0684F5] group-hover:bg-[#0684F5]/20 transition-colors">
                             <Calendar size={18} />
                          </div>
                          <div className="text-left">
                             <span className="block text-sm font-bold text-white">Assign Sessions</span>
                             <span className="block text-xs text-gray-400">Optional: Pre-register attendee for specific agenda items</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          {selectedSessions.size > 0 && (
                             <span className="text-[10px] bg-[#0684F5] text-white px-2.5 py-1 rounded-full font-bold">
                                {selectedSessions.size} Selected
                             </span>
                          )}
                          {showSessions ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                       </div>
                    </button>

                    {showSessions && (
                       <div className="mt-2 space-y-2 border border-white/10 rounded-xl p-3 max-h-[300px] overflow-y-auto bg-[#0B2236]">
                          {sessions.length === 0 ? (
                             <p className="text-center text-xs text-gray-500 py-6">No sessions available.</p>
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
                                       ? 'bg-[#0684F5]/10 border-[#0684F5]' 
                                       : 'bg-transparent border-transparent hover:bg-white/5'
                                   }`}
                                 >
                                   <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${ 
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

        {/* ATTENDEE TABLE */}
        <div 
          className="rounded-xl border overflow-hidden backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading attendees...</div>
          ) : attendees.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No attendees yet</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Your attendee list is empty. As soon as people register for your event, they will appear here automatically.
              </p>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-6 py-2.5 bg-[#10B981] text-white rounded-lg font-bold hover:bg-[#0da06f] transition-all shadow-lg shadow-[#10B981]/20"
                >
                  Add First Attendee
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ticket</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Checked In</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {attendee.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-1">
                            <div className="text-sm font-medium text-white">{attendee.name}</div>
                            <div className="text-sm text-gray-400">{attendee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 text-gray-300 border border-white/5">
                          {attendee.ticket_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         {attendee.status === 'approved' ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                             <CheckCircle size={12} /> Approved
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                             <Clock size={12} /> Pending
                           </span>
                         )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendee.checked_in ? (
                          <span className="text-emerald-500 text-sm flex items-center gap-1.5 font-medium">
                            <CheckCircle size={14} /> Yes
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: BADGES & CHECK-IN */}
      {!isAdding && (
        <section className="mt-12">
          <div className="mb-4 flex items-end gap-2">
             <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
               Badges & Check-in
             </h3>
             <div className="h-px bg-white/10 flex-1 mb-2"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div 
               className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 hover:to-white/5 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
               onClick={() => setIsDesigningBadges(true)}
             >
                <div className="relative z-10 flex items-start justify-between">
                   <div>
                      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#0684F5] transition-colors">Design Badges</h4>
                      <p className="text-sm text-gray-400 mb-4 max-w-[80%]">Customize the layout, colors, and logos for your event badges.</p>
                      <span className="text-[#0684F5] font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                         <CreditCard size={16} /> Open Editor
                      </span>
                   </div>
                   <div className="p-3 bg-white/5 rounded-lg group-hover:bg-[#0684F5]/20 transition-colors">
                      <BadgeCheck size={24} className="text-white group-hover:text-[#0684F5]" />
                   </div>
                </div>
             </div>
          </div>
        </section>
      )}
    </div>
  );
}
