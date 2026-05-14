Restaurant POS - Local Setup Guide

This guide is for anyone setting up, running, testing, or packaging the Restaurant POS frontend on their own machine.


Before You Start

Make sure you have these installed:

Node.js
Required version: ^20.19.0 or >=22.12.0.
This is required because the project uses Vite 7.

npm
Comes with Node.js.

Git
Optional, but useful if you are cloning or pulling updates.

Browser
Chrome or Edge is recommended.

Terminal
PowerShell on Windows, Terminal on macOS/Linux.

If you are testing hardware features, you may also need:

Thermal printer
Used for testing receipts and order slips.

Touchscreen monitor
Used for kiosk and cashier POS use.

Dedicated kiosk PC
Used for running the packaged Electron kiosk build.


Project Location

The frontend lives inside the frontend folder. Navigate there before running any commands:

cd "C:\Users\John Lester\Desktop\restaurant_pos\frontend"

Here is what is inside:

src/
Main React, TypeScript, Redux, and CSS source code.

src/features/
Feature modules: kiosk, POS, kitchen, admin, inventory, and sales.

src/shared/styles/
Shared CSS files.

public/
Static images and assets.

electron/
Electron kiosk entry point.

docs/
Project documentation.

dist/
Web production build output.

release/
Electron installer output.

Run all npm commands from the frontend folder, not the repository root.


Installing Dependencies

Run:

npm install

This reads package.json and installs everything into node_modules.

Key packages include:

react, react-dom
Used for UI rendering.

react-router-dom
Used for page routing.

@reduxjs/toolkit, react-redux
Used for state management.

xlsx
Used for Excel, CSV, and JSON import/export.

vite, @vitejs/plugin-react
Used for the dev server and production builds.

typescript
Used for type checking.

eslint
Used for linting.

tailwindcss, postcss, autoprefixer
Used for CSS tooling.

electron, electron-builder
Used for the native kiosk app.

concurrently, wait-on
Used to run Vite and Electron together.


Environment Variables

Copy the example env file to create your local one:

Copy-Item .env.example .env

Default values in .env.example:

VITE_SYNC_KITCHEN_MS=5000
VITE_SYNC_SALES_MS=5000
VITE_SYNC_ORDERS_MS=5000
VITE_SYNC_BACKOFF_MULTIPLIER=1.8
VITE_SYNC_MAX_INTERVAL_MULTIPLIER=4
VITE_SYNC_JITTER_RATIO=0.15

What each one does:

VITE_SYNC_KITCHEN_MS
How often the kitchen syncs, in milliseconds.

VITE_SYNC_SALES_MS
How often sales syncs.

VITE_SYNC_ORDERS_MS
How often orders sync.

VITE_SYNC_BACKOFF_MULTIPLIER
How much longer each retry waits after a sync failure.

VITE_SYNC_MAX_INTERVAL_MULTIPLIER
Upper limit on retry interval growth.

VITE_SYNC_JITTER_RATIO
Adds slight randomness to sync timing.

There is also an optional router setting for packaged or file-based runs:

VITE_ROUTER_MODE=hash

The app also detects file:// automatically and switches to hash routing on its own.


Running the App Locally

Run:

npm run dev

Vite will print a local URL, usually:

http://localhost:5173

The default page loads /kiosk.

To get to the staff login, go to:

http://localhost:5173/login

If port 5173 is taken, Vite will pick another port. Use the URL shown in the terminal.


Local Links and Navigation

Use these links after running npm run dev:

Customer kiosk
http://localhost:5173/kiosk
Customer order screen.

Staff login
http://localhost:5173/login
Login page for admin, cashier, and kitchen users.

POS screen
http://localhost:5173/pos
Cashier order-taking screen. Login is required.

Kitchen display
http://localhost:5173/kitchen
Back-of-house kitchen screen. Login is required.

Customer KDS board
http://localhost:5173/KDS
Customer-facing kitchen queue board.

KDS shortcut
http://localhost:5173/kds-board
Redirects to /KDS.


How to Open the Login Page

1. Start the app with npm run dev.
2. Open the Vite URL in the browser, usually http://localhost:5173.
3. Type /login after the port, or open http://localhost:5173/login directly.
4. Enter the username and PIN from the Test Accounts section.
5. After login, the app sends the user to the correct page based on the role.


How to Open the KDS Customer Board

1. Direct link: open http://localhost:5173/KDS in a browser tab or customer-facing monitor.
2. From the kitchen page: log in as kitchen or admin.
3. Go to http://localhost:5173/kitchen.
4. Click Open Customer Board.
5. Shortcut link: http://localhost:5173/kds-board also works and redirects to /KDS.
6. If Vite uses another port, replace 5173 with the port shown in the terminal.

If VITE_ROUTER_MODE=hash is enabled, use hash links instead:

Login
http://localhost:5173/#/login

KDS
http://localhost:5173/#/KDS


Test Accounts

These accounts are seeded locally for testing:

