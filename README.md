# Restaurant POS

This repository contains a React frontend and a Laravel backend API for a restaurant point-of-sale system.

## Project Structure
- `frontend/` - React + TypeScript + Vite application (POS, kiosk, kitchen, admin modules)
- `backend/` - Laravel 13 REST API with Sanctum and PostgreSQL-ready schema

## Runtime
- Frontend can still run in mock mode
- Backend API is available under `backend/`
- PostgreSQL is the intended production database

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
- Backend guide: `backend/README.md`
