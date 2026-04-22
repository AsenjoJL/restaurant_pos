# Restaurant POS

This repository contains the frontend-only workspace for a restaurant point-of-sale system.

## Project Structure
- `frontend/` - React + TypeScript + Vite application (POS, kiosk, kitchen, admin modules)

## Runtime
- Frontend-only
- Mock data and local state persistence
- No bundled backend or database

## Frontend Tech Stack
- TypeScript + TSX
- React 19
- Vite (`@vitejs/plugin-react`)
- Redux Toolkit + React Redux
- React Router DOM
- Electron + electron-builder (kiosk desktop app)
- Custom CSS architecture (`base.css`, `pos.css`, `admin.css`, `kiosk.css`, `tokens.css`)

## Docs
- Frontend guide: `frontend/README.md`
- Frontend architecture: `frontend/docs/FRONTEND_ARCHITECTURE.md`
