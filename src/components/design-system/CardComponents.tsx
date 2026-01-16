import { Calendar, Users, MapPin, TrendingUp, Clock, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

export function CardComponents() {
  return (
    <section id="cards">
      <div className="mb-6">
        <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
          Card Components
        </h3>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Flexible card layouts with hover effects and shadows - inspired by Confetti\'s clean design
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Card */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Basic Card
          </h4>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Default State */}
            <div
              className="bg-white rounded-xl p-6 border transition-all duration-300"
              style={{
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                Event Card
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                A simple card with default styling and subtle shadow
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontWeight: 600
                  }}
                >
                  Action
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Hover State */}
            <div
              className="bg-white rounded-xl p-6 border transition-all duration-300 transform scale-[1.02] cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-medium)'
              }}
            >
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                Hover State
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Card with enhanced shadow and subtle lift on hover
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontWeight: 600
                  }}
                >
                  Action
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Event Card - Full Example */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Event Card (Full Example)
          </h4>

          <div className="grid md:grid-cols-3 gap-6">
            <div
              className="bg-white rounded-xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              style={{
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              {/* Image Header */}
              <div
                className="h-40 bg-gradient-to-br relative"
                style={{
                  backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
                }}
              >
                <div className="absolute top-3 right-3">
                  <div
                    className="px-2 py-1 rounded-full text-xs backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--success)',
                      fontWeight: 600
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--success)' }} />
                      Live
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                  Tech Conference 2025
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                  Join us for an exciting day of innovation and networking
                </p>

                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Calendar size={14} />
                    <span>Dec 15, 2025</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <MapPin size={14} />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Users size={14} />
                    <span>248 registered</span>
                  </div>
                </div>

                {/* Action */}
                <button
                  className="w-full py-2 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontWeight: 600
                  }}
                >
                  View Event
                </button>
              </div>
            </div>

            {/* Second Event Card */}
            <div
              className="bg-white rounded-xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              style={{
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              <div
                className="h-40 bg-gradient-to-br"
                style={{
                  backgroundImage: 'linear-gradient(135deg, var(--accent) 0%, var(--warning) 100%)'
                }}
              >
                <div className="absolute top-3 right-3">
                  <div
                    className="px-2 py-1 rounded-full text-xs backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--gray-600)',
                      fontWeight: 600
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--gray-600)' }} />
                      Draft
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                  Workshop: Design Systems
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                  Learn how to build scalable design systems
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Calendar size={14} />
                    <span>Jan 20, 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <MapPin size={14} />
                    <span>Online Event</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Users size={14} />
                    <span>12 registered</span>
                  </div>
                </div>

                <button
                  className="w-full py-2 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                    fontWeight: 600
                  }}
                >
                  Continue Editing
                </button>
              </div>
            </div>

            {/* Third Event Card */}
            <div
              className="bg-white rounded-xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              style={{
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              <div
                className="h-40 bg-gradient-to-br"
                style={{
                  backgroundImage: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)'
                }}
              >
                <div className="absolute top-3 right-3">
                  <div
                    className="px-2 py-1 rounded-full text-xs backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--warning)',
                      fontWeight: 600
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--warning)' }} />
                      Premium
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                  Networking Mixer
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                  Connect with industry leaders and innovators
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Calendar size={14} />
                    <span>Feb 5, 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <MapPin size={14} />
                    <span>New York, NY</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Users size={14} />
                    <span>89 registered</span>
                  </div>
                </div>

                <button
                  className="w-full py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
                    color: '#ffffff',
                    fontWeight: 600
                  }}
                >
                  View Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Stats Card
          </h4>

          <div className="grid md:grid-cols-4 gap-6">
            <div
              className="bg-white rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(0, 212, 212, 0.1)' }}
                >
                  <Users size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <TrendingUp size={16} style={{ color: 'var(--success)' }} />
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Total Attendees
              </p>
              <p className="text-2xl" style={{ fontWeight: 700 }}>
                2,847
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>
                +12% from last month
              </p>
            </div>

            <div
              className="bg-white rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(255, 87, 34, 0.1)' }}
                >
                  <Calendar size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <TrendingUp size={16} style={{ color: 'var(--success)' }} />
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Active Events
              </p>
              <p className="text-2xl" style={{ fontWeight: 700 }}>
                24
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>
                +3 new this week
              </p>
            </div>

            <div
              className="bg-white rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(213, 0, 109, 0.1)' }}
                >
                  <Clock size={20} style={{ color: 'var(--secondary)' }} />
                </div>
                <TrendingUp size={16} style={{ color: 'var(--success)' }} />
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Avg. Duration
              </p>
              <p className="text-2xl" style={{ fontWeight: 700 }}>
                3.5h
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                Per event
              </p>
            </div>

            <div
              className="bg-white rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <TrendingUp size={20} style={{ color: 'var(--success)' }} />
                </div>
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Satisfaction
              </p>
              <p className="text-2xl" style={{ fontWeight: 700 }}>
                98%
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>
                +5% increase
              </p>
            </div>
          </div>
        </div>

        {/* Action Card with Menu */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Card with Action Menu
          </h4>

          <div className="max-w-md">
            <div
              className="bg-white rounded-xl p-6 border transition-all duration-300"
              style={{
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                    Annual Summit
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Created 2 days ago
                  </p>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>Status</span>
                  <div
                    className="px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--success)',
                      fontWeight: 600
                    }}
                  >
                    Live
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>Attendees</span>
                  <span style={{ fontWeight: 600 }}>124</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    fontWeight: 600
                  }}
                >
                  <Eye size={16} />
                  View
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontWeight: 600
                  }}
                >
                  <Edit size={16} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
