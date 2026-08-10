---
name: Lumina Focus
colors:
  surface: '#faf9f7'
  surface-dim: '#dadad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#99efe5'
  on-secondary-container: '#006f67'
  tertiary: '#525e5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b7775'
  on-tertiary-container: '#f3fffc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#d8e5e2'
  tertiary-fixed-dim: '#bcc9c6'
  on-tertiary-fixed: '#121e1c'
  on-tertiary-fixed-variant: '#3d4947'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-tablet: 24px
  margin-mobile: 16px
  rail-width: 72px
---

## Brand & Style

This design system is engineered for the high-frequency operator who requires sustained cognitive focus without the fatigue of traditional dense enterprise interfaces. The brand personality is **calm, supportive, and efficient**, transitioning the IMS experience from a daunting database into a streamlined workspace. 

The design style leans into **Modern Minimalism with Soft Tactile elements**. It utilizes expansive white space, a warm-neutral foundation, and clear visual signifiers to guide the user's eye toward the "next best action." By reducing administrative noise and emphasizing content through soft elevation and subtle depth, the system ensures that critical operations remain the primary focus throughout the workday.

## Colors

The palette departs from cold corporate blues in favor of a **Vibrant Teal** (#0D9488) primary color. This choice provides a high-contrast, professional "Success Green" feel that signals a productive and positive environment. 

The background is a **Soft, Warm Neutral** (#FDFCFA). This slightly off-white base reduces screen glare and provides a more comfortable viewing experience for 8-hour operator shifts. Success, Warning, and Error states should be rendered in semantic colors that harmonize with the Teal primary, avoiding overly aggressive saturations to maintain the calm aesthetic.

## Typography

To enhance readability during fast-paced operations, the base body text size is set to **16px (body-md)**, with **18px (body-lg)** used for primary task descriptions. 

- **Headlines:** Use **Manrope** for a modern, balanced, and approachable feel. It provides a geometric clarity that feels contemporary without being cold.
- **Body:** Use **Work Sans** for its exceptional legibility and grounded nature. Its slightly wider apertures help prevent character confusion during rapid scanning.
- **Data & Labels:** Use **JetBrains Mono** for status tags, ID numbers, and technical labels. The monospaced nature ensures that numeric values align perfectly in tables and forms, aiding in quick data verification.

## Layout & Spacing

The layout is **Workspace-Centric**, utilizing either a top-bar navigation or a slim "Icon-only" left rail (72px) to maximize the horizontal real estate for complex data views. 

A **12-column fluid grid** is employed with a generous **24px gutter** to ensure visual breathing room. 
- **Desktop:** 40px outer margins to center the eye on the work area.
- **Tablet:** 24px margins, reflowing 3-column cards into 2-column stacks.
- **Mobile:** 16px margins, single-column focus.

Whitespace is used intentionally as a separator. Rather than using lines to divide every element, the system uses spacing increments of 8px to group related content, reducing visual "noise" and administrative clutter.

## Elevation & Depth

Visual hierarchy is established through **Ambient Shadows and Tonal Layering**. 

- **Surface Level (0):** The soft neutral background (#FDFCFA).
- **Card Level (1):** High-contrast white surfaces with a soft, diffused shadow (12px blur, 4% opacity, tinted with the primary teal color). This makes tasks feel "lifted" and interactable.
- **Overlay Level (2):** Modals and dropdowns use a more pronounced shadow (24px blur, 8% opacity) to provide clear separation from the workspace.

Avoid heavy borders. Use subtle 1px strokes in a slightly darker warm-neutral (#EAE8E4) only when necessary for structural definition in high-density tables.

## Shapes

The shape language is purposefully **Soft and Approachable**. 
- Base components (buttons, inputs) utilize a **0.5rem (8px)** radius.
- Task cards and containers utilize a **1rem (16px)** radius.
- Pill-shaped accents are reserved for status indicators (tags/chips) to distinguish them from actionable buttons.

This increased roundedness (compared to the sharp Admin theme) reduces the "industrial" feel of the IMS and reinforces the operator-friendly nature of the system.

## Components

### Buttons
Primary buttons use the Vibrant Teal background with white text. They should have a subtle 2px bottom-heavy shadow to feel "pressable." Secondary buttons use a ghost style with a teal border and transparent background.

### Cards
Cards are the primary container for tasks. They must feature a 16px corner radius and a white background. Padding within cards should be a minimum of 24px to maintain the "Focus-Oriented" philosophy.

### Input Fields
Inputs should feel "quiet" when inactive (light-gray border) and "wake up" with a 2px Teal stroke and soft outer glow when focused. Labels should always be visible above the field in the `label-md` mono font.

### Progress & Feedback
Use "Loom" style progress rings and soft-tinted snackbars. The goal is to inform the operator of system status without interrupting their flow with aggressive pop-ups or high-contrast alerts unless a critical error occurs.

### Workspace Header
A persistent, thin header that displays the current task name, breadcrumbs, and a single, clear "Primary Action" button (e.g., "Submit Entry" or "Complete Audit") anchored to the top-right.