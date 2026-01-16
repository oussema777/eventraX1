import { Monitor, Tablet, Smartphone, Calendar, MapPin, Users } from 'lucide-react';

interface LivePreviewProps {
  primaryColor: string;
  secondaryColor: string;
  cornerRadius: number;
  headingFont: string;
  bodyFont: string;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  setPreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  handleBlockEdit?: (blockId: string) => void;
  handleBlockHover?: (blockId: string | null) => void;
  hoveredBlock?: string | null;
  selectedTemplate?: string;
}

export default function LivePreview({
  primaryColor,
  secondaryColor,
  cornerRadius,
  headingFont,
  bodyFont,
  previewDevice,
  setPreviewDevice,
  handleBlockEdit,
  handleBlockHover,
  hoveredBlock,
  selectedTemplate = 'modern'
}: LivePreviewProps) {
  const getDeviceWidth = () => {
    switch (previewDevice) {
      case 'tablet': return '768px';
      case 'mobile': return '375px';
      default: return '100%';
    }
  };

  // Template configurations
  const getTemplateHeroImage = () => {
    switch (selectedTemplate) {
      case 'elegant':
        return 'https://images.unsplash.com/photo-1511578314322-379afb476865?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
      case 'bold':
        return 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
      default:
        return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
    }
  };

  const getTemplateLayout = () => {
    switch (selectedTemplate) {
      case 'elegant':
        return 'centered';
      case 'bold':
        return 'split';
      default:
        return 'full';
    }
  };

  const devices = [
    { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { id: 'tablet' as const, icon: Tablet, label: 'Tablet' },
    { id: 'mobile' as const, icon: Smartphone, label: 'Mobile' }
  ];

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Browser Chrome */}
      <div 
        className="bg-white rounded-t-xl p-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between">
          {/* macOS Dots */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFBD2E' }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28CA42' }} />
          </div>

          {/* URL Bar */}
          <div 
            className="flex-1 mx-8 px-4 py-2 rounded-lg text-xs text-center"
            style={{ 
              backgroundColor: 'var(--gray-100)',
              color: 'var(--muted-foreground)'
            }}
          >
            eventra.app/events/saas-summit-2024
          </div>

          {/* Device Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {devices.map((device) => {
              const Icon = device.icon;
              return (
                <button
                  key={device.id}
                  onClick={() => setPreviewDevice(device.id)}
                  className="p-1.5 rounded transition-colors"
                  style={{
                    backgroundColor: previewDevice === device.id ? 'white' : 'transparent',
                    boxShadow: previewDevice === device.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                  title={device.label}
                >
                  <Icon 
                    size={16} 
                    style={{ 
                      color: previewDevice === device.id ? 'var(--primary)' : 'var(--muted-foreground)'
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preview Canvas */}
      <div 
        className="bg-white rounded-b-xl overflow-hidden transition-all duration-300"
        style={{ 
          maxWidth: getDeviceWidth(),
          margin: '0 auto',
          boxShadow: 'var(--shadow-strong)'
        }}
      >
        {/* Hero Section */}
        <div 
          className="relative overflow-hidden"
          style={{ 
            height: '400px',
            backgroundImage: `url(${getTemplateHeroImage()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Gradient Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)'
            }}
          />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 sm:px-8">
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl mb-4"
              style={{ 
                fontFamily: headingFont,
                fontWeight: 700,
                color: 'white'
              }}
            >
              SaaS Summit 2024
            </h1>
            <p 
              className="text-base sm:text-lg lg:text-xl mb-6"
              style={{ 
                fontFamily: bodyFont,
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              Future of Innovation
            </p>

            {/* Date Chip */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-6 text-sm"
              style={{ 
                borderRadius: `${cornerRadius * 2}px`,
                fontWeight: 500
              }}
            >
              <Calendar size={16} />
              Dec 15-17, 2024
            </div>

            {/* Register Button */}
            <button
              className="px-8 py-3 text-white transition-transform hover:scale-105"
              style={{ 
                backgroundColor: primaryColor,
                borderRadius: `${cornerRadius}px`,
                fontFamily: bodyFont,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              Register Now
            </button>
          </div>
        </div>

        {/* Event Details Section */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Date Card */}
            <div 
              className="text-center p-6 rounded-xl"
              style={{ 
                backgroundColor: '#F9FAFB',
                borderRadius: `${cornerRadius}px`
              }}
            >
              <div 
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Calendar size={24} style={{ color: primaryColor }} />
              </div>
              <div 
                className="text-xs mb-1"
                style={{ 
                  fontFamily: bodyFont,
                  color: '#6B7280'
                }}
              >
                Date
              </div>
              <div 
                className="text-sm"
                style={{ 
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  color: '#0B2641'
                }}
              >
                Dec 15-17
              </div>
            </div>

            {/* Location Card */}
            <div 
              className="text-center p-6 rounded-xl"
              style={{ 
                backgroundColor: '#F9FAFB',
                borderRadius: `${cornerRadius}px`
              }}
            >
              <div 
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <MapPin size={24} style={{ color: primaryColor }} />
              </div>
              <div 
                className="text-xs mb-1"
                style={{ 
                  fontFamily: bodyFont,
                  color: '#6B7280'
                }}
              >
                Location
              </div>
              <div 
                className="text-sm"
                style={{ 
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  color: '#0B2641'
                }}
              >
                San Francisco
              </div>
            </div>

            {/* Attendees Card */}
            <div 
              className="text-center p-6 rounded-xl"
              style={{ 
                backgroundColor: '#F9FAFB',
                borderRadius: `${cornerRadius}px`
              }}
            >
              <div 
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${secondaryColor}20` }}
              >
                <Users size={24} style={{ color: secondaryColor }} />
              </div>
              <div 
                className="text-xs mb-1"
                style={{ 
                  fontFamily: bodyFont,
                  color: '#6B7280'
                }}
              >
                Attendees
              </div>
              <div 
                className="text-sm"
                style={{ 
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  color: '#0B2641'
                }}
              >
                1,247
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div 
          className="p-6 sm:p-10 lg:p-12"
          style={{ backgroundColor: '#F9FAFB' }}
        >
          <h2 
            className="text-2xl sm:text-3xl mb-4"
            style={{ 
              fontFamily: headingFont,
              fontWeight: 600,
              color: '#0B2641'
            }}
          >
            About This Event
          </h2>
          <p 
            className="text-base mb-4 leading-relaxed"
            style={{ 
              fontFamily: bodyFont,
              color: '#4B5563'
            }}
          >
            Join us for the premier SaaS conference of 2024, bringing together industry leaders, 
            innovators, and entrepreneurs to explore the future of software as a service. 
            Network with peers, learn from experts, and discover the latest trends shaping our industry.
          </p>
          <button 
            className="transition-opacity hover:opacity-80"
            style={{ 
              color: primaryColor,
              fontFamily: bodyFont,
              fontWeight: 600
            }}
          >
            Read More →
          </button>
        </div>

        {/* Sponsors Section */}
        <div className="p-6 sm:p-10 lg:p-12">
          <h2 
            className="text-2xl sm:text-3xl mb-8 text-center"
            style={{ 
              fontFamily: headingFont,
              fontWeight: 600,
              color: '#0B2641'
            }}
          >
            Our Sponsors
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i}
                className="aspect-square rounded-lg flex items-center justify-center transition-transform hover:scale-105"
                style={{ 
                  backgroundColor: '#F3F4F6',
                  borderRadius: `${cornerRadius}px`
                }}
              >
                <div 
                  className="text-2xl"
                  style={{ 
                    fontFamily: headingFont,
                    fontWeight: 700,
                    color: '#D1D5DB'
                  }}
                >
                  Logo
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div 
          className="h-64 flex items-center justify-center"
          style={{ backgroundColor: '#E5E7EB' }}
        >
          <div className="text-center">
            <MapPin size={48} style={{ color: '#9CA3AF' }} className="mx-auto mb-2" />
            <p 
              className="text-sm"
              style={{ 
                fontFamily: bodyFont,
                color: '#4B5563',
                fontWeight: 500
              }}
            >
              123 Conference Center, San Francisco, CA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
