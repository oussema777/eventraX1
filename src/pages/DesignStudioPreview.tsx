import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import HeroBlock from '../components/design-studio/blocks/HeroBlock';
import AboutBlock from '../components/design-studio/blocks/AboutBlock';
import EventDetailsBlock from '../components/design-studio/blocks/EventDetailsBlock';
import SpeakersBlock from '../components/design-studio/blocks/SpeakersBlock';
import AgendaBlock from '../components/design-studio/blocks/AgendaBlock';
import TicketsBlock from '../components/design-studio/blocks/TicketsBlock';
import FooterBlock from '../components/design-studio/blocks/FooterBlock';
import SponsorsBlock from '../components/design-studio/blocks/SponsorsBlock';
import SponsorPackagesBlock from '../components/design-studio/blocks/SponsorPackagesBlock';
import NetworkingBlock from '../components/design-studio/blocks/NetworkingBlock';
import ExhibitorsBlock from '../components/design-studio/blocks/ExhibitorsBlock';
import CountdownBlock from '../components/design-studio/blocks/CountdownBlock';
import TestimonialsBlock from '../components/design-studio/blocks/TestimonialsBlock';
import VideoHeroBlock from '../components/design-studio/blocks/VideoHeroBlock';

interface ActiveBlock {
  id: string;
  blockId?: string;
  type?: string;
  isVisible: boolean;
  settings?: Record<string, any>;
}

interface PreviewData {
  activeBlocks: ActiveBlock[];
  brandColor: string;
  buttonRadius: number;
  logoUrl?: string;
  content?: any;
}

export default function DesignStudioPreview() {
  const [previewData, setPreviewData] = useState<PreviewData>({
    activeBlocks: [],
    brandColor: '#635BFF',
    buttonRadius: 12,
    logoUrl: '',
    content: null
  });

  useEffect(() => {
    // Load preview data from localStorage
    const savedData = localStorage.getItem('designStudioPreview');
    const savedContent = localStorage.getItem('designStudioContent');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const parsedContent = savedContent ? JSON.parse(savedContent) : null;
        
        setPreviewData({
          ...parsedData,
          content: parsedContent
        });
      } catch (error) {
        console.error('Failed to parse preview data:', error);
      }
    }
  }, []);

  const renderBlock = (block: ActiveBlock) => {
    if (!block.isVisible) return null;

    const { content } = previewData;
    const blockProps = {
      brandColor: previewData.brandColor,
      buttonRadius: previewData.buttonRadius,
      showEditControls: false
    };

    const blockType = block.blockId || block.type;
    switch (blockType) {
      case 'hero':
        return <HeroBlock key={block.id} {...blockProps} event={content?.event} settings={block.settings} logoUrl={previewData.logoUrl} />;
      case 'about':
        // Apply settings overrides if present, otherwise use event data
        const aboutData = {
          name: block.settings?.title || content?.event?.name,
          tagline: block.settings?.subtitle || content?.event?.tagline,
          description: block.settings?.description || content?.event?.description,
          features: block.settings?.features || undefined
        };
        return <AboutBlock key={block.id} {...blockProps} event={aboutData} />;
      case 'event-details':
      case 'details':
        return <EventDetailsBlock key={block.id} {...blockProps} event={content?.event} />;
      case 'speakers':
        return <SpeakersBlock key={block.id} {...blockProps} speakers={content?.speakers} />;
      case 'agenda':
        return <AgendaBlock key={block.id} {...blockProps} sessions={content?.sessions} days={content?.days} />;
      case 'tickets':
        return <TicketsBlock key={block.id} {...blockProps} tickets={content?.tickets} />;
      case 'footer':
        return <FooterBlock key={block.id} {...blockProps} settings={block.settings} event={content?.event} />;
      case 'video-hero':
        return <VideoHeroBlock key={block.id} {...blockProps} settings={block.settings} />;
      case 'sponsors':
        return <SponsorsBlock key={block.id} {...blockProps} sponsors={content?.sponsors} packages={content?.sponsorPackages} settings={block.settings} />;
      case 'sponsor-packages':
        return <SponsorPackagesBlock key={block.id} {...blockProps} packages={content?.sponsorPackages} settings={block.settings} />;
      case 'networking':
        return <NetworkingBlock key={block.id} {...blockProps} settings={block.settings} />;
      case 'exhibitors':
        return <ExhibitorsBlock key={block.id} {...blockProps} exhibitors={content?.exhibitors} settings={block.settings} />;
      case 'countdown':
        return <CountdownBlock key={block.id} {...blockProps} targetDate={content?.event?.start_date} settings={block.settings} />;
      case 'testimonials':
        return <TestimonialsBlock key={block.id} {...blockProps} settings={block.settings} />;
      default:
        return null;
    }
  };

  const handleClose = () => {
    window.close();
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', position: 'relative' }}>
      {/* Close Button (floating) */}
      <button
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '48px',
          height: '48px',
          backgroundColor: '#0B2641',
          border: 'none',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#635BFF';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#0B2641';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <X size={24} style={{ color: '#FFFFFF' }} />
      </button>

      {/* Preview Notice Banner */}
      <div
        style={{
          backgroundColor: '#635BFF',
          color: '#FFFFFF',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        🎨 Preview Mode - This is how your event page will look to visitors
      </div>

      {/* Render all visible blocks */}
      <div>
        {previewData.activeBlocks.length > 0 ? (
          previewData.activeBlocks.map((block) => renderBlock(block))
        ) : (
          <div
            style={{
              minHeight: 'calc(100vh - 48px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                fontSize: '64px',
                marginBottom: '20px',
                opacity: 0.5
              }}
            >
              📄
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1D1F', marginBottom: '12px' }}>
              No Content Yet
            </h2>
            <p style={{ fontSize: '16px', color: '#6F767E', maxWidth: '500px' }}>
              Start adding blocks in the Design Studio to see your event page come to life!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
