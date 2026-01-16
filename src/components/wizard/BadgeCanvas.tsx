import { 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Ruler,
  ChevronDown,
  User,
  Eye,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';

interface BadgeCanvasProps {
  selectedElement: string;
  setSelectedElement: (element: string) => void;
  orientation: 'portrait' | 'landscape';
}

export default function BadgeCanvas({ selectedElement, setSelectedElement, orientation }: BadgeCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showLayers, setShowLayers] = useState(true);

  return (
    <div 
      className="rounded-xl p-4 md:p-10"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
    >
      {/* Canvas Toolbar */}
      <div 
        className="rounded-lg px-3 py-3 md:px-5 md:py-3 mb-6 flex flex-wrap items-center justify-between border gap-3"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {/* Left Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            title="Undo"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Undo size={18} />
          </button>
          <button 
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            title="Redo"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Redo size={18} />
          </button>

          <div 
            className="w-px h-6 mx-2 hidden md:block"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          />

          <button 
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            onClick={() => setZoom(Math.max(50, zoom - 25))}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ZoomOut size={18} />
          </button>

          <button
            className="px-3 h-9 rounded-lg border flex items-center gap-1 transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="text-sm" style={{ fontWeight: 500 }}>{zoom}%</span>
            <ChevronDown size={14} style={{ color: '#94A3B8' }} />
          </button>

          <button 
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            onClick={() => setZoom(Math.min(150, zoom + 25))}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ZoomIn size={18} />
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm hidden md:inline" style={{ color: '#FFFFFF' }}>Show Grid</span>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ backgroundColor: showGrid ? '#0684F5' : 'rgba(255,255,255,0.2)' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                style={{ left: showGrid ? 'calc(100% - 22px)' : '2px' }}
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm hidden md:inline" style={{ color: '#FFFFFF' }}>Snap to Grid</span>
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ backgroundColor: snapToGrid ? '#0684F5' : 'rgba(255,255,255,0.2)' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                style={{ left: snapToGrid ? 'calc(100% - 22px)' : '2px' }}
              />
            </button>
          </div>

          <button 
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            title="Ruler"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Ruler size={18} />
          </button>
        </div>
      </div>

      {/* Badge Canvas */}
      <div className="flex items-center justify-center mb-6 overflow-x-auto pb-4">
        <div
          className="bg-white rounded-2xl border-2 relative flex-shrink-0"
          style={{
            width: '400px',
            height: '300px',
            borderColor: 'rgba(255,255,255,0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
          }}
        >
          {/* Event Logo */}
          <div 
            className="absolute top-5 left-5 w-15 h-15 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
          >
            <div 
              className="text-xs"
              style={{ fontWeight: 700, color: '#1D4ED8' }}
            >
              LOGO
            </div>
          </div>

          {/* Event Name */}
          <div className="absolute top-5 right-5">
            <div 
              className="text-base text-white text-right"
              style={{ fontWeight: 700 }}
            >
              SaaS Summit 2024
            </div>
          </div>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Profile Photo */}
            <div 
              className="w-30 h-30 rounded-full bg-white border-4 border-white flex items-center justify-center mb-3"
              style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}
            >
              <User size={48} style={{ color: '#9CA3AF' }} />
            </div>

            {/* Name */}
            <div 
              className="text-3xl text-white text-center mb-1"
              style={{ fontWeight: 700, letterSpacing: '0.05em' }}
            >
              JOHN SMITH
            </div>

            {/* Company */}
            <div 
              className="text-sm text-white text-center"
              style={{ opacity: 0.9 }}
            >
              Tech Innovations Inc.
            </div>

            {/* Job Title */}
            <div 
              className="text-sm text-white text-center"
              style={{ opacity: 0.9 }}
            >
              Senior Product Manager
            </div>
          </div>

          {/* QR Code - Selected Element */}
          <div
            className="absolute bottom-5 right-5 cursor-move"
            onClick={() => setSelectedElement('qrcode')}
          >
            <div 
              className="w-25 h-25 bg-white rounded-lg flex items-center justify-center relative"
              style={{
                border: selectedElement === 'qrcode' ? '3px solid #0684F5' : 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* QR Code Pattern */}
              <div className="grid grid-cols-5 gap-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3"
                    style={{ 
                      backgroundColor: Math.random() > 0.5 ? 'black' : 'white'
                    }}
                  />
                ))}
              </div>

              {/* Resize Handles */}
              {selectedElement === 'qrcode' && (
                <>
                  {/* Corner Handles */}
                  {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((position) => (
                    <div
                      key={position}
                      className="absolute w-2 h-2 bg-white rounded-full border-2"
                      style={{
                        borderColor: '#0684F5',
                        top: position.includes('top') ? '-4px' : 'auto',
                        bottom: position.includes('bottom') ? '-4px' : 'auto',
                        left: position.includes('left') ? '-4px' : 'auto',
                        right: position.includes('right') ? '-4px' : 'auto',
                        cursor: `${position.includes('top') ? 'n' : 's'}${position.includes('left') ? 'w' : 'e'}-resize`
                      }}
                    />
                  ))}

                  {/* Edge Handles */}
                  {['top', 'right', 'bottom', 'left'].map((position) => (
                    <div
                      key={position}
                      className="absolute w-2 h-2 bg-white rounded-full border-2"
                      style={{
                        borderColor: '#0684F5',
                        top: position === 'top' ? '-4px' : position === 'bottom' ? 'auto' : '50%',
                        bottom: position === 'bottom' ? '-4px' : 'auto',
                        left: position === 'left' ? '-4px' : position === 'right' ? 'auto' : '50%',
                        right: position === 'right' ? '-4px' : 'auto',
                        transform: ['top', 'bottom'].includes(position) ? 'translateX(-50%)' : ['left', 'right'].includes(position) ? 'translateY(-50%)' : 'none',
                        cursor: `${position === 'top' || position === 'bottom' ? 'ns' : 'ew'}-resize`
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Ticket Number */}
          <div className="absolute bottom-5 left-5">
            <div 
              className="text-xs text-white"
              style={{ opacity: 0.7 }}
            >
              #12345
            </div>
          </div>
        </div>
      </div>

      {/* Layer Panel */}
      {showLayers && (
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="w-full flex items-center justify-between px-4 py-3 border-b transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div className="flex items-center gap-2">
              <span 
                className="text-sm"
                style={{ fontWeight: 600, color: '#FFFFFF' }}
              >
                Layers
              </span>
              <span 
                className="text-xs px-2 py-0.5 rounded"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#94A3B8'
                }}
              >
                8 elements
              </span>
            </div>
            <ChevronUp size={16} style={{ color: '#94A3B8' }} />
          </button>

          <div className="p-2 space-y-1">
            {[
              'Background Gradient',
              'Event Logo',
              'Event Name',
              'Profile Photo',
              'Attendee Name',
              'Company Name',
              'Job Title',
              'QR Code'
            ].map((layer, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: layer === 'QR Code' ? 'rgba(6,132,245,0.2)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (layer !== 'QR Code') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  if (layer !== 'QR Code') e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <button className="w-5 h-5 flex items-center justify-center">
                  <Eye size={14} style={{ color: '#94A3B8' }} />
                </button>
                <span 
                  className="text-sm flex-1"
                  style={{ 
                    color: '#FFFFFF',
                    fontWeight: layer === 'QR Code' ? 600 : 400
                  }}
                >
                  {layer}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}