import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import WizardSidebar from '../components/wizard/WizardSidebar';
import DesignControls, { DesignConfig } from '../components/wizard/DesignControls';
import LivePreview from '../components/wizard/LivePreview';
import DesignFooterActionBar from '../components/wizard/DesignFooterActionBar';
import SuccessToast from '../components/wizard/SuccessToast';
import { useEventWizard } from '../hooks/useEventWizard';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

export default function WizardStep2Design() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user, signOut } = useAuth();
  const { eventData, saveDraft, isSaving } = useEventWizard(eventId);
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#00D4D4');
  const [secondaryColor, setSecondaryColor] = useState('#10B981');
  const [cornerRadius, setCornerRadius] = useState(12);
  const [headingFont, setHeadingFont] = useState('Inter');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [backgroundStyle, setBackgroundStyle] = useState<'solid' | 'gradient' | 'image'>('solid');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isStacked, setIsStacked] = useState(window.innerWidth < 1024);
  const [designConfig, setDesignConfig] = useState<DesignConfig>({});
  const storageKey = (eventData.id || eventId)
    ? `eventra_design_settings_${eventData.id || eventId}`
    : 'eventra_design_settings';

  const persistLocalDesign = (payload: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsStacked(window.innerWidth < 1024);
    };
    handleResize();
    window?.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load from DB
  useEffect(() => {
    if (eventData.id) {
      const localSettings =
        typeof window !== 'undefined'
          ? (() => {
              const raw = window.localStorage.getItem(storageKey);
              return raw ? JSON.parse(raw) : null;
            })()
          : null;
      if (eventData.primary_color) setPrimaryColor(eventData.primary_color);
      if (eventData.secondary_color) setSecondaryColor(eventData.secondary_color);
      if (eventData.branding_settings) {
        const bs = eventData.branding_settings;
        if (bs.cornerRadius) setCornerRadius(bs.cornerRadius);
        if (bs.headingFont) setHeadingFont(bs.headingFont);
        if (bs.bodyFont) setBodyFont(bs.bodyFont);
        if (bs.backgroundStyle) setBackgroundStyle(bs.backgroundStyle);
        if (bs.template) setSelectedTemplate(bs.template);
        if (bs.design_config) {
          setDesignConfig(bs.design_config);
        }
      } else if (localSettings?.branding_settings) {
        const bs = localSettings.branding_settings;
        if (localSettings.primary_color) setPrimaryColor(localSettings.primary_color);
        if (localSettings.secondary_color) setSecondaryColor(localSettings.secondary_color);
        if (bs.cornerRadius) setCornerRadius(bs.cornerRadius);
        if (bs.headingFont) setHeadingFont(bs.headingFont);
        if (bs.bodyFont) setBodyFont(bs.bodyFont);
        if (bs.backgroundStyle) setBackgroundStyle(bs.backgroundStyle);
        if (bs.template) setSelectedTemplate(bs.template);
        if (bs.design_config) {
          setDesignConfig(bs.design_config);
        }
      }
    }
  }, [eventData, storageKey]);

  const ensureEventId = async () => {
    if (eventData.id) return eventData.id;
    const created = await saveDraft(
      {
        name: eventData.name || 'Untitled Event',
        status: 'draft',
        event_format: eventData.event_format || 'in-person'
      },
      true
    );
    return created?.id || eventData.id;
  };

  const handleSaveDraft = async () => {
    const id = await ensureEventId();
    const localPayload = {
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      branding_settings: {
        cornerRadius,
        headingFont,
        bodyFont,
        backgroundStyle,
        template: selectedTemplate,
        design_config: designConfig
      }
    };
    persistLocalDesign(localPayload);
    const nextEvent = await saveDraft({
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      branding_settings: {
        cornerRadius,
        headingFont,
        bodyFont,
        backgroundStyle,
        template: selectedTemplate,
        design_config: designConfig
      }
    });
    setToastMessage('💾 Changes saved');
    setShowToast(true);
    
    // Navigate to next step
    setTimeout(() => {
      const nextId = nextEvent?.id || id;
      if (nextId) navigate(`/create/registration/${nextId}`);
    }, 1000);
  };

  const handleStepClick = (step: any) => {
    if (!eventData.id || !eventData.name?.trim()) {
      toast.error('Please complete Step 1 details before continuing.');
      return;
    }
    if (typeof step === 'string' && step.startsWith('3.')) {
      const base = eventData.id ? `/create/registration/${eventData.id}` : '/create-event';
      navigate(`${base}?substep=${step}`);
      return;
    }
    const baseUrl = step === 1 ? 'details' : step === 2 ? 'design' : step === 3 ? 'registration' : 'launch';
    if (eventData.id) {
      navigate(`/create/${baseUrl}/${eventData.id}`);
    } else {
      navigate('/create-event');
    }
  };

  const handleBlockEdit = (blockId: string) => {
    // Persist block edits when modals save.
    (async () => {
      const id = await ensureEventId();
      if (!id) return;
      const localPayload = {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        branding_settings: {
          cornerRadius,
          headingFont,
          bodyFont,
          backgroundStyle,
          template: selectedTemplate,
          design_config: designConfig
        }
      };
      persistLocalDesign(localPayload);
      await saveDraft({
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        branding_settings: {
          cornerRadius,
          headingFont,
          bodyFont,
          backgroundStyle,
          template: selectedTemplate,
          design_config: designConfig
        }
      });
      setToastMessage('💾 Changes saved');
      setShowToast(true);
    })();
  };

  const handleBlockHover = (blockId: string | null) => {
    setHoveredBlock(blockId);
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#0B2641' }}>
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
      <div style={{ display: 'flex', flex: 1, marginTop: '72px', overflow: isStacked ? 'auto' : 'hidden' }}>
        {/* Sidebar */}
        <WizardSidebar
          currentStep={2}
          completedSteps={eventData.name?.trim() ? [1] : []}
          eventName={eventData.name || 'Untitled Event'}
          onStepClick={handleStepClick}
          onSaveDraft={handleSaveDraft}
          isSaving={isSaving}
        />

        {/* Split Screen Layout */}
        <div
          className="flex-1 flex"
          style={{
            flexDirection: isStacked ? 'column' : 'row',
            overflow: isStacked ? 'visible' : 'hidden',
            height: isStacked ? 'auto' : '100%'
          }}
        >
          {/* Left Panel - Customization Controls */}
          <div
            className="overflow-y-auto"
            style={{
              backgroundColor: 'var(--card)',
              borderRight: isStacked ? 'none' : '1px solid var(--border)',
              borderBottom: isStacked ? '1px solid var(--border)' : 'none',
              width: isStacked ? '100%' : '40%',
              flex: isStacked ? '0 0 auto' : '0 0 40%',
              overflowY: isStacked ? 'visible' : 'auto',
              maxHeight: isStacked ? 'none' : '100%'
            }}
          >
            <DesignControls 
              primaryColor={primaryColor}
              setPrimaryColor={setPrimaryColor}
              secondaryColor={secondaryColor}
              setSecondaryColor={setSecondaryColor}
              cornerRadius={cornerRadius}
              setCornerRadius={setCornerRadius}
              headingFont={headingFont}
              setHeadingFont={setHeadingFont}
              bodyFont={bodyFont}
              setBodyFont={setBodyFont}
              backgroundStyle={backgroundStyle}
              setBackgroundStyle={setBackgroundStyle}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              designConfig={designConfig}
              onDesignConfigChange={setDesignConfig}
              onBlockEdit={handleBlockEdit}
            />
          </div>

          {/* Right Panel - Live Preview */}
          <div
            className="overflow-y-auto"
            style={{
              backgroundColor: 'var(--navy-light)',
              padding: 'clamp(16px, 4vw, 40px)',
              width: isStacked ? '100%' : '60%',
              flex: isStacked ? '0 0 auto' : '0 0 60%',
              overflowY: isStacked ? 'visible' : 'auto',
              maxHeight: isStacked ? 'none' : '100%'
            }}
          >
            <LivePreview 
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              cornerRadius={cornerRadius}
              headingFont={headingFont}
              bodyFont={bodyFont}
              previewDevice={previewDevice}
              setPreviewDevice={setPreviewDevice}
              handleBlockEdit={handleBlockEdit}
              handleBlockHover={handleBlockHover}
              hoveredBlock={hoveredBlock}
              selectedTemplate={selectedTemplate}
              designConfig={designConfig}
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <DesignFooterActionBar 
        onContinue={handleSaveDraft}
        onBack={async () => {
          const id = await ensureEventId();
          if (id) {
            navigate(`/create/details/${id}`);
          } else {
          navigate('/create-event');
          }
        }}
      />
      
      {/* Success Toast */}
      <SuccessToast 
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
      />
    </div>
  );
}
