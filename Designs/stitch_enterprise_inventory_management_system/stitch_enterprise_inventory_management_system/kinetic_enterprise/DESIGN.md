---
name: Kinetic Enterprise
colors:
  surface: '#f8f9ff'
  surface-dim: '#d1dbec'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dfe9fa'
  surface-container-highest: '#d9e3f4'
  on-surface: '#121c28'
  on-surface-variant: '#434655'
  inverse-surface: '#27313e'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#555f6f'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f3'
  on-secondary-container: '#596373'
  tertiary: '#006229'
  on-tertiary: '#ffffff'
  tertiary-container: '#007e37'
  on-tertiary-container: '#c1ffc5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#f8f9ff'
  on-background: '#121c28'
  surface-variant: '#d9e3f4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  container-max: 1440px
---

## Brand & Style
This design system is engineered for high-velocity enterprise operations, prioritizing clarity, trust, and data density. The aesthetic follows a **Corporate / Modern** approach, blending the utility of an industrial tool with the refinement of a modern SaaS platform. 

The visual narrative focuses on "Reliable Precision." By utilizing a structured layout with generous whitespace around dense data clusters, the system reduces cognitive load for users managing complex inventories. The emotional response is one of controlled efficiency—users should feel that the interface is an extension of their professional expertise, providing clear paths to action without unnecessary decorative friction.

## Colors
The palette is rooted in a professional "Enterprise Blue" to signal stability and action. 

- **Primary (#2563EB):** Reserved for primary actions, active navigation states, and focus indicators.
- **Secondary (#1F2937):** Used exclusively for high-contrast structural elements like the Sidebar to provide a visual anchor for the application.
- **Success & Warning:** Functional colors used sparingly for status badges and finality actions. 
- **Neutrals:** A range of grays manages the information hierarchy. #111827 provides high-contrast legibility for titles, while #4B5563 softens secondary metadata.
- **Surface:** The background remains a cool gray (#F9FAFB) to allow pure white cards to pop forward in the visual stack.

## Typography
The system uses **Inter** exclusively to take advantage of its exceptional legibility in data-heavy environments. 

- **Headlines:** Use Semi-Bold (600) weights to establish clear section anchors.
- **Data Tables:** Use `body-md` for standard row content. For numerical data, ensure tabular lining is enabled to allow for easy vertical scanning of quantities and prices.
- **Labels:** Use `label-sm` for table headers and category tags, often paired with a subtle uppercase treatment to distinguish them from interactive data.
- **Mobile Scaling:** For screens below 768px, `display-lg` should downscale to 28px/36px to prevent text wrapping on critical dashboard metrics.

## Layout & Spacing
The layout employs a **Fluid Grid** logic with fixed maximum constraints for desktop readability.

- **Sidebar:** A fixed 260px width sidebar provides global navigation.
- **Grid:** Use a 12-column grid system for the main content area. Gutters are fixed at 20px to maintain a dense but readable data flow.
- **Rhythm:** An 8px linear scale (with a 4px "half-step") governs all margins and padding. 
- **Breakpoints:** 
  - **Desktop (1280px+):** Full 12-column visibility. 
  - **Tablet (768px - 1279px):** Sidebar collapses to icons; grid shifts to 6 columns. 
  - **Mobile (<767px):** Single column stack; horizontal scrolling permitted only for wide data tables.

## Elevation & Depth
Depth is communicated through **Tonal Layering** and **Ambient Shadows**.

- **Level 0 (Background):** #F9FAFB. All canvas areas.
- **Level 1 (Cards):** Pure White (#FFFFFF) with a `0px 4px 10px rgba(0, 0, 0, 0.05)` shadow. Used for the main content containers and dashboard widgets.
- **Level 2 (Modals/Popovers):** Pure White (#FFFFFF) with a more pronounced `0px 10px 25px rgba(0, 0, 0, 0.10)` shadow.
- **Interactions:** Use subtle 1px inner borders (`#E5E7EB`) on cards to provide definition against the light gray background, ensuring the 10px blur shadow remains soft and professional.

## Shapes
The design system utilizes a structured, "semi-rounded" language to balance approachability with a professional, geometric feel.

- **Main Containers (Cards/Modals):** 12px (`rounded-lg`) corner radius to soften the large surface areas.
- **Interactive Elements (Buttons/Inputs):** 8px (`rounded-md`) corner radius to create a compact, "tool-like" appearance.
- **Status Badges:** Full pill-shape (`rounded-full`) to differentiate categorical tags from clickable buttons.

## Components
- **Buttons:**
  - **Primary:** Solid #2563EB with white text. 8px radius.
  - **Secondary:** White background with #D1D5DB border and #4B5563 text.
  - **Destructive:** Solid #EF4444 for deletions/alerts.
- **Input Fields:** 8px radius, #D1D5DB border. On `:focus`, the border transitions to #2563EB with a 2px soft outer glow.
- **Sidebar Nav:** Dark background (#1F2937). Active state uses a left-side 4px primary blue vertical accent and a #2D3748 background tint.
- **Data Tables:** Clean rows with 1px #F3F4F6 bottom borders. Zebra striping is avoided to maintain a clean look; use hover states (#F9FAFB) for row tracking instead.
- **Status Chips:** Small, bold text with 10% opacity background of the parent color (e.g., Green text on light green background for "Shipped").
- **Cards:** White surface, 12px radius, subtle 10px blur shadow. Ensure 24px internal padding for all card content.