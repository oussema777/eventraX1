import { Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function InputComponents() {
  const [toggleChecked, setToggleChecked] = useState(false);

  return (
    <section id="inputs">
      <div className="mb-6">
        <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
          Input Field Components
        </h3>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Form inputs with multiple states and clear visual feedback
        </p>
      </div>

      <div className="space-y-8">
        {/* Text Input - Default */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Text Input - Default State
          </h4>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="max-w-md space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                Event Name
              </label>
              <input
                type="text"
                placeholder="Enter event name..."
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 text-sm"
                style={{ 
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--foreground)',
                  height: '44px'
                }}
              />
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Choose a clear, descriptive name for your event
              </p>
            </div>
          </div>
        </div>

        {/* Text Input - Focus State */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Text Input - Focus State
          </h4>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="max-w-md space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                Event Location
              </label>
              <input
                type="text"
                placeholder="Enter location..."
                className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 text-sm"
                style={{ 
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--primary)',
                  color: 'var(--foreground)',
                  height: '44px',
                  boxShadow: '0 0 0 3px rgba(0, 212, 212, 0.1)'
                }}
                defaultValue="San Francisco, CA"
              />
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Where will your event take place?
              </p>
            </div>
          </div>
        </div>

        {/* Text Input - Error State */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Text Input - Error State
          </h4>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="max-w-md space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 text-sm"
                style={{ 
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--destructive)',
                  color: 'var(--foreground)',
                  height: '44px'
                }}
                defaultValue="invalid-email"
              />
              <p className="text-xs" style={{ color: 'var(--destructive)' }}>
                Please enter a valid email address
              </p>
            </div>
          </div>
        </div>

        {/* Text Input - Disabled State */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Text Input - Disabled State
          </h4>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="max-w-md space-y-1.5">
              <label className="block text-xs font-medium opacity-50" style={{ color: 'var(--foreground)' }}>
                Registration Code
              </label>
              <input
                type="text"
                placeholder="Auto-generated"
                disabled
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 text-sm opacity-50 cursor-not-allowed"
                style={{ 
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--muted-foreground)',
                  height: '44px'
                }}
                defaultValue="EVT-2025-001"
              />
              <p className="text-xs opacity-50" style={{ color: 'var(--muted-foreground)' }}>
                This field is automatically generated
              </p>
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Textarea
          </h4>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="max-w-md space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                Event Description
              </label>
              <textarea
                placeholder="Describe your event..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 text-sm resize-none"
                style={{ 
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--foreground)'
                }}
              />
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Maximum 500 characters
              </p>
            </div>
          </div>
        </div>

        {/* Dropdown/Select */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Dropdown / Select
          </h4>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="max-w-md space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                Event Category
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-200 text-sm appearance-none cursor-pointer"
                  style={{ 
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--foreground)',
                    height: '44px',
                    paddingRight: '40px'
                  }}
                >
                  <option>Select a category...</option>
                  <option>Conference</option>
                  <option>Workshop</option>
                  <option>Webinar</option>
                  <option>Networking</option>
                  <option>Social</option>
                </select>
                <ChevronDown 
                  size={20} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--muted-foreground)' }}
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Choose the most relevant category
              </p>
            </div>
          </div>
        </div>

        {/* Date Picker */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Date Picker
          </h4>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="max-w-md space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                Event Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-200 text-sm"
                  style={{ 
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--foreground)',
                    height: '44px',
                    paddingRight: '40px'
                  }}
                />
                <Calendar 
                  size={20} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--muted-foreground)' }}
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Select the date for your event
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Switch */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Toggle Switch
          </h4>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="max-w-md space-y-6">
              {/* Off State */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Registrations</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Allow attendees to register for this event
                  </p>
                </div>
                <button
                  onClick={() => setToggleChecked(!toggleChecked)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
                  style={{ 
                    backgroundColor: toggleChecked ? 'var(--primary)' : 'var(--switch-background)'
                  }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-light"
                    style={{ 
                      transform: toggleChecked ? 'translateX(26px)' : 'translateX(4px)'
                    }}
                  />
                </button>
              </div>

              {/* On State Example */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Send Notifications</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Email notifications to attendees
                  </p>
                </div>
                <button
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-light"
                    style={{ transform: 'translateX(26px)' }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Checkbox */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Checkbox
          </h4>
          
          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="max-w-md space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-2 transition-colors cursor-pointer"
                  style={{ 
                    borderColor: 'var(--input-border)',
                    accentColor: 'var(--primary)'
                  }}
                />
                <div>
                  <p className="text-sm font-medium">Accept terms and conditions</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    I agree to the event terms and privacy policy
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 h-5 w-5 rounded border-2 transition-colors cursor-pointer"
                  style={{ 
                    borderColor: 'var(--primary)',
                    accentColor: 'var(--primary)'
                  }}
                />
                <div>
                  <p className="text-sm font-medium">Receive event updates</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Get email updates about this event
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
