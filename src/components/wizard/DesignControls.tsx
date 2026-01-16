import { useState } from 'react';
import { 
  Palette, 
  ChevronDown, 
  Layout, 
  Settings,
  Image,
  Calendar,
  AlignLeft,
  Users,
  Star,
  Clock,
  MapPin,
  HelpCircle,
  Ticket,
  GripVertical,
  Crown,
  Edit2,
  Upload,
  Video,
  Lock,
  Store
} from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import HeroCoverModal, { HeroCoverData } from './modals/HeroCoverModal';
import AboutSectionModal, { AboutSectionData } from './modals/AboutSectionModal';
import SpeakersGridModal, { SpeakersGridData } from './modals/SpeakersGridModal';
import VideoSettingsModal, { VideoSettingsData } from './modals/VideoSettingsModal';
import UpgradeModal from './modals/UpgradeModal';
import DraggableContentBlock from './DraggableContentBlock';
import { usePlan } from '../../hooks/usePlan';

interface DesignControlsProps {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  cornerRadius: number;
  setCornerRadius: (radius: number) => void;
  headingFont: string;
  setHeadingFont: (font: string) => void;
  bodyFont: string;
  setBodyFont: (font: string) => void;
  backgroundStyle: 'solid' | 'gradient' | 'image';
  setBackgroundStyle: (style: 'solid' | 'gradient' | 'image') => void;
  onBlockEdit?: (blockId: string) => void;
  onBlockHover?: (blockId: string | null) => void;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
}

