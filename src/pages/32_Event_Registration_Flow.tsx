import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  HelpCircle,
  Loader2,
  Lock,
  ChevronDown,
  Download
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { createNotification } from '../lib/notifications';
import { useAuth } from '../contexts/AuthContext';
import { sendEmail, generateRegistrationEmailHtml } from '../lib/email';
import { countries } from '../data/countries';

const toFlagEmoji = (code: string) => {
  if (!code) return '';
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

type RegistrationStep = 1 | 2 | 3;

interface Session {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  location?: string;
  speaker_name?: string;
  day?: number;
}

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  value: string;
  readonly?: boolean;
  isSystem?: boolean;
  isDropdownOpen?: boolean; // For country field dropdown
  phoneCountryCode?: string;
  phoneNumber?: string;
  isPhoneDropdownOpen?: boolean; // For phone field country code dropdown
}

export default function EventRegistrationFlow() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [event, setEvent] = useState<any>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [sessions, setSessions] = useState<Session[]>(new Array());
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [freeTicketId, setFreeTicketId] = useState<string | null>(null);
  const [registeredAttendeeId, setRegisteredAttendeeId] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateConfirmationCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'EV-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId, user, profile]);

  const handleDownloadTicket = async () => {
    if (!registeredAttendeeId) return;
    window.print();
  };

  const fetchEventData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch Event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // 2. Fetch Sessions
      const { data: sessionData } = await supabase
        .from('event_sessions')
        .select('*')
        .eq('event_id', eventId)
        .order('starts_at', { ascending: true });
      
      if (sessionData) {
        setSessions(sessionData);
      }

      // 3. Fetch Free Ticket (Internal Logic)
      const { data: ticketData } = await supabase
        .from('event_tickets')
        .select('id')
        .eq('event_id', eventId)
        .eq('status', 'active')
        .limit(1);
      
      if (ticketData && ticketData.length > 0) {
        setFreeTicketId(ticketData[0].id);
      }

      // 4. Fetch Form Schema
      const { data: formsData } = await supabase
        .from('event_forms')
        .select('*')
        .eq('event_id', eventId);

      let formData = null;

      if (formsData && formsData.length > 0) {
        // Sort by most recently updated first
        formsData.sort((a: any, b: any) => 
          new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
        );

        // Priority 1: Active 'registration' form
        formData = formsData.find((f: any) => f.form_type === 'registration' && f.status === 'active');

        // Priority 2: Active default form
        if (!formData) {
          formData = formsData.find((f: any) => f.is_default && f.status === 'active');
        }

        // Priority 3: ANY active form (e.g. user made a custom form and activated it)
        if (!formData) {
          formData = formsData.find((f: any) => f.status === 'active');
        }

        // Priority 4: Fallback to the most recent form (even if draft) - helps during testing
        if (!formData) {
          formData = formsData[0];
        }
      }

      const defaultFields: FormField[] = [
        { 
          id: 'fullName', 
          label: 'Full Name', 
          type: 'text', 
          required: true, 
          value: profile?.full_name || '',
          readonly: !!profile?.full_name
        },
        { 
          id: 'email', 
          label: 'Email Address', 
          type: 'email', 
          required: true, 
          value: user?.email || '',
          readonly: !!user?.email
        }
      ];

      if (formData?.schema?.fields && Array.isArray(formData.schema.fields) && formData.schema.fields.length > 0) {
        const mappedFields = formData.schema.fields.map((f: any) => {
          let defaultValue = '';
          let isReadonly = false;

          // Check if this is a system field (Name/Email)
          const isEmail = f.type === 'email' || f.id === 'default-email';
          const isName = (f.label && f.label.toLowerCase().includes('name')) || f.id === 'default-name';

          if (isEmail && user?.email) {
            defaultValue = user.email;
            isReadonly = true;
          } else if (isName && profile?.full_name) {
            defaultValue = profile.full_name;
            isReadonly = true;
          } else if (profile) {
            // Auto-fill custom fields from profile if possible
            const labelLower = (f.label || '').toLowerCase();
            if (labelLower.includes('job') || labelLower.includes('title')) defaultValue = profile.job_title || '';
            else if (labelLower.includes('company') || labelLower.includes('organization')) defaultValue = profile.company || '';
            else if (labelLower.includes('phone')) defaultValue = profile.phone_number || '';
          }

          const isPhoneField = f.type === 'phone' || (f.label && f.label.toLowerCase().includes('phone'));
          let initialPhoneCountryCode = 'US'; // Default
          let initialPhoneNumber = '';

          if (isPhoneField && defaultValue) {
            const parts = defaultValue.split(' ');
            if (parts[0] && parts[0].startsWith('+')) {
              // Simple check for phone code
              initialPhoneCountryCode = countries.find(c => c.phoneCode === parts[0])?.code || 'US';
              initialPhoneNumber = parts.slice(1).join(' ');
            } else {
              initialPhoneNumber = defaultValue;
            }
          }
          
          return {
            id: f.id || `field_${Math.random().toString(36).substr(2, 9)}`,
            label: f.label || f.name || 'Untitled Field',
            type: f.type,
            required: f.required,
            options: f.options,
            value: isPhoneField ? '' : defaultValue, 
            readonly: isReadonly, // Allow editing unless strictly system-locked logic requires otherwise
            isSystem: f.isSystem,
            isDropdownOpen: false, 
            phoneCountryCode: isPhoneField ? initialPhoneCountryCode : undefined,
            phoneNumber: isPhoneField ? initialPhoneNumber : undefined,
            isPhoneDropdownOpen: false 
          };
        });

        // Ensure System Fields (Name & Email) are present in the final list
        const hasName = mappedFields.some((f: any) => 
          f.id === 'default-name' || 
          f.id === 'fullName' || 
          (f.label && (f.label.toLowerCase().includes('name') || f.label.toLowerCase().includes('nom')))
        );
        
        const hasEmail = mappedFields.some((f: any) => 
          f.id === 'default-email' || 
          f.id === 'email' || 
          f.type === 'email' ||
          (f.label && f.label.toLowerCase().includes('email'))
        );

        let finalFields = [...mappedFields];

        // If missing from schema, prepend the defaults
        if (!hasEmail) {
           finalFields = [{
             id: 'email',
             label: 'Email Address',
             type: 'email',
             required: true,
             value: user?.email || '',
             readonly: !!user?.email
           }, ...finalFields];
        }
        if (!hasName) {
           finalFields = [{
             id: 'fullName',
             label: 'Full Name',
             type: 'text',
             required: true,
             value: profile?.full_name || '',
             readonly: !!profile?.full_name
           }, ...finalFields];
        }
        
        setFormFields(finalFields);
      } else {
        setFormFields(defaultFields);
      }

    } catch (error) {
      console.error('Error fetching registration data:', error);
      toast.error('Failed to load event details.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (fieldId: string, value: string) => {
    setFormFields(formFields.map(field =>
      field.id === fieldId && !field.readonly ? { ...field, value } : field
    ));
  };

  const toggleCountryDropdown = (fieldId: string) => {
    setFormFields(formFields.map(field =>
      field.id === fieldId ? { ...field, isDropdownOpen: !field.isDropdownOpen } : field
    ));
  };

  const updatePhoneField = (fieldId: string, part: 'countryCode' | 'number', value: string) => {
    setFormFields(formFields.map(field => {
      if (field.id === fieldId && !field.readonly) {
        if (part === 'countryCode') {
          return { ...field, phoneCountryCode: value, isPhoneDropdownOpen: false };
        }
        if (part === 'number') {
          return { ...field, phoneNumber: value };
        }
      }
      return field;
    }));
  };

  const togglePhoneCountryDropdown = (fieldId: string) => {
    setFormFields(formFields.map(field =>
      field.id === fieldId ? { ...field, isPhoneDropdownOpen: !field.isPhoneDropdownOpen } : field
    ));
  };

  const toggleSession = (sessionId: string) => {
    setSelectedSessions(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  const handleCompleteRegistration = async () => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get form data
      const responses: Record<string, any> = {};
      formFields.forEach(f => {
        if (f.type === 'phone' && f.phoneCountryCode && f.phoneNumber) {
          responses[f.label] = `${f.phoneCountryCode} ${f.phoneNumber}`;
        } else {
          responses[f.label] = f.value;
        }
      });

      const email = user?.email || formFields.find(f => f.type === 'email')?.value;
      const name = profile?.full_name || formFields.find(f => f.label.toLowerCase().includes('name'))?.value;

      if (!email || !name) {
        toast.error('Name and Email are required');
        setIsSubmitting(false);
        return;
      }

      if (!freeTicketId) {
        console.warn('No ticket found, registration might be incomplete on analytics.');
      }

      const code = generateConfirmationCode();
      setConfirmationCode(code);
      responses['confirmation_code'] = code;

      // 1. Insert Attendee
      const attendeePayload = {
        event_id: eventId,
        profile_id: user?.id || null,
        ticket_type: 'General Admission', 
        ticket_color: '#0684F5',
        price: 0,
        status: 'registered',
        meta: responses, 
        email: email, 
        name: name
      };

      const { data: attendee, error: regError } = await supabase
        .from('event_attendees')
        .insert([attendeePayload])
        .select()
        .single();

      if (regError) {
        if (regError.code === '23505') {
          // Already registered - fetch existing record
          toast.success("You're already registered! Updating your agenda...");
          
          let query = supabase
            .from('event_attendees')
            .select()
            .eq('event_id', eventId);
            
          if (user) {
            query = query.eq('profile_id', user.id);
          } else {
            query = query.eq('email', email);
          }

          const { data: existing } = await query.single();
          
          if (existing) {
            setRegisteredAttendeeId(existing.id); // SAVE ID
            const existingCode = existing.meta?.confirmation_code || code;
            setConfirmationCode(existingCode);

            const sessionInserts = Array.from(selectedSessions).map(sessionId => ({
              attendee_id: existing.id,
              session_id: sessionId
            }));

            await supabase.from('event_attendee_sessions').delete().eq('attendee_id', existing.id);
            
            if (sessionInserts.length > 0) {
              await supabase.from('event_attendee_sessions').insert(sessionInserts);
            }

            const mySessions = sessions.filter(s => selectedSessions.has(s.id));
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${existing.id}`;
            const emailHtml = generateRegistrationEmailHtml(event?.name || 'Event', existing.name || email || 'Attendee', qrUrl, mySessions);
            
            await sendEmail({
              to: email || '',
              subject: `Registration Confirmed: ${event?.name}`,
              html: emailHtml
            });
            
            setCurrentStep(3);
            return;
          }
        }
        throw regError;
      }

      try {
        await supabase.rpc('increment_ticket_sold', { tid: freeTicketId, qty: 1 });
      } catch (err) {
        console.warn('Failed to update ticket count (RPC missing?):', err);
      }

      if (attendee) {
        setRegisteredAttendeeId(attendee.id); // SAVE ID
        const sessionInserts = Array.from(selectedSessions).map(sessionId => ({
          attendee_id: attendee.id,
          session_id: sessionId
        }));
        
        if (sessionInserts.length > 0) {
          await supabase.from('event_attendee_sessions').insert(sessionInserts);
        }

        const mySessions = sessions.filter(s => selectedSessions.has(s.id));
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${attendee.id}`;
        const emailHtml = generateRegistrationEmailHtml(event?.name || 'Event', attendee.name || email || 'Attendee', qrUrl, mySessions);
        
        await sendEmail({
          to: email || '',
          subject: `Registration Confirmed: ${event?.name}`,
          html: emailHtml
        });
      }

      try {
        if (event?.owner_id) {
          await createNotification({
            recipient_id: event.owner_id,
            actor_id: user?.id || null,
            title: 'New event registration',
            body: `${email || 'An attendee'} registered for ${event.name || 'your event'}.`,
            type: 'action',
            action_url: `/event/${eventId}`
          });
        }
      } catch (err) { console.error(err); }

      setCurrentStep(3);
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      handleCompleteRegistration();
    } else if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as RegistrationStep);
      window.scrollTo(0, 0);
    } else {
      navigate(`/event/${eventId}/landing`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as RegistrationStep);
      window.scrollTo(0, 0);
    } else {
      navigate(-1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formFields.filter(f => f.required).every(f => f.value.trim() !== '');
    }
    return true; // Step 2 is optional
  };

  const steps = [
    { number: 1, label: 'Details' },
    { number: 2, label: 'Sessions' },
    { number: 3, label: 'Done' }
  ];

  const formatTime = (iso: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B2641]">
        <Loader2 className="animate-spin text-[#0684F5]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0B2641', color: '#FFFFFF' }}>
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          .print-container, .print-container * {
            visibility: visible !important;
          }
          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            display: flex !important;
            justify-content: center !important;
          }
          .print-voucher {
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 380px !important;
            border: 1px solid #EEE !important;
            box-shadow: none !important;
          }
          .print-summary, .no-print {
            display: none !important;
          }
        }
      `}</style>
      {/* Header */}
      <header
        className="sticky top-0 z-50 no-print"
        style={{
          backgroundColor: 'rgba(11, 38, 65, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          height: '80px',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="h-full flex items-center justify-between px-10">
          <div style={{ width: '150px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Logo />
          </div>

          <div className="flex items-center gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className="flex items-center justify-center rounded-full transition-all"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: currentStep >= step.number ? '#0684F5' : 'rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      border: currentStep >= step.number ? 'none' : '2px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {currentStep > step.number ? <Check size={16} /> : step.number}
                  </div>
                  <span
                    className="mt-1.5"
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: currentStep >= step.number ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    style={{
                      width: '40px',
                      height: '2px',
                      backgroundColor: currentStep > step.number ? '#0684F5' : 'rgba(255, 255, 255, 0.1)',
                      margin: '0 12px',
                      marginBottom: '20px'
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ width: '150px', textAlign: 'right' }}>
            <button
              className="flex items-center gap-2 transition-colors ml-auto"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                fontWeight: 500,
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FFFFFF';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
            >
              <HelpCircle size={16} />
              Help
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-10 pb-10 px-6 flex-grow">
        <div
          className="mx-auto rounded-2xl p-10"
          style={{
            maxWidth: '800px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Step 1: User Details */}
          {currentStep === 1 && (
            <div>
              <div className="mb-8">
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'Guest'}
                </h1>
                <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Confirm your details to register for <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{event?.name}</span>
                </p>
              </div>

              <div className="space-y-6">
                {formFields.map((field) => (
                  <div key={field.id}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: '8px'
                      }}
                    >
                      {field.label}
                      {field.required && <span style={{ color: '#F87171' }}> *</span>}
                      {field.readonly && (
                        <span style={{ 
                          marginLeft: '8px', 
                          fontSize: '11px', 
                          color: 'rgba(255, 255, 255, 0.4)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          Locked
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      {(field.type === 'select' || field.type === 'dropdown') ? (
                        <select
                          value={field.value}
                          onChange={(e) => updateFormField(field.id, e.target.value)}
                          disabled={field.readonly}
                          className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                          style={{
                            fontSize: '15px',
                            backgroundColor: field.readonly ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                            color: field.readonly ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF',
                            cursor: field.readonly ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="" style={{ color: '#000' }}>Select an option</option>
                          {field.options?.map(opt => <option key={opt} value={opt} style={{ color: '#000' }}>{opt}</option>)}
                        </select>
                      ) : field.type === 'country' ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => toggleCountryDropdown(field.id)}
                            className="w-full flex items-center justify-between transition-all"
                            style={{
                              height: '48px',
                              padding: '12px 16px',
                              fontSize: '16px',
                              color: field.value ? '#FFFFFF' : '#9CA3AF',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1.5px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              outline: 'none',
                              textAlign: 'left'
                            }}
                          >
                            {field.fieldValue ? (
                              <span className="flex items-center gap-2">
                                <span style={{ fontSize: '20px' }}>
                                  {toFlagEmoji(field.fieldValue)}
                                </span>
                                {countries.find(c => c.code === field.fieldValue)?.name}
                              </span>
                            ) : (
                              "Select Country"
                            )}
                            <ChevronDown size={20} style={{ color: '#6B7280' }} />
                          </button>

                          {field.isDropdownOpen && (
                            <div
                              className="absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-10"
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                maxHeight: '200px',
                                overflowY: 'auto'
                              }}
                            >
                              {countries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => {
                                    updateFormField(field.id, country.code);
                                    toggleCountryDropdown(field.id);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                                  style={{
                                    border: 'none',
                                    backgroundColor: field.value === country.code ? '#F3F4F6' : 'transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                  }}
                                >
                                  <span style={{ fontSize: '20px' }}>{toFlagEmoji(country.code)}</span>
                                  <span style={{ fontSize: '14px', color: '#374151' }}>{country.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={field.value}
                          onChange={(e) => updateFormField(field.id, e.target.value)}
                          disabled={field.readonly}
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border outline-none transition-all resize-y"
                          style={{
                            fontSize: '15px',
                            backgroundColor: field.readonly ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                            color: field.readonly ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF',
                            cursor: field.readonly ? 'not-allowed' : 'text'
                          }}
                          onFocus={(e) => {
                            if (!field.readonly) {
                              e.target.style.borderColor = '#0684F5';
                              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                            }
                          }}
                          onBlur={(e) => {
                            if (!field.readonly) {
                              e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            }
                          }}
                        />
                      ) : field.type === 'radio' ? (
                        <div className="space-y-3 pt-2">
                          {field.options?.map((opt, i) => (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-2 rounded transition-colors">
                              <input
                                type="radio"
                                name={field.id}
                                value={opt}
                                checked={field.value === opt}
                                onChange={(e) => updateFormField(field.id, e.target.value)}
                                disabled={field.readonly}
                                className="w-5 h-5 cursor-pointer"
                                style={{
                                  accentColor: '#0684F5'
                                }}
                              />
                              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px' }}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (field.type === 'checkbox' || field.type === 'multichoice') ? (
                        <div className="space-y-3 pt-2">
                          {field.options?.map((opt, i) => {
                             const currentVals = field.value ? field.value.split(', ') : [];
                             const isChecked = currentVals.includes(opt);
                             return (
                              <label key={i} className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-2 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    let newVals = [...currentVals];
                                    if (e.target.checked) {
                                      if (!newVals.includes(opt)) newVals.push(opt);
                                    } else {
                                      newVals = newVals.filter(v => v !== opt);
                                    }
                                    updateFormField(field.id, newVals.filter(Boolean).join(', '));
                                  }}
                                  disabled={field.readonly}
                                  className="w-5 h-5 cursor-pointer"
                                  style={{
                                    accentColor: '#0684F5'
                                  }}
                                />
                                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px' }}>{opt}</span>
                              </label>
                             );
                          })}
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) => updateFormField(field.id, e.target.value)}
                          disabled={field.readonly}
                          className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                          style={{
                            fontSize: '15px',
                            backgroundColor: field.readonly ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                            color: field.readonly ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF',
                            cursor: field.readonly ? 'not-allowed' : 'text'
                          }}
                          onFocus={(e) => {
                            if (!field.readonly) {
                              e.target.style.borderColor = '#0684F5';
                              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                            }
                          }}
                          onBlur={(e) => {
                            if (!field.readonly) {
                              e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            }
                          }}
                        />
                      )}
                      {field.readonly && (
                        <Lock 
                          size={14} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Spacer for better visual flow before the bottom navigation bar */}
              <div className="h-12" />
            </div>
          )}

          {/* Step 2: Choose Sessions */}
          {currentStep === 2 && (
            <div>
              <div className="mb-8">
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  Customize Your Agenda
                </h1>
                <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Select the sessions you plan to attend (Optional)
                </p>
              </div>

              {sessions.length === 0 ? (
                <div 
                  className="text-center py-12 rounded-xl border border-dashed"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                >
                  <Calendar className="mx-auto h-10 w-10 mb-3" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No sessions available for selection yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => {
                    const isSelected = selectedSessions.has(session.id);
                    return (
                      <div
                        key={session.id}
                        className={`p-4 rounded-xl border transition-all cursor-pointer`}
                        style={{
                          backgroundColor: isSelected ? 'rgba(6, 132, 245, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          borderColor: isSelected ? '#0684F5' : 'rgba(255, 255, 255, 0.1)',
                          borderWidth: '1px'
                        }}
                        onClick={() => toggleSession(session.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div 
                            className="mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: isSelected ? '#0684F5' : 'transparent',
                              borderColor: isSelected ? '#0684F5' : 'rgba(255, 255, 255, 0.3)'
                            }}
                          >
                            {isSelected && <Check size={14} style={{ color: '#FFFFFF' }} />}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>{session.title}</h3>
                              <span 
                                className="text-xs font-semibold px-2 py-1 rounded"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.8)' }}
                              >
                                {formatTime(session.starts_at)} - {formatTime(session.ends_at)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm mt-2">
                              {session.speaker_name && (
                                <div className="flex items-center gap-1.5" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                  <div 
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                                  >
                                    {session.speaker_name[0]}
                                  </div>
                                  <span style={{ fontWeight: 500 }}>{session.speaker_name}</span>
                                </div>
                              )}
                              {session.location && (
                                <div className="flex items-center gap-1.5" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                  <MapPin size={14} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                                  <span style={{ fontWeight: 500 }}>{session.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="text-center py-12">
              <div 
                className="mx-auto mb-6 rounded-full w-20 h-20 flex items-center justify-center no-print"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <Check size={40} style={{ color: '#10B981' }} />
              </div>

              <h1 className="text-3xl font-bold mb-4 no-print" style={{ color: '#FFFFFF' }}>
                You're All Set!
              </h1>

              <p className="mb-8 max-w-md mx-auto no-print" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
                Thank you for registering for <strong style={{ color: '#FFFFFF' }}>{event?.name}</strong>. 
                A confirmation email has been sent to <strong style={{ color: '#FFFFFF' }}>{user?.email}</strong>.
              </p>

              {/* Action Buttons - Moved Above */}
              <div className="flex flex-col gap-3 max-w-xs mx-auto mb-12 no-print">
                <button
                  onClick={handleDownloadTicket}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    backgroundColor: '#0684F5',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(6, 132, 245, 0.25)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0571D0';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0684F5';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Download size={18} />
                  Download Ticket Voucher
                </button>

                <button
                  onClick={() => navigate(`/event/${eventId}/landing`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  Back to Event Page
                </button>
              </div>

              {/* Printable Content Wrapper */}
              <div className="print-container">
                {/* Voucher Display */}
                {registeredAttendeeId && (
                  <div 
                    className="mb-8 max-w-sm mx-auto overflow-hidden rounded-2xl shadow-2xl print-voucher"
                    style={{ backgroundColor: '#FFFFFF', color: '#0B2641' }}
                  >
                    {/* Voucher Header */}
                    <div className="p-6 text-left border-b border-dashed border-gray-200" style={{ backgroundColor: '#0B2641', color: '#FFFFFF' }}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">Official Entry Ticket</p>
                          <h2 className="text-xl font-black leading-tight">{event?.name}</h2>
                        </div>
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                          <Calendar size={20} className="text-blue-400" />
                        </div>
                      </div>
                      <div className="flex gap-4 text-[11px] font-medium opacity-80">
                        <div>
                          <p className="uppercase opacity-60 mb-0.5">Date</p>
                          <p>{event?.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD'}</p>
                        </div>
                        <div>
                          <p className="uppercase opacity-60 mb-0.5">Time</p>
                          <p>{event?.start_date ? new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Voucher Main */}
                    <div className="p-8 flex flex-col items-center">
                      <div className="p-3 bg-gray-50 rounded-xl mb-6">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${registeredAttendeeId}`}
                          alt="Check-in QR Code"
                          style={{ width: '160px', height: '160px', display: 'block' }}
                        />
                      </div>
                      
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Attendee</p>
                        <p className="text-lg font-bold mb-4">{profile?.full_name || user?.email?.split('@')[0]}</p>
                        
                        {confirmationCode && (
                          <div className="inline-block px-4 py-2 bg-blue-50 rounded-lg">
                            <p className="text-[9px] uppercase tracking-widest text-blue-600 font-bold mb-0.5">Conf. Code</p>
                            <p className="text-xl font-black tracking-tighter text-blue-700">{confirmationCode}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Voucher Footer */}
                    <div className="px-8 py-4 bg-gray-50 text-center border-t border-dashed border-gray-200">
                      <p className="text-[10px] text-gray-400 font-medium italic">Please present this QR code at the event entrance for seamless check-in.</p>
                    </div>
                  </div>
                )}

                {/* Session Review - Ecommerce Checkout Style */}
                {selectedSessions.size > 0 && (
                  <div 
                    className="max-w-md mx-auto text-left print-summary"
                    style={{ 
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                      paddingTop: '32px' 
                    }}
                  >
                    <div className="flex justify-between items-baseline mb-6">
                      <h3 className="text-lg font-light tracking-tight" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        Selected Sessions
                      </h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {selectedSessions.size} items
                      </span>
                    </div>

                    <div className="space-y-4">
                      {sessions
                        .filter(s => selectedSessions.has(s.id))
                        .map(s => (
                          <div key={s.id} className="flex justify-between items-start group">
                            <div className="flex-1 pr-4">
                              <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                {s.title}
                              </p>
                              <p className="text-[11px] font-light mt-1" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                {s.location || 'Main Hall'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[12px] font-light tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {formatTime(s.starts_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div 
                      className="mt-8 pt-6 flex justify-between items-center"
                      style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
                    >
                      <span className="text-sm font-light text-white/40">Registration Fee</span>
                      <span className="text-sm font-light text-white">Free</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      {currentStep < 3 && (
        <footer
          className="mt-auto px-6 py-8"
          style={{
            backgroundColor: 'rgba(11, 38, 65, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="max-w-[800px] mx-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold"
              style={{
                backgroundColor: 'transparent',
                color: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <ChevronLeft size={18} />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="px-8 py-2.5 rounded-lg font-bold flex items-center gap-2"
              style={{
                backgroundColor: !canProceed() || isSubmitting ? 'rgba(255, 255, 255, 0.1)' : '#0684F5',
                color: !canProceed() || isSubmitting ? 'rgba(255, 255, 255, 0.3)' : '#FFFFFF',
                border: 'none',
                cursor: !canProceed() || isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: !canProceed() || isSubmitting ? 'none' : '0 4px 12px rgba(6, 132, 245, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (canProceed() && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#0571D0';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (canProceed() && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#0684F5';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {currentStep === 2 ? 'Complete Registration' : 'Continue'}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}