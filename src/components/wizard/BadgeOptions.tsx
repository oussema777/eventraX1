import { ChevronDown, Printer } from 'lucide-react';

interface BadgeOptionsProps {
  badgeOrientation: 'portrait' | 'landscape';
  setBadgeOrientation: (orientation: 'portrait' | 'landscape') => void;
  badgeSize: string;
  setBadgeSize: (size: string) => void;
}

export default function BadgeOptions({ 
  badgeOrientation, 
  setBadgeOrientation,
  badgeSize,
  setBadgeSize
}: BadgeOptionsProps) {
  return (
    <div 
      className="bg-white rounded-lg px-6 py-4 border flex flex-wrap items-center justify-center gap-4"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Badge Orientation */}
      <div className="relative">
        <button
          className="h-10 px-4 rounded-lg border flex items-center gap-2 transition-colors hover:bg-gray-50"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <span className="text-sm">
            Badge Orientation: <span style={{ fontWeight: 600 }}>
              {badgeOrientation === 'portrait' ? 'Portrait' : 'Landscape'}
            </span>
          </span>
          <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
        </button>
      </div>

      {/* Divider */}
      <div 
        className="w-px h-6 hidden md:block"
        style={{ backgroundColor: 'var(--border)' }}
      />

      {/* Badge Size */}
      <div className="relative">
        <button
          className="h-10 px-4 rounded-lg border flex items-center gap-2 transition-colors hover:bg-gray-50"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <span className="text-sm">
            Badge Size: <span style={{ fontWeight: 600 }}>Standard 4x3</span>
          </span>
          <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
        </button>
      </div>

      {/* Divider */}
      <div 
        className="w-px h-6 hidden md:block"
        style={{ backgroundColor: 'var(--border)' }}
      />

      {/* Print Settings */}
      <button
        className="h-10 px-4 rounded-lg border flex items-center gap-2 transition-colors hover:bg-gray-50"
        style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
      >
        <Printer size={16} />
        <span className="text-sm" style={{ fontWeight: 500 }}>Print Settings</span>
      </button>
    </div>
  );
}