Admin
Username: admin
Password / PIN: 1111
Opens on login: /admin/dashboard

Cashier
Username: cashier
Password / PIN: 2222
Opens on login: /pos

Kitchen
Username: kitchen
Password / PIN: 3333
Opens on login: /kitchen


Routes

Customer-Facing Routes

/
Redirects to /kiosk.

/kiosk
Customer welcome screen.

/kiosk/menu
Menu ordering.

/kiosk/success/:orderNo
Order confirmation.

/kiosk/print/:orderNo
Order slip print view.

/KDS
Customer-facing kitchen queue board.


Staff Routes

/login
Public staff login.

/pos
Admin and cashier route for POS ordering.

/orders
Admin and cashier route for queue, payments, and cash drawer.

/kitchen
Admin and kitchen route for the kitchen display.


Admin Routes

/admin/dashboard
Sales and operations overview.

/admin/products
Menu products.

/admin/categories
Product categories.

/admin/recipes
Recipes and ingredient usage.

/admin/inventory
Stock management.

/admin/sales
Sales records.

/admin/orders-dashboard
Orders and inventory deductions.

/admin/cash-adjustments
Cash adjustment review.

/admin/replacements
Replacement and remake review.

/admin/users
Staff accounts.

/admin/audit-logs
Audit history.

/admin/settings
Store, tax, receipt, and sync settings.


Quality Checks

Run the linter:

npm run lint

Run TypeScript type checking:

npx tsc -b

Run a full production build:

npm run build

The build runs TypeScript first, then outputs the production bundle to frontend/dist.


Previewing the Production Build

After building, run:

npm run preview

Use this to verify the built version looks and behaves correctly before packaging or deploying.


Running the Kiosk App With Electron

To run the kiosk in development:

npm run kiosk:dev

This starts the Vite dev server, waits for it to be ready, then opens Electron in fullscreen kiosk mode.

The window is locked for customer use. The native menu is hidden, and printing uses silent native print with a browser fallback.


Building Installers

Build for all platforms:

npm run kiosk:build

Or build for a specific one:

npm run kiosk:build:win
npm run kiosk:build:mac
npm run kiosk:build:linux

Output goes to frontend/release/:

Windows
NSIS installer .exe

macOS
DMG

Linux
AppImage

Build on the target OS when you can, especially for Windows installers.


Local Data

The app runs frontend-only with mock repositories. No backend or database is needed.

All data is saved in browser localStorage, so it stays on the same browser and device.

Storage keys used:

pos.auth.v1
Logged-in user session.

pos.orders.v2
Orders.

pos.inventory.v2
Ingredients, recipes, and stock adjustments.

pos.cash.v1
Cash drawer and adjustments.

pos.sales.v2
Sales records.

pos.audit.v1
Audit logs.

pos.admin.v4
Products, categories, users, and settings.

To reset everything during testing:

1. Open DevTools.
2. Go to Application.
3. Open Local Storage.
4. Delete the POS keys.
5. Refresh the browser.

This wipes local orders, sales, inventory edits, and settings. Only do this with test data.


Inventory Import

The inventory page accepts .xlsx, .xls, .csv, and .json files.

When you import a file, the app matches rows by inventory ID or name. It updates matches and creates new ingredients for anything it does not recognize.

You will get a summary of what was imported, updated, skipped, or errored.

Template columns:

inventory id
Required: No
Notes: Updates existing ingredients when matched.

ingredient type
Required: No
Notes: RAW or NON_RAW. Defaults to raw if blank.

name
Required: Yes
Notes: Ingredient name.

category
Required: Yes
Notes: Ingredient category.

base unit
Required: Yes
Notes: g, ml, or pcs.

on hand
Required: No
Notes: Current stock. Defaults to 0.

reorder level
Required: No
Notes: Low-stock threshold. Defaults to 0.

unit cost
Required: Yes, unless bulk pricing is provided.
Notes: Cost per base unit.

bulk qty
Required: No
Notes: Used with bulk unit and price to calculate unit cost.

bulk unit
Required: No
Notes: kg, l, pcs, or the base unit.

bulk price
Required: No
Notes: Total cost of the bulk pack.


Troubleshooting

npm install fails
Check your internet connection, confirm you are in the frontend folder, and verify your Node version.

Vite says Node is unsupported
Upgrade to Node 20.19.0+ or 22.12.0+.

Page is blank after changes
Stop the dev server, run npm install, then restart with npm run dev.

Login fails
Double-check the username and PIN, or check if an admin created a different account.

Electron does not open
Make sure Vite is running on port 5173 and nothing else is using it.

Receipt does not print
Check your default printer, browser print permissions, and Electron print behavior.

Old data is still showing
Clear the POS keys from Local Storage and refresh.

Inventory import fails
Re-download the template and make sure the required columns are present.

VS Code schema timeout warning
This is a VS Code or network editor issue, not a POS runtime error. It is safe to ignore.
