import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import WizardSidebar from '../components/wizard/WizardSidebar';
import LaunchHeader from '../components/wizard/LaunchHeader';
import EventSummaryCard from '../components/wizard/EventSummaryCard';
import IntegrationsSection from '../components/wizard/IntegrationsSection';
import SEOSection from '../components/wizard/SEOSection';
import PaymentGatewaySection from '../components/wizard/PaymentGatewaySection';
import PrivacySection from '../components/wizard/PrivacySection';
import LaunchChecklist from '../components/wizard/LaunchChecklist';
import PublishConfirmation from '../components/wizard/PublishConfirmation';
import LaunchFooterActionBar from '../components/wizard/LaunchFooterActionBar';

import { useAuth } from '../contexts/AuthContext';
import { useEventWizard } from '../hooks/useEventWizard';
import { toast } from 'sonner@2.0.3';
import { createNotification } from '../lib/notifications';
import { useI18n } from '../i18n/I18nContext';

export default function WizardStep4Launch() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user, signOut } = useAuth();
  const { eventData, saveDraft, isSaving } = useEventWizard(eventId);
  const { t } = useI18n();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const untitledEvent = t('wizard.common.untitledEvent');

  const handlePublish = async () => {
    try {
      if (!eventData.id) {
        toast.error(t('wizard.step4.errors.publishFirst'));
        return;
      }
      await saveDraft({
        status: 'published',
        is_public: true
      });
      if (user?.id) {
        try {
          await createNotification({
            recipient_id: user.id,
            actor_id: user.id,
            title: t('wizard.notifications.publishedTitle'),
            body: t('wizard.notifications.publishedBody', {
              name: eventData.name || t('wizard.common.yourEvent')
            }),
            type: 'system',
            action_url: eventData.id ? `/event/${eventData.id}` : null
          });
        } catch {
          // Notifications should not block publish.
        }
      }
      toast.success(t('wizard.step4.toasts.publishedSuccess'));
      navigate(`/success-live?eventId=${eventData.id}`);
    } catch (error) {
      toast.error(t('wizard.step4.toasts.publishFailed'));
    }
  };

  const handleSaveDraft = async () => {
    if (!eventData.id) {
      toast.error(t('wizard.step4.errors.saveFirst'));
      return;
    }
    await saveDraft({ status: 'draft' });
    toast.success(t('wizard.step4.toasts.draftSaved'));
  };

  const handleStepClick = async (step: any) => {
    if (typeof step === 'string' && step.startsWith('3.')) {
      const base = eventData.id ? `/create/registration/${eventData.id}` : '/create-event';
      navigate(`${base}?substep=${step}`);
      return;
    }
    const baseUrl = step === 1 ? 'details' : step === 2 ? 'design' : step === 3 ? 'registration' : 'launch';
    if (eventData.id) {
      navigate(`/create/${baseUrl}/${eventData.id}`);
      return;
    }
    navigate('/create-event');
  };

  const handlePreview = () => {
    if (eventData.id) {
      window.open(`/event/${eventData.id}/landing`, '_blank');
    } else {
      toast.error(t('wizard.step4.errors.saveFirst', 'Please save event details first.'));
    }
  };

  return (
    <div className="wizard-step-container" style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingTop: '72px' }}>
      <style>{`
        @media (max-width: 1024px) {
          .wizard-sidebar-container { display: none !important; }
          .launch-main-content { padding: 24px !important; }
          .launch-header h1 { font-size: 24px !important; }
        }
        @media (max-width: 500px) {
          .launch-main-content { padding: 0 !important; padding-bottom: 120px !important; }
          .launch-header { padding: 24px 16px !important; margin-bottom: 0 !important; }
          .max-w-[1000px] { width: 100% !important; margin: 0 !important; }
          .space-y-8 > * { margin-top: 0 !important; }
          /* Targets child sections like EventSummaryCard, IntegrationsSection etc */
          .max-w-[1000px] > div { 
            border-radius: 0 !important; 
            border-left: none !important; 
            border-right: none !important; 
            margin-bottom: 16px !important; 
          }
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
        <div className="wizard-sidebar-container">
          <WizardSidebar
            currentStep={4}
            completedSteps={eventData.name?.trim() ? [1, 2, 3] : []}
            eventName={eventData.name || untitledEvent}
            onStepClick={handleStepClick}
            onSaveDraft={handleSaveDraft}
            isSaving={isSaving}
          />
        </div>

        {/* Main Content */}
        <main className="launch-main-content" style={{ flex: 1, padding: '40px', paddingBottom: '120px' }}>
          <div className="max-w-[1000px] mx-auto space-y-8">
            {/* Header */}
            <div className="launch-header" style={{ marginBottom: '32px' }}>
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
                {t('wizard.stepLabels.step4')}
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {t('wizard.step4.title')}
              </h1>
              <p style={{ fontSize: '15px', color: '#9CA3AF' }}>
                {t('wizard.step4.subtitle')}
              </p>
            </div>

            {/* Event Summary */}
            <EventSummaryCard />

            {/* Integrations */}
            <IntegrationsSection />

            {/* SEO Settings */}
            <SEOSection />

            {/* Payment Gateway (PRO) */}
            <PaymentGatewaySection />

            {/* Privacy & Visibility */}
            <PrivacySection />

            {/* Launch Checklist */}
            <LaunchChecklist />

            {/* Publish Confirmation */}
            <PublishConfirmation />

            {/* Bottom spacing for sticky footer */}
            <div className="h-32" />
          </div>
        </main>

        {/* Sticky Footer */}
      <LaunchFooterActionBar 
        onPublish={handlePublish}
        onSaveDraft={handleSaveDraft}
        onPreview={handlePreview}
        onBack={() => {
      if (eventData.id) {
        navigate(`/create/registration/${eventData.id}`);
        return;
      }
      navigate('/create-event');
    }}
      />
      </div>
    </div>
  );
}
