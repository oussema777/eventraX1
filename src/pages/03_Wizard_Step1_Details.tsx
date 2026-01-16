import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import WizardSidebar from '../components/wizard/WizardSidebar';
import EventDetailsForm from '../components/wizard/EventDetailsForm';
import FooterActionBar from '../components/wizard/FooterActionBar';
import { useAuth } from '../contexts/AuthContext';
import { useEventWizard } from '../hooks/useEventWizard';
import { toast } from 'sonner@2.0.3';
import { getEventBasicDetails } from '../utils/eventStorage';
import { createNotification } from '../lib/notifications';
import { useI18n } from '../i18n/I18nContext';

export default function WizardStep1Details() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { eventData, isSaving, saveDraft } = useEventWizard(eventId);
  const { t } = useI18n();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const untitledEvent = t('wizard.common.untitledEvent');

  const buildDraftPayload = () => {
    const details = getEventBasicDetails();
    const safeName =
      details.eventName?.trim() || draftName.trim() || eventData.name?.trim() || untitledEvent;
    return {
      name: safeName,
      tagline: details.tagline || eventData.tagline,
      event_type: details.eventType === 'Other' && details.otherEventType ? details.otherEventType : details.eventType,
      event_status: details.eventStatus || eventData.event_status || 'free',
      event_format: details.eventFormat || eventData.event_format || 'in-person',
      location_address: details.venueAddress || eventData.location_address,
      start_date: details.startDate || eventData.start_date,
      end_date: details.endDate || eventData.end_date,
      timezone: details.timezone || eventData.timezone,
      capacity_limit: details.hasCapacityLimit ? details.maxAttendees || null : null,
      waitlist_enabled: details.enableWaitlist || eventData.waitlist_enabled || false,
      attendee_settings: {
        waitlist_capacity: details.enableWaitlist ? details.waitlistCapacity || null : null
      }
    };
  };

  const handleSaveDraft = async () => {
    const created = await saveDraft(buildDraftPayload(), !eventData.id);
    const eventName = created?.name || eventData.name || draftName || untitledEvent;
    if (user?.id) {
      try {
        await createNotification({
          recipient_id: user.id,
          actor_id: user.id,
          title: created?.id && !eventData.id
            ? t('wizard.notifications.draftCreatedTitle')
            : t('wizard.notifications.draftSavedTitle'),
          body: t('wizard.notifications.draftSavedBody', { name: eventName }),
          type: 'system',
          action_url: created?.id ? `/event/${created.id}` : '/dashboard'
        });
      } catch {
        // Ignore notification errors
      }
    }
    navigate('/draft-saved');
  };

  const handleContinue = async () => {
    const details = buildDraftPayload();
    const nameToSave = details.name?.trim();
    if (!nameToSave) {
      toast.error(t('wizard.details.errors.nameRequired'));
      return;
    }

    if (details.waitlist_enabled && details.capacity_limit && details.attendee_settings?.waitlist_capacity) {
      if (details.attendee_settings.waitlist_capacity > details.capacity_limit) {
        toast.error("Waitlist capacity cannot be more than max attendees");
        return;
      }
    }

    const nextEvent = await saveDraft({
      ...details,
      status: eventData.status || 'draft'
    }, !eventData.id);
    const id = nextEvent?.id || eventData.id;
    if (id) {
      if (user?.id && nextEvent?.id && !eventData.id) {
        try {
          await createNotification({
            recipient_id: user.id,
            actor_id: user.id,
            title: t('wizard.notifications.draftCreatedTitle'),
            body: t('wizard.notifications.readyToDesign', {
              name: nextEvent.name || details.name || untitledEvent
            }),
            type: 'system',
            action_url: `/create/design/${id}`
          });
        } catch {
          // Ignore notification errors
        }
      }
      navigate(`/create/design/${id}`);
    }
  };

  const handleStepClick = async (step: any) => {
    // If we already have an ID, just navigate
    if (eventData.id) {
      if (typeof step === 'string' && step.startsWith('3.')) {
        navigate(`/create/registration/${eventData.id}?substep=${step}`);
        return;
      }
      const baseUrl = step === 1 ? 'details' : step === 2 ? 'design' : step === 3 ? 'registration' : 'launch';
      navigate(`/create/${baseUrl}/${eventData.id}`);
      return;
    }

    // If no ID (new event), validate and save first
    const details = getEventBasicDetails();
    if (!details.eventName?.trim()) {
      toast.error(t('wizard.details.errors.nameRequired', 'Event name is required.'));
      return;
    }
    if (!details.startDate || !details.endDate) {
      toast.error(t('wizard.details.errors.datesRequired', 'Please select start and end dates.'));
      return;
    }

    // Auto-save and create event
    try {
      const payload = buildDraftPayload();
      const nextEvent = await saveDraft({
        ...payload,
        status: 'draft'
      }, true); // force insert

      if (nextEvent?.id) {
        if (typeof step === 'string' && step.startsWith('3.')) {
          navigate(`/create/registration/${nextEvent.id}?substep=${step}`);
          return;
        }
        const baseUrl = step === 1 ? 'details' : step === 2 ? 'design' : step === 3 ? 'registration' : 'launch';
        navigate(`/create/${baseUrl}/${nextEvent.id}`);
      }
    } catch (error) {
      toast.error(t('wizard.details.errors.saveFailed', 'Failed to save event.'));
    }
  };

  return (
    <div className="wizard-step-container" style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingTop: '72px' }}>
      <style>{`
        @media (max-width: 500px) {
          .wizard-main-content { padding: 0 !important; padding-bottom: 120px !important; }
          .wizard-card-container { 
            padding: 0px !important; 
            border-radius: 0 !important; 
            border: none !important; 
            margin: 0 !important; 
            box-shadow: none !important;
            width: 100% !important;
          }
          .wizard-header-section { padding: 24px 16px !important; margin-bottom: 0 !important; }
          .wizard-header-section h1 { font-size: 24px !important; }
        }
      `}</style>
      {/* Fixed Navigation */}
      <NavbarLoggedIn 
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        currentPage="wizard"
        userName={user?.user_metadata?.full_name}
        userEmail={user?.email}
        onLogout={signOut}
      />

      {/* Sidebar Navigation */}
      <div style={{ display: 'flex' }}>
        <WizardSidebar
          currentStep={1}
          completedSteps={[]}
          eventName={eventData.name || untitledEvent}
          onStepClick={handleStepClick}
          onSaveDraft={handleSaveDraft}
          isSaving={isSaving}
        />

        {/* Main Content */}
        <main className="wizard-main-content" style={{ flex: 1, padding: 'clamp(20px, 4vw, 40px)', paddingBottom: '120px' }}>
          <div className="max-w-[900px] mx-auto">
            {/* Header */}
            <div className="wizard-header-section" style={{ marginBottom: '32px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0684F5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}
              >
                {t('wizard.stepLabels.step1')}
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {t('wizard.step1.title')}
              </h1>
              <p style={{ fontSize: '15px', color: '#94A3B8' }}>
                {t('wizard.step1.subtitle')}
              </p>
            </div>

            {/* Form */}
            <div
              className="wizard-card-container"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                padding: 'clamp(20px, 4vw, 40px)'
              }}
            >
              <EventDetailsForm onNameChange={setDraftName} />
            </div>
          </div>
        </main>
      </div>

      {/* Sticky Footer */}
      <FooterActionBar 
        currentStep={1}
        onBack={() => navigate('/dashboard')}
        onContinue={handleContinue}
        onSaveDraft={handleSaveDraft}
        isBackDisabled={true}
      />
    </div>
  );
}
