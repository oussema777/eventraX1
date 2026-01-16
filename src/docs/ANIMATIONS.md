# Animation & Micro-Interaction Guide - Eventra Design System

## Overview

All animations are optimized for 60fps performance and respect user preferences via `prefers-reduced-motion`. Animation durations range from 150ms-400ms for optimal UX.

## Button Animations

### Hover Lift Effect
**Class**: `.btn-hover-lift`
**Duration**: 250ms
**Effect**: Translates button up by 2px with enhanced shadow

```tsx
<button className="btn-hover-lift px-6 py-3 rounded-lg">
  Hover Me
</button>
```

**Usage**: Primary CTAs, important action buttons

---

### Glow Effect
**Class**: `.btn-hover-glow`
**Effect**: Adds glowing shadow on hover

```tsx
<button className="btn-hover-glow px-6 py-3 rounded-lg">
  Glow Effect
</button>
```

**Usage**: Premium features, highlighted actions

---

### Ripple Effect
**Class**: `.ripple-effect`
**Duration**: 600ms
**Effect**: Click ripple animation

```tsx
<button className="ripple-effect px-6 py-3 rounded-lg">
  Click Me
</button>
```

**Usage**: All clickable buttons for tactile feedback

## Interactive Elements

### Scale Effect
**Class**: `.interactive-scale`
**Duration**: 150ms (fast)
**Effect**: Scales to 105% on hover, 98% on active

```tsx
<div className="interactive-scale cursor-pointer">
  Interactive Card
</div>
```

**Usage**: Cards, tiles, clickable containers

---

## Loading States

### Pulse Glow
**Class**: `.loading-pulse`
**Duration**: 2s infinite
**Effect**: Gentle opacity and glow pulsation

```tsx
<div className="loading-pulse">
  Loading...
</div>
```

**Usage**: Loading indicators, pending states

---

### Spin Animation
**Class**: `.loading-spin`
**Duration**: 1s linear infinite
**Effect**: Smooth 360° rotation

```tsx
<div className="loading-spin">
  <Loader size={24} />
</div>
```

**Usage**: Spinners, loading icons

---

### Shimmer Effect
**Class**: `.shimmer`
**Duration**: 2s infinite
**Effect**: Skeleton screen shimmer

```tsx
<div className="shimmer h-20 w-full rounded-lg" />
```

**Usage**: Content loading placeholders

## Page Transitions

### Fade In
**Class**: `.fade-in`
**Duration**: 250ms

```tsx
<div className="fade-in">
  Content appears smoothly
</div>
```

---

### Slide In Up
**Class**: `.slide-in-up`
**Duration**: 400ms
**Effect**: Fades in while sliding from bottom

```tsx
<div className="slide-in-up">
  Content slides up
</div>
```

**Usage**: Modal entrances, page content

---

### Slide In Down
**Class**: `.slide-in-down`
**Duration**: 400ms
**Effect**: Fades in while sliding from top

```tsx
<div className="slide-in-down">
  Content slides down
</div>
```

**Usage**: Dropdowns, notifications

## Card Interactions

### Card Hover
**Class**: `.card-hover`
**Duration**: 250ms
**Effect**: Lifts card, adds shadow, changes border color

```tsx
<div className="card-hover border rounded-xl p-6">
  Interactive Card
</div>
```

**Usage**: Event cards, product cards, clickable panels

## Transition Utilities

### Smooth Transition
**Class**: `.transition-smooth`
**Duration**: 250ms
**Timing**: cubic-bezier(0.4, 0, 0.2, 1)

```tsx
<button className="transition-smooth hover:bg-primary">
  Smooth transition
</button>
```

---

### Fast Transition
**Class**: `.transition-fast`
**Duration**: 150ms

```tsx
<button className="transition-fast hover:opacity-80">
  Quick feedback
</button>
```

---

### Slow Transition
**Class**: `.transition-slow`
**Duration**: 400ms

```tsx
<div className="transition-slow hover:scale-110">
  Deliberate motion
</div>
```

---

### Spring Transition
**Class**: `.transition-spring`
**Duration**: 250ms
**Timing**: cubic-bezier(0.34, 1.56, 0.64, 1)
**Effect**: Elastic "bounce" feel

```tsx
<button className="transition-spring hover:scale-105">
  Playful spring
</button>
```

## Focus States

### Focus Ring
**Class**: `.focus-ring`
**Effect**: Blue glow ring on keyboard focus

```tsx
<button className="focus-ring px-6 py-3 rounded-lg">
  Keyboard accessible
</button>
```

**Usage**: All interactive elements for accessibility

## Shadow Utilities

### Shadow Glow
**Class**: `.shadow-glow`
**Effect**: Blue glowing shadow

```tsx
<div className="shadow-glow p-6 rounded-lg">
  Glowing container
</div>
```

**Usage**: Highlighted content, premium features

## CSS Variables

### Animation Timing
```css
--transition-fast: 150ms;
--transition-base: 250ms;
--transition-slow: 400ms;
```

### Easing Functions
```css
--transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
--transition-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

## Performance Best Practices

### ✓ Do's
- Use `transform` and `opacity` for animations (hardware accelerated)
- Keep animations between 150-400ms
- Use `will-change` sparingly for complex animations
- Test on lower-end devices
- Respect `prefers-reduced-motion`

### ✗ Don'ts
- Avoid animating `width`, `height`, `top`, `left`
- Don't use animations longer than 500ms
- Don't animate too many elements simultaneously
- Don't use `will-change` on every element
- Don't override user motion preferences

## Accessibility

All animations automatically respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Example Component

```tsx
import React from 'react';

export function AnimatedButton() {
  return (
    <button
      className="
        btn-hover-lift 
        ripple-effect 
        focus-ring 
        transition-smooth
        px-6 py-3 rounded-xl
      "
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)'
      }}
    >
      <span className="flex items-center gap-2">
        Click Me
        <ArrowRight size={18} />
      </span>
    </button>
  );
}
```

## Animation Combinations

### Premium CTA
```tsx
<button className="btn-hover-lift btn-hover-glow ripple-effect transition-spring">
  Upgrade Now
</button>
```

### Interactive Card
```tsx
<div className="card-hover interactive-scale fade-in">
  Event Card Content
</div>
```

### Loading State
```tsx
<div className="loading-pulse shimmer">
  Loading content...
</div>
```

## Testing

1. **Visual Testing**: Check all states (hover, active, focus)
2. **Performance**: Use Chrome DevTools Performance tab
3. **Accessibility**: Test with keyboard navigation
4. **Reduced Motion**: Test with system preference enabled
5. **Mobile**: Test touch interactions
