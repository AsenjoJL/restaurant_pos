# Restaurant POS System (Frontend)

I designed and built a Restaurant POS System specifically for small and growing food businesses. This frontend powers self‑ordering, staff ordering, cashier workflows, kitchen display, and admin inventory/costing.

## What’s Included
- Self‑ordering kiosk flow
- Staff‑based ordering (cashier input)
- Cashier payment flow (cash/card/e‑wallets)
- Kitchen Display System (KDS) with timers and SLA
- Admin inventory management + recipe costing
- Combo/bundle builder
- Cash drawer control
- Audit logs with CSV export

## Tech Stack
- **Language**: TypeScript + TSX
- **UI Framework**: React 19
- **Build Tool**: Vite (`@vitejs/plugin-react`)
- **State Management**: Redux Toolkit + React Redux
- **Routing**: React Router DOM
- **Desktop Packaging (Kiosk)**: Electron + electron-builder (Windows NSIS)
- **Data Access Pattern**: Repository pattern with `mock` / `api` mode switching
- **API/HTTP Layer**: Custom `fetch` client (`httpClient`)
- **Client Persistence**: localStorage + cross-tab sync (`storage` event)
- **Styling**: Custom CSS architecture (`base.css`, `pos.css`, `admin.css`, `kiosk.css`, `tokens.css`)
- **Reporting Utility**: `xlsx`
- **Linting**: ESLint

## Data Mode (Mock or API)
- `VITE_DATA_MODE=mock` → runs frontend-only using repository mock implementations
- `VITE_DATA_MODE=api` → uses HTTP repositories for Laravel API integration
- `VITE_API_BASE_URL` controls the API base path (default `/api/v1`)

Copy `.env.example` to `.env` and set values per environment.

Architecture guide:
- `docs/FRONTEND_ARCHITECTURE.md`
- `docs/UI_STYLE_SPEC.md`

## Roles & Access
- **Cashier**: POS ordering, payments, cash drawer, cashier queue
- **Kitchen**: Kitchen display only
- **Admin**: Full access (POS, cashier, kitchen, admin tools)

## Core Workflows

### 1) Self‑Ordering Kiosk
1. Customer starts at `/kiosk`
2. Selects order type and items
3. Places order → order slip prints
4. Customer pays at counter

### 2) Staff‑Based Ordering (Cashier POS)
1. Cashier adds items in `/pos`
2. Selects Dine‑in or Takeout
3. Takes payment → order auto‑sent to kitchen

### 3) Kitchen Workflow
1. Order appears in KDS as **SENT_TO_KITCHEN**
2. Kitchen clicks **Start** → status **PREPARING**
3. Kitchen clicks **Ready** → status **READY_FOR_PICKUP**
4. Cashier closes order → **COMPLETED**

### 4) Inventory & Costing
- Inventory is deducted on payment confirmation
- Recipe lines define ingredient usage per product
- Unit costs produce **COGS** and **gross margin**
- Adjustments support restock, waste, variance, manual changes

### 5) Cash Drawer Control
- Open/close shifts with opening float
- Record cash in/out
- End‑of‑shift count + variance tracking

### 6) Replacement / Remake
- Cashier requests replacement for completed orders
- Admin approves → replacement ticket sent to kitchen

### 7) Audit Logs
All key actions are logged (payments, replacements, cash drawer, auth) and can be exported as CSV.

## Routes
### Public
- `/kiosk` – Kiosk landing
- `/kiosk/order-type`
- `/kiosk/menu`
- `/kiosk/cart`
- `/kiosk/confirm`
- `/kiosk/success/:orderNo`
- `/kiosk/print/:orderNo`

### Staff
- `/pos` – Staff POS ordering
- `/orders` – Cashier queue
- `/kitchen` – KDS

### Admin
- `/admin/dashboard`
- `/admin/products`
- `/admin/categories`
- `/admin/inventory`
- `/admin/recipes`
- `/admin/replacements`
- `/admin/cash-adjustments`
- `/admin/audit-logs`
- `/admin/users`
- `/admin/settings`

## Local Storage Keys
Data is UI‑first and persisted locally:
- `pos.orders.v1` – orders
- `pos.auth.v1` – user session
- `pos.cash.v1` – cash drawer + adjustments
- `pos.audit.v1` – audit logs

## Setup
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```

## Notes
- UI‑first only (no backend integration yet)
- All data is mock/localStorage
- Designed for speed + clarity in busy restaurant workflows

---

Message me if you’re interested in a demo or full deployment.
