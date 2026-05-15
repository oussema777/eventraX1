import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { generateAccessCode } from '../utils/codeGenerator';
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
  Download,
  CreditCard,
  Upload,
  Globe,
  Handshake,
  UserPlus,
  LogIn,
  X
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { sanitizeError } from '../utils/errorHandler';
import { createNotification } from '../lib/notifications';
import { useAuth } from '../contexts/AuthContext';
import { sendEmail, generateRegistrationEmailHtml, sendCapacityAlertEmail } from '../lib/email';
import { countries } from '../data/countries';
import { uploadFormSubmissionFile } from '../utils/storage';
import { useI18n } from '../i18n/I18nContext';
import { PLATFORM_INTERESTS, PLATFORM_SECTORS } from '../constants/platformFields';
import SEOHead from '../components/SEOHead';
import { truncateDescription, canonicalUrl } from '../utils/seo';

const toFlagEmoji = (code: string) => {
  if (!code || code.length !== 2) return '';
  try {
    return code
      .toUpperCase()
      .split('')
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join('');
  } catch {
    return '';
  }
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
  const location = useLocation();
  const accessCodeVerified = (location.state as any)?.accessCodeVerified;
  const { user, profile } = useAuth();
  const { t } = useI18n();

  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [needsAccessCode, setNeedsAccessCode] = useState(false);
  const [needsAccount, setNeedsAccount] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [event, setEvent] = useState<any>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [sessions, setSessions] = useState<Session[]>(new Array());
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [freeTicketId, setFreeTicketId] = useState<string | null>(null);
  const [registeredAttendeeId, setRegisteredAttendeeId] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);
  const [isPaidEvent, setIsPaidEvent] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUploading, setFileUploading] = useState<Record<string, boolean>>({});
  const [countrySearch, setCountrySearch] = useState('');

  // System fields state (mandatory, always present)
  const [systemFields, setSystemFields] = useState({
    fullName: '',
    phone: '',
    phoneCountryCode: '+216',
    email: '',
    companyName: '',
    companyDescription: '',
    interests: [] as string[],
    sector: '',
    socialUrl: '',
    b2bOptIn: false,
  });
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);
  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [isPhoneCountryOpen, setIsPhoneCountryOpen] = useState(false);

  const generateConfirmationCode = () => 'EV-' + generateAccessCode(6);

  // When user logs in while on the account-required gate, re-fetch event data
  useEffect(() => {
    if (needsAccount && user) {
      setNeedsAccount(false);
      fetchEventData();
    }
  }, [user, needsAccount]);

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

      // Check if private event requires access code
      if (eventData.access_code && !accessCodeVerified) {
        setNeedsAccessCode(true);
        setIsLoading(false);
        return;
      }

      // Check if B2B event requires an Eventra account
      if (eventData.attendee_settings?.requireAccountForB2B && !user) {
        setNeedsAccount(true);
        setIsLoading(false);
        return;
      }

      // 2. Fetch Sessions
      const { data: sessionData } = await supabase
        .from('event_sessions')
        .select('*')
        .eq('event_id', eventId)
        .order('starts_at', { ascending: true });
      
      if (sessionData) {
        setSessions(sessionData);
      }

      // 3. Fetch Tickets and detect if it's a paid event
      const { data: ticketData } = await supabase
        .from('event_tickets')
        .select('id, price')
        .eq('event_id', eventId)
        .eq('status', 'active');
      
      if (ticketData && ticketData.length > 0) {
        setFreeTicketId(ticketData[0].id);
        const hasPaid = ticketData.some((t: any) => t.price > 0);
        setIsPaidEvent(hasPaid);
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
          const labelLowerCheck = (f.label || '').toLowerCase();
          const isName = f.id === 'default-name' || (f.label && /^(full\s*name|name|your\s*name|nom)$/i.test(f.label.trim()) && !labelLowerCheck.includes('company') && !labelLowerCheck.includes('organization'));

          if (isEmail && user?.email) {
            defaultValue = user.email;
            isReadonly = true;
          } else if (isName && profile?.full_name) {
            defaultValue = profile.full_name;
            isReadonly = true;
          } else if (profile) {
            // Auto-fill custom fields from profile if possible
            const labelLower = (f.label || '').toLowerCase();
            const typeLower = (f.type || '').toLowerCase();

            if (labelLower.includes('job') || labelLower.includes('title')) {
              defaultValue = profile.job_title || '';
            } else if (labelLower.includes('company') || labelLower.includes('organization')) {
              defaultValue = profile.company || '';
            } else if (typeLower === 'phone' || labelLower.includes('phone')) {
              defaultValue = profile.phone_number || '';
            } else if (typeLower === 'country' || labelLower.includes('pays') || labelLower.includes('country')) {
              const loc = profile.location || '';
              // Try to find code if loc is a name
              const found = countries.find(c => c.name.toLowerCase() === loc.toLowerCase() || c.code === loc);
              defaultValue = found ? found.code : loc;
            } else if (typeLower === 'date' || labelLower.includes('birth') || labelLower.includes('naissance')) {
              defaultValue = profile.date_of_birth || '';
            } else if (labelLower === 'gender' || labelLower === 'genre' || labelLower === 'sexe') {
              defaultValue = profile.gender || '';
            }
          }

          const isPhoneField = f.type === 'phone' || (f.label && f.label.toLowerCase().includes('phone'));
          let initialPhoneCountryCode = 'US'; // Default
          let initialPhoneNumber = '';

          if (isPhoneField && defaultValue) {
            // Attempt to parse phone number
            const cleaned = defaultValue.trim();
            if (cleaned.startsWith('+')) {
              // Look for matching country code
              const matchingCountry = countries.find(c => cleaned.startsWith(c.phoneCode));
              if (matchingCountry) {
                initialPhoneCountryCode = matchingCountry.code;
                initialPhoneNumber = cleaned.replace(matchingCountry.phoneCode, '').trim();
              } else {
                initialPhoneNumber = cleaned;
              }
            } else {
              initialPhoneNumber = cleaned;
            }
          }
          
          return {
            id: f.id || `field_${Math.random().toString(36).substr(2, 9)}`,
            label: f.label || f.name || 'Untitled Field',
            type: f.type,
            required: f.required,
            options: f.options,
            value: isPhoneField ? '' : defaultValue, 
            readonly: isReadonly, 
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
        
        console.log('[REGISTRATION_DEBUG] Final Fields:', finalFields);
        setFormFields(finalFields);
      } else {
        console.log('[REGISTRATION_DEBUG] No custom form found, using default fields');
        setFormFields(defaultFields);
      }

      // Auto-fill system fields from profile
      if (profile) {
        setSystemFields(prev => ({
          ...prev,
          fullName: profile.full_name || prev.fullName,
          email: user?.email || profile.email || prev.email,
          phone: profile.phone || prev.phone,
          companyName: profile.company || prev.companyName,
          companyDescription: profile.company_description || prev.companyDescription,
          interests: profile.interests || prev.interests,
          sector: profile.sector || prev.sector,
          socialUrl: profile.social_url || profile.linkedin_url || prev.socialUrl,
        }));
      }

    } catch (error) {
      console.error('Error fetching registration data:', error);
      toast.error(t('registrationFlow.toasts.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (fieldId: string, value: string) => {
    setFormFields(prev => prev.map(field =>
      field.id === fieldId && !field.readonly ? { ...field, value } : field
    ));
  };

  const toggleCountryDropdown = (fieldId: string) => {
    setFormFields(prev => prev.map(field =>
      field.id === fieldId ? { ...field, isDropdownOpen: !field.isDropdownOpen } : field
    ));
    setCountrySearch('');
  };

  const selectCountry = (fieldId: string, countryCode: string) => {
    setFormFields(prev => prev.map(field =>
      field.id === fieldId ? { ...field, value: countryCode, isDropdownOpen: false } : field
    ));
    setCountrySearch('');
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
          const phoneCountry = countries.find(c => c.code === f.phoneCountryCode);
          responses[f.label] = `${phoneCountry?.phoneCode || f.phoneCountryCode} ${f.phoneNumber}`;
        } else if (f.type === 'country' && f.value) {
          const countryObj = countries.find(c => c.code === f.value);
          responses[f.label] = countryObj?.name || f.value;
        } else {
          responses[f.label] = f.value;
        }
      });

      const email = user?.email || formFields.find(f => f.type === 'email')?.value;
      const name = profile?.full_name || formFields.find(f => f.label.toLowerCase().includes('name'))?.value;

      if (!email || !name) {
        toast.error(t('registrationFlow.toasts.nameEmailRequired'));
        setIsSubmitting(false);
        return;
      }

      if (!freeTicketId) {
        console.warn('No ticket found, registration might be incomplete on analytics.');
      }

      // Fetch notification settings for event_registration
      let regNotifSettings = { is_email_enabled: true, is_bell_enabled: true };
      if (eventId) {
        try {
          const { data: notifSetting } = await supabase
            .from('event_notification_settings')
            .select('is_email_enabled, is_bell_enabled')
            .eq('event_id', eventId)
            .eq('trigger_type', 'event_registration')
            .maybeSingle();
          if (notifSetting) regNotifSettings = notifSetting;
        } catch { /* default ON */ }
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
          toast.success(t('registrationFlow.toasts.alreadyRegistered'));
          
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
            if (regNotifSettings.is_email_enabled) {
              const emailHtml = generateRegistrationEmailHtml(event?.name || 'Event', existing.name || email || 'Attendee', qrUrl, mySessions, !user);
              await sendEmail({
                to: email || '',
                subject: `Registration Confirmed: ${event?.name}`,
                html: emailHtml
              });
            }
            
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

      // Capacity alert email to organizer
      try {
        if (event?.owner_id && freeTicketId) {
          const { data: ticketInfo } = await supabase
            .from('event_tickets')
            .select('quantitySold, quantityTotal')
            .eq('id', freeTicketId)
            .maybeSingle();
          if (ticketInfo && ticketInfo.quantityTotal > 0) {
            const pct = Math.round(((ticketInfo.quantitySold || 0) / ticketInfo.quantityTotal) * 100);
            if (pct >= 80) {
              const { data: ownerProfile } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', event.owner_id)
                .maybeSingle();
              if (ownerProfile?.email) {
                sendCapacityAlertEmail({
                  organizerName: ownerProfile.full_name || 'Organizer',
                  organizerEmail: ownerProfile.email,
                  eventName: event.name || 'Event',
                  currentCount: ticketInfo.quantitySold || 0,
                  totalCapacity: ticketInfo.quantityTotal,
                  percentFull: pct,
                  eventId: eventId || ''
                }).catch(() => {});
              }
            }
          }
        }
      } catch { /* non-blocking */ }

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
        if (regNotifSettings.is_email_enabled) {
          const emailHtml = generateRegistrationEmailHtml(event?.name || 'Event', attendee.name || email || 'Attendee', qrUrl, mySessions, !user);
          await sendEmail({
            to: email || '',
            subject: `Registration Confirmed: ${event?.name}`,
            html: emailHtml
          });
        }
      }

      try {
        if (event?.owner_id && regNotifSettings.is_bell_enabled) {
          // Internal manager alert - kept as simple system notification
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
      toast.error(sanitizeError(error, t('registrationFlow.toasts.registrationFailed')));
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

  const handleFileUpload = async (fieldId: string, file: File) => {
    if (!eventId) return;
    
    setFileUploading(prev => ({ ...prev, [fieldId]: true }));
    try {
      // We use a temporary attendee ID or just event ID + timestamp if attendee not yet created
      // But actually, we usually create attendee FIRST.
      // For this flow, let's use eventId + timestamp as path
      const url = await uploadFormSubmissionFile(eventId, user?.id || 'guest', file);
      if (url) {
        updateFormField(fieldId, url);
        toast.success(t('registrationFlow.toasts.fileUploaded'));
      } else {
        toast.error(t('registrationFlow.toasts.fileUploadFailed'));
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(t('registrationFlow.toasts.fileUploadError'));
    } finally {
      setFileUploading(prev => ({ ...prev, [fieldId]: false }));
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
      // System field validation
      const systemValid =
        systemFields.fullName.trim().length >= 2 &&
        systemFields.email.trim().length > 0 && /\S+@\S+\.\S+/.test(systemFields.email) &&
        systemFields.phone.replace(/\D/g, '').length >= 7 &&
        systemFields.companyName.trim().length >= 2 &&
        systemFields.companyDescription.trim().length >= 10 &&
        systemFields.companyDescription.trim().length <= 500 &&
        systemFields.interests.length > 0 &&
        systemFields.sector.trim().length > 0 &&
        /^https?:\/\/.+/.test(systemFields.socialUrl);

      // Custom field validation (existing logic)
      const requiredFields = formFields.filter(f => f.required);
      const emptyRequired = requiredFields.filter(f => {
        if (f.type === 'phone') {
          return !f.phoneNumber || f.phoneNumber.trim() === '';
        }
        return !f.value || f.value.trim() === '';
      });

      const noActiveUploads = !Object.values(fileUploading).some(val => val === true);
      return systemValid && emptyRequired.length === 0 && noActiveUploads;
    }
    return true;
  };

  const steps = [
    { number: 1, label: t('registrationFlow.steps.details') },
    { number: 2, label: t('registrationFlow.steps.sessions') },
    { number: 3, label: t('registrationFlow.steps.done') }
  ];

  const formatTime = (iso: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderSystemFields = () => {
    const isReadOnly = !!profile;
    const fieldStyle = {
      backgroundColor: '#0D243B',
      borderColor: 'rgba(255,255,255,0.15)',
      color: '#FFFFFF',
    };

    const updateSystemField = (key: string, value: any) => {
      setSystemFields(prev => ({ ...prev, [key]: value }));
    };

    return (
      <>
        {/* 1. Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1.5">
            {t('registration.systemFields.fullName', { defaultValue: 'Full Name' })} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={systemFields.fullName}
            onChange={e => updateSystemField('fullName', e.target.value)}
            readOnly={isReadOnly && !!systemFields.fullName}
            className="w-full px-3 py-2.5 rounded-lg border text-sm"
            style={fieldStyle}
            placeholder="John Doe"
          />
        </div>

        {/* 2. Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1.5">
            {t('registration.systemFields.email', { defaultValue: 'Email Address' })} <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={systemFields.email}
            onChange={e => updateSystemField('email', e.target.value)}
            readOnly={isReadOnly && !!systemFields.email}
            className="w-full px-3 py-2.5 rounded-lg border text-sm"
            style={fieldStyle}
            placeholder="john@company.com"
          />
        </div>

        {/* 3. Phone with country code */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1.5">
            {t('registration.systemFields.phone', { defaultValue: 'Phone Number' })} <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <div className="relative" style={{ minWidth: '110px' }}>
              <button
                type="button"
                onClick={() => setIsPhoneCountryOpen(!isPhoneCountryOpen)}
                className="w-full flex items-center gap-1.5 px-2 py-2.5 rounded-lg border text-sm"
                style={fieldStyle}
              >
                <span>{toFlagEmoji(countries.find(c => c.phoneCode === systemFields.phoneCountryCode)?.code || '') || '🌍'}</span>
                <span className="text-white/70 text-xs">{systemFields.phoneCountryCode}</span>
                <ChevronDown size={12} className="ml-auto text-white/50" />
              </button>
              {isPhoneCountryOpen && (
                <div className="absolute z-50 mt-1 w-64 max-h-48 overflow-y-auto rounded-lg border shadow-xl"
                  style={{ backgroundColor: '#0D243B', borderColor: 'rgba(255,255,255,0.15)' }}>
                  {countries.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { updateSystemField('phoneCountryCode', c.phoneCode); setIsPhoneCountryOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10"
                    >
                      <span>{toFlagEmoji(c.code)}</span>
                      <span>{c.name}</span>
                      <span className="ml-auto text-white/50">{c.phoneCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="tel"
              value={systemFields.phone}
              onChange={e => updateSystemField('phone', e.target.value)}
              readOnly={isReadOnly && !!systemFields.phone}
              className="flex-1 px-3 py-2.5 rounded-lg border text-sm"
              style={fieldStyle}
              placeholder="12345678"
            />
          </div>
        </div>

        {/* 4. Company Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1.5">
            {t('registration.systemFields.companyName', { defaultValue: 'Company Name' })} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={systemFields.companyName}
            onChange={e => updateSystemField('companyName', e.target.value)}
            readOnly={isReadOnly && !!systemFields.companyName}
            className="w-full px-3 py-2.5 rounded-lg border text-sm"
            style={fieldStyle}
            placeholder="Acme Corp"
          />
        </div>

        {/* 5. Short Company Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1.5">
            {t('registration.systemFields.companyDescription', { defaultValue: 'Short Company Description' })} <span className="text-red-400">*</span>
          </label>
          <textarea
            value={systemFields.companyDescription}
            onChange={e => updateSystemField('companyDescription', e.target.value)}
            readOnly={isReadOnly && !!systemFields.companyDescription}
            className="w-full px-3 py-2.5 rounded-lg border text-sm resize-none"
            style={fieldStyle}
            rows={3}
            maxLength={500}
            placeholder={t('registration.systemFields.companyDescriptionPlaceholder', { defaultValue: 'Briefly describe what your company does (10-500 characters)' })}
          />
          <p className="text-xs mt-1" style={{ color: systemFields.companyDescription.length < 10 ? '#EF4444' : 'rgba(255,255,255,0.4)' }}>
            {systemFields.companyDescription.length}/500
          </p>
        </div>

        {/* 6. Interests (multi-select) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1.5">
            {t('registration.systemFields.interests', { defaultValue: 'Interests' })} <span className="text-red-400">*</span>
          </label>
          {systemFields.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {systemFields.interests.map(interest => (
                <span key={interest} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                  style={{ backgroundColor: 'rgba(6,132,245,0.2)', color: '#0684F5', border: '1px solid rgba(6,132,245,0.3)' }}>
                  {interest}
                  <button type="button" onClick={() => updateSystemField('interests', systemFields.interests.filter((i: string) => i !== interest))}
                    className="ml-0.5 hover:text-white">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsInterestsOpen(!isInterestsOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm"
              style={fieldStyle}
            >
              <span className="text-white/50">
                {t('registration.systemFields.interestsPlaceholder', { defaultValue: 'Select your interests' })}
              </span>
              <ChevronDown size={14} className="text-white/50" />
            </button>
            {isInterestsOpen && (
              <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border shadow-xl"
                style={{ backgroundColor: '#0D243B', borderColor: 'rgba(255,255,255,0.15)' }}>
                {PLATFORM_INTERESTS.map(interest => {
                  const isSelected = systemFields.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          updateSystemField('interests', systemFields.interests.filter((i: string) => i !== interest));
                        } else {
                          updateSystemField('interests', [...systemFields.interests, interest]);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10"
                    >
                      <div className="w-4 h-4 rounded border flex items-center justify-center"
                        style={{ borderColor: isSelected ? '#0684F5' : 'rgba(255,255,255,0.3)', backgroundColor: isSelected ? '#0684F5' : 'transparent' }}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      {interest}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 7. Sector (single-select) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1.5">
            {t('registration.systemFields.sector', { defaultValue: 'Sector' })} <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSectorOpen(!isSectorOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm"
              style={fieldStyle}
            >
              <span className={systemFields.sector ? 'text-white' : 'text-white/50'}>
                {systemFields.sector || t('registration.systemFields.sectorPlaceholder', { defaultValue: 'Select your sector' })}
              </span>
              <ChevronDown size={14} className="text-white/50" />
            </button>
            {isSectorOpen && (
              <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border shadow-xl"
                style={{ backgroundColor: '#0D243B', borderColor: 'rgba(255,255,255,0.15)' }}>
                {PLATFORM_SECTORS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { updateSystemField('sector', s); setIsSectorOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 ${systemFields.sector === s ? 'text-[#0684F5]' : 'text-white'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 8. Social URL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1.5">
            {t('registration.systemFields.socialUrl', { defaultValue: 'Social / Website URL' })} <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={systemFields.socialUrl}
            onChange={e => updateSystemField('socialUrl', e.target.value)}
            readOnly={isReadOnly && !!systemFields.socialUrl}
            className="w-full px-3 py-2.5 rounded-lg border text-sm"
            style={fieldStyle}
            placeholder={t('registration.systemFields.socialUrlPlaceholder', { defaultValue: 'https://linkedin.com/in/yourprofile' })}
          />
        </div>

        {/* B2B Toggle */}
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(6,132,245,0.08)', border: '1px solid rgba(6,132,245,0.2)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                {t('registration.systemFields.b2bOptIn', { defaultValue: 'Want B2B Matching?' })}
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                {t('registration.systemFields.b2bOptInDescription', { defaultValue: 'Get matched with relevant attendees for business networking' })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateSystemField('b2bOptIn', !systemFields.b2bOptIn)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ backgroundColor: systemFields.b2bOptIn ? '#0684F5' : 'rgba(255,255,255,0.2)' }}
            >
              <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ transform: systemFields.b2bOptIn ? 'translateX(20px)' : 'translateX(0)' }} />
            </button>
          </div>
        </div>
      </>
    );
  };

  if (needsAccessCode) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B2641' }}>
        <div className="w-full max-w-sm mx-4 rounded-2xl p-6" style={{ backgroundColor: '#0D243B', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
              <Lock size={20} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {t('event.accessCodeModalTitle', { defaultValue: 'Private Event' })}
              </h3>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                {t('event.enterAccessCode', { defaultValue: 'Enter Access Code' })}
              </p>
            </div>
          </div>

          <input
            type="text"
            value={enteredCode}
            onChange={(e) => { setEnteredCode(e.target.value.toUpperCase()); setCodeError(''); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && enteredCode.length >= 4) {
                if (enteredCode.toUpperCase() === (event?.access_code || '').toUpperCase()) {
                  setNeedsAccessCode(false);
                } else {
                  setCodeError(t('event.invalidAccessCode', { defaultValue: 'Invalid access code' }));
                }
              }
            }}
            placeholder="e.g. VIP2026"
            maxLength={10}
            autoFocus
            className="w-full h-11 px-4 rounded-lg border outline-none font-mono text-sm tracking-wider mb-2"
            style={{
              borderColor: codeError ? '#EF4444' : 'rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              textTransform: 'uppercase'
            }}
          />

          {codeError && <p className="text-xs mb-3" style={{ color: '#EF4444' }}>{codeError}</p>}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate(`/event/${eventId}/landing`)}
              className="flex-1 h-10 rounded-lg border text-sm"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#9CA3AF' }}
            >
              {t('common.back', { defaultValue: 'Back' })}
            </button>
            <button
              onClick={() => {
                if (enteredCode.toUpperCase() === (event?.access_code || '').toUpperCase()) {
                  setNeedsAccessCode(false);
                } else {
                  setCodeError(t('event.invalidAccessCode', { defaultValue: 'Invalid access code' }));
                }
              }}
              disabled={enteredCode.length < 4}
              className="flex-1 h-10 rounded-lg text-sm font-medium text-white"
              style={{
                backgroundColor: enteredCode.length >= 4 ? '#0684F5' : '#374151',
                cursor: enteredCode.length >= 4 ? 'pointer' : 'not-allowed'
              }}
            >
              {t('event.submitCode', { defaultValue: 'Submit' })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (needsAccount) {
    const handleSwitchToLogin = () => {
      setShowRegistrationModal(false);
      setShowLoginModal(true);
    };
    const handleSwitchToSignup = () => {
      setShowLoginModal(false);
      setShowRegistrationModal(true);
    };

    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B2641' }}>
        <div className="w-full max-w-md mx-4 rounded-2xl overflow-hidden" style={{ backgroundColor: '#0D243B', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Top accent bar */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #0684F5, #8B5CF6)' }} />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(6,132,245,0.15), rgba(139,92,246,0.15))' }}>
              <Handshake size={28} style={{ color: '#0684F5' }} />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white mb-2">
              {t('event.accountRequiredTitle', { defaultValue: 'Create an Account to Register' })}
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9CA3AF', lineHeight: 1.6 }}>
              {t('event.accountRequiredReason', { defaultValue: 'This event includes B2B networking and matchmaking. An account lets you connect with other attendees, schedule meetings, and more.' })}
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 gap-3 mb-8 text-left">
              {[
                { icon: Handshake, text: t('event.b2bFeature1', { defaultValue: 'B2B matchmaking & meetings' }) },
                { icon: Globe, text: t('event.b2bFeature2', { defaultValue: 'Attendee networking directory' }) },
                { icon: Calendar, text: t('event.b2bFeature3', { defaultValue: 'Personalized session schedule' }) }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <item.icon size={16} style={{ color: '#0684F5', flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: '#D1D5DB' }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #0684F5, #0574D4)',
                  boxShadow: '0 4px 14px rgba(6, 132, 245, 0.3)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 132, 245, 0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(6, 132, 245, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <UserPlus size={18} />
                {t('event.createAccount', { defaultValue: 'Create Account' })}
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#D1D5DB'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
              >
                <LogIn size={18} />
                {t('event.alreadyHaveAccount', { defaultValue: 'Already have an account? Sign in' })}
              </button>
            </div>

            {/* Back link */}
            <button
              onClick={() => navigate(`/event/${eventId}/landing`)}
              className="mt-5 text-xs transition-colors"
              style={{ color: '#6B7280' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
            >
              {t('event.backToEvent', { defaultValue: '← Back to event page' })}
            </button>
          </div>
        </div>

        {/* Auth Modals */}
        <ModalRegistrationEntry
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onGoogleSignup={async () => setShowRegistrationModal(false)}
          onEmailSignup={async () => setShowRegistrationModal(false)}
          onLoginClick={handleSwitchToLogin}
        />

        <ModalLogin
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onGoogleLogin={async () => setShowLoginModal(false)}
          onLoginSuccess={() => setShowLoginModal(false)}
          onSignUpClick={handleSwitchToSignup}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B2641]">
        <Loader2 className="animate-spin text-[#0684F5]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0B2641', color: '#FFFFFF' }}>
      {event && (
        <SEOHead
          title={`Register for ${event.name || 'Event'}`}
          description={truncateDescription(`Register for ${event.name}. Secure your spot and select your sessions.`, 160)}
          canonicalUrl={canonicalUrl(`/event/${eventId}/register`)}
        />
      )}
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
        @media (max-width: 768px) {
          .reg-help-text { display: none; }
          .reg-help-btn button { padding: 8px !important; border: none !important; }
        }
        @media (max-width: 640px) {
          .h-full.flex.items-center { padding-left: 16px !important; padding-right: 16px !important; }
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
        <div className="h-full flex items-center justify-between px-10" style={{ gap: '12px' }}>
          <div style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
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

          <div className="reg-help-btn" style={{ minWidth: '40px', textAlign: 'right', flexShrink: 0 }}>
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
                cursor: 'pointer',
                whiteSpace: 'nowrap'
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
              <span className="reg-help-text">{t('registrationFlow.help')}</span>
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
                  {t('registrationFlow.welcomeBack').replace('{name}', profile?.full_name?.split(' ')[0] || t('registrationFlow.guest'))}
                </h1>
                <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t('registrationFlow.confirmDetails').replace('{eventName}', '')} <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{event?.name}</span>
                </p>
              </div>

              <div className="space-y-6">
                {/* System fields (mandatory, always present) */}
                {renderSystemFields()}

                {/* Divider between system fields and custom fields */}
                {formFields.length > 0 && (
                  <div className="border-t border-white/10 my-6 pt-4">
                    <p className="text-sm text-white/50 mb-4">
                      {t('registration.additionalFields', { defaultValue: 'Additional Information' })}
                    </p>
                  </div>
                )}

                {/* Custom fields from event form builder */}
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
                          {t('registrationFlow.locked')}
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
                          <option value="" style={{ color: '#000' }}>{t('registrationFlow.selectOption')}</option>
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
                            {field.value ? (
                              <span className="flex items-center gap-2">
                                <span style={{ fontSize: '20px' }}>
                                  {toFlagEmoji(field.value)}
                                </span>
                                {countries.find(c => c.code === field.value)?.name}
                              </span>
                            ) : (
                              t('registrationFlow.selectCountry')
                            )}
                            <ChevronDown size={20} style={{ color: '#6B7280' }} />
                          </button>

                          {field.isDropdownOpen && (
                            <div
                              className="absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-10"
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                maxHeight: '280px',
                                overflowY: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                            >
                              <div style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
                                <input
                                  type="text"
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  placeholder={t('registrationFlow.searchCountry', { defaultValue: 'Search country...' })}
                                  autoFocus
                                  className="w-full px-3 py-2 rounded-md outline-none"
                                  style={{
                                    fontSize: '14px',
                                    color: '#374151',
                                    backgroundColor: '#F9FAFB',
                                    border: '1px solid #E5E7EB'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div style={{ overflowY: 'auto', flex: 1 }}>
                                {countries
                                  .filter(c => !countrySearch || c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.toLowerCase().includes(countrySearch.toLowerCase()))
                                  .map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => selectCountry(field.id, country.code)}
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
                            </div>
                          )}
                        </div>
                      ) : field.type === 'phone' ? (
                        <div className="flex gap-2">
                          <div className="relative" style={{ width: '120px' }}>
                            <button
                              type="button"
                              onClick={() => togglePhoneCountryDropdown(field.id)}
                              className="w-full flex items-center justify-between transition-all"
                              style={{
                                height: '48px',
                                padding: '0 12px',
                                fontSize: '15px',
                                color: '#FFFFFF',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                outline: 'none'
                              }}
                            >
                              <span className="flex items-center gap-2">
                                <span>{toFlagEmoji(field.phoneCountryCode || 'US')}</span>
                                <span>{countries.find(c => c.code === (field.phoneCountryCode || 'US'))?.phoneCode}</span>
                              </span>
                              <ChevronDown size={16} style={{ color: '#6B7280' }} />
                            </button>

                            {field.isPhoneDropdownOpen && (
                              <div
                                className="absolute top-full left-0 mt-1 w-[280px] rounded-lg shadow-lg z-10"
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
                                    onClick={() => updatePhoneField(field.id, 'countryCode', country.code)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                                    style={{
                                      border: 'none',
                                      backgroundColor: field.phoneCountryCode === country.code ? '#F3F4F6' : 'transparent',
                                      cursor: 'pointer',
                                      textAlign: 'left'
                                    }}
                                  >
                                    <span style={{ fontSize: '20px' }}>{toFlagEmoji(country.code)}</span>
                                    <span style={{ fontSize: '14px', color: '#374151' }}>
                                      {country.name} ({country.phoneCode})
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="tel"
                            value={field.phoneNumber || ''}
                            onChange={(e) => updatePhoneField(field.id, 'number', e.target.value)}
                            placeholder={t('registrationFlow.phoneNumber')}
                            className="flex-1 h-[48px] px-4 rounded-lg border outline-none transition-all"
                            style={{
                              fontSize: '16px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              borderColor: 'rgba(255, 255, 255, 0.15)',
                              color: '#FFFFFF'
                            }}
                          />
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
                      ) : field.type === 'file' ? (
                        <div className="space-y-2">
                          <input
                            type="file"
                            id={`file-${field.id}`}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(field.id, file);
                            }}
                          />
                          <label
                            htmlFor={`file-${field.id}`}
                            className="flex flex-col items-center justify-center w-full p-6 rounded-lg border-2 border-dashed transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-500/5"
                            style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' }}
                          >
                            {fileUploading[field.id] ? (
                              <Loader2 size={24} className="animate-spin text-blue-500" />
                            ) : field.value ? (
                              <div className="flex flex-col items-center gap-2">
                                <Check size={24} className="text-green-500" />
                                <span className="text-sm text-green-500 font-medium">{t('registrationFlow.fileUploaded')}</span>
                                <span className="text-xs text-slate-400 truncate max-w-[200px]">
                                  {field.value.split('/').pop()}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload size={24} style={{ color: '#94A3B8' }} />
                                <span className="text-sm" style={{ color: '#94A3B8' }}>
                                  {t('registrationFlow.clickToUpload')}
                                </span>
                              </div>
                            )}
                          </label>
                        </div>
                      ) : field.type === 'url' ? (
                        <div className="relative">
                          <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="url"
                            value={field.value}
                            onChange={(e) => updateFormField(field.id, e.target.value)}
                            placeholder={field.placeholder || "https://example.com"}
                            className="w-full h-12 pl-11 pr-4 rounded-lg border outline-none transition-all"
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)', 
                              borderColor: 'rgba(255,255,255,0.15)',
                              color: '#FFFFFF'
                            }}
                          />
                        </div>
                      ) : field.type === 'address' ? (
                        <div className="relative">
                          <MapPin size={18} className="absolute left-4 top-4 text-slate-400" />
                          <textarea
                            value={field.value}
                            onChange={(e) => updateFormField(field.id, e.target.value)}
                            placeholder={field.placeholder || "Enter full address..."}
                            rows={3}
                            className="w-full pl-11 pr-4 pt-3.5 rounded-lg border outline-none transition-all resize-none"
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)', 
                              borderColor: 'rgba(255,255,255,0.15)',
                              color: '#FFFFFF'
                            }}
                          />
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
                  {t('registrationFlow.customizeAgenda')}
                </h1>
                <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t('registrationFlow.selectSessionsOptional')}
                </p>
              </div>

              {sessions.length === 0 ? (
                <div 
                  className="text-center py-12 rounded-xl border border-dashed"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                >
                  <Calendar className="mx-auto h-10 w-10 mb-3" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{t('registrationFlow.noSessionsAvailable')}</p>
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
            <div className="text-center py-6">
              <div 
                className="mx-auto mb-6 rounded-full w-20 h-20 flex items-center justify-center no-print"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <Check size={40} style={{ color: '#10B981' }} />
              </div>

              <h1 className="text-3xl font-bold mb-4 no-print" style={{ color: '#FFFFFF' }}>
                {isPaidEvent ? t('registrationFlow.preRegistrationComplete') : t('registrationFlow.allSet')}
              </h1>

              <p className="mb-10 max-w-md mx-auto no-print" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
                {isPaidEvent
                  ? t('registrationFlow.paidConfirmationDesc').replace('{eventName}', event?.name || '')
                  : t('registrationFlow.freeConfirmationDesc').replace('{eventName}', event?.name || '').replace('{email}', user?.email || '')
                }
              </p>

              {/* Final Step Card for Paid Events */}
              {isPaidEvent && (
                <div 
                  className="mb-12 p-8 rounded-2xl text-left border border-dashed animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ 
                    backgroundColor: 'rgba(6, 132, 245, 0.05)', 
                    borderColor: 'rgba(6, 132, 245, 0.3)' 
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(6, 132, 245, 0.2)', color: '#0684F5' }}
                    >
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: '#FFFFFF' }}>{t('registrationFlow.finalStepTitle')}</h3>
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                        {t('registrationFlow.finalStepDesc')}
                      </p>
                      <button
                        onClick={() => navigate(`/event/${eventId}/tickets`)}
                        className="group flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
                        style={{
                          backgroundColor: '#0684F5',
                          color: '#FFFFFF',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(6, 132, 245, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#0571D0';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#0684F5';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {t('registrationFlow.browseSecureTicket')}
                        <Check size={18} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 max-w-xs mx-auto mb-12 no-print">
                {!isPaidEvent && (
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
                    {t('registrationFlow.downloadTicketVoucher')}
                  </button>
                )}

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
                  {t('registrationFlow.backToEventPage')}
                </button>
              </div>

              {/* Printable Content Wrapper */}
              <div className="print-container">
                {/* Voucher Display - Hidden for paid events until ticket purchased */}
                {registeredAttendeeId && !isPaidEvent && (
                  <div 
                    className="mb-8 max-w-sm mx-auto overflow-hidden rounded-2xl shadow-2xl print-voucher"
                    style={{ backgroundColor: '#FFFFFF', color: '#0B2641' }}
                  >
                    {/* Voucher Header */}
                    <div className="p-6 text-left border-b border-dashed border-gray-200" style={{ backgroundColor: '#0B2641', color: '#FFFFFF' }}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">{t('registrationFlow.voucher.officialEntryTicket')}</p>
                          <h2 className="text-xl font-black leading-tight">{event?.name}</h2>
                        </div>
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                          <Calendar size={20} className="text-blue-400" />
                        </div>
                      </div>
                      <div className="flex gap-4 text-[11px] font-medium opacity-80">
                        <div>
                          <p className="uppercase opacity-60 mb-0.5">{t('registrationFlow.voucher.date')}</p>
                          <p>{event?.start_date ? new Date(event.start_date).toLocaleDateString() : t('registrationFlow.voucher.tbd')}</p>
                        </div>
                        <div>
                          <p className="uppercase opacity-60 mb-0.5">{t('registrationFlow.voucher.time')}</p>
                          <p>{event?.start_date ? new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('registrationFlow.voucher.tbd')}</p>
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
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">{t('registrationFlow.voucher.attendee')}</p>
                        <p className="text-lg font-bold mb-4">{profile?.full_name || user?.email?.split('@')[0]}</p>
                        
                        {confirmationCode && (
                          <div className="inline-block px-4 py-2 bg-blue-50 rounded-lg">
                            <p className="text-[9px] uppercase tracking-widest text-blue-600 font-bold mb-0.5">{t('registrationFlow.voucher.confCode')}</p>
                            <p className="text-xl font-black tracking-tighter text-blue-700">{confirmationCode}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Voucher Footer */}
                    <div className="px-8 py-4 bg-gray-50 text-center border-t border-dashed border-gray-200">
                      <p className="text-[10px] text-gray-400 font-medium italic">{t('registrationFlow.voucher.presentQR')}</p>
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
                        {t('registrationFlow.selectedSessions')}
                      </h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {t('registrationFlow.itemsCount').replace('{count}', String(selectedSessions.size))}
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
                                {s.location || t('registrationFlow.mainHall')}
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
                      <span className="text-sm font-light text-white/40">{t('registrationFlow.registrationStatus')}</span>
                      <span className="text-sm font-light text-white">
                        {isPaidEvent ? t('registrationFlow.ticketPurchaseRequired') : t('registrationFlow.free')}
                      </span>
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
              {t('registrationFlow.back')}
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
              {currentStep === 2 ? t('registrationFlow.completeRegistration') : t('registrationFlow.continue')}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}