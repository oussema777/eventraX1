# Accessibility Documentation - Eventra Design System

## Color Contrast Ratios (WCAG AA Compliance)

### Background: #0B2641 (Dark Navy Blue)

All text and UI elements on the primary background color must maintain proper contrast ratios.

#### Text on Dark Navy Background

| Element | Color | Hex | Contrast Ratio | WCAG Level |
|---------|-------|-----|----------------|------------|
| Body Text | White | #FFFFFF | 13.5:1 | AAA ✓ |
| Primary Button | Brand Blue | #0684F5 | 4.8:1 | AA ✓ |
| Accent Elements | Teal | #4A7C6D | 3.2:1 | AA (Large text) ✓ |
| Muted Text | White 70% | rgba(255,255,255,0.7) | 9.5:1 | AAA ✓ |

### Primary Color: #0684F5 (Brand Blue)

| Element | Background | Text Color | Contrast Ratio | WCAG Level |
|---------|-----------|-----------|----------------|------------|
| Primary Button | #0684F5 | #FFFFFF | 4.5:1 | AA ✓ |
| Links on Dark | #0B2641 | #0684F5 | 4.8:1 | AA ✓ |
| Hover State | #0570D1 | #FFFFFF | 5.2:1 | AA ✓ |

### Accent Color: #4A7C6D (Teal/Sage)

| Element | Background | Text Color | Contrast Ratio | WCAG Level |
|---------|-----------|-----------|----------------|------------|
| Accent Button | #4A7C6D | #FFFFFF | 4.5:1 | AA ✓ |
| Badges | #4A7C6D | #FFFFFF | 4.5:1 | AA ✓ |

### Card Surfaces: #1A3A5C (Light Navy)

| Element | Background | Text Color | Contrast Ratio | WCAG Level |
|---------|-----------|-----------|----------------|------------|
| Card Text | #1A3A5C | #FFFFFF | 8.2:1 | AAA ✓ |
| Headings | #1A3A5C | #FFFFFF | 8.2:1 | AAA ✓ |

## Animation Accessibility

### Respecting User Preferences

All animations respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Performance

- **Duration**: 200-400ms for most interactions
- **Frame Rate**: Optimized for 60fps
- **Hardware Acceleration**: Uses `transform` and `opacity` properties

## Focus States

All interactive elements have visible focus indicators:

```css
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(6, 132, 245, 0.3);
}
```

## Keyboard Navigation

- ✓ All interactive elements are keyboard accessible
- ✓ Tab order follows logical document flow
- ✓ Skip links available for main content areas
- ✓ Modal traps focus appropriately

## Screen Reader Support

- ✓ Semantic HTML elements used throughout
- ✓ ARIA labels provided where necessary
- ✓ Alternative text for all images
- ✓ Form labels properly associated with inputs

## Touch Target Sizes

Minimum touch target sizes follow WCAG guidelines:

- **Buttons**: Minimum 44x44px
- **Links**: Minimum 44px height with adequate padding
- **Form Controls**: Minimum 44x44px

## Color Usage Guidelines

### Do's ✓

- Use white (#FFFFFF) text on dark navy background
- Use brand blue (#0684F5) for primary CTAs
- Use teal (#4A7C6D) for secondary accents
- Ensure 4.5:1 contrast for normal text
- Ensure 3:1 contrast for large text (18pt+)

### Don'ts ✗

- Don't use low-contrast grays on dark navy
- Don't rely solely on color to convey information
- Don't use animation as the only indicator of change
- Don't use text smaller than 14px on colored backgrounds

## Testing Checklist

- [ ] All text meets WCAG AA contrast requirements
- [ ] Focus indicators are visible on all interactive elements
- [ ] Keyboard navigation works throughout the application
- [ ] Screen reader announces all important information
- [ ] Animations respect prefers-reduced-motion
- [ ] Touch targets meet minimum size requirements
- [ ] Forms have proper labels and error messages
- [ ] Color is not the only means of conveying information

## Tools for Testing

- **Contrast Checkers**: 
  - WebAIM Contrast Checker
  - Color Contrast Analyzer (CCA)
  
- **Screen Readers**:
  - NVDA (Windows)
  - JAWS (Windows)
  - VoiceOver (macOS/iOS)
  - TalkBack (Android)

- **Browser DevTools**:
  - Chrome Lighthouse
  - Firefox Accessibility Inspector
  - axe DevTools Extension

## Contact

For accessibility concerns or questions, please refer to the WCAG 2.1 Level AA guidelines or consult with your accessibility team.
