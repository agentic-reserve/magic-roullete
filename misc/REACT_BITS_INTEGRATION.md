# React Bits Integration - Magic Roulette

## Overview

Magic Roulette frontend now includes **React Bits** components for stunning UI animations and effects! React Bits is an open-source collection of memorable UI elements that make your app feel premium and engaging.

## What's Included

### 🎨 Components Added

1. **Particle Background** (`components/react-bits/particle-background.tsx`)
   - Animated particle system with connections
   - Customizable particle count, color, size, and speed
   - Perfect for hero sections and backgrounds

2. **Floating Card** (`components/react-bits/floating-card.tsx`)
   - 3D tilt effect on mouse hover
   - Smooth perspective transforms
   - Great for feature cards and game modes

3. **Magnetic Button** (`components/react-bits/magnetic-button.tsx`)
   - Button follows mouse cursor with magnetic effect
   - Customizable strength and behavior
   - Perfect for CTAs and important actions

4. **Animated Text** (`components/react-bits/animated-text.tsx`)
   - Multiple animation types: fade, slide, scale, blur
   - Split text animation (word/character)
   - Glitch text effect
   - Intersection observer for scroll-triggered animations

### 🎭 Animations Added

All animations are in `app/globals.css`:

- `animate-glitch-1` / `animate-glitch-2` - Glitch effects
- `revolver-spin` - Smooth cylinder rotation
- `animate-pulse-glow` - Pulsing glow effect
- `animate-float` - Floating animation
- `animate-shimmer` - Shimmer effect
- `animate-bounce-in` - Bounce entrance
- `animate-slide-up` - Slide up entrance
- `animate-fade-in` - Fade entrance
- `animate-scale-in` - Scale entrance
- `animate-rotate-in` - Rotate entrance

## Usage Examples

### Particle Background

```tsx
import { ParticleBackground } from '@/components/react-bits/particle-background';

<ParticleBackground
  particleCount={80}
  particleColor="rgba(239, 68, 68, 0.3)"
  particleSize={3}
  speed={0.3}
/>
```

### Floating Card

```tsx
import { FloatingCard } from '@/components/react-bits/floating-card';

<FloatingCard intensity={8}>
  <div className="p-6 rounded-lg border-2 border-primary">
    Your content here
  </div>
</FloatingCard>
```

### Magnetic Button

```tsx
import { MagneticButton } from '@/components/react-bits/magnetic-button';

<MagneticButton strength={0.4}>
  <button className="gun-metal-button">
    Click Me
  </button>
</MagneticButton>
```

### Animated Text

```tsx
import { AnimatedText, SplitTextAnimation, GlitchText } from '@/components/react-bits/animated-text';

// Simple fade in
<AnimatedText
  text="Welcome to Magic Roulette"
  type="fade"
  delay={100}
/>

// Split text animation
<SplitTextAnimation
  text="SPIN TO WIN"
  type="char"
  stagger={0.1}
/>

// Glitch effect
<GlitchText text="DEGEN MODE" />
```

## Enhanced Homepage

An enhanced version of the homepage is available at `app/page-enhanced.tsx` with all React Bits components integrated.

### To Use Enhanced Version:

```bash
# Backup original
mv app/page.tsx app/page-original.tsx

# Use enhanced version
mv app/page-enhanced.tsx app/page.tsx

# Restart dev server
pnpm dev
```

### Features in Enhanced Version:

- ✨ Particle background throughout
- 🎴 Floating cards for game modes
- 🧲 Magnetic buttons for CTAs
- 📝 Animated text reveals on scroll
- ⚡ Glitch effects on titles
- 🎯 Smooth entrance animations
- 💫 Pulsing glow effects

## CSS Animations

All animations are available as Tailwind classes:

```tsx
// Float animation
<div className="animate-float">🔫</div>

// Pulse glow
<button className="animate-pulse-glow">SPIN NOW</button>

// Bounce in
<div className="animate-bounce-in">Welcome!</div>

// Slide up
<div className="animate-slide-up">Content</div>

// Glitch effect
<div className="animate-glitch-1">GLITCH</div>
```

