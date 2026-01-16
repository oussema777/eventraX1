import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Eye, Download, LayoutTemplate, ChevronDown, ChevronUp, Info, 
  Palette, User, QrCode, Upload, Maximize2, RectangleVertical, 
  RectangleHorizontal, Building2, X, Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';

interface BadgeSettings {
  templateId: string;
  size: string;
  orientation: 'portrait' | 'landscape';
  paperType: string;
  logoUrl: string | null;
  brandColor: string;
  showJobTitle: boolean;
  showCompany: boolean;
  showTicketType: boolean;
  showCustomField: boolean;
  qrPosition: 'bottom-center' | 'bottom-right' | 'back';
  includeSecurityHash: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  thumbnail: string;
}

interface BadgeEditorSimpleProps {
  eventId: string;
}

export default function BadgeEditorSimple({ eventId }: BadgeEditorSimpleProps) {
  const { t, tList } = useI18n();
  const [settings, setSettings] = useState<BadgeSettings>({
    templateId: 'modern',
    size: 'standard',
    orientation: 'portrait',
    paperType: 'glossy',
    logoUrl: null,
    brandColor: '#635BFF',
    showJobTitle: true,
    showCompany: true,
    showTicketType: true,
    showCustomField: false,
    qrPosition: 'bottom-center',
    includeSecurityHash: true
  });

  const savingRef = useRef<number | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('events')
        .select('badge_settings')
        .eq('id', eventId)
        .maybeSingle();
      if (!mounted) return;
      if (error) { console.error('Badge settings load error:', error); return; }
      const s = data?.badge_settings;
      if (s && typeof s === 'object') {
        setSettings((prev) => ({ ...prev, ...s }));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  const persistSettings = async (next: BadgeSettings) => {
    if (!eventId) return;
    const { data, error } = await supabase
      .from('events')
      .update({ badge_settings: next, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select('id');
    if (error) throw error;
    if (!data || (Array.isArray(data) && data.length === 0)) throw new Error('No rows updated');
  };


  useEffect(() => {
    if (!eventId) return;
    if (savingRef.current) window.clearTimeout(savingRef.current);
    savingRef.current = window.setTimeout(async () => {
      try {
        await persistSettings(settings);
      } catch (e) {
        console.error('Badge settings save error:', e);
      }
    }, 500);
    return () => {
      if (savingRef.current) window.clearTimeout(savingRef.current);
    };
  }, [eventId, settings]);


  const [expandedSection, setExpandedSection] = useState<string>('template');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [zoom, setZoom] = useState(100);

  const categories = useMemo(
    () => [
      { id: 'all', label: t('wizard.step3.qrBadges.templates.categories.all') },
      { id: 'professional', label: t('wizard.step3.qrBadges.templates.categories.professional') },
      { id: 'creative', label: t('wizard.step3.qrBadges.templates.categories.creative') },
      { id: 'minimal', label: t('wizard.step3.qrBadges.templates.categories.minimal') },
      { id: 'bold', label: t('wizard.step3.qrBadges.templates.categories.bold') },
      { id: 'classic', label: t('wizard.step3.qrBadges.templates.categories.classic') }
    ],
    [t]
  );

  const templates = useMemo<Template[]>(
    () => [
      {
        id: 'modern',
        name: t('wizard.step3.qrBadges.templates.modern.name'),
        description: t('wizard.step3.qrBadges.templates.modern.description'),
        category: 'professional',
        features: tList('wizard.step3.qrBadges.templates.modern.features', [])
      },
      {
        id: 'classic',
        name: t('wizard.step3.qrBadges.templates.classic.name'),
        description: t('wizard.step3.qrBadges.templates.classic.description'),
        category: 'professional',
        features: tList('wizard.step3.qrBadges.templates.classic.features', [])
      },
      {
        id: 'creative',
        name: t('wizard.step3.qrBadges.templates.creative.name'),
        description: t('wizard.step3.qrBadges.templates.creative.description'),
        category: 'creative',
        features: tList('wizard.step3.qrBadges.templates.creative.features', [])
      },
      {
        id: 'minimal',
        name: t('wizard.step3.qrBadges.templates.minimal.name'),
        description: t('wizard.step3.qrBadges.templates.minimal.description'),
        category: 'minimal',
        features: tList('wizard.step3.qrBadges.templates.minimal.features', [])
      },
      {
        id: 'tech',
        name: t('wizard.step3.qrBadges.templates.tech.name'),
        description: t('wizard.step3.qrBadges.templates.tech.description'),
        category: 'professional',
        features: tList('wizard.step3.qrBadges.templates.tech.features', [])
      },
      {
        id: 'elegant',
        name: t('wizard.step3.qrBadges.templates.elegant.name'),
        description: t('wizard.step3.qrBadges.templates.elegant.description'),
        category: 'classic',
        features: tList('wizard.step3.qrBadges.templates.elegant.features', [])
      },
      {
        id: 'vibrant',
        name: t('wizard.step3.qrBadges.templates.vibrant.name'),
        description: t('wizard.step3.qrBadges.templates.vibrant.description'),
        category: 'creative',
        features: tList('wizard.step3.qrBadges.templates.vibrant.features', [])
      },
      {
        id: 'corporate',
        name: t('wizard.step3.qrBadges.templates.corporate.name'),
        description: t('wizard.step3.qrBadges.templates.corporate.description'),
        category: 'professional',
        features: tList('wizard.step3.qrBadges.templates.corporate.features', [])
      },
      {
        id: 'startup',
        name: t('wizard.step3.qrBadges.templates.startup.name'),
        description: t('wizard.step3.qrBadges.templates.startup.description'),
        category: 'bold',
        features: tList('wizard.step3.qrBadges.templates.startup.features', [])
      }
    ],
    [t, tList]
  );

  const currentTemplate = templates.find(t => t.id === settings.templateId);

  const colorPresets = ['#635BFF', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

  const templatePresets: Record<string, Partial<BadgeSettings>> = {
    modern: { brandColor: '#635BFF', qrPosition: 'bottom-center', paperType: 'glossy', showCustomField: false, includeSecurityHash: true },
    classic: { brandColor: '#1F2937', qrPosition: 'bottom-center', paperType: 'matte', showCustomField: false, includeSecurityHash: true },
    corporate: { brandColor: '#0B2641', qrPosition: 'bottom-right', paperType: 'matte', showCustomField: false, includeSecurityHash: true },
    creative: { brandColor: '#EF4444', qrPosition: 'bottom-center', paperType: 'glossy', showCustomField: true, includeSecurityHash: false },
    minimal: { brandColor: '#111827', qrPosition: 'bottom-right', paperType: 'matte', showCompany: false, showTicketType: true, showCustomField: false, includeSecurityHash: true },
    startup: { brandColor: '#10B981', qrPosition: 'bottom-center', paperType: 'glossy', showCustomField: true, includeSecurityHash: true },
    tech: { brandColor: '#3B82F6', qrPosition: 'bottom-right', paperType: 'glossy', showCustomField: false, includeSecurityHash: true },
    elegant: { brandColor: '#8B5CF6', qrPosition: 'bottom-center', paperType: 'glossy', showCustomField: false, includeSecurityHash: true },
    vibrant: { brandColor: '#F59E0B', qrPosition: 'bottom-center', paperType: 'glossy', showCustomField: true, includeSecurityHash: false }
  };

  const applySelectedTemplate = async () => {
    if (!selectedTemplate) return;
    const preset = templatePresets[selectedTemplate] || {};
    const next = { ...settings, ...preset, templateId: selectedTemplate };
    setSettings(next);
    setShowTemplateModal(false);
    try {
      await persistSettings(next);
    } catch (e) {
      console.error('Badge template apply error:', e);
    }
  };


  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setSettings((prev) => ({ ...prev, logoUrl: event.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const filteredTemplates = categoryFilter === 'all' 
    ? templates 
    : templates.filter(t => t.category === categoryFilter);

  const badgeWidth = settings.orientation === 'portrait' ? 400 : 600;
  const badgeHeight = settings.orientation === 'portrait' ? 600 : 400;

  const handleDownloadPdf = () => {
    const node = badgeRef.current;
    if (!node) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const doc = w.document;
    const clone = node.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.width = `${badgeWidth}px`;
    clone.style.height = `${badgeHeight}px`;
    clone.style.boxShadow = 'none';
    const printTitle = t('wizard.step3.qrBadges.printTitle');
    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${printTitle}</title>
      <style>
        html,body{margin:0;padding:0;background:#fff;}
        .wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;}
      </style>
    </head><body><div class="wrap"></div></body></html>`);
    doc.close();
    const wrap = doc.querySelector('.wrap');
    if (wrap) wrap.appendChild(clone);
    w.focus();
    window.setTimeout(() => {
      try { w.print(); } catch (e) { console.error(e); }
    }, 250);
  };

  const scale = zoom / 100;

  return (
    <div className="badge-editor-container" style={{ 
      backgroundColor: '#0F172A', 
      padding: '32px',
      paddingBottom: '80px',
      minHeight: 'calc(100vh - 160px)'
    }}>
      <style>{`
        @media (max-width: 1024px) {
          .badge-editor-container { padding: 16px !important; }
          .badge-editor-header { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
          .badge-editor-header-actions { width: 100% !important; flex-direction: column !important; }
          .badge-editor-header-actions button { width: 100% !important; justify-content: center !important; }
          
          .badge-editor-layout { display: flex !important; flex-direction: column !important; gap: 24px !important; }
          .badge-editor-sidebar { position: static !important; width: 100% !important; }
          .badge-editor-preview-container { padding: 20px !important; min-height: auto !important; }
          .badge-editor-canvas { padding: 40px 20px !important; overflow-x: auto !important; }
          
          /* Modal Adjustments */
          .template-modal-content { width: 95vw !important; max-height: 90vh !important; }
          .template-grid { grid-template-columns: 1fr !important; }
          .template-category-tabs { overflow-x: auto !important; padding-bottom: 8px !important; }
          .template-category-tabs button { white-space: nowrap !important; }
        }
        @media (max-width: 500px) {
          .badge-editor-container { padding: 8px !important; }
          .badge-editor-preview-container { padding: 12px !important; }
          .badge-editor-canvas { padding: 20px 10px !important; }
        }
      `}</style>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* TOP HEADER BAR */}
        <div className="badge-editor-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          {/* Left: Title */}
          <div>
            <h1 style={{ 
              fontFamily: 'Inter, sans-serif',
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#FFFFFF',
              marginBottom: '8px'
            }}>
              {t('wizard.step3.qrBadges.header.title')}
            </h1>
            <p style={{ 
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px', 
              fontWeight: 400, 
              color: '#E5E7EB'
            }}>
              {t('wizard.step3.qrBadges.header.subtitle')}
            </p>
          </div>

          {/* Right: Actions */}
          <div className="badge-editor-header-actions" style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                height: '40px',
                padding: '0 20px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.borderColor = '#2563EB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              <Eye size={16} />
              {t('wizard.step3.qrBadges.header.preview')}
            </button>
            <button
              style={{
                height: '40px',
                padding: '0 20px',
                backgroundColor: '#2563EB',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
              onClick={handleDownloadPdf}
            >
              <Download size={16} />
              {t('wizard.step3.qrBadges.header.download')}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT LAYOUT */}
        <div className="badge-editor-layout" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '32px' }}>
          {/* LEFT COLUMN: CUSTOMIZATION PANEL */}
          <div className="badge-editor-sidebar" style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              {/* Section 1: Template Selection */}
              <div>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'template' ? '' : 'template')}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: expandedSection === 'template' ? '16px 16px 0 0' : '16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <LayoutTemplate size={20} style={{ color: '#2563EB' }} />
                    <span style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: '#FFFFFF'
                    }}>
                      {t('wizard.step3.qrBadges.sections.template.title')}
                    </span>
                  </div>
                  {expandedSection === 'template' ? 
                    <ChevronUp size={20} style={{ color: '#E5E7EB' }} /> : 
                    <ChevronDown size={20} style={{ color: '#E5E7EB' }} />
                  }
                </button>

                {expandedSection === 'template' && (
                  <div style={{ padding: '24px' }}>
                    {/* Current Template Display */}
                    <div style={{
                      backgroundColor: '#F4F5F6',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid #635BFF',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '80px',
                        height: '100px',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <div style={{ fontSize: '10px', color: '#6F767E', textAlign: 'center' }}>
                          {t('wizard.step3.qrBadges.sections.template.previewLabel')}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '15px', 
                          fontWeight: 700, 
                          color: '#1A1D1F',
                          marginBottom: '4px'
                        }}>
                          {currentTemplate?.name}
                        </div>
                        <div style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '13px', 
                          fontWeight: 400, 
                          color: '#6F767E',
                          marginBottom: '8px'
                        }}>
                          {currentTemplate?.description}
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          height: '22px',
                          padding: '0 10px',
                          backgroundColor: '#E0E7FF',
                          borderRadius: '11px',
                          alignItems: 'center',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#635BFF'
                        }}>
                          {t('wizard.step3.qrBadges.sections.template.currentBadge')}
                        </div>
                      </div>
                    </div>

                    {/* Change Template Button */}
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      style={{
                        width: '100%',
                        height: '40px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #635BFF',
                        borderRadius: '8px',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#635BFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F7FF'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      {t('wizard.step3.qrBadges.sections.template.changeButton')}
                    </button>
                  </div>
                )}
              </div>

              {/* Section 2: Badge Information */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'info' ? '' : 'info')}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Info size={20} style={{ color: '#2563EB' }} />
                    <span style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: '#FFFFFF'
                    }}>
                      {t('wizard.step3.qrBadges.sections.info.title')}
                    </span>
                  </div>
                  {expandedSection === 'info' ? 
                    <ChevronUp size={20} style={{ color: '#E5E7EB' }} /> : 
                    <ChevronDown size={20} style={{ color: '#E5E7EB' }} />
                  }
                </button>

                {expandedSection === 'info' && (
                  <div style={{ padding: '24px' }}>
                    {/* Badge Size */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px', 
                        fontWeight: 500, 
                        color: '#6F767E',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        {t('wizard.step3.qrBadges.sections.info.sizeLabel')}
                      </label>
                      <div style={{
                        backgroundColor: '#F4F5F6',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}>
                        <span style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '15px', 
                          fontWeight: 600, 
                          color: '#1A1D1F'
                        }}>
                          {t('wizard.step3.qrBadges.sections.info.sizeValue')}
                        </span>
                        <Maximize2 size={18} style={{ color: '#9A9FA5' }} />
                      </div>
                    </div>

                    {/* Orientation */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px', 
                        fontWeight: 500, 
                        color: '#6F767E',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        {t('wizard.step3.qrBadges.sections.info.orientationLabel')}
                      </label>
                      <div style={{
                        backgroundColor: '#F4F5F6',
                        padding: '4px',
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '0'
                      }}>
                        <button
                          onClick={() => setSettings({ ...settings, orientation: 'portrait' })}
                          style={{
                            flex: 1,
                            height: '40px',
                            padding: '0 16px',
                            backgroundColor: settings.orientation === 'portrait' ? '#FFFFFF' : 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: settings.orientation === 'portrait' ? '#1A1D1F' : '#6F767E',
                            cursor: 'pointer',
                            boxShadow: settings.orientation === 'portrait' ? '0px 2px 4px rgba(0, 0, 0, 0.06)' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          <RectangleVertical size={16} style={{ color: settings.orientation === 'portrait' ? '#635BFF' : '#9A9FA5' }} />
                          {t('wizard.step3.qrBadges.sections.info.orientation.portrait')}
                        </button>
                        <button
                          onClick={() => setSettings({ ...settings, orientation: 'landscape' })}
                          style={{
                            flex: 1,
                            height: '40px',
                            padding: '0 16px',
                            backgroundColor: settings.orientation === 'landscape' ? '#FFFFFF' : 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: settings.orientation === 'landscape' ? '#1A1D1F' : '#6F767E',
                            cursor: 'pointer',
                            boxShadow: settings.orientation === 'landscape' ? '0px 2px 4px rgba(0, 0, 0, 0.06)' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          <RectangleHorizontal size={16} style={{ color: settings.orientation === 'landscape' ? '#635BFF' : '#9A9FA5' }} />
                          {t('wizard.step3.qrBadges.sections.info.orientation.landscape')}
                        </button>
                      </div>
                    </div>

                    {/* Paper Type */}
                    <div>
                      <label style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px', 
                        fontWeight: 500, 
                        color: '#6F767E',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        {t('wizard.step3.qrBadges.sections.info.paperTypeLabel')}
                      </label>
                      <select
                        value={settings.paperType}
                        onChange={(e) => setSettings({ ...settings, paperType: e.target.value })}
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '0 12px',
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#1A1D1F',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="glossy">{t('wizard.step3.qrBadges.sections.info.paperTypes.glossy')}</option>
                        <option value="matte">{t('wizard.step3.qrBadges.sections.info.paperTypes.matte')}</option>
                        <option value="recycled">{t('wizard.step3.qrBadges.sections.info.paperTypes.recycled')}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Branding */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'branding' ? '' : 'branding')}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Palette size={20} style={{ color: '#2563EB' }} />
                    <span style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: '#FFFFFF'
                    }}>
                      {t('wizard.step3.qrBadges.sections.branding.title')}
                    </span>
                  </div>
                  {expandedSection === 'branding' ? 
                    <ChevronUp size={20} style={{ color: '#E5E7EB' }} /> : 
                    <ChevronDown size={20} style={{ color: '#E5E7EB' }} />
                  }
                </button>

                {expandedSection === 'branding' && (
                  <div style={{ padding: '24px' }}>
                    {/* Event Logo Upload */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px', 
                        fontWeight: 500, 
                        color: '#6F767E',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        {t('wizard.step3.qrBadges.sections.branding.logoLabel')}
                      </label>
                      
                      {!settings.logoUrl ? (
                        <div
                          onClick={handleLogoUpload}
                          style={{
                            backgroundColor: '#FAFBFC',
                            border: '2px dashed #E9EAEB',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            minHeight: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#635BFF';
                            e.currentTarget.style.backgroundColor = '#F8F7FF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E9EAEB';
                            e.currentTarget.style.backgroundColor = '#FAFBFC';
                          }}
                        >
                          <Upload size={32} style={{ color: '#9A9FA5', marginBottom: '8px' }} />
                          <div style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px', 
                            fontWeight: 600, 
                            color: '#1A1D1F',
                            marginBottom: '4px'
                          }}>
                            {t('wizard.step3.qrBadges.sections.branding.uploadCta')}
                          </div>
                          <div style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px', 
                            fontWeight: 400, 
                            color: '#9A9FA5'
                          }}>
                            {t('wizard.step3.qrBadges.sections.branding.uploadHint')}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          backgroundColor: '#FAFBFC',
                          border: '2px solid #E9EAEB',
                          borderRadius: '12px',
                          padding: '24px',
                          textAlign: 'center'
                        }}>
                          <img 
                            src={settings.logoUrl} 
                            alt={t('wizard.step3.qrBadges.sections.branding.logoAlt')} 
                            style={{ 
                              maxHeight: '100px', 
                              maxWidth: '100%',
                              marginBottom: '12px'
                            }} 
                          />
                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                              onClick={handleLogoUpload}
                              style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#635BFF',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              {t('wizard.step3.qrBadges.sections.branding.replace')}
                            </button>
                            <button
                              onClick={() => setSettings({ ...settings, logoUrl: null })}
                              style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#DC2626',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              {t('wizard.step3.qrBadges.sections.branding.remove')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Brand Color */}
                    <div>
                      <label style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px', 
                        fontWeight: 500, 
                        color: '#6F767E',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        {t('wizard.step3.qrBadges.sections.branding.colorLabel')}
                      </label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: settings.brandColor,
                            border: '2px solid #E9EAEB',
                            cursor: 'pointer'
                          }}
                        />
                        <input
                          type="text"
                          value={settings.brandColor}
                          onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                          placeholder="#635BFF"
                          style={{
                            width: '120px',
                            height: '48px',
                            padding: '0 16px',
                            backgroundColor: '#F4F5F6',
                            border: '1px solid #E9EAEB',
                            borderRadius: '8px',
                            fontFamily: 'Inter, monospace',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#1A1D1F',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {colorPresets.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSettings({ ...settings, brandColor: color })}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              backgroundColor: color,
                              border: settings.brandColor === color ? '2px solid #635BFF' : '2px solid transparent',
                              cursor: 'pointer',
                              boxShadow: settings.brandColor === color ? '0px 0px 0px 3px rgba(99, 91, 255, 0.2)' : 'none',
                              transition: 'all 0.2s'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Attendee Information */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'attendee' ? '' : 'attendee')}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <User size={20} style={{ color: '#2563EB' }} />
                    <span style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: '#FFFFFF'
                    }}>
                      {t('wizard.step3.qrBadges.sections.attendee.title')}
                    </span>
                  </div>
                  {expandedSection === 'attendee' ? 
                    <ChevronUp size={20} style={{ color: '#E5E7EB' }} /> : 
                    <ChevronDown size={20} style={{ color: '#E5E7EB' }} />
                  }
                </button>

                {expandedSection === 'attendee' && (
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Full Name - Always on, disabled */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        backgroundColor: '#E0E7FF',
                        borderRadius: '8px',
                        opacity: 0.7
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <User size={16} style={{ color: '#6F767E' }} />
                          <span style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px', 
                            fontWeight: 500, 
                            color: '#1A1D1F'
                          }}>
                            {t('wizard.step3.qrBadges.sections.attendee.fullName')}
                          </span>
                        </div>
                        <div style={{
                          width: '44px',
                          height: '24px',
                          backgroundColor: '#635BFF',
                          borderRadius: '12px',
                          position: 'relative',
                          cursor: 'not-allowed'
                        }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            transition: 'all 0.2s'
                          }} />
                        </div>
                      </div>

                      {/* Job Title */}
                      <ToggleItem
                        label={t('wizard.step3.qrBadges.sections.attendee.jobTitle')}
                        checked={settings.showJobTitle}
                        onChange={(checked) => setSettings({ ...settings, showJobTitle: checked })}
                      />

                      {/* Company Name */}
                      <ToggleItem
                        label={t('wizard.step3.qrBadges.sections.attendee.company')}
                        checked={settings.showCompany}
                        onChange={(checked) => setSettings({ ...settings, showCompany: checked })}
                      />

                      {/* Ticket Type */}
                      <ToggleItem
                        label={t('wizard.step3.qrBadges.sections.attendee.ticketType')}
                        checked={settings.showTicketType}
                        onChange={(checked) => setSettings({ ...settings, showTicketType: checked })}
                      />

                      {/* Custom Field */}
                      <ToggleItem
                        label={t('wizard.step3.qrBadges.sections.attendee.customField')}
                        checked={settings.showCustomField}
                        onChange={(checked) => setSettings({ ...settings, showCustomField: checked })}
                      />
                    </div>
                    <div style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px', 
                      fontWeight: 400, 
                      color: '#9A9FA5',
                      marginTop: '8px'
                    }}>
                      {t('wizard.step3.qrBadges.sections.attendee.requiredHint')}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: QR Code Settings */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'qr' ? '' : 'qr')}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: expandedSection === 'qr' ? '0' : '0 0 16px 16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <QrCode size={20} style={{ color: '#2563EB' }} />
                    <span style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: '#FFFFFF'
                    }}>
                      {t('wizard.step3.qrBadges.sections.qr.title')}
                    </span>
                  </div>
                  {expandedSection === 'qr' ? 
                    <ChevronUp size={20} style={{ color: '#E5E7EB' }} /> : 
                    <ChevronDown size={20} style={{ color: '#E5E7EB' }} />
                  }
                </button>

                {expandedSection === 'qr' && (
                  <div style={{ padding: '24px', borderRadius: '0 0 16px 16px' }}>
                    {/* QR Code Preview */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #E9EAEB',
                      textAlign: 'center',
                      marginBottom: '16px'
                    }}>
                      <svg width="100" height="100" viewBox="0 0 29 29" style={{ margin: '0 auto 8px' }}>
                        <rect width="29" height="29" fill="#FFFFFF"/>
                        <rect x="0" y="0" width="7" height="7" fill="#000000"/>
                        <rect x="1" y="1" width="5" height="5" fill="#FFFFFF"/>
                        <rect x="2" y="2" width="3" height="3" fill="#000000"/>
                        <rect x="22" y="0" width="7" height="7" fill="#000000"/>
                        <rect x="23" y="1" width="5" height="5" fill="#FFFFFF"/>
                        <rect x="24" y="2" width="3" height="3" fill="#000000"/>
                        <rect x="0" y="22" width="7" height="7" fill="#000000"/>
                        <rect x="1" y="23" width="5" height="5" fill="#FFFFFF"/>
                        <rect x="2" y="24" width="3" height="3" fill="#000000"/>
                        <rect x="8" y="6" width="1" height="1" fill="#000000"/>
                        <rect x="10" y="6" width="1" height="1" fill="#000000"/>
                        <rect x="12" y="6" width="1" height="1" fill="#000000"/>
                        <rect x="6" y="8" width="1" height="1" fill="#000000"/>
                        <rect x="6" y="10" width="1" height="1" fill="#000000"/>
                        <rect x="22" y="22" width="5" height="5" fill="#000000"/>
                        <rect x="23" y="23" width="3" height="3" fill="#FFFFFF"/>
                        <rect x="24" y="24" width="1" height="1" fill="#000000"/>
                      </svg>
                      <div style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px', 
                        fontWeight: 400, 
                        color: '#6F767E'
                      }}>
                        {t('wizard.step3.qrBadges.sections.qr.uniqueCode')}
                      </div>
                    </div>

                    {/* QR Position */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px', 
                        fontWeight: 500, 
                        color: '#6F767E',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        {t('wizard.step3.qrBadges.sections.qr.positionLabel')}
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <QRPositionOption
                          value="bottom-center"
                          label={t('wizard.step3.qrBadges.sections.qr.positions.bottomCenter')}
                          selected={settings.qrPosition === 'bottom-center'}
                          onChange={(value) => setSettings({ ...settings, qrPosition: value as any })}
                        />
                        <QRPositionOption
                          value="bottom-right"
                          label={t('wizard.step3.qrBadges.sections.qr.positions.bottomRight')}
                          selected={settings.qrPosition === 'bottom-right'}
                          onChange={(value) => setSettings({ ...settings, qrPosition: value as any })}
                        />
                        <QRPositionOption
                          value="back"
                          label={t('wizard.step3.qrBadges.sections.qr.positions.back')}
                          selected={settings.qrPosition === 'back'}
                          onChange={(value) => setSettings({ ...settings, qrPosition: value as any })}
                        />
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div style={{
                      backgroundColor: '#FFF3E0',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #F59E0B'
                    }}>
                      <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={settings.includeSecurityHash}
                          onChange={(e) => setSettings({ ...settings, includeSecurityHash: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#F59E0B', marginTop: '2px' }}
                        />
                        <div>
                          <div style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '13px', 
                            fontWeight: 500, 
                            color: '#1A1D1F',
                            marginBottom: '4px'
                          }}>
                            {t('wizard.step3.qrBadges.sections.qr.security.title')}
                          </div>
                          <div style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px', 
                            fontWeight: 400, 
                            color: '#B54708'
                          }}>
                            {t('wizard.step3.qrBadges.sections.qr.security.subtitle')}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE PREVIEW */}
          <div className="badge-editor-preview-container" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
            padding: '40px',
            minHeight: '800px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Preview Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <h2 style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px', 
                fontWeight: 700, 
                color: '#1A1D1F'
              }}>
                {t('wizard.step3.qrBadges.preview.title')}
              </h2>
              
              {/* Zoom Controls */}
              <div style={{
                display: 'flex',
                gap: '8px',
                backgroundColor: '#F4F5F6',
                padding: '4px',
                borderRadius: '8px'
              }}>
                {[75, 100, 125].map((zoomLevel) => (
                  <button
                    key={zoomLevel}
                    onClick={() => setZoom(zoomLevel)}
                    style={{
                      height: '32px',
                      padding: '0 12px',
                      borderRadius: '6px',
                      backgroundColor: zoom === zoomLevel ? '#FFFFFF' : 'transparent',
                      border: 'none',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: zoom === zoomLevel ? '#635BFF' : '#6F767E',
                      boxShadow: zoom === zoomLevel ? '0px 2px 4px rgba(0, 0, 0, 0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {zoomLevel}%
                  </button>
                ))}
              </div>
            </div>

            {/* Badge Preview Canvas */}
            <div className="badge-editor-canvas" style={{
              flex: 1,
              background: 'radial-gradient(circle, #FAFBFC 0%, #F4F5F6 100%)',
              borderRadius: '12px',
              padding: '60px 40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Sample Data Toggle */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(26, 29, 31, 0.8)',
                backdropFilter: 'blur(8px)',
                padding: '8px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <User size={14} style={{ color: '#FFFFFF' }} />
                <span style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px', 
                  fontWeight: 500, 
                  color: '#FFFFFF'
                }}>
                  {t('wizard.step3.qrBadges.preview.sampleData')}
                </span>
                <Info 
                  size={14} 
                  style={{ color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }} 
                  title={t('wizard.step3.qrBadges.preview.sampleDataHint')}
                />
              </div>

              {/* The Badge */}
              <div
                ref={badgeRef}
                style={{
                  width: `${badgeWidth * scale}px`,
                  height: `${badgeHeight * scale}px`,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.12)',
                  position: 'relative',
                  transform: 'rotateX(2deg)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
                  flexShrink: 0
                }}
              >
                {/* Lanyard Hole */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(180deg, #E9EAEB 0%, #D1D5DB 100%)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }} />

                {/* Top Section - Logo */}
                <div style={{
                  padding: '32px 24px 0 24px',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {settings.logoUrl ? (
                    <img 
                      src={settings.logoUrl} 
                      alt={t('wizard.step3.qrBadges.preview.logoAlt')}
                      style={{
                        maxWidth: '200px',
                        maxHeight: '60px',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '120px',
                      height: '60px',
                      border: '2px dashed #E9EAEB',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: '#9A9FA5'
                    }}>
                      {t('wizard.step3.qrBadges.preview.logoPlaceholder')}
                    </div>
                  )}
                </div>

                {/* Middle Section - Attendee Info */}
                <div style={{
                  padding: '24px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}>
                  {/* Name */}
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#1A1D1F',
                    marginBottom: '12px'
                  }}>
                    {t('wizard.step3.qrBadges.preview.sampleName')}
                  </div>

                  {/* Job Title */}
                  {settings.showJobTitle && (
                    <div style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '18px',
                      fontWeight: 500,
                      color: '#6F767E',
                      marginBottom: '8px'
                    }}>
                      {t('wizard.step3.qrBadges.preview.sampleTitle')}
                    </div>
                  )}

                  {/* Company */}
                  {settings.showCompany && (
                    <div style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#9A9FA5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginBottom: '16px'
                    }}>
                      <Building2 size={16} />
                      {t('wizard.step3.qrBadges.preview.sampleCompany')}
                    </div>
                  )}

                  {/* Ticket Type Badge */}
                  {settings.showTicketType && (
                    <div style={{
                      display: 'inline-flex',
                      height: '32px',
                      padding: '0 16px',
                      backgroundColor: `${settings.brandColor}1A`,
                      borderRadius: '16px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: settings.brandColor,
                      margin: '0 auto'
                    }}>
                      {t('wizard.step3.qrBadges.preview.sampleTicket')}
                    </div>
                  )}
                </div>

                {/* QR Code (if not on back) */}
                {settings.qrPosition !== 'back' && (
                  <div style={{
                    padding: '20px',
                    display: 'flex',
                    justifyContent: settings.qrPosition === 'bottom-center' ? 'center' : 'flex-end'
                  }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      backgroundColor: '#FFFFFF',
                      padding: '12px',
                      borderRadius: '8px',
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                    }}>
                      <svg width="96" height="96" viewBox="0 0 29 29">
                        <rect width="29" height="29" fill="#FFFFFF"/>
                        <rect x="0" y="0" width="7" height="7" fill="#000000"/>
                        <rect x="1" y="1" width="5" height="5" fill="#FFFFFF"/>
                        <rect x="2" y="2" width="3" height="3" fill="#000000"/>
                        <rect x="22" y="0" width="7" height="7" fill="#000000"/>
                        <rect x="23" y="1" width="5" height="5" fill="#FFFFFF"/>
                        <rect x="24" y="2" width="3" height="3" fill="#000000"/>
                        <rect x="0" y="22" width="7" height="7" fill="#000000"/>
                        <rect x="1" y="23" width="5" height="5" fill="#FFFFFF"/>
                        <rect x="2" y="24" width="3" height="3" fill="#000000"/>
                        <rect x="22" y="22" width="5" height="5" fill="#000000"/>
                        <rect x="23" y="23" width="3" height="3" fill="#FFFFFF"/>
                        <rect x="24" y="24" width="1" height="1" fill="#000000"/>
                      </svg>
                    </div>
                  </div>
                )}

                {/* Footer Bar */}
                <div style={{
                  height: '80px',
                  backgroundColor: settings.brandColor,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0 0 12px 12px'
                }}>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: '4px'
                  }}>
                    {t('wizard.step3.qrBadges.preview.sampleEvent')}
                  </div>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}>
                    {t('wizard.step3.qrBadges.preview.sampleDate')}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Hint */}
            <div style={{
              textAlign: 'center',
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <Info size={16} style={{ color: '#9A9FA5' }} />
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#6F767E'
              }}>
                {t('wizard.step3.qrBadges.preview.hint')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TEMPLATE GALLERY MODAL */}
      {showTemplateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(26, 29, 31, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowTemplateModal(false)}
        >
          <div
            className="template-modal-content"
            style={{
              width: '1100px',
              maxHeight: '85vh',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '32px 40px',
              borderBottom: '1px solid #E9EAEB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '24px', 
                  fontWeight: 700, 
                  color: '#1A1D1F',
                  marginBottom: '8px'
                }}>
                  {t('wizard.step3.qrBadges.templates.modal.title')}
                </h2>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px', 
                  fontWeight: 400, 
                  color: '#6F767E'
                }}>
                  {t('wizard.step3.qrBadges.templates.modal.subtitle')}
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#F4F5F6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E9EAEB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
              >
                <X size={24} style={{ color: '#6F767E' }} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              padding: '40px',
              overflowY: 'auto',
              maxHeight: 'calc(85vh - 200px)'
            }}>
              {/* Category Filters */}
              <div className="template-category-tabs" style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '32px'
              }}>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setCategoryFilter(category.id)}
                    style={{
                      height: '36px',
                      padding: '0 20px',
                      borderRadius: '18px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      backgroundColor: categoryFilter === category.id ? '#635BFF' : '#F4F5F6',
                      color: categoryFilter === category.id ? '#FFFFFF' : '#6F767E',
                      border: categoryFilter === category.id ? 'none' : '1px solid #E9EAEB',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (categoryFilter !== category.id) {
                        e.currentTarget.style.backgroundColor = '#E9EAEB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (categoryFilter !== category.id) {
                        e.currentTarget.style.backgroundColor = '#F4F5F6';
                      }
                    }}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="template-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px'
              }}>
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    style={{
                      backgroundColor: '#FAFBFC',
                      borderRadius: '12px',
                      padding: '20px',
                      border: selectedTemplate === template.id ? '3px solid #635BFF' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '2px solid #635BFF';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTemplate !== template.id) {
                        e.currentTarget.style.border = '2px solid transparent';
                        e.currentTarget.style.backgroundColor = '#FAFBFC';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {/* Selected Indicator */}
                    {template.id === settings.templateId && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '28px',
                        height: '28px',
                        backgroundColor: '#1F7A3E',
                        borderRadius: '50%',
                        border: '3px solid #FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)'
                      }}>
                        <Check size={16} style={{ color: '#FFFFFF' }} />
                      </div>
                    )}

                    {/* Template Preview */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '2/3',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
                      marginBottom: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {/* Mini badge content */}
                      <div style={{ height: '40px', marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '24px', backgroundColor: '#E9EAEB', borderRadius: '4px' }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80%', height: '12px', backgroundColor: '#1A1D1F', borderRadius: '4px' }} />
                        <div style={{ width: '60%', height: '8px', backgroundColor: '#6F767E', borderRadius: '4px' }} />
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#000000', borderRadius: '4px', marginTop: '8px' }} />
                      </div>
                      <div style={{ height: '24px', backgroundColor: '#635BFF', borderRadius: '0 0 4px 4px', marginLeft: '-16px', marginRight: '-16px', marginBottom: '-16px' }} />
                    </div>

                    {/* Template Info */}
                    <div>
                      <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#1A1D1F',
                        marginBottom: '8px'
                      }}>
                        {template.name}
                      </div>
                      <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#6F767E',
                        marginBottom: '12px'
                      }}>
                        {template.description}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {template.features.map((feature, idx) => (
                          <div
                            key={idx}
                            style={{
                              height: '22px',
                              padding: '0 10px',
                              backgroundColor: '#E0E7FF',
                              borderRadius: '11px',
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#635BFF',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '24px 40px',
              borderTop: '1px solid #E9EAEB',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowTemplateModal(false)}
                style={{
                  height: '44px',
                  padding: '0 24px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #E9EAEB',
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#6F767E',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                {t('wizard.step3.qrBadges.templates.modal.cancel')}
              </button>
              <button
                onClick={applySelectedTemplate}
                disabled={!selectedTemplate}
                style={{
                  height: '44px',
                  padding: '0 24px',
                  backgroundColor: selectedTemplate ? '#635BFF' : '#E9EAEB',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: selectedTemplate ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: selectedTemplate ? 1 : 0.5,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedTemplate) e.currentTarget.style.backgroundColor = '#7C75FF';
                }}
                onMouseLeave={(e) => {
                  if (selectedTemplate) e.currentTarget.style.backgroundColor = '#635BFF';
                }}
              >
                <Check size={16} />
                {t('wizard.step3.qrBadges.templates.modal.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function ToggleItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: checked ? '#E0E7FF' : '#F4F5F6',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }}
      onClick={() => onChange(!checked)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <User size={16} style={{ color: '#6F767E' }} />
        <span style={{ 
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px', 
          fontWeight: 500, 
          color: '#1A1D1F'
        }}>
          {label}
        </span>
      </div>
      <div style={{
        width: '44px',
        height: '24px',
        backgroundColor: checked ? '#635BFF' : '#E9EAEB',
        borderRadius: '12px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: '#FFFFFF',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </div>
    </div>
  );
}

function QRPositionOption({ value, label, selected, onChange }: { value: string; label: string; selected: boolean; onChange: (value: string) => void }) {
  return (
    <div
      onClick={() => onChange(value)}
      style={{
        padding: '12px 16px',
        backgroundColor: selected ? '#FFFFFF' : '#F4F5F6',
        border: selected ? '2px solid #635BFF' : '2px solid transparent',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        border: `2px solid ${selected ? '#635BFF' : '#E9EAEB'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {selected && (
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#635BFF'
          }} />
        )}
      </div>
      <span style={{ 
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px', 
        fontWeight: 500, 
        color: '#1A1D1F'
      }}>
        {label}
        
      </span>
    </div>
  );
}
  