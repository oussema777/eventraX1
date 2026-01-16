import { Plus, Lock, ChevronRight, Upload } from 'lucide-react';

export function ButtonComponents() {
  return (
    <section id="buttons">
      <div className="mb-6">
        <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
          Button Components
        </h3>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Versatile button system with multiple variants and states
        </p>
      </div>

      <div className="space-y-8">
        {/* Primary Buttons */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Primary Button
          </h4>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Main call-to-action with cyan background (Confetti signature color)
          </p>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap gap-4">
              {/* Default */}
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-light hover:shadow-medium text-sm font-semibold"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  height: '44px'
                }}
              >
                Create Event
              </button>

              {/* With Icon Left */}
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-light hover:shadow-medium text-sm font-semibold"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  height: '44px'
                }}
              >
                <Plus size={18} />
                New Event
              </button>

              {/* Hover State Demo */}
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg shadow-medium scale-105 text-sm font-semibold"
                style={{ 
                  backgroundColor: 'var(--primary-hover)',
                  color: 'var(--primary-foreground)',
                  height: '44px'
                }}
              >
                Hover State
              </button>

              {/* Disabled */}
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg opacity-50 cursor-not-allowed text-sm font-semibold"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  height: '44px'
                }}
              >
                Disabled
              </button>
            </div>
          </div>
        </div>

        {/* Accent Buttons */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Accent Button (Orange CTA)
          </h4>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            High-visibility action button with Confetti\'s orange accent
          </p>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap gap-4">
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-light hover:shadow-medium text-sm font-semibold"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  height: '44px'
                }}
              >
                Publish Event
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-light hover:shadow-medium text-sm font-semibold"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  height: '44px'
                }}
              >
                <Upload size={18} />
                Upload Now
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg shadow-medium scale-105 text-sm font-semibold"
                style={{ 
                  backgroundColor: 'var(--accent-hover)',
                  color: 'var(--accent-foreground)',
                  height: '44px'
                }}
              >
                Hover State
              </button>
            </div>
          </div>
        </div>

        {/* Secondary/Outline Buttons */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Secondary / Outline Button
          </h4>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Transparent background with border, subtle hover effect
          </p>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap gap-4">
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:bg-[var(--gray-50)] text-sm font-semibold"
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--primary)',
                  border: '2px solid var(--primary)',
                  height: '44px'
                }}
              >
                Preview
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:bg-[var(--gray-50)] text-sm font-semibold"
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--foreground)',
                  border: '2px solid var(--border)',
                  height: '44px'
                }}
              >
                Cancel
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:bg-[var(--gray-50)] text-sm font-semibold"
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--foreground)',
                  border: '2px solid var(--border)',
                  height: '44px'
                }}
              >
                Learn More
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Ghost Buttons */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Ghost Button
          </h4>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Transparent with no border, subtle background on hover
          </p>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap gap-4">
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:bg-[var(--gray-100)] text-sm font-semibold"
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--foreground)',
                  height: '44px'
                }}
              >
                Skip
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:bg-[var(--gray-100)] text-sm font-semibold"
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--muted-foreground)',
                  height: '44px'
                }}
              >
                View Details
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--gray-100)] text-sm font-semibold"
                style={{ 
                  color: 'var(--foreground)',
                  height: '44px'
                }}
              >
                Hover State
              </button>
            </div>
          </div>
        </div>

        {/* Premium/Pro Button */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Premium / Pro Button
          </h4>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Gradient gold/amber for premium features with lock icon
          </p>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap gap-4">
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-light hover:shadow-medium text-sm font-semibold relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
                  color: '#ffffff',
                  height: '44px'
                }}
              >
                <Lock size={18} />
                Upgrade to Pro
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-light hover:shadow-medium text-sm font-semibold relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #D97706 0%, #EA580C 100%)',
                  color: '#ffffff',
                  height: '44px'
                }}
              >
                <Lock size={18} />
                Premium Feature
              </button>
            </div>
          </div>
        </div>

        {/* Size Variations */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Size Variations
          </h4>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="flex flex-wrap items-center gap-4">
              {/* Small */}
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-light text-xs font-semibold"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  height: '36px'
                }}
              >
                Small
              </button>

              {/* Default */}
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-light text-sm font-semibold"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  height: '44px'
                }}
              >
                Default
              </button>

              {/* Large */}
              <button
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-light text-base font-semibold"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  height: '52px'
                }}
              >
                Large
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
