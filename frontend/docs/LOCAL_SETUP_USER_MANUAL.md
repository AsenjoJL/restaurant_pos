Restaurant POS Local Setup

These notes are for running the frontend on a local computer.


Tools to install

Node.js
Use version 20.19.0 or newer. Version 22.12.0 or newer is also fine.

npm
Comes with Node.js.

Git
Needed for cloning, pulling, committing, and pushing.

Browser
Chrome or Edge works best for testing.

Terminal
Use PowerShell on Windows.


Optional hardware for testing

Thermal printer
For receipt and order slip tests.

Touchscreen monitor
For kiosk or cashier POS testing.

Kiosk computer
For testing the Electron kiosk build.


Open the frontend folder

From the project root:

cd "C:\Users\John Lester\Desktop\restaurant_pos\frontend"

Run all npm commands from this frontend folder.


Main folders

src
React, TypeScript, Redux, and CSS source code.

src/features
Feature areas like kiosk, POS, kitchen, admin, inventory, and sales.

src/shared/styles
Shared CSS files.

public
Images and static assets.

electron
Electron kiosk files.

docs
Project documents.

dist
Production web build.

release
Electron installer output.


Install packages

Run:

npm install

This installs the dependencies from package.json.

Main packages:

react and react-dom for the UI.
react-router-dom for routes.
@reduxjs/toolkit and react-redux for state.
xlsx for Excel, CSV, and JSON import/export.
vite and @vitejs/plugin-react for local running and builds.
typescript for type checking.
eslint for linting.
tailwindcss, postcss, and autoprefixer for CSS tooling.
electron and electron-builder for the kiosk app.
concurrently and wait-on for running Vite and Electron together.


Environment file

Create the local env file:

Copy-Item .env.example .env

Default values:

VITE_SYNC_KITCHEN_MS=5000
VITE_SYNC_SALES_MS=5000
VITE_SYNC_ORDERS_MS=5000
VITE_SYNC_BACKOFF_MULTIPLIER=1.8
VITE_SYNC_MAX_INTERVAL_MULTIPLIER=4
VITE_SYNC_JITTER_RATIO=0.15

The sync values control how often kitchen, sales, and orders refresh during local use.

Optional router setting:

VITE_ROUTER_MODE=hash

Hash routing is useful for packaged or file-based runs.


Run the app

Start the dev server:

npm run dev

Vite usually opens on:

http://localhost:5173

If that port is busy, Vite will show a different one. Use the port shown in the terminal.


Useful local links

Customer kiosk:
http://localhost:5173/kiosk

Staff login:
http://localhost:5173/login

Cashier POS:
http://localhost:5173/pos

Orders and payments:
http://localhost:5173/orders

Kitchen display:
http://localhost:5173/kitchen

Customer KDS board:
http://localhost:5173/KDS

KDS shortcut:
http://localhost:5173/kds-board

Admin dashboard:
http://localhost:5173/admin/dashboard

Hash route examples:

http://localhost:5173/#/login
http://localhost:5173/#/KDS


Login page

1. Run npm run dev.
2. Open the local Vite URL.
3. Go to /login.
4. Enter the username and PIN.
5. The app redirects based on the role.


Customer KDS board

Open:

http://localhost:5173/KDS

Another option is:

http://localhost:5173/kds-board

From the kitchen screen, the customer board can also be opened after logging in as kitchen or admin.


Test accounts

Admin
Username: admin
PIN: 1111
Opens: /admin/dashboard

Cashier
Username: cashier
PIN: 2222
Opens: /pos

Kitchen
Username: kitchen
PIN: 3333
Opens: /kitchen


Routes

Customer:

/
/kiosk
/kiosk/menu
/kiosk/success/:orderNo
/kiosk/print/:orderNo
/KDS

Staff:

/login
/pos
/orders
/kitchen

Admin:

/admin/dashboard
/admin/catalog
/admin/products
/admin/categories
/admin/recipes
/admin/inventory
/admin/sales-center
/admin/sales
/admin/orders-dashboard
/admin/cash-adjustments
/admin/replacements
/admin/users
/admin/audit-logs
/admin/settings
/admin/administration


Check the project

Lint:

npm run lint

Type check:

npx tsc -b

Production build:

npm run build

Preview build:

npm run preview

The production files go to frontend/dist.


Electron kiosk

Run kiosk development mode:

npm run kiosk:dev

Build installers:

npm run kiosk:build

Build Windows installer:

npm run kiosk:build:win

Build macOS installer:

npm run kiosk:build:mac

Build Linux installer:

npm run kiosk:build:linux

Installer files are placed in frontend/release.


Local data

The local version stores data in browser localStorage.

There is no backend database in this setup.

Storage keys:

pos.auth.v1
Login session.

pos.orders.v2
Orders.

pos.inventory.v2
Ingredients, recipes, and stock movement.

pos.cash.v1
Cash drawer data.

pos.sales.v2
Sales records.

pos.audit.v1
Audit logs.

pos.admin.v4
Products, categories, users, and settings.


Reset test data

1. Open browser DevTools.
2. Open Application.
3. Open Local Storage.
4. Delete the POS keys.
5. Refresh the browser.

Only do this for test data.


Inventory import

Accepted file types:

.xlsx
.xls
.csv
.json

The import matches rows by inventory ID or ingredient name.

Required fields:

name
category
base unit
unit cost, unless bulk price is used

Optional fields:

inventory id
ingredient type
on hand
reorder level
bulk quantity
bulk unit
bulk price


Troubleshooting

npm install fails
Check the internet connection, folder location, and Node.js version.

Node version warning
Install Node.js 20.19.0 or newer.

Blank page
Stop the server, run npm install, then run npm run dev again.

Login fails
Check the username, PIN, and account status.

Electron does not open
Check that Vite is running and the port is available.

Receipt does not print
Check the printer and browser or Electron print settings.

Old data is still showing
Clear the POS localStorage keys.

Inventory import fails
Download a new template and check the columns.

VS Code schema warning
This is an editor or network warning. It does not mean the POS app failed.
