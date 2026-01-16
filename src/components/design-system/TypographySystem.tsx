export function TypographySystem() {
  const textStyles = [
    {
      name: 'Display / Hero',
      element: 'h1',
      size: '48px',
      weight: 'Bold (700)',
      lineHeight: '1.2',
      usage: 'Landing pages, hero sections'
    },
    {
      name: 'H1 Page Title',
      element: 'h1',
      size: '32px',
      weight: 'Semibold (600)',
      lineHeight: '1.3',
      usage: 'Main page headings'
    },
    {
      name: 'H2 Section',
      element: 'h2',
      size: '24px',
      weight: 'Semibold (600)',
      lineHeight: '1.4',
      usage: 'Section headers'
    },
    {
      name: 'H3 Card Title',
      element: 'h3',
      size: '18px',
      weight: 'Semibold (600)',
      lineHeight: '1.5',
      usage: 'Card titles, subsections'
    },
    {
      name: 'Body Large',
      element: 'p',
      size: '16px',
      weight: 'Regular (400)',
      lineHeight: '1.6',
      usage: 'Intro paragraphs, important body text'
    },
    {
      name: 'Body',
      element: 'p',
      size: '14px',
      weight: 'Regular (400)',
      lineHeight: '1.6',
      usage: 'Default body text, descriptions'
    },
    {
      name: 'Caption',
      element: 'span',
      size: '12px',
      weight: 'Medium (500)',
      lineHeight: '1.5',
      usage: 'Labels, helper text, metadata'
    },
    {
      name: 'Button',
      element: 'button',
      size: '14px',
      weight: 'Semibold (600)',
      lineHeight: '1',
      usage: 'Button labels, CTAs'
    }
  ];

  const getFontSize = (size: string) => {
    const map: Record<string, string> = {
      '48px': 'text-5xl',
      '32px': 'text-3xl',
      '24px': 'text-2xl',
      '18px': 'text-lg',
      '16px': 'text-base',
      '14px': 'text-sm',
      '12px': 'text-xs'
    };
    return map[size] || 'text-base';
  };

  const getFontWeight = (weight: string) => {
    if (weight.includes('700')) return 'font-bold';
    if (weight.includes('600')) return 'font-semibold';
    if (weight.includes('500')) return 'font-medium';
    return 'font-normal';
  };

  const getLineHeight = (lh: string) => {
    const map: Record<string, string> = {
      '1.2': 'leading-tight',
      '1.3': 'leading-snug',
      '1.4': 'leading-snug',
      '1.5': 'leading-normal',
      '1.6': 'leading-relaxed',
      '1': 'leading-none'
    };
    return map[lh] || 'leading-normal';
  };

  return (
    <section id="typography">
      <div className="mb-6">
        <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
          Typography System
        </h3>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Clean, readable type hierarchy using Inter or similar modern sans-serif
        </p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
        <div className="space-y-8">
          {textStyles.map((style, index) => (
            <div key={index} className="border-b border-[var(--border)] pb-6 last:border-b-0 last:pb-0">
              <div className="grid md:grid-cols-[1fr_2fr] gap-6">
                {/* Metadata */}
                <div className="space-y-2">
                  <h4 className="text-sm" style={{ fontWeight: 600 }}>
                    {style.name}
                  </h4>
                  <div className="space-y-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <p>Size: {style.size}</p>
                    <p>Weight: {style.weight}</p>
                    <p>Line Height: {style.lineHeight}</p>
                    <p className="pt-2 italic">{style.usage}</p>
                  </div>
                </div>

                {/* Example */}
                <div>
                  {style.element === 'h1' && style.size === '48px' && (
                    <h1 className={`${getFontSize(style.size)} ${getFontWeight(style.weight)} ${getLineHeight(style.lineHeight)}`}>
                      Make events easier
                    </h1>
                  )}
                  {style.element === 'h1' && style.size === '32px' && (
                    <h1 className={`${getFontSize(style.size)} ${getFontWeight(style.weight)} ${getLineHeight(style.lineHeight)}`}>
                      Create Your Perfect Event
                    </h1>
                  )}
                  {style.element === 'h2' && (
                    <h2 className={`${getFontSize(style.size)} ${getFontWeight(style.weight)} ${getLineHeight(style.lineHeight)}`}>
                      Event Management Made Simple
                    </h2>
                  )}
                  {style.element === 'h3' && (
                    <h3 className={`${getFontSize(style.size)} ${getFontWeight(style.weight)} ${getLineHeight(style.lineHeight)}`}>
                      Card Title Example
                    </h3>
                  )}
                  {style.element === 'p' && style.size === '16px' && (
                    <p className={`${getFontSize(style.size)} ${getFontWeight(style.weight)} ${getLineHeight(style.lineHeight)}`}>
                      Create beautiful event experiences with our comprehensive platform. Manage registrations, attendees, and more.
                    </p>
                  )}
                  {style.element === 'p' && style.size === '14px' && (
                    <p className={`${getFontSize(style.size)} ${getFontWeight(style.weight)} ${getLineHeight(style.lineHeight)}`}>
                      This is the default body text used throughout the application for descriptions, content, and general information.
                    </p>
                  )}
                  {style.element === 'span' && (
                    <span className={`${getFontSize(style.size)} ${getFontWeight(style.weight)} ${getLineHeight(style.lineHeight)}`}>
                      Helper text · Caption · Label
                    </span>
                  )}
                  {style.element === 'button' && (
                    <span className={`${getFontSize(style.size)} ${getFontWeight(style.weight)} ${getLineHeight(style.lineHeight)}`}>
                      Button Label
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
