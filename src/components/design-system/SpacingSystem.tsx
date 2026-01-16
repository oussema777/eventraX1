export function SpacingSystem() {
  const spacingSizes = [
    { name: 'XS', value: '4px', var: '--spacing-xs' },
    { name: 'SM', value: '8px', var: '--spacing-sm' },
    { name: 'MD', value: '16px', var: '--spacing-md' },
    { name: 'LG', value: '24px', var: '--spacing-lg' },
    { name: 'XL', value: '32px', var: '--spacing-xl' },
    { name: '2XL', value: '48px', var: '--spacing-2xl' },
    { name: '3XL', value: '64px', var: '--spacing-3xl' }
  ];

  const shadows = [
    {
      name: 'Light',
      description: 'Subtle shadow for cards and containers',
      value: 'var(--shadow-light)',
      usage: 'Default cards, input fields'
    },
    {
      name: 'Medium',
      description: 'Enhanced shadow for hover states',
      value: 'var(--shadow-medium)',
      usage: 'Hover effects, elevated elements'
    },
    {
      name: 'Strong',
      description: 'Prominent shadow for modals and dialogs',
      value: 'var(--shadow-strong)',
      usage: 'Modals, dropdowns, popovers'
    },
    {
      name: 'Focus',
      description: 'Colored glow for focus states',
      value: 'var(--shadow-focus)',
      usage: 'Focused inputs, active elements'
    }
  ];

  return (
    <section id="spacing">
      <div className="mb-6">
        <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
          Spacing & Shadows
        </h3>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Consistent spacing scale and shadow system for visual hierarchy
        </p>
      </div>

      <div className="space-y-8">
        {/* Spacing Scale */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Spacing Scale
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="space-y-6">
              {spacingSizes.map((spacing) => (
                <div key={spacing.name} className="flex items-center gap-6">
                  <div className="w-16 text-sm" style={{ fontWeight: 600 }}>
                    {spacing.name}
                  </div>
                  <div className="flex-1 flex items-center gap-4">
                    <div
                      className="h-12 rounded transition-all duration-300 hover:scale-105"
                      style={{
                        width: spacing.value,
                        backgroundColor: 'var(--primary)',
                        minWidth: '4px'
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm" style={{ fontWeight: 500 }}>
                        {spacing.value}
                      </span>
                      <code className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {spacing.var}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spacing in Use */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Spacing Examples
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="space-y-8">
              {/* Component Spacing */}
              <div>
                <p className="text-sm mb-3" style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}>
                  Component Padding (24px)
                </p>
                <div
                  className="rounded-lg border-2 border-dashed inline-block"
                  style={{ borderColor: 'var(--primary)' }}
                >
                  <div
                    className="bg-white rounded-lg"
                    style={{
                      padding: '24px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div className="text-sm">Card Content</div>
                  </div>
                </div>
              </div>

              {/* Stack Spacing */}
              <div>
                <p className="text-sm mb-3" style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}>
                  Stack Spacing (16px gap)
                </p>
                <div className="space-y-4 max-w-sm">
                  <div className="h-12 rounded-lg" style={{ backgroundColor: 'var(--gray-100)' }} />
                  <div className="h-12 rounded-lg" style={{ backgroundColor: 'var(--gray-100)' }} />
                  <div className="h-12 rounded-lg" style={{ backgroundColor: 'var(--gray-100)' }} />
                </div>
              </div>

              {/* Inline Spacing */}
              <div>
                <p className="text-sm mb-3" style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}>
                  Inline Spacing (8px gap)
                </p>
                <div className="flex gap-2">
                  <div className="w-16 h-12 rounded-lg" style={{ backgroundColor: 'var(--primary)' }} />
                  <div className="w-16 h-12 rounded-lg" style={{ backgroundColor: 'var(--accent)' }} />
                  <div className="w-16 h-12 rounded-lg" style={{ backgroundColor: 'var(--secondary)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shadow System */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Shadow System
          </h4>

          <div className="grid md:grid-cols-2 gap-6">
            {shadows.map((shadow) => (
              <div
                key={shadow.name}
                className="bg-white rounded-xl p-6 border"
                style={{
                  borderColor: 'var(--border)',
                  boxShadow: shadow.value
                }}
              >
                <h5 className="text-base mb-2" style={{ fontWeight: 600 }}>
                  {shadow.name}
                </h5>
                <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                  {shadow.description}
                </p>
                <div className="text-xs p-2 rounded" style={{ backgroundColor: 'var(--gray-50)' }}>
                  <code style={{ color: 'var(--muted-foreground)' }}>
                    box-shadow: {shadow.value}
                  </code>
                </div>
                <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
                  Usage: {shadow.usage}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Border Radius
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div
                  className="w-full h-24 mx-auto"
                  style={{
                    backgroundColor: 'var(--primary)',
                    borderRadius: '4px'
                  }}
                />
                <div>
                  <p className="text-sm" style={{ fontWeight: 500 }}>
                    Small
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    4px
                  </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div
                  className="w-full h-24 mx-auto"
                  style={{
                    backgroundColor: 'var(--accent)',
                    borderRadius: '8px'
                  }}
                />
                <div>
                  <p className="text-sm" style={{ fontWeight: 500 }}>
                    Default
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    8px
                  </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div
                  className="w-full h-24 mx-auto"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    borderRadius: '12px'
                  }}
                />
                <div>
                  <p className="text-sm" style={{ fontWeight: 500 }}>
                    Large
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    12px
                  </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div
                  className="w-full h-24 mx-auto"
                  style={{
                    backgroundColor: 'var(--warning)',
                    borderRadius: '16px'
                  }}
                />
                <div>
                  <p className="text-sm" style={{ fontWeight: 500 }}>
                    XL
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    16px
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Usage Guidelines
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h5 className="text-base mb-3" style={{ fontWeight: 600, color: 'var(--success)' }}>
                  ✓ Do
                </h5>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <li>• Use consistent spacing throughout your design</li>
                  <li>• Follow the 4px base unit for all spacing</li>
                  <li>• Use larger spacing (24px+) for section separation</li>
                  <li>• Apply shadows to elevated content</li>
                  <li>• Use focus shadows for interactive elements</li>
                </ul>
              </div>

              <div>
                <h5 className="text-base mb-3" style={{ fontWeight: 600, color: 'var(--destructive)' }}>
                  ✗ Don&apos;t
                </h5>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <li>• Use arbitrary spacing values (e.g., 13px, 27px)</li>
                  <li>• Mix too many different spacing sizes</li>
                  <li>• Overuse strong shadows</li>
                  <li>• Apply shadows to flat UI elements</li>
                  <li>• Forget to add spacing between sections</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
