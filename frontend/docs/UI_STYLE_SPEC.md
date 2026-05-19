UI Style Notes

The Restaurant POS is used during real work, so the screens need to be clear, fast, and easy to read. The design is not meant to look like a landing page. It needs to feel like a simple restaurant work system.


General look

Keep the background white or very light.
Use dark text.
Use blue for main actions.
Use soft borders to separate sections.
Keep shadows light.
Do not use decorative gradients.
Do not use busy backgrounds.

The goal is a clean working screen where a cashier, kitchen staff, or admin can understand what to do right away.


Colors

Use the shared tokens first.

--bg
Page background.

--panel
Cards, panels, and main surfaces.

--panel-muted
Light secondary areas.

--text
Main text.

--muted
Small helper text.

--border
Border color.

--accent
Main blue action color.

--success
Positive status.

--warning
Warning status.

--danger
Delete, cancel, reject, void, or other risky actions.

--info
Neutral information.

Do not use status colors just for decoration.


Text

Use normal readable text. Avoid very small text on operational pages.

Body text uses --font-body.
Headings use --font-display.
Order numbers, totals, IDs, and amounts use --font-mono.

Good size range:

Page title: 28 to 32px
Section title: 20 to 24px
Card title: 16 to 18px
Normal text: 14 to 16px
Helper text: 12 to 14px

Do not place oversized display text inside tables, sidebars, or compact panels.


Spacing

Keep spacing even.

Small gaps use --space-1 or --space-2.
Normal gaps use --space-3 to --space-5.
Large page gaps use --space-6 or --space-7.

Most cards look good with 16px to 24px padding.

Make sure text does not touch borders.
Make sure buttons have space around them.
Make sure rows do not look squeezed.


Borders and depth

Use borders first.
Use shadows only when a panel needs a little lift.

Use --radius-sm for small controls.
Use --radius-md for normal buttons and cards.
Use --radius-lg only for larger panels.

Keep the border color soft. Avoid pure black borders.


Buttons

Primary buttons are blue.

Use one main primary action in a section when possible.

Use outline or secondary buttons for normal actions.

Use danger buttons only for risky actions.

Keep destructive actions away from normal actions so the user does not click them by mistake.


Inputs

Every input needs a label.

Add helper text when the field might be confusing.

Show validation near the field.

Disabled fields need to look disabled.


Tables

Use a light header.
Keep rows aligned.
Keep action buttons in the same area.
Use status chips for statuses.

If a row has too much information, move the details into a modal or details page.


Screen states

Each screen needs a clear state for:

Loading
Empty data
Error
No search results
Successful action

Do not leave an empty white panel with no explanation.


Accessibility

Use readable contrast.
Show keyboard focus.
Label form controls.
Add labels to icon-only buttons.
Do not rely on color alone to explain a status.


Motion

Keep movement small and quick.
Avoid flashy animation.
The system needs to feel steady during service.


Responsive layout

Desktop is the main target, but tablet sizes still need to work.

On smaller screens, stack columns vertically.

Keep the important actions visible.

For tables, either keep the columns readable or switch to card-style rows.


Page notes

Admin
White surfaces, dark text, clear cards, and readable tables.

POS
Fast scanning matters most. The order panel, totals, and checkout action need to be easy to see.

Kitchen
Use large readable tickets and simple status actions.

Kiosk
Use large touch targets and simple next steps.


CSS notes

Use existing tokens before adding new values.
Keep feature styles in their feature stylesheet.
Put shared styles in the shared styles folder.
Avoid duplicate rules that fight each other.
Add comments only when a section needs a label.


Final check

Before calling a screen finished, check these:

Text is readable.
Buttons have enough space.
Borders are not touching text.
There is no overlapping content.
The page works on desktop and smaller screens.
Loading, empty, error, and no-results states are handled.
