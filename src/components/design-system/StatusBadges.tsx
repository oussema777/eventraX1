import { Lock, Eye, Archive, Zap } from 'lucide-react';

export function StatusBadges() {
  const badges = [
    {
      label: 'Live',
      color: 'var(--success)',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      icon: Zap,
      description: 'Event is currently active and accepting registrations'
    },
    {
      label: 'Draft',
      color: 'var(--gray-600)',
      bgColor: 'var(--gray-100)',
      icon: Eye,
      description: 'Event is in draft mode and not visible to public'
    },
    {
      label: 'Archived',
      color: 'var(--muted-foreground)',
      bgColor: 'var(--muted)',
      icon: Archive,
      description: 'Event has ended and is archived'
    },
    {
      label: 'Premium',
      color: 'var(--warning)',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      icon: Lock,
      description: 'Premium feature - requires upgrade'
    }
  ];

  return (
    <section id="badges">
      <div className="mb-6">
        <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
          Status Badges
        </h3>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Clear status indicators with dot indicators and optional icons
        </p>
      </div>

      <div className="space-y-8">
        {/* Default Badges */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Default Badge Variants
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.label}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: badge.bgColor,
                    color: badge.color
                  }}
                >
                  {/* Dot Indicator */}
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: badge.color }}
                  />
                  <span className="text-xs" style={{ fontWeight: 600 }}>
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges with Icons */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Badges with Icons
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap gap-4">
              {badges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.label}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: badge.bgColor,
                      color: badge.color
                    }}
                  >
                    <Icon size={14} />
                    <span className="text-xs" style={{ fontWeight: 600 }}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Larger Badges */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Large Badges
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap gap-4">
              {badges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.label}
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: badge.bgColor,
                      color: badge.color
                    }}
                  >
                    <Icon size={16} />
                    <span className="text-sm" style={{ fontWeight: 600 }}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Badge Descriptions */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Badge Usage Guide
          </h4>

          <div className="grid md:grid-cols-2 gap-4">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className="bg-white rounded-xl p-6 shadow-light border border-[var(--border)]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: badge.bgColor }}
                    >
                      <Icon size={20} style={{ color: badge.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-sm"
                          style={{ fontWeight: 600, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: badge.color }}
                        />
                      </div>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Solid Badges */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Solid Badges (High Contrast)
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap gap-4">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--success)',
                  color: '#ffffff'
                }}
              >
                <Zap size={14} />
                <span className="text-xs" style={{ fontWeight: 600 }}>
                  Live
                </span>
              </div>

              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--gray-700)',
                  color: '#ffffff'
                }}
              >
                <Eye size={14} />
                <span className="text-xs" style={{ fontWeight: 600 }}>
                  Draft
                </span>
              </div>

              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--gray-500)',
                  color: '#ffffff'
                }}
              >
                <Archive size={14} />
                <span className="text-xs" style={{ fontWeight: 600 }}>
                  Archived
                </span>
              </div>

              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--warning)',
                  color: '#ffffff'
                }}
              >
                <Lock size={14} />
                <span className="text-xs" style={{ fontWeight: 600 }}>
                  Premium
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Count Badges */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Count Badges
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm">Notifications</span>
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    fontWeight: 600
                  }}
                >
                  5
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">New Events</span>
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontWeight: 600
                  }}
                >
                  12
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Messages</span>
                <div
                  className="flex items-center justify-center px-2 h-6 rounded-full text-xs"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    color: '#ffffff',
                    fontWeight: 600,
                    minWidth: '24px'
                  }}
                >
                  99+
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