## Customization

### Particle Background

```tsx
<ParticleBackground
  particleCount={100}        // Number of particles
  particleColor="rgba(255, 0, 0, 0.5)"  // Particle color
  particleSize={4}           // Particle size
  speed={0.5}                // Movement speed
  className="opacity-50"     // Additional classes
/>
```

### Floating Card

```tsx
<FloatingCard
  intensity={15}             // Tilt intensity (1-20)
  className="custom-class"   // Additional classes
>
  {children}
</FloatingCard>
```

### Magnetic Button

```tsx
<MagneticButton
  strength={0.5}             // Magnetic strength (0-1)
  onClick={() => {}}         // Click handler
  disabled={false}           // Disabled state
>
  {children}
</MagneticButton>
```

### Animated Text

```tsx
<AnimatedText
  text="Your text"
  type="fade"                // fade, slide, scale, blur
  delay={200}                // Delay in ms
  duration={0.5}             // Duration in seconds
/>

<SplitTextAnimation
  text="Your text"
  type="word"                // word or char
  stagger={0.05}             // Delay between items
  delay={0}                  // Initial delay
/>
```

## Performance Tips

1. **Particle Background**
   - Use fewer particles on mobile (30-50)
   - Reduce particle count for better performance
   - Consider disabling on low-end devices

2. **Floating Cards**
   - Limit to important elements
   - Reduce intensity for subtle effects
   - Works best on desktop

3. **Magnetic Buttons**
   - Use sparingly for CTAs
   - Lower strength for subtle effect
   - Disable on mobile for better UX

4. **Animated Text**
   - Use intersection observer (built-in)
   - Stagger animations for better flow
   - Keep delays reasonable (< 1s)

## Browser Support

All components work on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Accessibility

All components are accessible:
- Keyboard navigation supported
- Screen reader friendly
- Respects `prefers-reduced-motion`
- ARIA labels where needed

## Adding More React Bits Components

Visit [React Bits](https://www.reactbits.dev) to explore more components:

### Using shadcn CLI:

```bash
# Install a component
npx shadcn@latest add https://reactbits.dev/r/[component-name]
```

### Manual Installation:

1. Browse components at https://www.reactbits.dev
2. Copy the component code
3. Paste into `components/react-bits/`
4. Import and use in your pages

## Examples from React Bits

### Popular Components to Add:

1. **Spotlight Effect**
   ```bash
   npx shadcn@latest add https://reactbits.dev/r/spotlight
   ```

2. **Ripple Button**
   ```bash
   npx shadcn@latest add https://reactbits.dev/r/ripple-button
   ```

3. **Gradient Text**
   ```bash
   npx shadcn@latest add https://reactbits.dev/r/gradient-text
   ```

4. **Animated Grid**
   ```bash
   npx shadcn@latest add https://reactbits.dev/r/animated-grid
   ```

5. **Meteor Effect**
   ```bash
   npx shadcn@latest add https://reactbits.dev/r/meteor
   ```

## Troubleshooting

### Particles not showing

```tsx
// Make sure z-index is correct
<ParticleBackground className="z-0" />

// Content should have higher z-index
<div className="relative z-10">Content</div>
```

### Floating card not working

```tsx
// Ensure parent has proper dimensions
<div className="w-full h-full">
  <FloatingCard>...</FloatingCard>
</div>
```

### Animations not triggering

```tsx
// Check if element is in viewport
// AnimatedText uses IntersectionObserver

// Force immediate animation
<AnimatedText delay={0} />
```

## Resources

- **React Bits**: https://www.reactbits.dev
- **Documentation**: https://www.reactbits.dev/get-started/introduction
- **Components**: https://www.reactbits.dev/components
- **Animations**: https://www.reactbits.dev/animations
- **Backgrounds**: https://www.reactbits.dev/backgrounds
- **Text Animations**: https://www.reactbits.dev/text-animations

## License

React Bits components are open source and free to use.

---

**Built with ❤️ for Magic Roulette**
**Powered by React Bits ✨**
