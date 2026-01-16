export function ColorSystem() {
  const colorGroups = [
    {
      title: 'Primary Colors',
      description: 'Vibrant cyan/turquoise - Confetti\'s signature color for primary actions and brand identity',
      colors: [
        { name: 'Primary', var: '--primary', textVar: '--primary-foreground' },
        { name: 'Primary Hover', var: '--primary-hover', textVar: '--primary-foreground' },
      ]
    },
    {
      title: 'Accent Colors',
      description: 'Bright orange for call-to-action buttons and important highlights',
      colors: [
        { name: 'Accent', var: '--accent', textVar: '--accent-foreground' },
        { name: 'Accent Hover', var: '--accent-hover', textVar: '--accent-foreground' },
      ]
    },
    {
      title: 'Secondary & Status Colors',
      description: 'Additional brand colors and status indicators',
      colors: [
        { name: 'Secondary (Magenta)', var: '--secondary', textVar: '--secondary-foreground' },
        { name: 'Success', var: '--success', textVar: '--success-foreground' },
        { name: 'Warning (Premium)', var: '--warning', textVar: '--warning-foreground' },
        { name: 'Destructive', var: '--destructive', textVar: '--destructive-foreground' },
      ]
    },
    {
      title: 'Dark Backgrounds',
      description: 'Navy and dark colors for contrast sections',
      colors: [
        { name: 'Navy', var: '--navy', textVar: '--navy-foreground' },
        { name: 'Sidebar Dark', var: '--sidebar-dark', textVar: '--sidebar-dark-foreground' },
      ]
    },
    {
      title: 'Neutrals',
      description: 'Gray scale for backgrounds, borders, and text',
      colors: [
        { name: 'Gray 50', var: '--gray-50', textVar: '--gray-900' },
        { name: 'Gray 100', var: '--gray-100', textVar: '--gray-900' },
        { name: 'Gray 200', var: '--gray-200', textVar: '--gray-900' },
        { name: 'Gray 300', var: '--gray-300', textVar: '--gray-900' },
        { name: 'Gray 400', var: '--gray-400', textVar: '--gray-900' },
        { name: 'Gray 500', var: '--gray-500', textVar: '--gray-50' },
        { name: 'Gray 600', var: '--gray-600', textVar: '--gray-50' },
        { name: 'Gray 700', var: '--gray-700', textVar: '--gray-50' },
        { name: 'Gray 800', var: '--gray-800', textVar: '--gray-50' },
        { name: 'Gray 900', var: '--gray-900', textVar: '--gray-50' },
      ]
    }
  ];

  return (
    <section id="colors">
      <div className="mb-6">
        <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
          Color System
        </h3>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Vibrant, energetic palette inspired by Confetti.events with professional undertones
        </p>
      </div>

      <div className="space-y-8">
        {colorGroups.map((group) => (
          <div key={group.title}>
            <h4 className="text-lg mb-2" style={{ fontWeight: 600 }}>
              {group.title}
            </h4>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
              {group.description}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {group.colors.map((color) => (
                <div key={color.name} className="space-y-2">
                  <div 
                    className="h-24 rounded-lg shadow-light flex items-center justify-center transition-transform hover:scale-105"
                    style={{ 
                      backgroundColor: `var(${color.var})`,
                      color: `var(${color.textVar})`
                    }}
                  >
                    <span className="text-xs" style={{ fontWeight: 600 }}>Aa</span>
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 500 }}>{color.name}</p>
                    <code className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {color.var}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
