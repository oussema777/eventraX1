import { useEffect, useRef, useState } from 'react';
import './EventDetailsForm.css';
import {
  Calendar,
  MapPin,
  Video,
  Globe,
  DollarSign,
  Gift,
  Infinity,
  ChevronDown,
  Check,
  AlertCircle,
  Palette,
  Lightbulb,
  FileText,
  ArrowRight,
  Lock
} from 'lucide-react';
import ProTipBox from './ProTipBox';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';
import { getEventBasicDetails, saveEventBasicDetails } from '../../utils/eventStorage';
import { useEventWizard } from '../../hooks/useEventWizard';
import { useI18n } from '../../i18n/I18nContext';
import { usePlan } from '../../hooks/usePlan';
import { toast } from 'sonner';

interface EventDetailsFormProps {
  onNameChange?: (name: string) => void;
}

export default function EventDetailsForm({ onNameChange }: EventDetailsFormProps) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { eventData, saveDraft, isLoading } = useEventWizard(eventId);
  const { t } = useI18n();
  const { isPro } = usePlan();
  const initializedRef = useRef(false);

  const [eventName, setEventName] = useState('');
  const [tagline, setTagline] = useState('');
  const [eventType, setEventType] = useState('Conference');
  const [otherEventType, setOtherEventType] = useState('');
  const [eventStatus, setEventStatus] = useState<'free' | 'paid' | 'continuous'>('free');
  const [eventFormat, setEventFormat] = useState<'in-person' | 'virtual' | 'hybrid'>('in-person');
  const [venueAddress, setVenueAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasCapacityLimit, setHasCapacityLimit] = useState(false);
  const [maxAttendees, setMaxAttendees] = useState('');
  const [waitlistCapacity, setWaitlistCapacity] = useState('');
  const [enableWaitlist, setEnableWaitlist] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [nameIsValid, setNameIsValid] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  
  // Debounced address for map preview to avoid excessive iframe reloads
  const [debouncedVenueAddress, setDebouncedVenueAddress] = useState('');

  useEffect(() => {
    if (!venueAddress) {
      setDebouncedVenueAddress('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedVenueAddress(venueAddress);
    }, 1000);
    return () => clearTimeout(timer);
  }, [venueAddress]);

  const handleMaxAttendeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMaxAttendees(value);
    
    if (value && waitlistCapacity) {
      if (parseInt(waitlistCapacity, 10) > parseInt(value, 10)) {
        setWaitlistError('Waitlist capacity cant be more than the max. attendees');
      } else {
        setWaitlistError('');
      }
    } else if (!value && waitlistCapacity) {
       // If max attendees is cleared but waitlist exists, technically waitlist > 0 (undefined/0).
       // But usually we just clear error until they type.
       setWaitlistError(''); 
    } else {
      setWaitlistError('');
    }
  };

  const handleWaitlistCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    // Strict Check: User cannot put waitlist more than capacity
    if (value && maxAttendees) {
      if (parseInt(value, 10) > parseInt(maxAttendees, 10)) {
        // Block the input (do not update state)
        // Optionally allow if they are deleting characters to fix it, but here we strictly block adding "more".
        // But if they paste a large number, it's blocked. 
        // If they type a digit that makes it larger, it's blocked.
        return; 
      }
    }
    
    setWaitlistCapacity(value);
    
    if (value && maxAttendees) {
      if (parseInt(value, 10) > parseInt(maxAttendees, 10)) {
        setWaitlistError('Waitlist capacity cant be more than the max. attendees');
      } else {
        setWaitlistError('');
      }
    } else {
      setWaitlistError('');
    }
  };

  const eventTypeOptions = [
    { value: 'Conference', label: t('wizard.details.eventTypes.conference') },
    { value: 'Workshop', label: t('wizard.details.eventTypes.workshop') },
    { value: 'Webinar', label: t('wizard.details.eventTypes.webinar') },
    { value: 'Networking', label: t('wizard.details.eventTypes.networking') },
    { value: 'Trade Show', label: t('wizard.details.eventTypes.tradeShow') },
    { value: 'Summit', label: t('wizard.details.eventTypes.summit') },
    { value: 'Masterclass', label: t('wizard.details.eventTypes.masterclass') },
    { value: 'Training', label: t('wizard.details.eventTypes.training') },
    { value: 'Bootcamp', label: t('wizard.details.eventTypes.bootcamp') },
    { value: 'Hackathon', label: t('wizard.details.eventTypes.hackathon') },
    { value: 'Award Ceremony', label: t('wizard.details.eventTypes.awardCeremony') },
    { value: 'Other', label: t('wizard.details.eventTypes.other') }
  ];
  const eventTypeValues = eventTypeOptions.map((option) => option.value);

  useEffect(() => {
    if (isLoading) return;
    if (initializedRef.current) return;
    const stored = getEventBasicDetails();
    const resolvedName = stored.eventName || eventData.name || '';
    const rawEventType = stored.eventType || eventData.event_type || 'Conference';
    const isKnownType = eventTypeValues.includes(rawEventType);
    const resolvedEventType = isKnownType ? rawEventType : 'Other';
    const resolvedOtherType =
      stored.otherEventType ||
      (!isKnownType && rawEventType !== 'Other' ? rawEventType : '') ||
      '';

    setEventName(resolvedName);
    setTagline(stored.tagline || eventData.tagline || '');
    setEventType(resolvedEventType);
    setOtherEventType(resolvedOtherType);
    setEventStatus((stored.eventStatus || eventData.event_status || 'free') as any);
    setEventFormat((stored.eventFormat || eventData.event_format || 'in-person') as any);
    setVenueAddress(stored.venueAddress || eventData.location_address || '');
    setStartDate(stored.startDate || eventData.start_date || '');
    setEndDate(stored.endDate || eventData.end_date || '');
    setHasCapacityLimit(
      typeof stored.hasCapacityLimit === 'boolean'
        ? stored.hasCapacityLimit
        : !!eventData.capacity_limit
    );
    setMaxAttendees(
      stored.maxAttendees?.toString() || eventData.capacity_limit?.toString() || ''
    );
    setEnableWaitlist(
      typeof stored.enableWaitlist === 'boolean'
        ? stored.enableWaitlist
        : !!eventData.waitlist_enabled
    );
    setWaitlistCapacity(
      stored.waitlistCapacity?.toString() ||
      eventData.attendee_settings?.waitlist_capacity?.toString() ||
      ''
    );
    if (resolvedName.length > 0) {
      setNameIsValid(true);
    }
    initializedRef.current = true;
  }, [eventData, isLoading]);

  useEffect(() => {
    if (!initializedRef.current) return;
    saveEventBasicDetails({
      eventName,
      tagline,
      eventType,
      otherEventType,
      eventStatus,
      eventFormat,
      venueAddress,
      startDate,
      endDate,
      maxAttendees: hasCapacityLimit ? parseInt(maxAttendees || '0', 10) : undefined,
      hasCapacityLimit,
      enableWaitlist,
      waitlistCapacity: enableWaitlist ? parseInt(waitlistCapacity || '0', 10) : undefined
    });
  }, [
    eventName,
    tagline,
    eventType,
    otherEventType,
    eventStatus,
    eventFormat,
    venueAddress,
    startDate,
    endDate,
    hasCapacityLimit,
    maxAttendees,
    enableWaitlist,
    waitlistCapacity
  ]);

  const handleEventNameChange = (value: string) => {
    setEventName(value);
    if (onNameChange) onNameChange(value);
    if (value.length > 0) {
      setShowNameError(false);
      setNameIsValid(true);
    } else {
      setNameIsValid(false);
    }
  };

  const formatCards = [
    {
      id: 'in-person' as const,
      icon: MapPin,
      label: t('wizard.details.format.inPerson.label'),
      description: t('wizard.details.format.inPerson.description')
    },
    {
      id: 'virtual' as const,
      icon: Video,
      label: t('wizard.details.format.virtual.label'),
      description: t('wizard.details.format.virtual.description')
    },
    {
      id: 'hybrid' as const,
      icon: Globe,
      label: t('wizard.details.format.hybrid.label'),
      description: t('wizard.details.format.hybrid.description')
    }
  ];

  const buildPayload = () => {
    const normalizedType = eventType === 'Other' && otherEventType.trim() ? otherEventType.trim() : eventType;
    return {
      name: eventName.trim() || eventData.name || t('wizard.common.untitledEvent'),
      tagline,
      event_type: normalizedType,
      event_status: eventStatus,
      event_format: eventFormat,
      location_address: venueAddress,
      start_date: startDate,
      end_date: endDate,
      capacity_limit: hasCapacityLimit ? parseInt(maxAttendees || '0', 10) : null,
      waitlist_enabled: enableWaitlist,
      attendee_settings: {
        waitlist_capacity: enableWaitlist ? parseInt(waitlistCapacity || '0', 10) : null
      }
    };
  };

  const ensureEventAndNavigate = async (target: string) => {
    // Validation
    if (!eventName.trim()) {
      setShowNameError(true);
      toast.error(t('wizard.details.errors.nameRequired', 'Event name is required.'));
      return;
    }

    if (!startDate || !endDate) {
      toast.error(t('wizard.details.errors.datesRequired', 'Please select start and end dates.'));
      return;
    }

    const payload = buildPayload();
    const created = await saveDraft(payload, !eventData.id);
    const id = created?.id || eventData.id;
    if (id) {
      navigate(`/create/${target}/${id}`);
      return;
    }
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div
      className="rounded-xl border p-6 sm:p-10"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="space-y-8">
        {/* Event Name */}
        <div>
          <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#1A1A1A' }}>
            {t('wizard.details.fields.eventName.label')} <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={eventName}
              onChange={(e) => handleEventNameChange(e.target.value)}
              placeholder={t('wizard.details.fields.eventName.placeholder')}
              maxLength={100}
              className="w-full h-12 px-4 rounded-lg border outline-none transition-all text-base"
              style={{
                borderColor: showNameError ? '#EF4444' : nameIsValid ? '#10B981' : '#E5E7EB',
                borderWidth: showNameError ? '2px' : '1px',
                boxShadow: showNameError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none',
                color: '#0B2641',
                backgroundColor: '#FFFFFF'
              }}
              onBlur={() => {
                if (eventName.length === 0) {
                  setShowNameError(true);
                }
              }}
            />
            {nameIsValid && (
              <Check
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#10B981' }}
              />
            )}
          </div>
          <div className="flex items-start justify-between mt-2">
            <div className="flex-1">
              {showNameError ? (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: '#EF4444' }}>
                  <AlertCircle size={14} />
                  <span>{t('wizard.details.fields.eventName.error')}</span>
                </div>
              ) : (
                <p className="text-sm" style={{ color: '#4B5563' }}>
                  {t('wizard.details.fields.eventName.helper')}
                </p>
              )}
            </div>
            <span className="text-sm ml-4" style={{ color: '#6B7280' }}>
              {eventName.length}/100
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#1A1A1A' }}>
            {t('wizard.details.fields.tagline.label')}
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder={t('wizard.details.fields.tagline.placeholder')}
            maxLength={150}
            className="w-full h-12 px-4 rounded-lg border outline-none transition-colors text-base"
            style={{
              borderColor: '#E5E7EB',
              color: '#0B2641'
            }}
          />
          <div className="flex justify-end mt-2">
            <span className="text-sm" style={{ color: '#6B7280' }}>
              {tagline.length}/150
            </span>
          </div>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#1A1A1A' }}>
            {t('wizard.details.fields.eventType.label')} <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div className="relative">
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full h-11 pl-4 pr-10 rounded-lg border outline-none appearance-none cursor-pointer transition-colors"
              style={{
                borderColor: '#E5E7EB',
                color: '#0B2641',
                backgroundColor: 'white'
              }}
            >
              {eventTypeOptions.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#6B7280' }}
            />
          </div>
          {eventType === 'Other' && (
            <input
              type="text"
              value={otherEventType}
              onChange={(e) => setOtherEventType(e.target.value)}
              placeholder={t('wizard.details.fields.eventType.otherPlaceholder')}
              className="w-full h-11 px-4 mt-3 rounded-lg border outline-none transition-colors text-base"
              style={{
                borderColor: '#E5E7EB',
                color: '#0B2641'
              }}
            />
          )}
        </div>

        {/* Event Status */}
        <div>
          <label className="block text-sm mb-4" style={{ fontWeight: 500, color: '#6B7280' }}>
            {t('wizard.details.fields.eventStatus.label')} <span style={{ color: '#EF4444' }}>*</span>
          </label>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Free Event */}
            <button
              onClick={() => {
                setEventStatus('free');
                saveEventBasicDetails({ eventStatus: 'free' });
              }}
              className="p-4 rounded-lg border-2 transition-all text-center"
              style={{
                borderColor: eventStatus === 'free' ? '#0684F5' : '#E5E7EB',
                backgroundColor: eventStatus === 'free' ? '#EFF6FF' : 'white',
                cursor: 'pointer'
              }}
            >
              <Gift
                size={24}
                className="mx-auto mb-2"
                style={{ color: eventStatus === 'free' ? '#0684F5' : '#6B7280' }}
              />
              <div
                className="text-sm mb-1"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                {t('wizard.details.eventStatus.free.title')}
              </div>
              <div
                className="text-xs"
                style={{ color: '#6B7280' }}
              >
                {t('wizard.details.eventStatus.free.subtitle')}
              </div>
            </button>

            {/* Paid Event (Pro Only) */}
            <button
              onClick={() => {
                if (!isPro) {
                  toast.error(t('wizard.details.errors.proFeaturePaid', 'Paid events are a Pro feature. Please upgrade to select.'));
                  return;
                }
                setEventStatus('paid');
                saveEventBasicDetails({ eventStatus: 'paid' });
              }}
              className={`p-4 rounded-lg border-2 transition-all text-center relative ${!isPro ? 'opacity-80' : ''}`}
              style={{
                borderColor: eventStatus === 'paid' ? '#0684F5' : '#E5E7EB',
                backgroundColor: eventStatus === 'paid' ? '#EFF6FF' : (!isPro ? '#F9FAFB' : 'white'),
                cursor: !isPro ? 'not-allowed' : 'pointer'
              }}
            >
              {!isPro && (
                <div className="absolute top-3 right-3">
                  <Lock size={16} className="text-gray-400" />
                </div>
              )}
              {!isPro && (
                <div className="absolute top-0 right-0 left-0 flex justify-center -mt-3">
                   <span className="bg-[#FACC15] text-[#854D0E] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#EAB308] shadow-sm">PRO</span>
                </div>
              )}
              <DollarSign
                size={24}
                className="mx-auto mb-2"
                style={{ color: eventStatus === 'paid' ? '#0684F5' : (!isPro ? '#9CA3AF' : '#6B7280') }}
              />
              <div
                className="text-sm mb-1"
                style={{ fontWeight: 600, color: !isPro ? '#6B7280' : '#0B2641' }}
              >
                {t('wizard.details.eventStatus.paid.title')}
              </div>
              <div
                className="text-xs"
                style={{ color: '#6B7280' }}
              >
                {t('wizard.details.eventStatus.paid.subtitle')}
              </div>
            </button>

            {/* Continuous Event (Pro Only) */}
            <button
              onClick={() => {
                if (!isPro) {
                  toast.error(t('wizard.details.errors.proFeatureContinuous', 'Continuous events are a Pro feature. Please upgrade to select.'));
                  return;
                }
                setEventStatus('continuous');
                saveEventBasicDetails({ eventStatus: 'continuous' });
              }}
              className={`p-4 rounded-lg border-2 transition-all text-center relative ${!isPro ? 'opacity-80' : ''}`}
              style={{
                borderColor: eventStatus === 'continuous' ? '#0684F5' : '#E5E7EB',
                backgroundColor: eventStatus === 'continuous' ? '#EFF6FF' : (!isPro ? '#F9FAFB' : 'white'),
                cursor: !isPro ? 'not-allowed' : 'pointer'
              }}
            >
              {!isPro && (
                <div className="absolute top-3 right-3">
                  <Lock size={16} className="text-gray-400" />
                </div>
              )}
              {!isPro && (
                <div className="absolute top-0 right-0 left-0 flex justify-center -mt-3">
                   <span className="bg-[#FACC15] text-[#854D0E] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#EAB308] shadow-sm">PRO</span>
                </div>
              )}
              <Infinity
                size={24}
                className="mx-auto mb-2"
                style={{ color: eventStatus === 'continuous' ? '#0684F5' : (!isPro ? '#9CA3AF' : '#6B7280') }}
              />
              <div
                className="text-sm mb-1"
                style={{ fontWeight: 600, color: !isPro ? '#6B7280' : '#0B2641' }}
              >
                {t('wizard.details.eventStatus.continuous.title')}
              </div>
              <div
                className="text-xs"
                style={{ color: '#6B7280' }}
              >
                {t('wizard.details.eventStatus.continuous.subtitle')}
              </div>
            </button>
          </div>

          <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
            {t('wizard.details.eventStatus.helper')}
          </p>
        </div>

        {/* Date & Time Section */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
            {/* Start Date & Time */}
            <div>
              <label className="block text-xs mb-2" style={{ fontWeight: 500, color: '#6B7280' }}>
                {t('wizard.details.fields.startDate.label')} <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border outline-none transition-colors"
                  style={{
                    borderColor: '#10B981',
                    color: '#0B2641'
                  }}
                />
              </div>
            </div>

            {/* End Date & Time */}
            <div>
              <label className="block text-xs mb-2" style={{ fontWeight: 500, color: '#6B7280' }}>
                {t('wizard.details.fields.endDate.label')} <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border outline-none transition-colors"
                  style={{
                    borderColor: '#10B981',
                    color: '#0B2641'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Duration Display */}
        <div className="flex items-center gap-2 text-xs" style={{ color: '#10B981', fontWeight: 500 }}>
          <Check size={14} />
          <span>{t('wizard.details.fields.durationHint')}</span>
        </div>
      </div>

        {/* Event Format */}
        <div>
          <label className="block text-sm mb-4" style={{ fontWeight: 500, color: '#6B7280' }}>
            {t('wizard.details.fields.eventFormat.label')} <span style={{ color: '#EF4444' }}>*</span>
          </label>

          {/* Format Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {formatCards.map((format) => {
              const Icon = format.icon;
              const isSelected = eventFormat === format.id;

              return (
                <button
                  key={format.id}
                  onClick={() => setEventFormat(format.id)}
                  className="p-4 rounded-lg border-2 transition-all text-center"
                  style={{
                    borderColor: isSelected ? '#3B82F6' : '#E5E7EB',
                    backgroundColor: isSelected ? '#F0F9FF' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <Icon
                    size={24}
                    className="mx-auto mb-2"
                    style={{ color: isSelected ? '#3B82F6' : '#6B7280' }}
                  />
                  <div
                    className="text-sm mb-1"
                    style={{ fontWeight: 600, color: '#0B2641' }}
                  >
                    {format.label}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: '#6B7280' }}
                  >
                    {format.description}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Conditional Venue Address */}
          {eventFormat === 'in-person' && (
            <div className="mt-4 space-y-4">
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#6B7280' }}
                />
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder={t('wizard.details.fields.venueAddress.placeholder')}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border outline-none transition-colors"
                  style={{
                    borderColor: '#E5E7EB',
                    color: '#0B2641'
                  }}
                />
              </div>

              {/* Dynamic Map Preview */}
              {debouncedVenueAddress && (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <div className="aspect-video w-full relative">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(debouncedVenueAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      title="Venue Location"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-3 bg-white border-t border-gray-200 flex justify-end">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1.5 transition-opacity hover:opacity-80"
                      style={{ color: '#3B82F6', fontWeight: 500 }}
                    >
                      <MapPin size={14} />
                      {t('wizard.details.fields.venueAddress.addToMaps', 'View on Google Maps')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pro Tip */}
        <ProTipBox />

        {/* Capacity Settings */}
        <div>
          <label className="block text-sm mb-3" style={{ fontWeight: 500, color: '#6B7280' }}>
            {t('wizard.details.capacity.title')}
          </label>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={() => setHasCapacityLimit(!hasCapacityLimit)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: hasCapacityLimit ? '#3B82F6' : '#E5E7EB'
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                style={{
                  left: hasCapacityLimit ? 'calc(100% - 22px)' : '2px'
                }}
              />
            </button>
            <span className="text-sm" style={{ color: '#0B2641' }}>
              {t('wizard.details.capacity.limitLabel')}
            </span>
          </div>

          {hasCapacityLimit && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4 max-sm:grid-cols-1">
                {/* Maximum Attendees */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                    {t('wizard.details.capacity.maxAttendees')}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maxAttendees}
                    onChange={handleMaxAttendeesChange}
                    placeholder={t('wizard.details.capacity.maxAttendeesPlaceholder')}
                    className="w-full h-11 px-4 rounded-lg border outline-none transition-colors"
                    style={{
                      borderColor: '#E5E7EB',
                      color: '#0B2641'
                    }}
                  />
                </div>

                {/* Enable Waitlist Toggle */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                    {t('wizard.details.capacity.waitlistLabel')}
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setEnableWaitlist(!enableWaitlist)}
                      className="relative w-11 h-6 rounded-full transition-colors"
                      style={{
                        backgroundColor: enableWaitlist ? '#3B82F6' : '#E5E7EB'
                      }}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                        style={{
                          left: enableWaitlist ? 'calc(100% - 22px)' : '2px'
                        }}
                      />
                    </button>
                    <span className="text-sm" style={{ color: enableWaitlist ? '#3B82F6' : '#6B7280' }}>
                      {enableWaitlist ? t('wizard.details.capacity.enabled') : t('wizard.details.capacity.disabled')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Waitlist Capacity - Only show when waitlist is enabled */}
              {enableWaitlist && (
                <div className="mb-3">
                  <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                    {t('wizard.details.capacity.waitlistCapacity')}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={waitlistCapacity}
                    onChange={handleWaitlistCapacityChange}
                    placeholder={t('wizard.details.capacity.waitlistPlaceholder')}
                    className="w-full h-11 px-4 rounded-lg border outline-none transition-colors"
                    style={{
                      borderColor: waitlistError ? '#EF4444' : '#E5E7EB',
                      color: '#0B2641'
                    }}
                  />
                  {waitlistError && (
                    <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                      {waitlistError}
                    </p>
                  )}
                  {!waitlistError && (
                    <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
                      {t('wizard.details.capacity.waitlistHelper')}
                    </p>
                  )}
                </div>
              )}

              {/* Helper text */}
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {enableWaitlist
                  ? t('wizard.details.capacity.waitlistEnabledNote')
                  : t('wizard.details.capacity.waitlistDisabledNote')}
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: '#E5E7EB' }} />
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-4 text-sm"
              style={{ backgroundColor: '#FFFFFF', color: '#6B7280', fontWeight: 500 }}
            >
              {t('wizard.details.nextStep')}
            </span>
          </div>
        </div>

        {/* Design Customization Choice */}
        <div>
          <div className="text-center mb-6">
            <h3 className="text-2xl mb-2" style={{ fontWeight: 600, color: '#0B2641' }}>
              {t('wizard.details.designChoice.title')}
            </h3>
            <p className="text-base" style={{ color: '#6B7280' }}>
              {t('wizard.details.designChoice.subtitle')}
            </p>
          </div>

          {/* Choice Cards */}
          <div className="setup-path-grid">
            {/* Design Studio Option */}
            <button
              onClick={() => ensureEventAndNavigate('design')}
              className="group p-8 rounded-xl border-2 transition-all text-left hover:shadow-xl"
              style={{
                borderColor: '#0684F5',
                backgroundColor: '#EFF6FF',
                cursor: 'pointer'
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: '#0684F5' }}
              >
                <Palette size={28} style={{ color: '#FFFFFF' }} />
              </div>

              <h4
                className="text-xl mb-2"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                {t('wizard.details.designChoice.designStudio.title')}
              </h4>

              <p
                className="text-sm mb-4"
                style={{ color: '#6B7280', lineHeight: '1.6' }}
              >
                {t('wizard.details.designChoice.designStudio.body')}
              </p>

              <div className="flex items-center gap-2" style={{ color: '#0684F5', fontWeight: 600 }}>
                <span className="text-sm">{t('wizard.details.designChoice.designStudio.cta')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid #DBEAFE' }}>
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  {t('wizard.details.designChoice.designStudio.note')}
                </p>
              </div>
            </button>

            {/* Skip to Registration Option */}
            <button
              onClick={() => ensureEventAndNavigate('registration')}
              className="group p-8 rounded-xl border-2 transition-all text-left hover:shadow-xl"
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: '#F3F4F6' }}
              >
                <FileText size={28} style={{ color: '#6B7280' }} />
              </div>

              <h4
                className="text-xl mb-2"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                {t('wizard.details.designChoice.registration.title')}
              </h4>

              <p
                className="text-sm mb-4"
                style={{ color: '#6B7280', lineHeight: '1.6' }}
              >
                {t('wizard.details.designChoice.registration.body')}
              </p>

              <div className="flex items-center gap-2" style={{ color: '#6B7280', fontWeight: 600 }}>
                <span className="text-sm">{t('wizard.details.designChoice.registration.cta')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  {t('wizard.details.designChoice.registration.note')}
                </p>
              </div>
            </button>
          </div>

          {/* Info Note */}
          <div
            className="mt-6 p-4 rounded-lg flex items-start gap-3"
            style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
          >
            <Lightbulb size={20} style={{ color: '#0684F5', flexShrink: 0, marginTop: '2px' }} />
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {t('wizard.details.designChoice.helper')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
