# Restaurant POS Local Setup User Manual

This manual is for the person who installs, runs, tests, or packages the Restaurant POS frontend on a local computer.

## 1. System Requirements

Install these before running the project:

| Required tool | Version / note |
| --- | --- |
| Node.js | `^20.19.0` or `>=22.12.0` because this project uses Vite 7 |
| npm | Installed together with Node.js |
| Git | Optional, but recommended if cloning or updating the project |
| Browser | Chrome or Edge recommended for local web testing |
| Terminal | PowerShell on Windows, Terminal on macOS/Linux |

Optional hardware:

| Hardware | Used for |
| --- | --- |
| Thermal printer | Receipt/order slip testing |
| Touchscreen monitor | Kiosk and cashier POS operation |
| Dedicated kiosk PC | Running the Electron kiosk build |

## 2. Project Location

The frontend app is inside the `frontend` folder:

```powershell
cd "C:\Users\John Lester\Desktop\restaurant_pos\frontend"
```

Important folders:

| Path | Purpose |
| --- | --- |
| `frontend/src` | Main React, TypeScript, Redux, and CSS source code |
| `frontend/src/features` | Feature modules such as kiosk, POS, kitchen, admin, inventory, sales |
| `frontend/src/shared/styles` | Shared CSS files |
| `frontend/public` | Static images and public assets |
| `frontend/electron` | Electron kiosk app entry point |
| `frontend/docs` | Project documentation |
| `frontend/dist` | Production web build output |
| `frontend/release` | Electron installer/package output |

Run all npm commands from `frontend`, not from the repository root.

## 3. Install Project Packages

From the `frontend` folder, install all dependencies:

```powershell
npm install
```

This reads `package.json` and `package-lock.json` and installs the correct versions into `node_modules`.

Main runtime packages installed by the project:

| Package | Purpose |
| --- | --- |
| `react`, `react-dom` | User interface |
| `react-router-dom` | Page routing |
| `@reduxjs/toolkit`, `react-redux` | App state management |
| `xlsx` | Excel, CSV, and JSON import/export support |
| `use-sync-external-store` | React store compatibility |

Main development/build packages:

| Package | Purpose |
| --- | --- |
| `vite`, `@vitejs/plugin-react` | Local dev server and production build |
| `typescript` | Type checking |
| `eslint` | Code linting |
| `tailwindcss`, `postcss`, `autoprefixer` | CSS tooling |
| `electron`, `electron-builder` | Native kiosk app |
| `concurrently`, `wait-on` | Start Vite and Electron together |

## 4. Configure Environment Variables

Create a local `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

Current `.env.example` values:

```env
VITE_SYNC_KITCHEN_MS=5000
VITE_SYNC_SALES_MS=5000
VITE_SYNC_ORDERS_MS=5000
VITE_SYNC_BACKOFF_MULTIPLIER=1.8
VITE_SYNC_MAX_INTERVAL_MULTIPLIER=4
VITE_SYNC_JITTER_RATIO=0.15
```

What they control:

| Variable | Meaning |
| --- | --- |
| `VITE_SYNC_KITCHEN_MS` | Kitchen refresh/sync interval in milliseconds |
| `VITE_SYNC_SALES_MS` | Sales refresh/sync interval in milliseconds |
| `VITE_SYNC_ORDERS_MS` | Orders refresh/sync interval in milliseconds |
| `VITE_SYNC_BACKOFF_MULTIPLIER` | Retry delay multiplier after sync failure |
| `VITE_SYNC_MAX_INTERVAL_MULTIPLIER` | Maximum retry interval multiplier |
| `VITE_SYNC_JITTER_RATIO` | Random jitter added to sync timing |

Optional router setting for packaged/file-based runs:

```env
VITE_ROUTER_MODE=hash
```

The app also switches to hash routing automatically when opened through `file://`.

## 5. Run the Web App Locally

Start the Vite development server:

```powershell
npm run dev
```

Open the URL shown by Vite, usually:

```text
http://localhost:5173
```

Default page:

```text
/kiosk
```

Staff login page:

```text
/login
```

If port `5173` is already used, Vite may select another port. Use the URL printed in the terminal.

## 6. Staff Test Accounts

The seeded local accounts are:

| Role | Username | Password / PIN | Default route |
| --- | --- | --- | --- |
| Admin | `admin` | `1111` | `/admin/dashboard` |
| Cashier | `cashier` | `2222` | `/pos` |
| Kitchen | `kitchen` | `3333` | `/kitchen` |

The login screen uses manual username and password/PIN entry.

## 7. Main Local Routes

Public/customer routes:

| Route | Purpose |
| --- | --- |
| `/` | Redirects to `/kiosk` |
| `/kiosk` | Customer welcome screen |
| `/kiosk/menu` | Customer menu ordering screen |
| `/kiosk/success/:orderNo` | Kiosk success page after placing order |
| `/kiosk/print/:orderNo` | Kiosk order slip print page |
| `/KDS` | Customer-facing kitchen queue board |
| `/kds-board` | Redirects to `/KDS` |

Staff routes:

| Route | Allowed roles | Purpose |
| --- | --- | --- |
| `/login` | Public | Staff login |
| `/pos` | Admin, Cashier | Staff POS ordering |
| `/orders` | Admin, Cashier | Cashier queue, payments, cash drawer, order actions |
| `/kitchen` | Admin, Kitchen | Kitchen display system |

