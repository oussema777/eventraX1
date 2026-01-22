import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import WizardSidebar from '../components/wizard/WizardSidebar';
import BadgeEditorSimple from '../components/wizard/BadgeEditorSimple';
import TicketsTab from '../components/wizard/TicketsTab';
import CustomFormsTab from '../components/wizard/CustomFormsTab';
import AttendeesTab from '../components/wizard/AttendeesTab';
import MarketingToolsTab from '../components/wizard/MarketingToolsTab';
import SpeakersTab from '../components/wizard/SpeakersTab';
import SessionsTab from '../components/wizard/SessionsTab';
import ExhibitorsTab from '../components/wizard/ExhibitorsTab';
import SponsorsTab from '../components/wizard/SponsorsTab';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { type WizardStep } from '../utils/wizardNavigation';

import { useAuth } from '../contexts/AuthContext';
import { useEventWizard } from '../hooks/useEventWizard';
import { getEventBasicDetails } from '../utils/eventStorage';
import { toast } from 'sonner@2.0.3';
import { useI18n } from '../i18n/I18nContext';

type SubStep = '3.1' | '3.2' | '3.3' | '3.4' | '3.5' | '3.6' | '3.7' | '3.8' | '3.9';

export default function WizardStep3Registration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { eventData, saveDraft, isSaving, isLoading } = useEventWizard();
  const { t } = useI18n();
  const isFreeEvent = (eventData.event_status || getEventBasicDetails().eventStatus || 'free') === 'free';
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentSubStep, setCurrentSubStep] = useState<SubStep>('3.1');
  const [completedSteps, setCompletedSteps] = useState<(1 | 2 | SubStep)[]>([1, 2]);
  const untitledEvent = t('wizard.common.untitledEvent');

  const subSteps = useMemo(() => {
    const steps = [
      { key: '3.1' as const, title: t('wizard.step3.subSteps.tickets') },
      { key: '3.2' as const, title: t('wizard.step3.subSteps.speakers') },
      { key: '3.3' as const, title: t('wizard.step3.subSteps.attendees') },
      { key: '3.4' as const, title: t('wizard.step3.subSteps.exhibitors') },
      { key: '3.5' as const, title: t('wizard.step3.subSteps.schedule') },
      { key: '3.6' as const, title: t('wizard.step3.subSteps.sponsors') },
      { key: '3.8' as const, title: t('wizard.step3.subSteps.customForms') },
      { key: '3.9' as const, title: t('wizard.step3.subSteps.marketingTools') }
    ];
    return isFreeEvent ? steps.filter((step) => step.key !== '3.1') : steps;
  }, [isFreeEvent, t]);

  useEffect(() => {
    if (isFreeEvent && currentSubStep === '3.1') {
      setCurrentSubStep('3.2');
    }
  }, [isFreeEvent, currentSubStep]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subStepParam = params.get('substep') || params.get('sub');
    if (subStepParam && subSteps.some((step) => step.key === subStepParam)) {
      setCurrentSubStep(subStepParam as SubStep);
    }
  }, [location.search, subSteps]);

  useEffect(() => {
    if (!subSteps.some((step) => step.key === currentSubStep)) {
      setCurrentSubStep(subSteps[0]?.key || '3.2');
    }
  }, [subSteps, currentSubStep]);


  const buildDraftPayload = () => {
    const details = getEventBasicDetails();
    return {
      name: details.eventName?.trim() || eventData.name || untitledEvent,
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
    if (!eventData.id) {
      toast.error(t('wizard.step3.errors.saveFirst'));
      return;
    }
    await saveDraft(buildDraftPayload(), false);
    navigate('/draft-saved');
  };

  const handleStepClick = async (step: WizardStep) => {
    if (typeof step === 'string' && step.startsWith('3.')) {
      setCurrentSubStep(step as SubStep);
      return;
    }
    const baseUrl = step === 1 ? 'details' : step === 2 ? 'design' : step === 3 ? 'registration' : 'launch';
    if (eventData.id) {
      navigate(`/create/${baseUrl}/${eventData.id}`);
      return;
    }
    navigate('/create-event');
  };

  const handleSaveAndContinue = async () => {
    if (!eventData.id) {
      toast.error(t('wizard.step3.errors.continueFirst'));
      return;
    }
    // Mark current sub-step as completed
    if (!completedSteps.includes(currentSubStep)) {
      setCompletedSteps([...completedSteps, currentSubStep]);
    }

    // Navigate to next sub-step
    const currentIndex = subSteps.findIndex(s => s.key === currentSubStep);
    if (currentIndex < subSteps.length - 1) {
      setCurrentSubStep(subSteps[currentIndex + 1].key);
    } else {
      // Last sub-step, go to next main step
      navigate(`/create/launch/${eventData.id}`);
    }
  };

  const handleBack = async () => {
    const currentIndex = subSteps.findIndex(s => s.key === currentSubStep);
    if (currentIndex > 0) {
      setCurrentSubStep(subSteps[currentIndex - 1].key);
    } else {
      // First sub-step, go back to previous main step
      if (eventData.id) {
        navigate(`/create/design/${eventData.id}`);
        return;
      }
      navigate('/create-event');
    }
  };

  const getCurrentStepInfo = () => {
    const currentIndex = subSteps.findIndex(s => s.key === currentSubStep);
    return {
      title: subSteps[currentIndex]?.title,
      stepNumber: t('wizard.stepLabels.step3', { current: currentIndex + 1, total: subSteps.length }),
      description: getStepDescription(currentSubStep)
    };
  };

  const getStepDescription = (step: SubStep) => {
    const descriptions: Record<SubStep, string> = {
      '3.1': t('wizard.step3.descriptions.tickets'),
      '3.2': t('wizard.step3.descriptions.speakers'),
      '3.3': t('wizard.step3.descriptions.attendees'),
      '3.4': t('wizard.step3.descriptions.exhibitors'),
      '3.5': t('wizard.step3.descriptions.schedule'),
      '3.6': t('wizard.step3.descriptions.sponsors'),
      '3.7': t('wizard.step3.descriptions.qrBadges'),
      '3.8': t('wizard.step3.descriptions.customForms'),
      '3.9': t('wizard.step3.descriptions.marketingTools')
    };
    return descriptions[step];
  };

  const renderSubStepContent = () => {
    const eventId = eventData.id || '';
    if (!eventId && isLoading) {
      return <div className="text-white p-10 text-center font-bold">{t('wizard.step3.loading')}</div>;
    }
    if (!eventId) {
      return <div className="text-white p-10 text-center font-bold">{t('wizard.step3.missingStep1')}</div>;
    }

    switch (currentSubStep) {
      case '3.1':
        return <TicketsTab eventId={eventId} />;
      case '3.2':
        return <SpeakersTab eventId={eventId} />;
      case '3.3':
        return <AttendeesTab eventId={eventId} />;
      case '3.4':
        return <ExhibitorsTab eventId={eventId} />;
      case '3.5':
        return <SessionsTab 
          eventId={eventId} 
          eventStartDate={eventData.start_date}
          eventEndDate={eventData.end_date}
        />;
      case '3.6':
        return <SponsorsTab eventId={eventId} />;
      case '3.8':
        return <CustomFormsTab eventId={eventId} />;
      case '3.9':
        return <MarketingToolsTab eventId={eventId} />;
      default:
        return <TicketsTab eventId={eventId} />;
    }
  };

  const stepInfo = getCurrentStepInfo();
  const isLastSubStep = currentSubStep === '3.9';

  return (
    <div className="wizard-step-container" style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingTop: '72px' }}>
      <style>{`
        @media (max-width: 500px) {
          .wizard-main-content { padding: 0 !important; padding-bottom: 120px !important; }
          .wizard-card-container { 
            padding: 0 !important; 
            border-radius: 0 !important; 
            border: none !important; 
            margin: 0 !important; 
            box-shadow: none !important;
            width: 100% !important;
            min-height: auto !important;
          }
          .wizard-header-section { padding: 24px 16px !important; margin-bottom: 0 !important; }
          .wizard-header-section h1 { font-size: 24px !important; }
          .wizard-fixed-footer { left: 0 !important; padding: 12px 16px !important; flex-direction: column !important; gap: 12px !important; height: auto !important; }
          .wizard-footer-actions { width: 100% !important; justify-content: space-between !important; }
          .wizard-footer-actions button { flex: 1 !important; }
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

      {/* Main Content with Sidebar */}
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <WizardSidebar
          currentStep={currentSubStep}
          completedSteps={completedSteps as any}
          eventName={eventData.name || untitledEvent}
          onStepClick={handleStepClick}
          onSaveDraft={handleSaveDraft}
          isSaving={isSaving}
          isFreeEvent={isFreeEvent}
        />

        {/* Main Content */}
        <main className="wizard-main-content" style={{ flex: 1, padding: '40px', paddingBottom: '120px' }}>
          <div className="max-w-[1400px] mx-auto">
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
                {stepInfo.stepNumber}
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {stepInfo.title}
              </h1>
              <p style={{ fontSize: '15px', color: '#9CA3AF' }}>
                {stepInfo.description}
              </p>
            </div>

            {/* Sub-Step Content */}
            <div
              className="wizard-card-container"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                padding: '40px',
                minHeight: '500px'
              }}
            >
              {renderSubStepContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Fixed Footer */}
      <div
        className="wizard-fixed-footer"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          left: '280px',
          backgroundColor: 'rgba(11, 38, 65, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 40
        }}
      >
        {/* Left: Back Button */}
        <button
          onClick={handleBack}
          style={{
            height: '44px',
            padding: '0 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <ArrowLeft size={16} />
          {t('wizard.common.back')}
        </button>

        {/* Right: Action Buttons */}
        <div className="wizard-footer-actions" style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSaveDraft}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: 'rgba(6, 132, 245, 0.1)',
              border: '1px solid rgba(6, 132, 245, 0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0684F5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)';
            }}
          >
            <Save size={16} />
            {t('wizard.common.saveDraft')}
          </button>

          <button
            onClick={handleSaveAndContinue}
            style={{
              height: '44px',
              padding: '0 24px',
              backgroundColor: '#0684F5',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0573D9';
              e.currentTarget.style.boxShadow = '0px 4px 12px rgba(6, 132, 245, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0684F5';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLastSubStep ? t('wizard.step3.continueReview') : t('wizard.common.saveContinue')}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
