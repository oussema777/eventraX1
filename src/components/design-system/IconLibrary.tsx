import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Users,
  Lock,
  Eye,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Upload,
  Settings,
  Bell,
  Menu,
  Home,
  Search,
  Heart,
  Star,
  Mail,
  Phone,
  MapPin,
  Clock,
  Download,
  Share2,
  Filter,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Zap,
  Globe
} from 'lucide-react';

export function IconLibrary() {
  const iconGroups = [
    {
      title: 'Actions',
      icons: [
        { Icon: Plus, name: 'Plus' },
        { Icon: Edit, name: 'Edit' },
        { Icon: Copy, name: 'Copy' },
        { Icon: Trash2, name: 'Trash' },
        { Icon: Upload, name: 'Upload' },
        { Icon: Download, name: 'Download' },
        { Icon: Share2, name: 'Share' },
        { Icon: Search, name: 'Search' }
      ]
    },
    {
      title: 'Navigation',
      icons: [
        { Icon: ChevronDown, name: 'ChevronDown' },
        { Icon: ChevronRight, name: 'ChevronRight' },
        { Icon: Menu, name: 'Menu' },
        { Icon: Home, name: 'Home' },
        { Icon: ExternalLink, name: 'ExternalLink' },
        { Icon: MoreVertical, name: 'More' }
      ]
    },
    {
      title: 'Status & Feedback',
      icons: [
        { Icon: Check, name: 'Check' },
        { Icon: X, name: 'Close' },
        { Icon: Eye, name: 'Eye' },
        { Icon: Lock, name: 'Lock' },
        { Icon: AlertCircle, name: 'Alert' },
        { Icon: Info, name: 'Info' },
        { Icon: HelpCircle, name: 'Help' },
        { Icon: TrendingUp, name: 'Trending' }
      ]
    },
    {
      title: 'Event & Content',
      icons: [
        { Icon: Calendar, name: 'Calendar' },
        { Icon: Users, name: 'Users' },
        { Icon: Clock, name: 'Clock' },
        { Icon: MapPin, name: 'Location' },
        { Icon: Star, name: 'Star' },
        { Icon: Heart, name: 'Heart' },
        { Icon: Zap, name: 'Zap' },
        { Icon: Globe, name: 'Globe' }
      ]
    },
    {
      title: 'Communication',
      icons: [
        { Icon: Mail, name: 'Mail' },
        { Icon: Phone, name: 'Phone' },
        { Icon: Bell, name: 'Bell' },
        { Icon: Settings, name: 'Settings' },
        { Icon: Filter, name: 'Filter' }
      ]
    }
  ];

  return (
    <section id="icons">
      <div className="mb-6">
        <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
          Icon Library
        </h3>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Consistent 24px icons from Lucide React - clean, professional, and scalable
        </p>
      </div>

      <div className="space-y-8">
        {iconGroups.map((group) => (
          <div key={group.title}>
            <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
              {group.title}
            </h4>

            <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
              <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
                {group.icons.map(({ Icon, name }) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                      style={{ backgroundColor: 'var(--gray-100)' }}
                    >
                      <Icon size={24} style={{ color: 'var(--foreground)' }} />
                    </div>
                    <span className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Icon Sizes */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Icon Sizes
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex items-end gap-8">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--gray-100)' }}
                >
                  <Star size={14} style={{ color: 'var(--foreground)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  14px
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--gray-100)' }}
                >
                  <Star size={16} style={{ color: 'var(--foreground)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  16px
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--gray-100)' }}
                >
                  <Star size={20} style={{ color: 'var(--foreground)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  20px
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--gray-100)' }}
                >
                  <Star size={24} style={{ color: 'var(--foreground)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  24px (Default)
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--gray-100)' }}
                >
                  <Star size={32} style={{ color: 'var(--foreground)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  32px
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-20 h-20 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--gray-100)' }}
                >
                  <Star size={48} style={{ color: 'var(--foreground)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  48px
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Icon Colors */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Icon Colors
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0, 212, 212, 0.1)' }}
                >
                  <Zap size={24} style={{ color: 'var(--primary)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Primary
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 87, 34, 0.1)' }}
                >
                  <Zap size={24} style={{ color: 'var(--accent)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Accent
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(213, 0, 109, 0.1)' }}
                >
                  <Heart size={24} style={{ color: 'var(--secondary)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Secondary
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <Check size={24} style={{ color: 'var(--success)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Success
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                >
                  <Lock size={24} style={{ color: 'var(--warning)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Warning
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <AlertCircle size={24} style={{ color: 'var(--destructive)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Destructive
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--gray-100)' }}
                >
                  <Settings size={24} style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Muted
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Icon in Context */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Icons in Context
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="space-y-6">
              {/* In Button */}
              <div>
                <p className="text-sm mb-3" style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}>
                  In Buttons
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      fontWeight: 600
                    }}
                  >
                    <Plus size={18} />
                    Create Event
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                      fontWeight: 600
                    }}
                  >
                    <Download size={18} />
                    Export
                  </button>
                </div>
              </div>

              {/* In List */}
              <div>
                <p className="text-sm mb-3" style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}>
                  In Lists
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Calendar size={20} style={{ color: 'var(--primary)' }} />
                    <span className="text-sm">Upcoming Events</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Users size={20} style={{ color: 'var(--accent)' }} />
                    <span className="text-sm">Manage Attendees</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Settings size={20} style={{ color: 'var(--muted-foreground)' }} />
                    <span className="text-sm">Settings</span>
                  </div>
                </div>
              </div>

              {/* In Input */}
              <div>
                <p className="text-sm mb-3" style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}>
                  In Input Fields
                </p>
                <div className="relative max-w-sm">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: 'var(--input-background)',
                      borderColor: 'var(--input-border)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
