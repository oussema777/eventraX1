import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import WizardSidebar from '../components/wizard/WizardSidebar';
import BlockLibraryPanel from '../components/design-studio/BlockLibraryPanel';
import PreviewPanel from '../components/design-studio/PreviewPanel';
import HeroBlock from '../components/design-studio/blocks/HeroBlock';
import AboutBlock from '../components/design-studio/blocks/AboutBlock';
import EventDetailsBlock from '../components/design-studio/blocks/EventDetailsBlock';
import SpeakersBlock from '../components/design-studio/blocks/SpeakersBlock';
import AgendaBlock from '../components/design-studio/blocks/AgendaBlock';
import TicketsBlock from '../components/design-studio/blocks/TicketsBlock';
import FooterBlock from '../components/design-studio/blocks/FooterBlock';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { type WizardStep } from '../utils/wizardNavigation';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../contexts/AuthContext';
import { useEventWizard } from '../hooks/useEventWizard';
import { uploadEventLogo } from '../utils/storage';
import { usePlan } from '../hooks/usePlan';
import { useI18n } from '../i18n/I18nContext';
import { useSpeakers } from '../hooks/useSpeakers';
import { useSessions } from '../hooks/useSessions';
import { useTickets } from '../hooks/useTickets';
import AboutBlockSettingsModal from '../components/design-studio/modals/AboutBlockSettingsModal';
import FooterBlockSettingsModal from '../components/design-studio/modals/FooterBlockSettingsModal';
import HeroBlockSettingsModal from '../components/design-studio/modals/HeroBlockSettingsModal';

interface Block {
  id: string;
  name: string;
  type: string;
  description: string;
  tier: 'FREE' | 'PRO';
  thumbnail: string;
  icon: any;
}

interface ActiveBlock extends Block {
  position: number;
  isVisible: boolean;
  settings?: any;
}

