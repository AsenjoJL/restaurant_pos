# Native Kiosk App Setup (Windows)

This project can run as a full native kiosk app using Electron.

## 1) Install dependencies

From `frontend`:

```powershell
npm install
```

## 2) Run kiosk app in development

```powershell
npm run kiosk:dev
```

What it does:
- Starts Vite dev server on `http://localhost:5173`
- Starts Electron in fullscreen kiosk mode
- Locks app in one window (menu hidden)

## 3) Build installer (`.exe`)

```powershell
npm run kiosk:build
```

Output folder:
- `frontend/release`

## 4) Behavior in native kiosk mode

- Fullscreen + kiosk enabled
- External links are blocked from opening inside app
- Printing uses native silent print first, browser print as fallback
- Router auto-switches to hash mode when running from `file://`

## 5) Optional Windows hardening

- Use a dedicated local Windows account (`KioskUser`)
- Auto-login to kiosk account
- Add app shortcut to Startup folder
- Set default thermal printer
- Disable task switching keys via kiosk policy/group policy (optional)

