import { useRef, useState } from 'react';
import { 
  Grid3x3, 
  LayoutTemplate, 
  Crown,
  Lock,
  Plus,
  GripVertical,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  Check,
  Lightbulb,
  X,
  Palette,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

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
  visible: boolean;
}

interface BlockLibraryPanelProps {
  activeBlocks: ActiveBlock[];
  onAddBlock: (block: Block) => void;
  onRemoveBlock: (blockId: string) => void;
  onReorderBlocks: (blocks: ActiveBlock[]) => void;
  onToggleVisibility: (blockId: string) => void;
  onOpenSettings: (blockId: string) => void;
  onUpgrade: () => void;
  isPro: boolean;
  brandColor?: string;
  onBrandColorChange?: (color: string) => void;
  fontFamily?: string;
  onFontFamilyChange?: (font: string) => void;
  buttonRadius?: number;
  onButtonRadiusChange?: (radius: number) => void;
  logoUrl?: string;
  onLogoUpload?: (file: File) => void;
  isLogoUploading?: boolean;
}

export default function BlockLibraryPanel({
  activeBlocks,
  onAddBlock,
  onRemoveBlock,
  onReorderBlocks,
  onToggleVisibility,
  onOpenSettings,
  onUpgrade,
  isPro,
  brandColor = '#635BFF',
  onBrandColorChange,
  fontFamily = 'inter',
  onFontFamilyChange,
  buttonRadius = 12,
  onButtonRadiusChange,
  logoUrl,
  onLogoUpload,
  isLogoUploading = false
}: BlockLibraryPanelProps) {
  const { t, tList } = useI18n();
  const [activeFilter, setActiveFilter] = useState<'all' | 'added' | 'free' | 'pro'>('all');
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [showBrandingSettings, setShowBrandingSettings] = useState(true);
  const [showHint, setShowHint] = useState(activeBlocks.length === 0);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const availableBlocks: Block[] = [
    {
      id: 'hero',
      name: t('wizard.designStudio.blocks.hero.name'),
      type: 'hero',
      description: t('wizard.designStudio.blocks.hero.description'),
      tier: 'FREE',
      thumbnail: 'gradient',
      icon: '🎯'
    },
    {
      id: 'about',
      name: t('wizard.designStudio.blocks.about.name'),
      type: 'about',
      description: t('wizard.designStudio.blocks.about.description'),
      tier: 'FREE',
      thumbnail: 'text-image',
      icon: '📄'
    },
    {
      id: 'details',
      name: t('wizard.designStudio.blocks.details.name'),
      type: 'details',
      description: t('wizard.designStudio.blocks.details.description'),
      tier: 'FREE',
      thumbnail: 'grid-info',
      icon: 'ℹ️'
    },
    {
      id: 'agenda',
      name: t('wizard.designStudio.blocks.agenda.name'),
      type: 'agenda',
      description: t('wizard.designStudio.blocks.agenda.description'),
      tier: 'FREE',
      thumbnail: 'timeline',
      icon: '📅'
    },
    {
      id: 'speakers',
      name: t('wizard.designStudio.blocks.speakers.name'),
      type: 'speakers',
      description: t('wizard.designStudio.blocks.speakers.description'),
      tier: 'FREE',
      thumbnail: 'avatar-grid',
      icon: '🎤'
    },
    {
      id: 'footer',
      name: t('wizard.designStudio.blocks.footer.name'),
      type: 'footer',
      description: t('wizard.designStudio.blocks.footer.description'),
      tier: 'FREE',
      thumbnail: 'footer',
      icon: '📧'
    },
    {
      id: 'tickets',
      name: t('wizard.designStudio.blocks.tickets.name'),
      type: 'tickets',
      description: t('wizard.designStudio.blocks.tickets.description'),
      tier: 'PRO',
      thumbnail: 'pricing-cards',
      icon: '🎫'
    },
    {
      id: 'video-hero',
      name: t('wizard.designStudio.blocks.videoHero.name'),
      type: 'video-hero',
      description: t('wizard.designStudio.blocks.videoHero.description'),
      tier: 'PRO',
      thumbnail: 'video',
      icon: '🎬'
    },
    {
      id: 'sponsors',
      name: t('wizard.designStudio.blocks.sponsors.name'),
      type: 'sponsors',
      description: t('wizard.designStudio.blocks.sponsors.description'),
      tier: 'PRO',
      thumbnail: 'logo-grid',
      icon: '🏢'
    },
    {
      id: 'countdown',
      name: t('wizard.designStudio.blocks.countdown.name'),
      type: 'countdown',
      description: t('wizard.designStudio.blocks.countdown.description'),
      tier: 'PRO',
      thumbnail: 'timer',
      icon: '⏱️'
    },
    {
      id: 'testimonials',
      name: t('wizard.designStudio.blocks.testimonials.name'),
      type: 'testimonials',
      description: t('wizard.designStudio.blocks.testimonials.description'),
      tier: 'PRO',
      thumbnail: 'carousel',
      icon: '💬'
    },
    {
      id: 'custom-html',
      name: t('wizard.designStudio.blocks.customHtml.name'),
      type: 'custom-html',
      description: t('wizard.designStudio.blocks.customHtml.description'),
      tier: 'PRO',
      thumbnail: 'code',
      icon: '💻'
    }
  ];

  const filteredBlocks = availableBlocks.filter(block => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'added') return activeBlocks.some(ab => ab.id === block.id);
    if (activeFilter === 'free') return block.tier === 'FREE';
    if (activeFilter === 'pro') return block.tier === 'PRO';
    return true;
  });

  const handleDragStart = (index: number) => {
    setDraggedBlockIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedBlockIndex !== null && draggedBlockIndex !== index) {
      setDropTargetIndex(index);
    }
  };

  const handleDrop = (index: number) => {
    if (draggedBlockIndex !== null) {
      const newBlocks = [...activeBlocks];
      const [draggedBlock] = newBlocks.splice(draggedBlockIndex, 1);
      newBlocks.splice(index, 0, draggedBlock);
      
      // Update positions
      const reorderedBlocks = newBlocks.map((block, idx) => ({
        ...block,
        position: idx
      }));
      
      onReorderBlocks(reorderedBlocks);
    }
    setDraggedBlockIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedBlockIndex(null);
    setDropTargetIndex(null);
  };

  const isBlockAdded = (blockId: string) => {
    return activeBlocks.some(ab => ab.id === blockId);
  };

  const addedLabel = activeBlocks.length > 0
    ? t('wizard.designStudio.filters.addedCount', { count: activeBlocks.length })
    : t('wizard.designStudio.filters.added');
  const fontOptions = [
    { value: 'inter', label: t('wizard.designStudio.branding.fonts.inter') },
    { value: 'roboto', label: t('wizard.designStudio.branding.fonts.roboto') },
    { value: 'poppins', label: t('wizard.designStudio.branding.fonts.poppins') },
    { value: 'montserrat', label: t('wizard.designStudio.branding.fonts.montserrat') },
    { value: 'open-sans', label: t('wizard.designStudio.branding.fonts.openSans') },
    { value: 'lato', label: t('wizard.designStudio.branding.fonts.lato') }
  ];
  const proFeatures = tList<string>('wizard.designStudio.pro.features', []);
  const getTierLabel = (tier: 'FREE' | 'PRO') =>
    tier === 'PRO' ? t('wizard.designStudio.tiers.pro') : t('wizard.designStudio.tiers.free');

  return (
    <div
      style={{
        width: 'min(420px, 100%)',
        backgroundColor: '#0B2641',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#0B2641',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
            {t('wizard.designStudio.title')}
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
            {t('wizard.designStudio.subtitle')}
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: t('wizard.designStudio.filters.all') },
            { key: 'added', label: addedLabel },
            { key: 'free', label: t('wizard.designStudio.filters.free') },
            { key: 'pro', label: t('wizard.designStudio.filters.pro'), icon: true }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              style={{
                height: '32px',
                padding: '0 14px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeFilter === tab.key ? 'none' : '1px solid #E9EAEB',
                backgroundColor: activeFilter === tab.key ? '#635BFF' : '#F4F5F6',
                color: activeFilter === tab.key ? '#FFFFFF' : '#6F767E',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== tab.key) {
                  e.currentTarget.style.backgroundColor = '#E9EAEB';
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== tab.key) {
                  e.currentTarget.style.backgroundColor = '#F4F5F6';
                }
              }}
            >
              {tab.icon && <Crown size={12} />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* UX Hint Banner */}
      {showHint && (
        <div
          style={{
            backgroundColor: '#E0E7FF',
            border: '1px solid #635BFF',
            borderRadius: '12px',
            padding: '16px',
            margin: '20px 24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'start'
          }}
        >
          <Lightbulb size={20} style={{ color: '#635BFF', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#635BFF', marginBottom: '4px' }}>
              {t('wizard.designStudio.hint.title')}
            </div>
            <div style={{ fontSize: '13px', color: '#4338CA', lineHeight: 1.5, marginBottom: '8px' }}>
              {t('wizard.designStudio.hint.description')}
            </div>
            <button
              onClick={() => setShowHint(false)}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#635BFF',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              {t('wizard.designStudio.hint.dismiss')}
            </button>
          </div>
          <button
            onClick={() => setShowHint(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} style={{ color: '#635BFF' }} />
          </button>
        </div>
      )}

      {/* Branding Settings Section */}
      <div
        style={{
          padding: '20px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <button
          onClick={() => setShowBrandingSettings(!showBrandingSettings)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: showBrandingSettings ? '16px' : '0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={18} style={{ color: '#0684F5' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
              {t('wizard.designStudio.branding.title')}
            </span>
          </div>
          {showBrandingSettings ? (
            <ChevronUp size={18} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          ) : (
            <ChevronDown size={18} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          )}
        </button>

        {showBrandingSettings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {/* Brand Color */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '8px' }}>
                {t('wizard.designStudio.branding.color')}
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => onBrandColorChange && onBrandColorChange(e.target.value)}
                  style={{
                    width: '48px',
                    height: '40px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent'
                  }}
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => onBrandColorChange && onBrandColorChange(e.target.value)}
                  style={{
                    flex: 1,
                    height: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '8px' }}>
                {t('wizard.designStudio.branding.logo')}
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file && onLogoUpload) {
                    onLogoUpload(file);
                  }
                  if (logoInputRef.current) {
                    logoInputRef.current.value = '';
                  }
                }}
                style={{ display: 'none' }}
              />
              <button
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isLogoUploading ? 0.7 : 1
                }}
                disabled={isLogoUploading}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onClick={() => logoInputRef.current?.click()}
              >
                {isLogoUploading
                  ? t('wizard.designStudio.branding.uploading')
                  : logoUrl
                    ? t('wizard.designStudio.branding.replaceLogo')
                    : t('wizard.designStudio.branding.uploadLogo')}
              </button>
            </div>

            {/* Font Family */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '8px' }}>
                {t('wizard.designStudio.branding.fontFamily')}
              </label>
              <select
                value={fontFamily}
                onChange={(e) => onFontFamilyChange && onFontFamilyChange(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {fontOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Button Roundness */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '8px' }}>
                {t('wizard.designStudio.branding.buttonRoundness', { value: buttonRadius })}
              </label>
              <input
                type="range"
                min="0"
                max="24"
                step="2"
                value={buttonRadius}
                onChange={(e) => onButtonRadiusChange && onButtonRadiusChange(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '4px',
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9A9FA5', marginTop: '4px' }}>
                <span>{t('wizard.designStudio.branding.square')}</span>
                <span>{t('wizard.designStudio.branding.rounded')}</span>
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setShowBrandingSettings(false)}
              style={{
                width: '100%',
                height: '40px',
                backgroundColor: '#0684F5',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0573D9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0684F5';
              }}
            >
              {t('wizard.designStudio.branding.apply')}
            </button>
          </div>
        )}
      </div>

      {/* Active Blocks Section */}
      <div
        style={{
          padding: '20px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutTemplate size={18} style={{ color: '#0684F5' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
              {t('wizard.designStudio.activeBlocks.title', { count: activeBlocks.length })}
            </span>
          </div>
          {activeBlocks.length > 0 && (
            <button
              onClick={() => {
                if (confirm(t('wizard.designStudio.activeBlocks.confirmClearAll'))) {
                  activeBlocks.forEach(block => onRemoveBlock(block.id));
                }
              }}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#DC2626',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {t('wizard.designStudio.activeBlocks.clearAll')}
            </button>
          )}
        </div>

        {/* Active Blocks List */}
        {activeBlocks.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: '#FAFBFC',
              border: '2px dashed #E9EAEB',
              borderRadius: '12px'
            }}
          >
            <LayoutTemplate size={48} style={{ color: '#E9EAEB', margin: '0 auto 16px' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1D1F', marginBottom: '8px' }}>
              {t('wizard.designStudio.activeBlocks.emptyTitle')}
            </div>
            <div style={{ fontSize: '14px', color: '#6F767E' }}>
              {t('wizard.designStudio.activeBlocks.emptySubtitle')}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeBlocks.map((block, index) => (
              <div key={`${block.id}-${index}`}>
                {dropTargetIndex === index && draggedBlockIndex !== index && (
                  <div
                    style={{
                      height: '2px',
                      backgroundColor: '#635BFF',
                      marginBottom: '12px',
                      borderRadius: '1px'
                    }}
                  />
                )}
                <div
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: draggedBlockIndex === index ? '2px solid #635BFF' : '2px solid #E9EAEB',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    position: 'relative',
                    cursor: 'grab',
                    opacity: draggedBlockIndex === index ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (draggedBlockIndex === null) {
                      e.currentTarget.style.borderColor = '#635BFF';
                      e.currentTarget.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (draggedBlockIndex === null) {
                      e.currentTarget.style.borderColor = '#E9EAEB';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {/* Position Indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '-8px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#635BFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      zIndex: 5
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Drag Handle */}
                  <div style={{ display: 'flex', alignItems: 'center', paddingRight: '8px' }}>
                    <GripVertical size={20} style={{ color: '#9A9FA5' }} />
                  </div>

                  {/* Block Thumbnail */}
                  <div
                    style={{
                      width: '60px',
                      height: '45px',
                      borderRadius: '6px',
                      backgroundColor: '#F4F5F6',
                      border: '1px solid #E9EAEB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0
                    }}
                  >
                    {block.icon}
                  </div>

                  {/* Block Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A1D1F', marginBottom: '4px' }}>
                      {block.name}
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        height: '20px',
                        padding: '0 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 600,
                        backgroundColor: block.tier === 'FREE' ? '#E6F4EA' : '#FEF3C7',
                        color: block.tier === 'FREE' ? '#1F7A3E' : '#F59E0B'
                      }}
                    >
                      {block.tier === 'PRO' && <Crown size={10} />}
                      {getTierLabel(block.tier)}
                    </div>
                  </div>

                  {/* Block Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSettings(block.id);
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#F4F5F6',
                        borderRadius: '6px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#E9EAEB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F4F5F6';
                      }}
                    >
                      <Settings size={16} style={{ color: '#6F767E' }} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(block.id);
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: block.visible ? '#F4F5F6' : '#FEE2E2',
                        borderRadius: '6px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = block.visible ? '#E9EAEB' : '#FEE2E2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = block.visible ? '#F4F5F6' : '#FEE2E2';
                      }}
                    >
                      {block.visible ? (
                        <Eye size={16} style={{ color: '#6F767E' }} />
                      ) : (
                        <EyeOff size={16} style={{ color: '#DC2626' }} />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(t('wizard.designStudio.activeBlocks.confirmRemove', { name: block.name }))) {
                          onRemoveBlock(block.id);
                        }
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#F4F5F6',
                        borderRadius: '6px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEE2E2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F4F5F6';
                      }}
                    >
                      <Trash2 size={16} style={{ color: '#6F767E' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Blocks Library */}
      <div style={{ padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Grid3x3 size={18} style={{ color: '#0684F5' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
              {t('wizard.designStudio.availableBlocks.title')}
            </span>
          </div>
        </div>

        {/* Blocks Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {filteredBlocks.map((block) => {
            const added = isBlockAdded(block.id);
            const locked = block.tier === 'PRO' && !isPro;

            return (
              <div
                key={block.id}
                onClick={() => {
                  if (locked) {
                    onUpgrade();
                  } else if (!added) {
                    onAddBlock(block);
                  }
                }}
                style={{
                  backgroundColor: '#FAFBFC',
                  border: added ? '2px dashed #E9EAEB' : '2px solid #E9EAEB',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: locked ? 'pointer' : (added ? 'not-allowed' : 'pointer'),
                  opacity: added ? 0.6 : 1,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!added) {
                    e.currentTarget.style.borderColor = '#635BFF';
                    e.currentTarget.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!added) {
                    e.currentTarget.style.borderColor = '#E9EAEB';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Block Preview */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '16/9',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E9EAEB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    marginBottom: '12px',
                    position: 'relative'
                  }}
                >
                  {block.icon}

                  {/* PRO Lock Overlay */}
                  {locked && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.95))',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(254, 243, 199, 0.9)',
                          border: '2px solid #F59E0B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0px 4px 12px rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        <Lock size={28} style={{ color: '#F59E0B' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Block Info */}
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1A1D1F', marginBottom: '6px' }}>
                  {block.name}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6F767E',
                    lineHeight: 1.4,
                    marginBottom: '8px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {block.description}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      height: '20px',
                      padding: '0 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 600,
                      backgroundColor: block.tier === 'FREE' ? '#E6F4EA' : '#FEF3C7',
                      color: block.tier === 'FREE' ? '#1F7A3E' : '#F59E0B'
                    }}
                  >
                    {block.tier === 'PRO' && <Crown size={10} />}
                    {getTierLabel(block.tier)}
                  </div>

                  {!added && !locked && (
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#E0E7FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Plus size={16} style={{ color: '#635BFF' }} />
                    </div>
                  )}

                  {added && (
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#E6F4EA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Check size={16} style={{ color: '#1F7A3E' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* PRO Upgrade CTA */}
        {!isPro && (
          <div
            style={{
              background: 'linear-gradient(135deg, #635BFF 0%, #7C75FF 100%)',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              marginTop: '24px'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Crown size={32} style={{ color: '#FFFFFF' }} />
            </div>

            <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('wizard.designStudio.pro.title')}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '20px'
              }}
            >
              {t('wizard.designStudio.pro.subtitle')}
            </div>

            <button
              onClick={onUpgrade}
              style={{
                height: '44px',
                padding: '0 32px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 700,
                color: '#635BFF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8F7FF';
                e.currentTarget.style.boxShadow = '0px 4px 16px rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Sparkles size={18} />
              {t('wizard.designStudio.pro.cta')}
            </button>

            <div style={{ marginTop: '16px', textAlign: 'left' }}>
              {proFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '8px'
                  }}
                >
                  <Check size={16} />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