export default function DesignControls({
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  cornerRadius,
  setCornerRadius,
  headingFont,
  setHeadingFont,
  bodyFont,
  setBodyFont,
  backgroundStyle,
  setBackgroundStyle,
  onBlockEdit,
  onBlockHover,
  selectedTemplate,
  setSelectedTemplate
}: DesignControlsProps) {
  const [expandedAccordion, setExpandedAccordion] = useState<string>('global-styles');
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  
  // Modal states
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSpeakersModalOpen, setIsSpeakersModalOpen] = useState(false);
  const [isVideoSettingsModalOpen, setIsVideoSettingsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  // Block data states
  const [heroData, setHeroData] = useState<HeroCoverData>({
    headline: 'SaaS Summit 2024',
    tagline: 'Future of Innovation',
    overlayOpacity: 50,
    showButton: true,
    buttonText: 'Register Now'
  });
  
  const [aboutData, setAboutData] = useState<AboutSectionData>({
    title: 'About This Event',
    description: '',
    backgroundColor: 'white',
    textAlign: 'center'
  });
  
  const [speakersData, setSpeakersData] = useState<SpeakersGridData>({
    speakerCount: 4,
    layout: '2-cols',
    speakers: [
      { id: '1', name: '', title: '', company: '', bio: '' },
      { id: '2', name: '', title: '', company: '', bio: '' },
      { id: '3', name: '', title: '', company: '', bio: '' },
      { id: '4', name: '', title: '', company: '', bio: '' }
    ]
  });
  
  const [videoSettingsData, setVideoSettingsData] = useState<VideoSettingsData>({
    videoUrl: '',
    videoTitle: '',
    videoDescription: ''
  });
  
  // Track edited blocks
  const [editedBlocks, setEditedBlocks] = useState<Set<string>>(new Set());
  
  // Logo state
  const [eventLogo, setEventLogo] = useState<string | null>(null);
  
  const { isPro: hasPro } = usePlan();

  const fonts = ['Inter', 'Roboto', 'Montserrat', 'Poppins'];

  // Content blocks with text block as free, additional text blocks as PRO
  const initialContentBlocks = [
    { id: 'hero', icon: Image, label: 'Hero Cover', description: 'Main banner', isPro: false },
    { id: 'hero-video', icon: Video, label: 'Hero Video Background', description: 'Replace image with video', isPro: true },
    { id: 'details', icon: Calendar, label: 'Event Details', description: 'Date, time, location', isPro: false },
    { id: 'text-block-1', icon: AlignLeft, label: 'Text Block', description: 'Free text content', isPro: false },
    { id: 'text-block-2', icon: AlignLeft, label: 'Text Block (Additional)', description: 'Extra text content', isPro: true },
    { id: 'text-block-3', icon: AlignLeft, label: 'Text Block (Additional)', description: 'Extra text content', isPro: true },
    { id: 'speakers', icon: Users, label: 'Speakers Grid', description: 'Featured speakers', isPro: true },
    { id: 'b2b', icon: Users, label: 'B2B Networking', description: 'Business connections', isPro: true },
    { id: 'sponsors', icon: Star, label: 'Sponsors', description: 'Partner showcase', isPro: false },
    { id: 'exhibitors', icon: Store, label: 'Exhibitors', description: 'Booth showcase', isPro: true },
    { id: 'schedule', icon: Clock, label: 'Schedule', description: 'Agenda timeline', isPro: true },
    { id: 'venue', icon: MapPin, label: 'Venue Map', description: 'Location', isPro: false },
    { id: 'faq', icon: HelpCircle, label: 'FAQ', description: 'Common questions', isPro: false },
    { id: 'register', icon: Ticket, label: 'Register CTA', description: 'Call-to-action button', isPro: false }
  ];

  // State to track block order (allows drag-and-drop reordering)
  const [contentBlocks, setContentBlocks] = useState(initialContentBlocks);

  // Track which blocks are enabled/disabled
  const [enabledBlocks, setEnabledBlocks] = useState<Set<string>>(
    new Set(['hero', 'details', 'text-block-1', 'sponsors', 'venue', 'faq', 'register'])
  );

  const toggleBlock = (blockId: string, isPro: boolean) => {
    if (isPro && !hasPro) {
      setIsUpgradeModalOpen(true);
      return;
    }
    
    const newEnabled = new Set(enabledBlocks);
    if (newEnabled.has(blockId)) {
      newEnabled.delete(blockId);
    } else {
      newEnabled.add(blockId);
    }
    setEnabledBlocks(newEnabled);
  };

  // Move block to new position
  const moveBlock = (dragIndex: number, hoverIndex: number) => {
    const draggedBlock = contentBlocks[dragIndex];
    const newBlocks = [...contentBlocks];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, draggedBlock);
    setContentBlocks(newBlocks);
  };

  const toggleAccordion = (id: string) => {
    setExpandedAccordion(expandedAccordion === id ? '' : id);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 
          className="text-2xl mb-2"
          style={{ fontWeight: 600, color: '#FFFFFF' }}
        >
          Design Your Event Page
        </h2>
        <p 
          className="text-sm"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          Customize colors, fonts, and layout
        </p>
        <div 
          className="w-full h-px mt-6"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        />
      </div>

      {/* Accordion Sections */}
      <div className="space-y-2">
        {/* Accordion 1: Global Styles */}
        <div 
          className="border rounded-lg overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => toggleAccordion('global-styles')}
            className="w-full flex items-center justify-between p-4 transition-colors"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <div className="flex items-center gap-3">
              <Palette size={20} style={{ color: 'var(--primary)' }} />
              <span 
                className="text-base"
                style={{ fontWeight: 600, color: '#FFFFFF' }}
              >
                Global Styles
              </span>
            </div>
            <ChevronDown 
              size={20} 
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                transform: expandedAccordion === 'global-styles' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>

          {expandedAccordion === 'global-styles' && (
            <div className="px-4 pb-4 space-y-6">
              {/* Template Selection */}
              <div>
                <label 
                  className="block text-sm mb-3"
                  style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
                >
                  Choose Template
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Modern Template - FREE */}
                  <button
                    onClick={() => setSelectedTemplate('modern')}
                    className="relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105"
                    style={{
                      borderColor: selectedTemplate === 'modern' ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: selectedTemplate === 'modern' ? 'rgba(6, 132, 245, 0.1)' : 'white'
                    }}
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-blue-100 p-3">
                      <div className="h-1/3 bg-white rounded mb-2" />
                      <div className="space-y-1">
                        <div className="h-2 bg-white/70 rounded" />
                        <div className="h-2 bg-white/70 rounded w-3/4" />
                      </div>
                    </div>
                    <div className="p-2 bg-white border-t" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs" style={{ color: '#0B2641', fontWeight: 600 }}>
                        Modern
                      </p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        FREE
                      </p>
                    </div>
                    {selectedTemplate === 'modern' && (
                      <div 
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Elegant Template - PRO */}
                  <button
                    onClick={() => {
                      if (hasPro) {
                        setSelectedTemplate('elegant');
                      } else {
                        setIsUpgradeModalOpen(true);
                      }
                    }}
                    className="relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105"
                    style={{
                      borderColor: selectedTemplate === 'elegant' ? 'var(--primary)' : '#F59E0B',
                      backgroundColor: selectedTemplate === 'elegant' ? 'rgba(6, 132, 245, 0.1)' : 'white',
                      opacity: !hasPro ? 0.9 : 1
                    }}
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-purple-50 to-pink-50 p-3">
                      <div className="h-1/3 bg-white rounded mb-2" />
                      <div className="space-y-1">
                        <div className="h-2 bg-white/70 rounded" />
                        <div className="h-2 bg-white/70 rounded w-2/3" />
                      </div>
                    </div>
                    <div className="p-2 bg-white border-t" style={{ borderColor: '#F59E0B' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs" style={{ color: '#0B2641', fontWeight: 600 }}>
                            Elegant
                          </p>
                          <div className="flex items-center gap-1">
                            <Crown size={10} style={{ color: '#F59E0B' }} />
                            <p className="text-xs" style={{ color: '#F59E0B', fontWeight: 700 }}>
                              PRO
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedTemplate === 'elegant' && hasPro && (
                      <div 
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    {!hasPro && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <Lock size={20} style={{ color: '#F59E0B' }} />
                      </div>
                    )}
                  </button>

                  {/* Bold Template - PRO */}
                  <button
                    onClick={() => {
                      if (hasPro) {
                        setSelectedTemplate('bold');
                      } else {
                        setIsUpgradeModalOpen(true);
                      }
                    }}
                    className="relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105"
                    style={{
                      borderColor: selectedTemplate === 'bold' ? 'var(--primary)' : '#F59E0B',
                      backgroundColor: selectedTemplate === 'bold' ? 'rgba(6, 132, 245, 0.1)' : 'white',
                      opacity: !hasPro ? 0.9 : 1
                    }}
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-orange-50 to-red-50 p-3">
                      <div className="h-1/3 bg-white rounded mb-2" />
                      <div className="space-y-1">
                        <div className="h-2 bg-white/70 rounded" />
                        <div className="h-2 bg-white/70 rounded w-4/5" />
                      </div>
                    </div>
                    <div className="p-2 bg-white border-t" style={{ borderColor: '#F59E0B' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs" style={{ color: '#0B2641', fontWeight: 600 }}>
                            Bold
                          </p>
                          <div className="flex items-center gap-1">
                            <Crown size={10} style={{ color: '#F59E0B' }} />
                            <p className="text-xs" style={{ color: '#F59E0B', fontWeight: 700 }}>
                              PRO
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedTemplate === 'bold' && hasPro && (
                      <div 
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    {!hasPro && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <Lock size={20} style={{ color: '#F59E0B' }} />
                      </div>
                    )}
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                  Templates apply predefined colors, fonts, and layouts
                </p>
              </div>

              {/* Primary Color */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
                >
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 cursor-pointer transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: primaryColor,
                      borderColor: 'var(--border)'
                    }}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg border outline-none"
                    style={{ 
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                  />
                  <button className="w-10 h-10 rounded-lg border flex items-center justify-center">
                    <Palette size={18} style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                  Used for buttons and accents
                </p>
              </div>

              {/* Secondary Color */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
                >
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 cursor-pointer transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: secondaryColor,
                      borderColor: 'var(--border)'
                    }}
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg border outline-none"
                    style={{ 
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                  />
                  <button className="w-10 h-10 rounded-lg border flex items-center justify-center">
                    <Palette size={18} style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                  Used for success states
                </p>
              </div>

              {/* Event Logo */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
                >
                  Event Logo
                </label>
                <div 
                  className="relative border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-solid"
                  style={{ 
                    borderColor: eventLogo ? 'var(--border)' : 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'white',
                    height: '120px'
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setEventLogo(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {eventLogo ? (
                      <img 
                        src={eventLogo} 
                        alt="Event logo" 
                        style={{ 
                          maxHeight: '100px',
                          maxWidth: '100%',
                          objectFit: 'contain'
                        }} 
                      />
                    ) : (
                      <>
                        <Upload size={32} style={{ color: '#0684F5', marginBottom: '8px' }} />
                        <span className="text-sm" style={{ color: '#6B7280' }}>
                          Upload your event logo
                        </span>
                        <span className="text-xs mt-1" style={{ color: '#0684F5' }}>
                          Click to browse
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Recommended: SVG or PNG, transparent background, max 2MB
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Logo appears in header of event page
                  </p>
                </div>
              </div>

              {/* Heading Font */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
                >
                  Heading Font
                </label>
                <select
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border outline-none appearance-none cursor-pointer"
                  style={{
                    borderColor: 'var(--border)',
                    color: '#0B2641',
                    backgroundColor: 'white'
                  }}
                >
                  {fonts.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font, color: '#0B2641' }}>
                      Aa - {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Body Font */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
                >
                  Body Font
                </label>
                <select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border outline-none appearance-none cursor-pointer"
                  style={{
                    borderColor: 'var(--border)',
                    color: '#0B2641',
                    backgroundColor: 'white'
                  }}
                >
                  {fonts.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font, color: '#0B2641' }}>
                      Aa - {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Corner Radius */}
              <div>
                <label 
                  className="block text-sm mb-3"
                  style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
                >
                  Corner Roundness ({cornerRadius}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={cornerRadius}
                  onChange={(e) => setCornerRadius(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex items-center gap-4 mt-4">
                  {[0, 8, 16].map((radius) => (
                    <div
                      key={radius}
                      className="w-12 h-12 border-2"
                      style={{
                        borderRadius: `${radius}px`,
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--gray-100)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: Content Blocks */}
        <div 
          className="border rounded-lg overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => toggleAccordion('content-blocks')}
            className="w-full flex items-center justify-between p-4 transition-colors"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <div className="flex items-center gap-3">
              <Layout size={20} style={{ color: 'var(--primary)' }} />
              <span 
                className="text-base"
                style={{ fontWeight: 600, color: '#FFFFFF' }}
              >
                Content Blocks
              </span>
            </div>
            <ChevronDown 
              size={20} 
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                transform: expandedAccordion === 'content-blocks' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>

          {expandedAccordion === 'content-blocks' && (
            <DndProvider backend={HTML5Backend}>
              <div className="px-4 pb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <p 
                  className="text-xs italic mb-2"
                  style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  Drag to reorder • Toggle blocks on/off for your event page
                </p>
                <div className="space-y-2">
                  {contentBlocks.map((block, index) => (
                    <DraggableContentBlock
                      key={block.id}
                      id={block.id}
                      index={index}
                      icon={block.icon}
                      label={block.label}
                      description={block.description}
                      isPro={block.isPro}
                      isEnabled={enabledBlocks.has(block.id)}
                      hasPro={hasPro}
                      onToggle={toggleBlock}
                      onEdit={(id) => {
                        if (id === 'hero') {
                          setIsHeroModalOpen(true);
                        } else if (id === 'hero-video') {
                          setIsVideoSettingsModalOpen(true);
                        } else if (id.startsWith('text-block-')) {
                          setIsAboutModalOpen(true);
                        } else if (id === 'speakers') {
                          setIsSpeakersModalOpen(true);
                        } else if (id === 'schedule') {
                          setIsVideoSettingsModalOpen(true);
                        }
                      }}
                      moveBlock={moveBlock}
                    />
                  ))}
                </div>
              </div>
            </DndProvider>
          )}
        </div>

        {/* Accordion 3: Advanced Settings */}
        <div 
          className="border rounded-lg overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => toggleAccordion('advanced')}
            className="w-full flex items-center justify-between p-4 transition-colors"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <div className="flex items-center gap-3">
              <Settings size={20} style={{ color: 'var(--primary)' }} />
              <span 
                className="text-base"
                style={{ fontWeight: 600, color: '#FFFFFF' }}
              >
                Advanced Settings
              </span>
            </div>
            <ChevronDown 
              size={20} 
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                transform: expandedAccordion === 'advanced' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>

          {expandedAccordion === 'advanced' && (
            <div className="px-4 pb-4 space-y-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
              {['Dark Mode', 'Social Share', 'Countdown Timer'].map((setting) => (
                <div key={setting} className="flex items-center justify-between">
                  <span 
                    className="text-sm"
                    style={{ color: '#FFFFFF' }}
                  >
                    {setting}
                  </span>
                  <button
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <HeroCoverModal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
        onSave={(data) => {
          setHeroData(data);
          setEditedBlocks((prev) => new Set([...prev, 'hero']));
        }}
        initialData={heroData}
      />
      <AboutSectionModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onSave={(data) => {
          setAboutData(data);
          setEditedBlocks((prev) => new Set([...prev, 'text-block-1']));
        }}
        initialData={aboutData}
      />
      <SpeakersGridModal
        isOpen={isSpeakersModalOpen}
        onClose={() => setIsSpeakersModalOpen(false)}
        onSave={(data) => {
          setSpeakersData(data);
          setEditedBlocks((prev) => new Set([...prev, 'speakers']));
        }}
        initialData={speakersData}
        hasPro={hasPro}
      />
      <VideoSettingsModal
        isOpen={isVideoSettingsModalOpen}
        onClose={() => setIsVideoSettingsModalOpen(false)}
        onSave={(data) => {
          setVideoSettingsData(data);
          setEditedBlocks((prev) => new Set([...prev, 'schedule']));
        }}
        initialData={videoSettingsData}
        hasPro={hasPro}
      />
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
