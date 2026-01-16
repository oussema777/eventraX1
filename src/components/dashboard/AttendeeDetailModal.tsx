import { useEffect, useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  CreditCard, 
  MapPin, 
  Linkedin, 
  FileText, 
  Info,
  Check,
  Star,
  Layers
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { supabase } from '../../lib/supabase';

interface AttendeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: any;
  onStatusChange: (status: 'approved' | 'declined') => void;
  onCheckInToggle: () => void;
  onVipToggle?: () => void;
}

export default function AttendeeDetailModal({
  isOpen,
  onClose,
  attendee,
  onStatusChange,
  onCheckInToggle,
  onVipToggle
}: AttendeeDetailModalProps) {
  const { t } = useI18n();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    if (isOpen && attendee?.id) {
      fetchAttendeeSessions();
    }
  }, [isOpen, attendee?.id]);

  const fetchAttendeeSessions = async () => {
    try {
      setLoadingSessions(true);
      console.log('Fetching sessions for attendee:', attendee.id);
      
      const { data, error } = await supabase
        .from('event_attendee_sessions')
        .select(`
          session_id,
          event_sessions (
            id,
            title,
            starts_at,
            ends_at,
            location
          )
        `)
        .eq('attendee_id', attendee.id);

      if (error) {
          console.error('Supabase session fetch error:', error);
          throw error;
      }
      
      console.log('Raw session data:', data);
      
      const mapped = data?.map(d => d.event_sessions).filter(Boolean) || [];
      console.log('Mapped sessions:', mapped);
      
      setSessions(mapped);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  if (!isOpen || !attendee) return null;

  const getStatusBadge = (status: string) => {
    const configs = {
      approved: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', color: '#10B981', icon: CheckCircle, label: t('manageEvent.attendees.filters.approved') },
      pending: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#F59E0B', icon: Clock, label: t('manageEvent.attendees.filters.pending') },
      declined: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#EF4444', icon: XCircle, label: t('manageEvent.attendees.filters.declined') }
    };
    const key = (status || 'pending').toLowerCase() as keyof typeof configs;
    return configs[key] || configs.pending;
  };

  const statusConfig = getStatusBadge(attendee.status);

  const renderField = (icon: any, label: string, value: any) => {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) return null;
    const Icon = icon;
    return (
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-0.5 w-5 h-5 flex items-center justify-center">
            <Icon size={18} style={{ color: '#0684F5' }} />
        </div>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
          <p style={{ fontSize: '14px', color: '#FFFFFF', lineHeight: '1.5' }}>{String(value)}</p>
        </div>
      </div>
    );
  };

  const formatTime = (iso: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(11, 38, 65, 0.85)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[900px] rounded-2xl border flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: '#0D3052',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 py-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center gap-6">
             <div className="relative">
                <img
                  src={attendee.photo || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'}
                  alt={attendee.name}
                  className="rounded-full object-cover"
                  style={{
                    width: '90px',
                    height: '90px',
                    border: '3px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  }}
                />
                {attendee.isVIP && (
                    <div 
                        className="absolute -top-1 -right-1 rounded-full flex items-center justify-center border-2 border-[#0D3052]"
                        style={{ width: '30px', height: '30px', backgroundColor: '#F59E0B' }}
                    >
                        <Star size={18} fill="white" color="white" />
                    </div>
                )}
             </div>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {attendee.name}
              </h2>
              <div className="flex items-center gap-3">
                 <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: statusConfig.bg,
                      border: `1px solid ${statusConfig.border}`,
                      color: statusConfig.color,
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                  >
                    <statusConfig.icon size={14} />
                    {statusConfig.label}
                  </span>
                  {attendee.checkedIn && (
                    <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: 'rgba(6, 132, 245, 0.15)',
                          border: '1px solid rgba(6, 132, 245, 0.3)',
                          color: '#0684F5',
                          fontSize: '13px',
                          fontWeight: 700
                        }}
                      >
                        <Check size={14} />
                        {t('manageEvent.attendees.table.rows.checkedIn')}
                      </span>
                  )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: '#94A3B8' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-12 gap-10">
                {/* Left Side: Core Identity (4 cols) */}
                <div className="col-span-4 space-y-8">
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6" style={{ color: '#0684F5' }}>
                            Core Profile
                        </h3>
                        <div className="space-y-4">
                            {renderField(Mail, "Email Address", attendee.email)}
                            {renderField(Phone, "Phone Number", attendee.phone)}
                            {renderField(User, "Job Title", attendee.jobTitle)}
                            {renderField(MapPin, "Organization", attendee.company)}
                            {renderField(Linkedin, "LinkedIn", attendee.linkedin)}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6" style={{ color: '#0684F5' }}>
                            Registration Context
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="mt-0.5 w-5 h-5 flex items-center justify-center">
                                    <CreditCard size={18} style={{ color: '#0684F5' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket Information</p>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: attendee.ticketColor }} />
                                        <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{attendee.ticketType}</span>
                                    </div>
                                </div>
                            </div>
                            {renderField(Calendar, "Registered On", `${attendee.regDate} at ${attendee.regTime}`)}
                            {renderField(Info, "Confirmation", attendee.confirmationCode)}
                        </div>
                    </section>
                </div>

                {/* Right Side: Custom Answers & Agenda (8 cols) */}
                <div className="col-span-8 space-y-10">
                     <section>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2" style={{ color: '#0684F5' }}>
                            <FileText size={14} />
                            Custom Registration Data
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            {/* Process Metadata from custom form */}
                            {(() => {
                                const validMeta = attendee.meta ? Object.entries(attendee.meta).filter(([key, value]) => {
                                    const skipKeys = [
                                        'name', 'email', 'company', 'phone', 'ticketType', 'ticketColor', 'price', 
                                        'country', 'dietaryRequirements', 'dietary', 'specialAssistance', 'accessibility',
                                        'jobTitle', 'linkedin', 'notes', 'interests', 'sessions', 'isNew', 'confirmationCode', 
                                        'job_title', 'photo', 'photo_url', 'fullName', 'Full Name', 'Email Address'
                                    ];
                                    return !skipKeys.includes(key) && typeof value !== 'object' && !key.startsWith('_');
                                }) : [];

                                if (validMeta.length === 0) {
                                    return (
                                        <div className="col-span-2 p-6 rounded-xl border border-dashed text-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                            <p style={{ color: '#94A3B8', fontSize: '13px' }}>No additional custom data provided during registration.</p>
                                        </div>
                                    );
                                }

                                return validMeta.map(([key, value]) => (
                                    <div key={key} className="p-4 rounded-xl border mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>{key}</p>
                                        <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 500 }}>{String(value)}</p>
                                    </div>
                                ));
                            })()}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2" style={{ color: '#0684F5' }}>
                            <Layers size={14} />
                            Attendee Agenda Selection
                        </h3>

                        {loadingSessions ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock size={16} className="animate-spin" /> Loading agenda...
                            </div>
                        ) : sessions.length > 0 ? (
                            <div className="space-y-3">
                                {sessions.map((session) => (
                                    <div 
                                        key={session.id} 
                                        className="p-4 rounded-xl border flex items-center justify-between"
                                        style={{ backgroundColor: 'rgba(6, 132, 245, 0.05)', borderColor: 'rgba(6, 132, 245, 0.2)' }}
                                    >
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{session.title}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                    <Clock size={12} /> {formatTime(session.starts_at)} - {formatTime(session.ends_at)}
                                                </span>
                                                {session.location && (
                                                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                        <MapPin size={12} /> {session.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <CheckCircle size={20} className="text-[#10B981]" />
                                    </div>
                                ))}
                            </div>
                        ) : attendee.meta?.agenda_preview ? (
                            <div className="p-6 rounded-xl border border-dashed" style={{ borderColor: 'rgba(6, 132, 245, 0.3)', backgroundColor: 'rgba(6, 132, 245, 0.02)' }}>
                                <p style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Preview from Registration:</p>
                                <p style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.6' }}>{attendee.meta.agenda_preview}</p>
                                <p className="mt-4 text-[10px] text-gray-500 italic">Note: Live schedule details are currently syncing.</p>
                            </div>
                        ) : (
                            <div className="p-6 rounded-xl border border-dashed text-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <p style={{ color: '#94A3B8', fontSize: '13px' }}>Attendee has not selected any sessions for their personalized agenda.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
             <div className="flex gap-3">
                {onVipToggle && (
                    <button
                        onClick={onVipToggle}
                        className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white text-sm font-bold transition-all flex items-center gap-2"
                    >
                        <Star size={16} fill={attendee.isVIP ? "white" : "none"} className={attendee.isVIP ? "text-yellow-500" : "text-gray-400"} />
                        {attendee.isVIP ? "Remove VIP" : "Mark as VIP"}
                    </button>
                )}
             </div>

             <div className="flex items-center gap-3">
                <button
                    onClick={onCheckInToggle}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                        attendee.checkedIn 
                        ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' 
                        : 'bg-[#0684F5] text-white hover:bg-[#0573D6]'
                    }`}
                >
                    {attendee.checkedIn ? <CheckCircle size={18} /> : <Check size={18} />}
                    {attendee.checkedIn ? "Checked In" : "Check In Attendee"}
                </button>

                {attendee.status === 'pending' && (
                    <>
                        <button
                            onClick={() => onStatusChange('declined')}
                            className="px-5 py-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-bold transition-all border border-red-500/20"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => onStatusChange('approved')}
                            className="px-5 py-2.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
                        >
                            Approve Registration
                        </button>
                    </>
                )}
             </div>
        </div>
      </div>
    </div>
  );
}

