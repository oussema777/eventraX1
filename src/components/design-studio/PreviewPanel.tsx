import { useEffect, useRef, useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize,
  ExternalLink,
  RotateCcw,
  Globe
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

interface PreviewPanelProps {
  children: React.ReactNode;
  activeBlocks?: any[];
  brandColor?: string;
  brandColorSecondary?: string;
  fontFamily?: string;
  buttonRadius?: number;
  logoUrl?: string;
  eventId?: string;
  previewContent?: any;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function PreviewPanel({ children, activeBlocks = [], brandColor = '#635BFF', brandColorSecondary = '#7C75FF', fontFamily = 'inter', buttonRadius = 12, logoUrl, eventId, previewContent }: PreviewPanelProps) {
  const { t } = useI18n();
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [zoom, setZoom] = useState(100);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    handleResize();
    window?.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry?.contentRect) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isNarrow = viewportWidth > 0 && viewportWidth < 640;

  const getCanvasBaseWidth = () => {
    switch (device) {
      case 'tablet':
        return 768;
      case 'mobile':
        return 375;
      default:
        return 1200;
    }
  };

  const measuredWidth = containerWidth > 0 ? containerWidth : viewportWidth;
  const availableWidth = Math.max(measuredWidth - 40, 280);
  const rawBaseWidth = getCanvasBaseWidth();
  const baseWidth = !isNarrow && device === 'desktop' ? availableWidth : rawBaseWidth;
  const frameWidth = isNarrow ? availableWidth : Math.min(baseWidth, availableWidth);
  const fitScale = Math.min(1, frameWidth / baseWidth);
  const canvasScale = (zoom / 100) * fitScale;

  const handleZoomIn = () => {
    if (zoom < 150) setZoom(zoom + 10);
  };

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 10);
  };

  const handleReset = () => {
    setZoom(100);
    setDevice('desktop');
  };

  const handleFullscreen = () => {
    const elem = document.getElementById('preview-canvas');
    if (elem) {
      // Check if fullscreen is supported and allowed
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
          console.warn('Fullscreen request failed:', err);
          // Fallback: Open in new tab instead
          handlePreviewNewTab();
        });
      } else {
        // Fallback: Open in new tab if fullscreen not supported
        handlePreviewNewTab();
      }
    }
  };

  const handlePreviewNewTab = () => {
    // Save preview data to localStorage
    const previewData = {
      activeBlocks,
      brandColor,
      brandColorSecondary,
      fontFamily,
      buttonRadius,
      logoUrl
    };
    localStorage.setItem('designStudioPreview', JSON.stringify(previewData));
    
    // Save content data to localStorage
    if (previewContent) {
      localStorage.setItem('designStudioContent', JSON.stringify(previewContent));
    }
    
    // Open preview in new tab
    window.open('/design-studio-preview', '_blank');
  };

  const getFontFamily = (font: string) => {
    switch (font) {
      case 'inter': return "'Inter', sans-serif";
      case 'roboto': return "'Roboto', sans-serif";
      case 'poppins': return "'Poppins', sans-serif";
      case 'montserrat': return "'Montserrat', sans-serif";
      case 'open-sans': return "'Open Sans', sans-serif";
      case 'lato': return "'Lato', sans-serif";
      default: return "'Inter', sans-serif";
    }
  };

  const handleLivePreview = async () => {
    if (!eventId) {
      console.warn('Missing event id for live preview.');
      return;
    }
    const livePort = import.meta.env.VITE_EVENTS_APP_PORT || '3001';
    const liveUrl = new URL(`${window.location.protocol}//${window.location.hostname}:${livePort}/`);
    liveUrl.searchParams.set('eventId', eventId);
    window.open(liveUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      ref={containerRef}
      className="h-auto lg:h-[calc(100vh-72px)]"
      style={{
        flex: 1,
        backgroundColor: '#0B2641',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px',
        position: 'relative'
      }}
    >
      {/* Sticky Header Controls - Optimized for responsiveness */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#0B2641',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '12px 16px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          {/* Left: Device Toggle */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '4px',
              borderRadius: '8px'
            }}
          >
            {[
              { type: 'desktop' as DeviceType, icon: Monitor, label: t('wizard.designStudio.preview.devices.desktop') },
              { type: 'tablet' as DeviceType, icon: Tablet, label: t('wizard.designStudio.preview.devices.tablet') },
              { type: 'mobile' as DeviceType, icon: Smartphone, label: t('wizard.designStudio.preview.devices.mobile') }
            ].map((deviceOption) => {
              const Icon = deviceOption.icon;
              const isActive = device === deviceOption.type;

              return (
                <button
                  key={deviceOption.type}
                  onClick={() => setDevice(deviceOption.type)}
                  title={deviceOption.label}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0px 2px 4px rgba(0, 0, 0, 0.08)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? '#0684F5' : 'rgba(255, 255, 255, 0.6)' }} />
                </button>
              );
            })}
          </div>

          {/* Center: Zoom Controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              title={t('wizard.designStudio.preview.zoomOut')}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: zoom <= 50 ? 'not-allowed' : 'pointer',
                opacity: zoom <= 50 ? 0.4 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (zoom > 50) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <ZoomOut size={16} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
            </button>

            <div
              style={{
                minWidth: '50px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              {zoom}%
            </div>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 150}
              title={t('wizard.designStudio.preview.zoomIn')}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: zoom >= 150 ? 'not-allowed' : 'pointer',
                opacity: zoom >= 150 ? 0.4 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (zoom < 150) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <ZoomIn size={16} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
            </button>

            <button
              onClick={handleReset}
              title={t('wizard.designStudio.preview.reset')}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              <RotateCcw size={16} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
            </button>
          </div>

          {/* Right: Preview Actions */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleLivePreview}
              title={t('wizard.designStudio.preview.live')}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              <Globe size={16} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
            </button>

            <button
              onClick={handleFullscreen}
              title={t('wizard.designStudio.preview.fullscreen')}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              <Maximize size={16} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
            </button>

            <button
              onClick={handlePreviewNewTab}
              title={t('wizard.designStudio.preview.newTab')}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#0684F5',
                borderRadius: '8px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0570D6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0684F5';
              }}
            >
              <ExternalLink size={16} style={{ color: '#FFFFFF' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Canvas Container */}
      <div
        className="min-h-0 lg:min-h-[calc(100vh-200px)]"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      >
        <div
          style={{
            width: `${frameWidth}px`,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div
            id="preview-canvas"
            className="min-h-0 lg:min-h-[800px]"
            style={{
              width: `${baseWidth}px`,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
              overflow: 'hidden',
              transform: `scale(${canvasScale})`,
              transformOrigin: 'top center',
              transition: 'width 0.3s ease, transform 0.3s ease',
              position: 'relative',
              margin: '0 auto',
              fontFamily: getFontFamily(fontFamily)
            }}
          >
            {/* Browser Chrome Mockup */}
            <div
              style={{
                height: '40px',
                backgroundColor: '#F4F5F6',
                borderRadius: '12px 12px 0 0',
                padding: '8px 12px',
                display: 'flex',
                gap: '6px',
                alignItems: 'center'
              }}
            >
              {/* Traffic Lights */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#DC2626'
                  }}
                />
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B'
                  }}
                />
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981'
                  }}
                />
              </div>

              {/* URL Bar */}
              <div
                style={{
                  flex: 1,
                  height: '24px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: '#9A9FA5'
                }}
              >
                {t('wizard.designStudio.preview.url')}
              </div>
            </div>

            {/* Page Content */}
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
