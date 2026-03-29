# UI Style Spec (Frontend-First)

This document is the UI implementation standard for the Restaurant POS frontend.
Use this as the source of truth when building or updating screens.

## 1) Visual Direction
- Overall look: clean, modern, professional operations dashboard.
- Surface preference: white and light-neutral backgrounds for admin and POS backoffice.
- Text preference: dark text for strong readability.
- Border style: subtle, low-contrast borders for structure.
- Interaction feel: calm, precise, and business-like.

## 2) Core Color Rules
- Primary page background: `--bg`
- Main surfaces/cards: `--panel` (white)
- Muted surfaces: `--panel-muted`
- Main text: `--text`
- Secondary text: `--muted`
- Border: `--border`
- Brand accent: `--accent`
- Status colors: `--success`, `--warning`, `--danger`, `--info`

Rules:
- Do not use dark-card + light-text for admin pages unless intentionally scoped.
- Avoid heavy pure-black borders. Use soft neutral borders.
- Keep status color usage semantic (do not repurpose danger as accent).

## 3) Typography Rules
- Body font: `--font-body`
- Display/headings: `--font-display`
- Numeric/amounts/IDs: `--font-mono` when needed

Size guidance:
- Page title: 28-32px
- Section title: 20-24px
- Card title: 16-18px
- Body text: 14-16px
- Meta/helper text: 12-14px

Rules:
- Use consistent type scale across features.
- Avoid oversized text in dense data tables.
- Keep table headers compact and readable.

## 4) Spacing and Layout
- Use token spacing only (`--space-1` to `--space-7`).
- Default card padding: 16px to 24px.
- Standard section gaps: 12px, 16px, or 24px.
- Keep horizontal rhythm aligned across headers, filters, and tables.

Rules:
- Avoid random one-off spacing values.
- Prefer a simple, repeated spacing rhythm over visual noise.

## 5) Borders, Radius, and Elevation
- Border color: `--border`
- Card radius: `--radius-md` or `--radius-lg`
- Interactive control radius: `--radius-sm` or `--radius-md`
- Shadows: `--shadow-sm` for subtle elevation, `--shadow` for major cards

Rules:
- Use borders first, shadows second.
- Do not stack heavy shadows on every element.

## 6) Component Standards
### Buttons
- Primary: high-contrast action, reserved for key action.
- Secondary/outline: neutral action.
- Danger: destructive action only.
- Ghost: low-emphasis utility.

Rules:
- One dominant primary action per section.
- Maintain consistent button height per context.

### Inputs/Selects/Textareas
- Always provide label text.
- Show helper text when needed.
- Show validation state inline.
- Keep disabled/read-only visibly distinct.

### Tables/Data Rows
- Light header background + subtle border.
- Row height and cell padding must be consistent.
- Status chips should be compact and semantic.
- Action column should align vertically.

## 7) State UX Requirements
Every feature screen must include:
- Loading state
- Empty state
- Error state
- No-results state (if searchable/filterable)
- Success feedback (toast or inline status)

Rules:
- No silent failure.
- No blank panels without context text.

## 8) Accessibility Baseline
- Ensure readable contrast for text and controls.
- Use visible focus states for keyboard navigation.
- Use semantic labels/aria for form controls and icon-only actions.
- Do not rely on color alone for status meaning.

## 9) Motion and Interaction
- Use `--transition-fast` and `--transition-base`.
- Keep transitions subtle and purposeful.
- Avoid flashy animations on data-heavy operational screens.

## 10) Responsive Behavior
- Desktop-first layout for staff operations.
- Ensure tablet-friendly interaction targets.
- On small widths:
  - collapse side-by-side blocks to vertical stacks
  - keep key actions visible
  - preserve table readability or switch to card rows

## 11) Feature-Specific Guidance
### Admin
- White surfaces, dark text, subtle neutral borders.
- Dense data should remain visually calm.
- Prioritize clarity over decorative styling.

### POS (staff)
- Keep ordering flow fast and legible.
- Cart and totals should be easy to scan at a glance.
- High-risk actions (cancel/void) must remain clearly separated.

### Kiosk
- May use richer visual language than admin, but must stay readable.
- Clear, large tap targets and obvious next-step actions.

## 12) CSS Authoring Rules
- Use comment headers for each stylesheet and major section.
- Reuse tokens before introducing new hardcoded values.
- Avoid duplicate style blocks with conflicting definitions.
- Keep feature-specific styles in the corresponding stylesheet.

## 13) Definition of Done (UI)
A screen is done only when:
1. It follows token-based typography, spacing, color, and border rules.
2. It includes loading/empty/error/no-results/success states.
3. It passes keyboard/focus and basic contrast checks.
4. It matches the established white-professional backoffice direction.
5. It is responsive on desktop and mobile breakpoints.
