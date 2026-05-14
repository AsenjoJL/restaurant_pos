UI Style Spec
This is the source of truth for how the Restaurant POS frontend should look and behave. Follow this when building or updating any screen.

Visual Direction
The overall feel should be clean, professional, and operational — like a well-designed back-office dashboard. Use white and light neutral backgrounds, dark text for readability, and subtle borders for structure. Keep interactions calm and precise. This isn't a marketing site; it's a tool people use all day.

Colors
Stick to the design tokens:

Page background → --bg
Cards and surfaces → --panel
Muted surfaces → --panel-muted
Body text → --text, secondary text → --muted
Borders → --border
Brand accent → --accent
Status → --success, --warning, --danger, --info

Don't use dark cards with light text on admin pages unless it's intentional. Keep borders soft, not pure black. Use status colors for what they mean — don't repurpose --danger as a decorative accent.

Typography

Body font: --font-body
Headings: --font-display
Numbers, IDs, amounts: --font-mono

Size guidance:
ContextSizePage title28–32pxSection title20–24pxCard title16–18pxBody14–16pxHelper/meta text12–14px
Keep the type scale consistent. Don't use oversized text in dense tables.

Spacing and Layout
Use only spacing tokens (--space-1 through --space-7). Card padding should be 16–24px. Section gaps are typically 12, 16, or 24px. Keep horizontal alignment consistent across headers, filters, and tables. No random one-off values.

Borders, Radius, and Shadows
Use --border for color, --radius-md or --radius-lg for cards, and --radius-sm or --radius-md for controls. Use --shadow-sm for subtle lift, --shadow for major cards. Reach for borders before shadows, and don't stack heavy shadows on everything.

Components
Buttons — Primary is for the main action only. Secondary/outline for neutral actions. Danger for destructive actions. Ghost for low-priority utilities. One primary button per section.
Inputs — Always include a label. Show helper text when it's useful, show validation inline, and make disabled fields visibly distinct.
Tables — Light header background, consistent row height and padding, compact semantic status chips, and a vertically aligned action column.

Required States
Every screen needs to handle:

Loading — while data is fetching
Empty — when there's no data yet
Error — when something goes wrong
No results — when a search or filter returns nothing
Success — a toast or inline confirmation after an action

No silent failures. No blank panels without any explanation.

Accessibility
Make sure text and controls have readable contrast. Show visible focus states for keyboard navigation. Label all form controls and icon-only actions properly. Never rely on color alone to communicate status.

Motion
Use --transition-fast and --transition-base. Keep animations subtle. Avoid flashy transitions on dense operational screens.

Responsive Behavior
Design desktop-first, but keep it usable on tablets. On small screens, collapse side-by-side layouts to vertical stacks, keep key actions visible, and either preserve table readability or switch to card rows.

Context-Specific Notes
Admin — White surfaces, dark text, subtle borders. Dense data should feel calm, not cluttered. Clarity over decoration.
POS (staff) — The ordering flow needs to be fast and easy to scan. Cart and totals should be immediately readable. Keep high-risk actions like cancel and void clearly separated from everything else.
Kiosk — Can be a bit more visual than admin, but must stay readable. Use large tap targets and make the next step obvious.

CSS Authoring
Use comment headers for each stylesheet and major section. Always reach for a token before hardcoding a value. Don't create duplicate style blocks that conflict with each other. Keep feature-specific styles in their own stylesheet.

Definition of Done
A screen is finished when it:

Uses token-based typography, spacing, color, and borders throughout
Handles loading, empty, error, no-results, and success states
Passes basic keyboard navigation and contrast checks
Fits the white, professional back-office aesthetic
Works on both desktop and mobile breakpoints