Admin routes:

| Route | Purpose |
| --- | --- |
| `/admin/dashboard` | Sales and operation dashboard |
| `/admin/catalog` | Catalog entry page |
| `/admin/products` | Menu products |
| `/admin/categories` | Product categories |
| `/admin/recipes` | Product recipes and ingredient usage |
| `/admin/inventory` | Ingredient stock management |
| `/admin/sales-center` | Sales tools entry page |
| `/admin/sales` | Sales records |
| `/admin/orders-dashboard` | Order and inventory deductions |
| `/admin/cash-adjustments` | Cash adjustment review |
| `/admin/replacements` | Replacement/remake review |
| `/admin/administration` | Administration entry page |
| `/admin/users` | Staff users |
| `/admin/audit-logs` | Audit history |
| `/admin/settings` | Store, tax, receipt, and live sync settings |

## 8. Run Quality Checks

Run lint:

```powershell
npm run lint
```

Run TypeScript type check:

```powershell
npx tsc -b
```

Run a full production build:

```powershell
npm run build
```

The build command runs TypeScript first, then creates the Vite production build in `frontend/dist`.

## 9. Preview the Production Build

After building:

```powershell
npm run preview
```

Open the preview URL printed by Vite.

Use this to check the built version before packaging or deployment.

## 10. Run the Native Kiosk App Locally

Start the Electron kiosk app in development:

```powershell
npm run kiosk:dev
```

This command:

1. Starts the Vite dev server.
2. Waits for `http://localhost:5173`.
3. Opens Electron in fullscreen kiosk mode.

Electron kiosk behavior:

| Behavior | Description |
| --- | --- |
| Fullscreen | App opens fullscreen |
| Kiosk mode | Window is locked for customer use |
| Hidden menu | Native menu is hidden |
| Printing | Uses native silent print first, then browser print fallback |
| Routing | Uses hash routing when packaged or opened through `file://` |

## 11. Build Native Installers

Build all enabled platforms:

```powershell
npm run kiosk:build
```

Build one platform:

```powershell
npm run kiosk:build:win
npm run kiosk:build:mac
npm run kiosk:build:linux
```

Output folder:

```text
frontend/release
```

Package types:

| Platform | Output |
| --- | --- |
| Windows | NSIS installer `.exe` |
| macOS | DMG |
| Linux | AppImage |

Build on the target operating system when possible. For example, build the Windows installer on Windows.

## 12. Local Data and Persistence

This app currently runs frontend-only with mock repositories. It does not require a backend server or database.

Data is saved in browser `localStorage`, so data stays on the same browser/device.

Current local storage keys:

| Key | Data |
| --- | --- |
| `pos.auth.v1` | Logged-in user session |
| `pos.orders.v2` | Orders |
| `pos.inventory.v2` | Ingredients, recipes, inventory adjustments |
| `pos.cash.v1` | Cash drawer, cash adjustments |
| `pos.sales.v2` | Sales records |
| `pos.audit.v1` | Audit logs |
| `pos.admin.v4` | Admin products, categories, users, settings |

To reset local data during testing:

1. Open browser DevTools.
2. Go to Application.
3. Open Local Storage.
4. Delete the POS keys listed above.
5. Refresh the app.

Only do this for test data because it removes local orders, sales, inventory edits, and settings.

## 13. Inventory Import and Export Files

The inventory page supports:

| File type | Extension |
| --- | --- |
| Excel | `.xlsx`, `.xls` for import |
| CSV | `.csv` |
| JSON | `.json` |

Inventory import template columns:

| Column | Required | Notes |
| --- | --- | --- |
| `inventory id` | No | Used to update matching ingredients when present |
| `ingredient type` | No | `RAW` or `NON_RAW`; defaults to raw behavior when blank |
| `name` | Yes | Ingredient name |
| `category` | Yes | Ingredient category |
| `base unit` | Yes | `g`, `ml`, or `pcs` |
| `on hand` | No | Current stock quantity; defaults to `0` if blank |
| `reorder level` | No | Low-stock threshold; defaults to `0` if blank |
| `unit cost` | Required unless bulk cost is provided | Cost per base unit |
| `bulk qty` | Optional | Used with bulk unit and bulk price to calculate unit cost |
| `bulk unit` | Optional | `kg`, `l`, `pcs`, or the base unit |
| `bulk price` | Optional | Total cost of the bulk pack |

When importing, the app:

1. Reads the selected Excel, CSV, or JSON file.
2. Matches existing ingredients by inventory ID or name.
3. Creates new ingredients when no match is found.
4. Updates matched ingredients.
5. Shows a summary of imported, updated, skipped, and error rows.

## 14. Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm install` fails | Check internet connection, Node version, and run from `frontend` |
| Vite says Node is unsupported | Upgrade Node to `20.19.0+` or `22.12.0+` |
| Page is blank after changes | Stop dev server, run `npm install`, restart `npm run dev` |
| Login fails | Use the seeded username/PIN exactly or check admin-created users |
| Electron does not open | Make sure Vite is on port `5173`; stop other apps using that port |
| Receipt does not print | Check default printer, browser print permission, and Electron kiosk print behavior |
| Old data still appears | Clear the POS local storage keys and refresh |
| Inventory import fails | Download the template again and keep the required headers |
| VS Code schema timeout appears | This is an editor/schema network warning, not a POS runtime error |

