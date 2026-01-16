# Color Application Guide - Eventra Platform

## Critical Rules for Color Contrast

### ⚠️ Golden Rule
**Background color determines text color:**
- Dark backgrounds (#0B2641) → White text (#FFFFFF)
- Light backgrounds (white/light gray) → Dark text (#0B2641 or #1A1A1A)

## Background Types & Color Pairings

### 1. Dark Navy Background (#0B2641)
**Where**: Main page backgrounds, wizards, dark sections

**Text Colors:**
- Primary text: `#FFFFFF` (white)
- Secondary text: `rgba(255, 255, 255, 0.7)` (70% opacity white)
- Muted text: CSS variable `var(--muted-foreground)`

**Interactive Elements:**
- Primary buttons: `#0684F5` background + white text
- Secondary buttons: Transparent background + `#0684F5` border + white text
- Links: `#0684F5`
- Icons: White or `#0684F5`

**Borders & Dividers:**
- `rgba(255, 255, 255, 0.1)` or CSS variable `var(--border)`
- Accent borders: `#4A7C6D`

**Example:**
```tsx
<div style={{ backgroundColor: 'var(--background)' }}>
  <h1 style={{ color: 'var(--foreground)' }}>White Heading</h1>
  <p style={{ color: 'var(--muted-foreground)' }}>Muted white text</p>
  <button style={{ 
    backgroundColor: 'var(--primary)', 
    color: 'var(--primary-foreground)' 
  }}>
    CTA Button
  </button>
</div>
```

---

### 2. Light Card Background (#1A3A5C or white)
**Where**: Cards, panels, elevated surfaces on dark backgrounds

**Text Colors:**
- Primary text: `#FFFFFF` (white) - for #1A3A5C cards
- Primary text: `#0B2641` or `#1A1A1A` (dark) - for white cards
- Secondary text: Adjust based on card background
- Links: `#0684F5`

**Interactive Elements:**
- Primary buttons: `#0684F5` background + white text
- Secondary buttons: White background + `#0684F5` text (on dark) OR `#0B2641` border + dark text (on light)
- Icons: Match text color

**Borders:**
- `var(--border)` adapts to context
- Hover states: `var(--primary)`

**Example - Dark Card:**
```tsx
<div style={{ backgroundColor: 'var(--card)' }}>
  <h2 style={{ color: 'var(--card-foreground)' }}>Card Title</h2>
  <p style={{ color: 'var(--muted-foreground)' }}>Card content</p>
</div>
```

**Example - White Card:**
```tsx
<div style={{ backgroundColor: '#FFFFFF' }}>
  <h2 style={{ color: '#0B2641' }}>Dark Card Title</h2>
  <p style={{ color: '#6B7280' }}>Gray card content</p>
  <a style={{ color: '#0684F5' }}>Blue link</a>
</div>
```

---

### 3. White/Light Gray Background (#FFFFFF or #F8F9FA)
**Where**: Landing page cards, dashboard cards, white panels

**Text Colors:**
- Primary text: `#0B2641` or `#1A1A1A` (dark navy/black)
- Secondary text: `#6B7280` or `#94A3B8` (gray variations)
- Muted text: `#9CA3AF`
- Links: `#0684F5`

**Interactive Elements:**
- Primary buttons: `#0684F5` background + white text
- Secondary buttons: White background + `#0684F5` border + `#0684F5` text
- Ghost buttons: Transparent background + `#0B2641` text
- Icons: `#0B2641` or `#0684F5`

**Borders:**
- `#E5E7EB` or `#D1D5DB` (gray borders)
- Hover states: `#0684F5`

**Example:**
```tsx
<div style={{ backgroundColor: '#FFFFFF' }}>
  <h2 style={{ color: '#0B2641', fontWeight: 600 }}>
    Event Card Title
  </h2>
  <p style={{ color: '#6B7280' }}>
    Event description text
  </p>
  <button style={{ 
    backgroundColor: '#0684F5', 
    color: '#FFFFFF' 
  }}>
    Register Now
  </button>
</div>
```

---

## Component-Specific Guidelines

### Navigation Bar
**Background**: `var(--background)` (#0B2641)
**Text**: White (`var(--foreground)`)
**Logo**: Uses provided logo image (optimized for dark background)
**Links**: White with hover opacity
**Active state**: `var(--primary)` underline

```tsx
<nav style={{ backgroundColor: 'var(--background)' }}>
  <a style={{ color: 'var(--foreground)' }}>Menu Item</a>
  <button style={{ 
    backgroundColor: 'var(--primary)', 
    color: 'var(--primary-foreground)' 
  }}>
    Create Event
  </button>
</nav>
```

---

### Wizard Pages
**Background**: `var(--background)` (#0B2641)
**Progress stepper background**: `var(--card)` (#1A3A5C)
**Text**: White throughout
**Form inputs**: 
- Background: `rgba(255, 255, 255, 0.05)`
- Border: `rgba(255, 255, 255, 0.2)`
- Text: White
- Placeholder: `rgba(255, 255, 255, 0.6)`

```tsx
<div style={{ backgroundColor: 'var(--background)' }}>
  <input
    style={{
      backgroundColor: 'var(--input-background)',
      border: '1px solid var(--input-border)',
      color: 'var(--foreground)'
    }}
    placeholder="Enter event name"
  />
</div>
```

---

### Dashboard Event Cards
**Background**: `#FFFFFF` (white cards)
**Text**: 
- Title: `#0B2641` (dark)
- Body: `#6B7280` (gray)
- Meta info: `#9CA3AF` (light gray)
**Badges/Tags**: 
- Background: `#F3F4F6`
- Text: `#6B7280`
**Hover state**: 
- Border color changes to `#0684F5`
- Slight lift with shadow

```tsx
<div 
  className="card-hover"
  style={{ 
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB'
  }}
>
  <h3 style={{ color: '#0B2641', fontWeight: 600 }}>
    SaaS Summit 2024
  </h3>
  <p style={{ color: '#6B7280' }}>
    Conference • Dec 15-17
  </p>
  <span style={{ 
    backgroundColor: '#F3F4F6', 
    color: '#6B7280' 
  }}>
    Live
  </span>
</div>
```

---

### Buttons

#### Primary CTA (All Contexts)
```tsx
<button style={{
  backgroundColor: 'var(--primary)',
  color: 'var(--primary-foreground)',
  border: 'none'
}}>
  Primary Action
</button>
```

#### Secondary Button (Dark Background)
```tsx
<button style={{
  backgroundColor: 'transparent',
  color: 'var(--foreground)',
  border: '1px solid var(--border)'
}}>
  Secondary Action
</button>
```

#### Secondary Button (Light Background)
```tsx
<button style={{
  backgroundColor: '#FFFFFF',
  color: '#0684F5',
  border: '1px solid #0684F5'
}}>
  Secondary Action
</button>
```

#### Destructive Button
```tsx
<button style={{
  backgroundColor: 'var(--destructive)',
  color: 'var(--destructive-foreground)'
}}>
  Delete
</button>
```

---

### Form Elements

#### Input (Dark Background)
```tsx
<input
  style={{
    backgroundColor: 'var(--input-background)',
    border: '1px solid var(--input-border)',
    color: 'var(--foreground)'
  }}
  placeholder="Placeholder text"
/>
```

#### Input (Light Background)
```tsx
<input
  style={{
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    color: '#0B2641'
  }}
  placeholder="Placeholder text"
/>
```

---

### Status Badges

#### Success (Green)
```tsx
<span style={{
  backgroundColor: 'var(--success)',
  color: 'var(--success-foreground)',
  padding: '4px 12px',
  borderRadius: '12px'
}}>
  Live
</span>
```

#### Warning (Amber)
```tsx
<span style={{
  backgroundColor: 'var(--warning)',
  color: 'var(--warning-foreground)',
  padding: '4px 12px',
  borderRadius: '12px'
}}>
  Draft
</span>
```

#### Info (Blue)
```tsx
<span style={{
  backgroundColor: 'var(--primary)',
  color: 'var(--primary-foreground)',
  padding: '4px 12px',
  borderRadius: '12px'
}}>
  Upcoming
</span>
```

---

## Accessibility Checklist

When implementing colors, verify:

- [ ] **Contrast Ratio**: Minimum 4.5:1 for normal text
- [ ] **Large Text**: Minimum 3:1 for text 18pt+ or 14pt bold+
- [ ] **Interactive Elements**: Clear focus states with `var(--ring)`
- [ ] **Color Independence**: Don't rely solely on color to convey information
- [ ] **Hover States**: Visible changes on interactive elements
- [ ] **Dark on Dark**: Never use dark text on dark backgrounds
- [ ] **Light on Light**: Never use white text on white backgrounds

## Testing Tools

Use these tools to verify contrast:
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Chrome DevTools**: Lighthouse accessibility audit
- **Figma Plugins**: Stark, Contrast

## Common Mistakes to Avoid

### ❌ Don't Do This:
```tsx
// White text on white background
<div style={{ backgroundColor: '#FFFFFF' }}>
  <p style={{ color: '#FFFFFF' }}>Invisible text!</p>
</div>

// Dark text on dark background
<div style={{ backgroundColor: 'var(--background)' }}>
  <p style={{ color: '#0B2641' }}>Can't see this!</p>
</div>

// Low contrast gray on white
<div style={{ backgroundColor: '#FFFFFF' }}>
  <p style={{ color: '#D1D5DB' }}>Too light!</p>
</div>
```

### ✅ Do This Instead:
```tsx
// White text on dark background
<div style={{ backgroundColor: 'var(--background)' }}>
  <p style={{ color: 'var(--foreground)' }}>Perfect contrast!</p>
</div>

// Dark text on light background
<div style={{ backgroundColor: '#FFFFFF' }}>
  <p style={{ color: '#0B2641' }}>Readable text!</p>
</div>

// Proper gray on white
<div style={{ backgroundColor: '#FFFFFF' }}>
  <p style={{ color: '#6B7280' }}>Good contrast!</p>
</div>
```

## Quick Reference Table

| Background | Text Color | Button Primary | Button Secondary | Links | Icons |
|------------|-----------|----------------|------------------|-------|-------|
| #0B2641 (Dark) | #FFFFFF | #0684F5 bg + white text | Transparent + #0684F5 border + white text | #0684F5 | White or #0684F5 |
| #1A3A5C (Card) | #FFFFFF | #0684F5 bg + white text | Transparent + border | #0684F5 | White or #0684F5 |
| #FFFFFF (White) | #0B2641 | #0684F5 bg + white text | White + #0684F5 border + #0684F5 text | #0684F5 | #0B2641 or #0684F5 |
| #F8F9FA (Light) | #0B2641 | #0684F5 bg + white text | White + #0684F5 border + #0684F5 text | #0684F5 | #0B2641 or #0684F5 |

---

**Last Updated**: December 6, 2024  
**Maintained By**: Eventra Design Team
