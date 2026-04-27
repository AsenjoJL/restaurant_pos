# Native Kiosk App Setup

This project can run as a full native kiosk app using Electron on Windows, macOS, and Linux.

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

## 3) Build native installers/packages

```powershell
npm run kiosk:build
```

Per-platform builds:

```powershell
npm run kiosk:build:win
npm run kiosk:build:mac
npm run kiosk:build:linux
```

Output folder:
- `frontend/release`

Default output types:
- Windows: `NSIS` installer (`.exe`)
- macOS: `DMG`
- Linux: `AppImage`

## 4) Behavior in native kiosk mode

- Fullscreen + kiosk enabled
- External links are blocked from opening inside app
- Printing uses native silent print first, browser print as fallback
- Router auto-switches to hash mode when running from `file://`

## 5) Platform notes

- Windows remains the most kiosk-ready target because the setup guide and hardening flow are already documented for it.
- macOS and Linux packaging are enabled, but kiosk lockdown and printer behavior should still be tested per OS before deployment.

## 6) Optional Windows hardening

- Use a dedicated local Windows account (`KioskUser`)
- Auto-login to kiosk account
- Add app shortcut to Startup folder
- Set default thermal printer
- Disable task switching keys via kiosk policy/group policy (optional)