export default function WizardStep2DesignStudio() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user, signOut } = useAuth();
  const { eventData, saveDraft, isSaving: isEventSaving } = useEventWizard(eventId);
  const { speakers } = useSpeakers();
  const { sessions } = useSessions(eventId);
  const { tickets } = useTickets();
  const { isPro } = usePlan();
  const { t } = useI18n();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<(1 | 2 | 3 | 4)[]>([]);
  const [activeBlocks, setActiveBlocks] = useState<ActiveBlock[]>([]);
  const [brandColor, setBrandColor] = useState('#635BFF');
  const [brandColorSecondary, setBrandColorSecondary] = useState('#7C75FF');
  const [fontFamily, setFontFamily] = useState('inter');
  const [buttonRadius, setButtonRadius] = useState(12);
  const [logoUrl, setLogoUrl] = useState('');
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 1024);
  const [settingsBlockId, setSettingsBlockId] = useState<string | null>(null);
  const storageKey = useMemo(() => {
    const id = eventData.id || eventId;
    return id ? `eventra_design_studio_${id}` : 'eventra_design_studio';
  }, [eventData.id, eventId]);
  const untitledEvent = t('wizard.common.untitledEvent');

  useEffect(() => {
    if (!eventData.id) return;
    setCompletedSteps(eventData.name?.trim() ? [1] : []);
    const localSettings =
      typeof window !== 'undefined'
        ? (() => {
            const raw = window.localStorage.getItem(storageKey);
            return raw ? JSON.parse(raw) : null;
          })()
        : null;
    const studioSettings = eventData.branding_settings?.design_studio;
    const source = studioSettings || localSettings;
    if (source?.activeBlocks) setActiveBlocks(source.activeBlocks);
    if (source?.brandColor) setBrandColor(source.brandColor);
    if (source?.brandColorSecondary) setBrandColorSecondary(source.brandColorSecondary);
    if (source?.fontFamily) setFontFamily(source.fontFamily);
    if (source?.buttonRadius) setButtonRadius(source.buttonRadius);
    if (source?.logoUrl) setLogoUrl(source.logoUrl);
  }, [eventData, storageKey]);

  useEffect(() => {
    const handleResize = () => {
      setIsNarrow(window.innerWidth < 1024);
    };
    handleResize();
    window?.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    persistLocalDesign({ brandColor, brandColorSecondary, fontFamily, buttonRadius, activeBlocks, logoUrl });
  }, [brandColor, brandColorSecondary, fontFamily, buttonRadius, activeBlocks, logoUrl, storageKey]);

  const persistLocalDesign = (payload: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  };

  const buildDesignPayload = (overrides: Record<string, any> = {}) => ({
    brandColor,
    brandColorSecondary,
    fontFamily,
    buttonRadius,
    activeBlocks,
    logoUrl,
    ...overrides
  });

  const persistAndSave = async () => {
    const payload = buildDesignPayload();
    persistLocalDesign(payload);
    if (!eventData.id) return;
    await saveDraft({
      branding_settings: {
        ...(eventData.branding_settings || {}),
        design_studio: payload
      }
    });
  };

  const handleSaveDraft = async () => {
    if (!eventData.id) {
      toast.error(t('wizard.designStudio.errors.saveFirst'));
      return;
    }
    await persistAndSave();
    navigate('/draft-saved');
  };

  const handleStepClick = async (step: WizardStep) => {
    if (typeof step === 'string' && step.startsWith('3.')) {
      await persistAndSave();
      const base = eventData.id ? `/create/registration/${eventData.id}` : '/create-event';
      navigate(`${base}?substep=${step}`);
      return;
    }
    await persistAndSave();
    const target =
      step === 1 ? 'details' : step === 2 ? 'design' : step === 3 ? 'registration' : 'launch';
    if (eventData.id) {
      navigate(`/create/${target}/${eventData.id}`);
      return;
    }
    navigate('/create-event');
  };

  const handleAddBlock = (block: Block) => {
    const newBlock: ActiveBlock = {
      ...block,
      position: activeBlocks.length,
      isVisible: true
    };
    setActiveBlocks([...activeBlocks, newBlock]);
  };

  const handleRemoveBlock = (blockId: string) => {
    setActiveBlocks(activeBlocks.filter(block => block.id !== blockId));
  };

  const handleReorderBlocks = (blocks: ActiveBlock[]) => {
    setActiveBlocks(blocks);
  };

  const handleToggleVisibility = (blockId: string) => {
    setActiveBlocks(
      activeBlocks.map(block =>
        block.id === blockId ? { ...block, isVisible: !block.isVisible } : block
      )
    );
  };

  const handleOpenSettings = (blockId: string) => {
    setSettingsBlockId(blockId);
  };

  const handleSaveBlockSettings = async (blockId: string, settings: any) => {
    setActiveBlocks(prev => 
      prev.map(block => block.id === blockId ? { ...block, settings } : block)
    );
    toast.success(t('common.updated', 'Updated successfully'));
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleLogoUpload = async (file: File) => {
    const id = eventData.id || eventId;
    if (!id) {
      toast.error(t('wizard.designStudio.errors.uploadFirst'));
      return;
    }
    setIsLogoUploading(true);
    try {
      const url = await uploadEventLogo(id, file);
      if (!url) {
        toast.error(t('wizard.designStudio.errors.uploadFailed'));
        return;
      }
      setLogoUrl(url);
      const payload = buildDesignPayload({ logoUrl: url });
      persistLocalDesign(payload);
      if (eventData.id) {
        await saveDraft({
          branding_settings: {
            ...(eventData.branding_settings || {}),
            design_studio: payload
          }
        });
      }
    } catch (error) {
      console.error('Logo upload failed:', error);
      toast.error(t('wizard.designStudio.errors.uploadFailed'));
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleBack = async () => {
    if (eventData.id) {
      navigate(`/create/details/${eventData.id}`);
      return;
    }
    navigate('/create-event');
  };

  const handleSaveAndContinue = async () => {
    // Mark step 2 as completed
    if (!completedSteps.includes(2)) {
      setCompletedSteps([...completedSteps, 2]);
    }

    await persistAndSave();
    if (eventData.id) {
      navigate(`/create/registration/${eventData.id}`);
      return;
    }
    navigate('/create-event');
  };

  const mappedSpeakers = useMemo(() => (speakers || []).map(s => ({
    name: s.full_name,
    title: s.title,
    company: s.company,
    avatarUrl: s.photo
  })), [speakers]);

  const mappedSessions = useMemo(() => (sessions || []).map(s => {
    const startTime = new Date(s.startTime);
    const startDate = new Date(eventData.start_date || '');
    const day = Math.max(1, Math.ceil((startTime.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    
    return {
      day: day,
      time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: `${s.duration} min`,
      title: s.title,
      location: s.venue,
      tags: s.tags
    };
  }), [sessions, eventData.start_date]);

  const mappedDays = useMemo(() => {
    const uniqueDays = Array.from(new Set(mappedSessions.map(s => s.day))).sort((a, b) => a - b);
    return uniqueDays.map(d => {
      const date = new Date(eventData.start_date || '');
      if (!isNaN(date.getTime())) {
        date.setDate(date.getDate() + (d - 1));
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        return {
          day: d,
          label: `Day ${d} • ${dateStr}`
        };
      }
      return {
        day: d,
        label: t('wizard.designStudio.agenda.dayLabel', { number: d })
      };
    });
  }, [mappedSessions, eventData.start_date, t]);

  const mappedTickets = useMemo(() => (tickets || []).map(t => ({
    name: t.name,
    price: `${t.price} ${t.currency || 'USD'}`,
    popular: t.isPro,
    features: t.includes || []
  })), [tickets]);

  const previewContent = useMemo(() => ({
    event: eventData,
    speakers: mappedSpeakers,
    sessions: mappedSessions,
    days: mappedDays,
    tickets: mappedTickets
  }), [eventData, mappedSpeakers, mappedSessions, mappedDays, mappedTickets]);

  const renderBlock = (block: ActiveBlock) => {
    if (!block.isVisible) return null;

    const isLocked = block.tier === 'PRO' && !isPro;

    switch (block.type) {
      case 'hero':
        return <HeroBlock key={block.id} isLocked={isLocked} event={eventData} brandColor={brandColor} brandColorSecondary={brandColorSecondary} buttonRadius={buttonRadius} logoUrl={logoUrl} settings={block.settings} onEdit={() => handleOpenSettings(block.id)} />;
      case 'about':
        const aboutData = {
          name: block.settings?.title || eventData.name,
          tagline: block.settings?.subtitle || eventData.tagline,
          description: block.settings?.description || eventData.description,
          features: block.settings?.features || undefined,
          image: block.settings?.image
        };
        return <AboutBlock key={block.id} event={aboutData} brandColor={brandColor} onEdit={() => handleOpenSettings(block.id)} />;
      case 'details':
        return <EventDetailsBlock key={block.id} event={eventData} brandColor={brandColor} onEdit={() => handleOpenSettings(block.id)} />;
      case 'speakers':
        return <SpeakersBlock key={block.id} speakers={mappedSpeakers} brandColor={brandColor} onEdit={() => handleOpenSettings(block.id)} />;
      case 'agenda':
        return (
          <AgendaBlock 
            key={block.id} 
            days={mappedDays.length > 0 ? mappedDays : undefined} 
            sessions={mappedSessions} 
            brandColor={brandColor} 
            buttonRadius={buttonRadius} 
            onEdit={() => handleOpenSettings(block.id)}
          />
        );
      case 'tickets':
        return <TicketsBlock key={block.id} tickets={mappedTickets} brandColor={brandColor} buttonRadius={buttonRadius} onEdit={() => handleOpenSettings(block.id)} />;
      case 'footer':
        return <FooterBlock key={block.id} settings={block.settings} brandColor={brandColor} event={eventData} onEdit={() => handleOpenSettings(block.id)} />;
      default:
        return (
          <div
            key={block.id}
            style={{
              padding: '80px 40px',
              backgroundColor: '#F4F5F6',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{block.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1A1D1F', marginBottom: '8px' }}>
              {block.name}
            </div>
            <div style={{ fontSize: '16px', color: '#6F767E' }}>
              {block.description}
            </div>
            {isLocked && (
              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={handleUpgrade}
                  style={{
                    height: '48px',
                    padding: '0 32px',
                    backgroundColor: '#635BFF',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  {t('wizard.designStudio.upgradeUnlock')}
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  const selectedBlock = activeBlocks.find(b => b.id === settingsBlockId);

  return (
    <div style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingTop: '72px' }}>
      {/* Fixed Navigation */}
      <NavbarLoggedIn
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        currentPage="wizard"
        userName={user?.user_metadata?.full_name}
        userEmail={user?.email}
        onLogout={signOut}
      />

      {/* Main Layout */}
      <div style={{ display: 'flex' }}>
        {/* Wizard Sidebar */}
        <WizardSidebar
          currentStep={2}
          completedSteps={completedSteps as any}
          eventName={eventData.name || untitledEvent}
          onStepClick={handleStepClick as any}
          onSaveDraft={handleSaveDraft}
          isSaving={isEventSaving}
        />

        {/* Content Area - Split View */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isNarrow ? 'column' : 'row',
            height: isNarrow ? 'auto' : 'calc(100vh - 72px)',
            paddingBottom: isNarrow ? '120px' : '80px',
            gap: isNarrow ? '24px' : '0'
          }}
        >
          {/* Left: Block Library Panel */}
          <BlockLibraryPanel
            activeBlocks={activeBlocks}
            onAddBlock={handleAddBlock}
            onRemoveBlock={handleRemoveBlock}
            onReorderBlocks={handleReorderBlocks}
            onToggleVisibility={handleToggleVisibility}
            onOpenSettings={handleOpenSettings}
            onUpgrade={handleUpgrade}
            isPro={isPro}
            brandColor={brandColor}
            onBrandColorChange={setBrandColor}
            brandColorSecondary={brandColorSecondary}
            onBrandColorSecondaryChange={setBrandColorSecondary}
            fontFamily={fontFamily}
            onFontFamilyChange={setFontFamily}
            buttonRadius={buttonRadius}
            onButtonRadiusChange={setButtonRadius}
            logoUrl={logoUrl}
            onLogoUpload={handleLogoUpload}
            isLogoUploading={isLogoUploading}
          />

          {/* Right: Preview Panel */}
          <PreviewPanel
            activeBlocks={activeBlocks}
            brandColor={brandColor}
            brandColorSecondary={brandColorSecondary}
            fontFamily={fontFamily}
            buttonRadius={buttonRadius}
            logoUrl={logoUrl}
            eventId={eventData.id || eventId}
            previewContent={previewContent}
          >
            {activeBlocks.filter((b) => b.isVisible).map((block) => renderBlock(block))}
          </PreviewPanel>
        </div>
      </div>

      {/* Fixed Footer */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          left: isNarrow ? '56px' : '280px',
          backgroundColor: '#0B2641',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px clamp(16px, 4vw, 40px)',
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
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
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
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <ArrowLeft size={16} />
          {t('wizard.common.back')}
        </button>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSaveDraft}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid #635BFF',
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
              e.currentTarget.style.backgroundColor = 'rgba(99, 91, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
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
              backgroundColor: '#635BFF',
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
              e.currentTarget.style.backgroundColor = '#7C75FF';
              e.currentTarget.style.boxShadow = '0px 4px 12px rgba(99, 91, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#635BFF';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {t('wizard.common.saveContinue')}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <AboutBlockSettingsModal
        isOpen={settingsBlockId === 'about'}
        onClose={() => setSettingsBlockId(null)}
        eventData={{
          name: selectedBlock?.settings?.title || eventData.name,
          tagline: selectedBlock?.settings?.subtitle || eventData.tagline,
          description: selectedBlock?.settings?.description || eventData.description,
          features: selectedBlock?.settings?.features,
          image: selectedBlock?.settings?.image
        }}
        onSave={(data) => handleSaveBlockSettings('about', { 
          title: data.name, 
          subtitle: data.tagline, 
          description: data.description,
          features: data.features,
          image: data.image
        })}
      />

      <HeroBlockSettingsModal
        isOpen={settingsBlockId === 'hero'}
        onClose={() => setSettingsBlockId(null)}
        currentSettings={selectedBlock?.settings || {}}
        onSave={(data) => handleSaveBlockSettings('hero', data)}
        isSaving={isEventSaving}
      />

      <FooterBlockSettingsModal
        isOpen={settingsBlockId === 'footer'}
        onClose={() => setSettingsBlockId(null)}
        settings={selectedBlock?.settings || {}}
        onSave={(data) => handleSaveBlockSettings('footer', data)}
        isSaving={isEventSaving}
      />
    </div>
  );
}
