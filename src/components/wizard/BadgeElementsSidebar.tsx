import { 
  Type, 
  Building, 
  Briefcase, 
  AlignLeft,
  Image,
  User,
  QrCode,
  Barcode,
  Hash,
  Square,
  Star,
  GripVertical,
  ChevronDown
} from 'lucide-react';

export default function BadgeElementsSidebar() {
  const textElements = [
    { id: 'attendee-name', icon: Type, label: 'Attendee Name' },
    { id: 'company', icon: Building, label: 'Company/Organization' },
    { id: 'job-title', icon: Briefcase, label: 'Job Title' },
    { id: 'custom-text', icon: AlignLeft, label: 'Custom Text' }
  ];

  const imageElements = [
    { id: 'event-logo', icon: Image, label: 'Event Logo' },
    { id: 'profile-photo', icon: User, label: 'Profile Photo' },
    { id: 'company-logo', icon: Building, label: 'Company Logo' }
  ];

  const dataElements = [
    { id: 'qr-code', icon: QrCode, label: 'QR Code', subtitle: 'For check-in' },
    { id: 'barcode', icon: Barcode, label: 'Barcode' },
    { id: 'ticket-number', icon: Hash, label: 'Ticket Number' }
  ];

  const decorativeElements = [
    { id: 'shape', icon: Square, label: 'Shape' },
    { id: 'icon', icon: Star, label: 'Icon' },
    { id: 'background-image', icon: Image, label: 'Background Image' }
  ];

  const DraggableElement = ({ element }: { element: any }) => {
    const Icon = element.icon;
    
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg border border-dashed cursor-grab transition-all hover:border-solid active:cursor-grabbing active:opacity-50"
        style={{
          borderColor: 'rgba(255,255,255,0.2)',
          backgroundColor: 'rgba(255,255,255,0.05)'
        }}
        draggable
      >
        <Icon size={18} style={{ color: '#0684F5' }} />
        <div className="flex-1">
          <div 
            className="text-sm"
            style={{ fontWeight: 500, color: '#FFFFFF' }}
          >
            {element.label}
          </div>
          {element.subtitle && (
            <div 
              className="text-xs"
              style={{ color: '#94A3B8' }}
            >
              {element.subtitle}
            </div>
          )}
        </div>
        <GripVertical size={16} style={{ color: '#94A3B8' }} />
      </div>
    );
  };

  const ElementSection = ({ title, elements }: { title: string; elements: any[] }) => (
    <div>
      <div 
        className="text-xs mb-3"
        style={{ 
          fontWeight: 500,
          color: '#94A3B8',
          letterSpacing: '0.05em'
        }}
      >
        {title}
      </div>
      <div className="space-y-2">
        {elements.map((element) => (
          <DraggableElement key={element.id} element={element} />
        ))}
      </div>
    </div>
  );

  return (
    <div 
      className="rounded-xl p-6 border"
      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 
          className="text-lg mb-1"
          style={{ fontWeight: 600, color: '#FFFFFF' }}
        >
          Badge Elements
        </h3>
        <p 
          className="text-xs"
          style={{ color: '#94A3B8' }}
        >
          Drag elements onto the badge
        </p>
      </div>

      {/* Element Sections */}
      <div className="space-y-5">
        <ElementSection title="TEXT FIELDS" elements={textElements} />
        <ElementSection title="IMAGES" elements={imageElements} />
        <ElementSection title="DATA & CODES" elements={dataElements} />
        <ElementSection title="DECORATION" elements={decorativeElements} />
      </div>

      {/* Divider */}
      <div 
        className="w-full h-px my-6"
        style={{ backgroundColor: '#E5E7EB' }}
      />

      {/* Load Preset */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors hover:bg-gray-50"
        style={{
          borderColor: '#E5E7EB',
          color: '#0B2641'
        }}
      >
        <span className="text-sm" style={{ fontWeight: 500 }}>Load Preset</span>
        <ChevronDown size={16} style={{ color: '#6B7280' }} />
      </button>
    </div>
  );
}