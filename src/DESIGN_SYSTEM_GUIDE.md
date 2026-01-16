# Eventra Design System

A comprehensive B2B event management SaaS design system inspired by Confetti.events aesthetic.

## Overview

This design system provides a complete set of components, colors, typography, and guidelines for building the Eventra platform. It combines professional reliability with playful, energetic elements.

## Key Features

### 🎨 Color System
- **Primary (Cyan)**: `#00D4D4` - Confetti's signature turquoise for primary actions
- **Accent (Orange)**: `#FF5722` - High-visibility CTAs and important highlights
- **Secondary (Magenta)**: `#D5006D` - Additional brand accent
- **Success (Green)**: `#10B981` - Positive actions and live status
- **Warning (Gold)**: `#F59E0B` - Premium features and important notices
- **Navy**: `#1E293B` - Dark sections for contrast
- **Neutrals**: Comprehensive gray scale from 50-900

### 📝 Typography
- **Display/Hero**: 48px Bold - Landing pages
- **H1 Page Title**: 32px Semibold - Main headings
- **H2 Section**: 24px Semibold - Section headers
- **H3 Card Title**: 18px Semibold - Card titles
- **Body Large**: 16px Regular - Important text
- **Body**: 14px Regular - Default content
- **Caption**: 12px Medium - Labels and metadata
- **Button**: 14px Semibold - CTAs

Font: Inter or similar modern sans-serif

### 🔘 Button Variants
1. **Primary Button** - Cyan background, white text
2. **Accent Button** - Orange background for high-visibility actions
3. **Secondary/Outline** - Transparent with border
4. **Ghost Button** - Transparent, subtle hover
5. **Premium Button** - Gold gradient with lock icon

**Specifications**:
- Height: 44px (default)
- Padding: 12px 24px
- Corner radius: 8px
- States: Default, Hover (scale + shadow), Active, Disabled

### 📋 Input Fields
- **Text Input**: 44px height, rounded corners, subtle border
- **Focus State**: Primary color border with glow
- **Error State**: Red border with error message
- **Disabled State**: Reduced opacity, muted background
- **Toggle Switch**: 44px width, 24px height, smooth animation
- **Dropdown**: Chevron icon, full-width options
- **Date Picker**: Calendar icon integration

### 🎯 Stepper Component
4-step progress indicator:
1. **Details** - FileText icon
2. **Design** - Palette icon
3. **Registration** - Users icon
4. **Launch** - Rocket icon

**States**:
- **Completed**: Green with checkmark
- **Active**: Cyan with pulse animation
- **Upcoming**: Gray, inactive

### 🏷️ Status Badges
- **Live**: Green with Zap icon - Active events
- **Draft**: Gray with Eye icon - Work in progress
- **Archived**: Muted with Archive icon - Ended events
- **Premium**: Gold with Lock icon - Paid features

Variants: With dot indicator, with icons, solid backgrounds

### 🃏 Card Components
**Default Card**:
- Padding: 24px
- Corner radius: 12px
- Border: Subtle 1px
- Shadow: Light (default), Medium (hover)
- Hover: Enhanced shadow + subtle lift (scale: 1.02)

**Event Card**: Includes image header, status badge, meta info (date, location, attendees), CTA button

**Stats Card**: Icon, metric value, trend indicator

### 🎨 Icon Library
24px Lucide React icons including:
- Actions: Plus, Edit, Copy, Trash, Upload, Download
- Navigation: Chevrons, Menu, Home, External Link
- Status: Check, X, Eye, Lock, Alert, Info
- Content: Calendar, Users, Clock, MapPin, Star
- Communication: Mail, Phone, Bell, Settings

### 📏 Spacing System
Based on 4px unit:
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **2XL**: 48px
- **3XL**: 64px

### 🌑 Shadow System
- **Light**: Subtle for cards (`0 1px 3px rgba(0,0,0,0.05)`)
- **Medium**: Enhanced for hover (`0 4px 6px rgba(0,0,0,0.05)`)
- **Strong**: Prominent for modals (`0 10px 15px rgba(0,0,0,0.1)`)
- **Focus**: Colored glow (`0 0 0 3px rgba(0,212,212,0.3)`)

### 🔄 Border Radius
- **Small**: 4px
- **Default**: 8px
- **Large**: 12px
- **XL**: 16px

## Design Principles

1. **Generous Whitespace**: Let content breathe
2. **Soft Shadows**: Subtle depth, not heavy
3. **Rounded Corners**: Friendly, approachable feel
4. **Vibrant Colors**: Energetic but professional
5. **Clear Hierarchy**: Easy to scan and understand
6. **Smooth Transitions**: 200-300ms duration
7. **Hover Feedback**: Scale + shadow for interactivity

## Confetti.events Inspiration

This design system draws specific inspiration from Confetti.events:
- **Cyan/Turquoise**: Primary brand color for trust and energy
- **Bright Orange**: High-contrast CTAs for maximum visibility
- **Dark Sidebar**: Professional contrast against light content areas
- **Playful Accents**: Magenta for excitement, maintaining professionalism
- **Clean Cards**: Generous padding, soft shadows, rounded corners
- **Clear Status**: Color-coded badges with icons for instant recognition

## Component Usage

### Button Examples
```tsx
// Primary
<button style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
  Create Event
</button>

// Accent CTA
<button style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
  Publish Now
</button>
```

### Card Examples
```tsx
<div className="bg-white rounded-xl p-6 shadow-light border border-[var(--border)]">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>
```

### Badge Examples
```tsx
<span style={{ 
  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
  color: 'var(--success)',
  padding: '4px 12px',
  borderRadius: '16px'
}}>
  Live
</span>
```

## Responsive Considerations

- Mobile-first approach
- Touch-friendly targets (minimum 44px)
- Flexible layouts with grid/flexbox
- Scalable typography
- Adaptive spacing

## Accessibility

- Sufficient color contrast (WCAG AA minimum)
- Focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader friendly markup
- Clear error messages

---

**Version**: 1.0  
**Last Updated**: December 2025  
**Maintained by**: Eventra Design Team
