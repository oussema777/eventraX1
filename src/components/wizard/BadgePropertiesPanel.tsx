import { 
  QrCode, 
  ChevronDown, 
  Link as LinkIcon,
  Copy,
  Trash2
} from 'lucide-react';
import { useState } from 'react';

interface BadgePropertiesPanelProps {
  selectedElement: string;
}

export default function BadgePropertiesPanel({ selectedElement }: BadgePropertiesPanelProps) {
  const [qrDataSource, setQrDataSource] = useState<'ticket-url' | 'attendee-id' | 'custom-url'>('ticket-url');
  const [xPos, setXPos] = useState('280');
  const [yPos, setYPos] = useState('220');
  const [width, setWidth] = useState('100');
  const [height, setHeight] = useState('100');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [cornerRadius, setCornerRadius] = useState(8);
  const [padding, setPadding] = useState('8');
  const [showBorder, setShowBorder] = useState(false);
  const [dropShadow, setDropShadow] = useState(true);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  return (
    <div 
      className="rounded-xl p-6 border overflow-y-auto"
      style={{ 
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
        maxHeight: '800px'
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 
          className="text-lg mb-1"
          style={{ fontWeight: 600, color: '#FFFFFF' }}
        >
          Properties
        </h3>
        <p 
          className="text-xs"
          style={{ color: '#94A3B8' }}
        >
          Configure selected element
        </p>
      </div>

      <div 
        className="w-full h-px mb-6"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      />

      {/* Properties Form */}
      <div className="space-y-6">
        {/* Element Type */}
        <div>
          <div 
            className="text-xs mb-2"
            style={{ 
              fontWeight: 500,
              color: '#94A3B8',
              textTransform: 'uppercase'
            }}
          >
            Element Type
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border mb-2" style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2">
              <QrCode size={18} style={{ color: '#0684F5' }} />
              <span className="text-sm" style={{ color: '#FFFFFF' }}>QR Code</span>
            </div>
          </div>
          <button
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#94A3B8', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Change Element
          </button>
        </div>

        {/* Content */}
        <div>
          <div 
            className="text-sm mb-3"
            style={{ fontWeight: 500, color: '#0B2641' }}
          >
            QR Data Source
          </div>
          <div className="space-y-2">
            {[
              { id: 'ticket-url' as const, label: 'Ticket URL' },
              { id: 'attendee-id' as const, label: 'Attendee ID' },
              { id: 'custom-url' as const, label: 'Custom URL' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setQrDataSource(option.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left"
                style={{
                  borderColor: qrDataSource === option.id ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: qrDataSource === option.id ? 'var(--primary-light)' : 'transparent'
                }}
              >
                <div 
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: qrDataSource === option.id ? 'var(--primary)' : 'var(--gray-300)'
                  }}
                >
                  {qrDataSource === option.id && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--primary)' }}
                    />
                  )}
                </div>
                <span 
                  className="text-sm"
                  style={{ 
                    color: 'var(--foreground)',
                    fontWeight: qrDataSource === option.id ? 600 : 400
                  }}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Position & Size */}
        <div>
          <div 
            className="text-sm mb-3"
            style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
          >
            Position
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
                X
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={xPos}
                  onChange={(e) => setXPos(e.target.value)}
                  className="w-full h-11 px-3 pr-8 rounded-lg border outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <span 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  px
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
                Y
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={yPos}
                  onChange={(e) => setYPos(e.target.value)}
                  className="w-full h-11 px-3 pr-8 rounded-lg border outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <span 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  px
                </span>
              </div>
            </div>
          </div>

          <div 
            className="text-sm mb-3"
            style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
          >
            Size
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
                Width
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full h-11 px-3 pr-8 rounded-lg border outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <span 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  px
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
                Height
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full h-11 px-3 pr-8 rounded-lg border outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <span 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  px
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLockAspectRatio(!lockAspectRatio)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ backgroundColor: lockAspectRatio ? 'var(--primary)' : 'var(--switch-background)' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                style={{ left: lockAspectRatio ? 'calc(100% - 22px)' : '2px' }}
              />
            </button>
            <LinkIcon size={14} style={{ color: 'var(--muted-foreground)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Lock Aspect Ratio
            </span>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <div 
            className="text-sm mb-3"
            style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
          >
            Background
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-lg border-2 cursor-pointer"
              style={{ 
                backgroundColor: bgColor,
                borderColor: 'var(--border)'
              }}
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="flex-1 h-10 px-3 rounded-lg border outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div 
            className="text-sm mb-3"
            style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
          >
            Corner Radius ({cornerRadius}px)
          </div>
          <input
            type="range"
            min="0"
            max="16"
            value={cornerRadius}
            onChange={(e) => setCornerRadius(Number(e.target.value))}
            className="w-full mb-4"
          />

          <div 
            className="text-sm mb-3"
            style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
          >
            Padding
          </div>
          <div className="relative">
            <input
              type="text"
              value={padding}
              onChange={(e) => setPadding(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg border outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
            <span 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--muted-foreground)' }}
            >
              px
            </span>
          </div>
        </div>

        {/* Border */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div 
              className="text-sm"
              style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
            >
              Border
            </div>
            <button
              onClick={() => setShowBorder(!showBorder)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ backgroundColor: showBorder ? 'var(--primary)' : 'var(--switch-background)' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                style={{ left: showBorder ? 'calc(100% - 22px)' : '2px' }}
              />
            </button>
          </div>
        </div>

        {/* Shadow */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div 
              className="text-sm"
              style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}
            >
              Drop Shadow
            </div>
            <button
              onClick={() => setDropShadow(!dropShadow)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ backgroundColor: dropShadow ? 'var(--primary)' : 'var(--switch-background)' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                style={{ left: dropShadow ? 'calc(100% - 22px)' : '2px' }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div 
        className="w-full h-px my-6"
        style={{ backgroundColor: 'var(--border)' }}
      />

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          className="w-full h-11 px-4 rounded-lg border flex items-center justify-center gap-2 transition-colors hover:bg-gray-50"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <Copy size={16} />
          <span className="text-sm" style={{ fontWeight: 500 }}>Duplicate Element</span>
        </button>

        <button
          className="w-full h-11 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-red-50"
          style={{ color: 'var(--destructive)' }}
        >
          <Trash2 size={16} />
          <span className="text-sm" style={{ fontWeight: 500 }}>Delete Element</span>
        </button>
      </div>
    </div>
  );
}