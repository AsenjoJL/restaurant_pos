# Restaurant POS Deployment Guide

This guide documents the production deployment path for this repository using:

- Backend: Render
- Database: Supabase Postgres
- Frontend: Vercel

It is written for the current project structure:

- `backend/` Laravel 13 API with Sanctum
- `frontend/` React + Vite SPA

## 1. Architecture Decision

This project currently uses Laravel Sanctum SPA authentication with cookie-based sessions.

That matters because Laravel's Sanctum SPA flow expects the frontend and backend to share the same top-level domain.

Production-safe example:

- Frontend: `https://app.example.com`
- Backend: `https://api.example.com`

Not recommended for Sanctum SPA production auth:

- `https://your-app.vercel.app`
- `https://your-api.onrender.com`

Those are different top-level domains. Laravel's Sanctum SPA authentication is not designed to treat that pair as the same first-party site.

If you want to keep the current authentication architecture, use custom domains.

Recommended production domain layout:

- `app.yourdomain.com` -> Vercel frontend
- `api.yourdomain.com` -> Render backend

For staging:

- `staging-app.yourdomain.com`
- `staging-api.yourdomain.com`

## 2. What Was Added For Deployment

This repository now includes:

- `backend/Dockerfile` for Render Docker deployment
- `backend/docker/start.sh` to boot Apache and cache Laravel config
- `backend/docker/apache-vhost.conf` for Apache document root to `public/`
- `frontend/vercel.json` for SPA route rewrites on Vercel
- backend CORS support for multiple frontend URLs via `FRONTEND_URLS`
- HTTPS URL forcing in Laravel production
- configurable product image disk via `PRODUCT_IMAGE_DISK`

## 3. Supabase Database Setup

Create a Supabase project first.

Then open `Connect` in the Supabase dashboard and copy the Postgres connection string.

Connection choice:

- Preferred for Render backend: direct connection string
- If your Render network path needs IPv4-only fallback: Supabase session pooler

Supabase documents:

- Direct connection is ideal for persistent servers and long-running containers
- Transaction pooler is ideal for serverless or edge workloads and does not support prepared statements

For this Laravel API on Render, prefer:

- Direct connection when available
- Session pooler only if direct connection is not practical for your network path

Database values you will need:

- `DB_CONNECTION=pgsql`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`

## 4. Render Backend Deployment

Create a new Render Web Service from your Git repository.

Use these settings:

- Root directory: `backend`
- Runtime: `Docker`

Health check:

- `/up`

### Render Environment Variables

Set these in Render:

```env
APP_NAME=Restaurant POS API
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

FRONTEND_URL=https://app.yourdomain.com
FRONTEND_URLS=https://app.yourdomain.com

APP_KEY=base64:YOUR_GENERATED_APP_KEY

DB_CONNECTION=pgsql
DB_HOST=YOUR_SUPABASE_HOST
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=YOUR_SUPABASE_PASSWORD

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_DOMAIN=.yourdomain.com
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

SANCTUM_STATEFUL_DOMAINS=app.yourdomain.com

CACHE_STORE=database
QUEUE_CONNECTION=database
LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=warning

FILESYSTEM_DISK=public
PRODUCT_IMAGE_DISK=public
```

If you switch product images to object storage:

```env
PRODUCT_IMAGE_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=...
AWS_BUCKET=...
AWS_URL=...
AWS_ENDPOINT=...
AWS_USE_PATH_STYLE_ENDPOINT=false
```

### Generate APP_KEY

Generate an app key locally from `backend/`:

```powershell
php artisan key:generate --show
```

Copy the output to Render as `APP_KEY`.

### First Deploy Commands

After the first successful deploy, open a Render shell and run:

```bash
php artisan migrate --force
php artisan db:seed --class=RoleSeeder --force
php artisan db:seed --class=AdminUserSeeder --force
```

If you want the default admin account created on first deployment, keep `AdminUserSeeder`.

### Uploaded Images on Render

Important:

- `public` disk on Render uses the container filesystem
- container files do not survive a rebuild unless you use persistent storage or external object storage

Recommended production choice:

- use S3-compatible storage for uploaded product images

Acceptable temporary choice:

- use Render local storage only if you understand images can disappear after rebuilds or container replacement

## 5. Vercel Frontend Deployment

Create a new Vercel project from the same repository.

Use these settings:

- Root directory: `frontend`
- Framework preset: `Vite`

The project now includes `frontend/vercel.json` so browser routes such as:

- `/login`
- `/kiosk/menu`
- `/orders`
- `/admin/dashboard`

rewrite to `index.html` correctly.

### Vercel Environment Variables

Set these in Vercel:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_USE_LARAVEL_API=true
VITE_SYNC_KITCHEN_MS=5000
VITE_SYNC_SALES_MS=5000
VITE_SYNC_ORDERS_MS=5000
VITE_SYNC_BACKOFF_MULTIPLIER=1.8
VITE_SYNC_MAX_INTERVAL_MULTIPLIER=4
VITE_SYNC_JITTER_RATIO=0.15
VITE_ROUTER_MODE=browser
```

### Custom Domain

Attach your frontend custom domain in Vercel:

- `app.yourdomain.com`

Do not rely on `*.vercel.app` as your permanent production URL if you want Sanctum cookie authentication to remain first-party with the backend.

## 6. DNS Setup

Point your custom domains:

- `app.yourdomain.com` -> Vercel
- `api.yourdomain.com` -> Render

Then update:

- `APP_URL`
- `FRONTEND_URL`
- `FRONTEND_URLS`
- `SANCTUM_STATEFUL_DOMAINS`
- `SESSION_DOMAIN`
- `VITE_API_BASE_URL`

## 7. Sanctum and Cookie Requirements

Current auth model:

- Laravel Sanctum SPA cookies
- CSRF cookie endpoint: `/sanctum/csrf-cookie`
- session auth over `auth:sanctum`

This means:

- frontend must send requests with credentials
- backend CORS must allow credentials
- frontend and backend should share the same top-level domain

This repo already does:

- `supports_credentials=true` in CORS
- `statefulApi()` middleware in `bootstrap/app.php`
- frontend `fetch()` requests with `credentials: 'include'`

Production values you must set correctly:

- `SESSION_DOMAIN=.yourdomain.com`
- `SESSION_SECURE_COOKIE=true`
- `SANCTUM_STATEFUL_DOMAINS=app.yourdomain.com`

## 8. Recommended Production Checklist

Backend:

- `APP_DEBUG=false`
- `APP_ENV=production`
- `APP_URL` uses HTTPS custom API domain
- Supabase DB credentials loaded correctly
- migrations applied
- admin user created
- product image storage choice decided
- Render health check passes on `/up`

Frontend:

- `VITE_API_BASE_URL` points to the HTTPS API domain
- custom frontend domain attached
- browser routes work after refresh
- login works with Sanctum cookies

Security:

- custom domains in place
- no local `.env` secrets committed
- strong admin password changed after first deploy
- rate limiting left enabled

## 9. Deployment Order

Use this order:

1. Create Supabase project
2. Deploy backend to Render
3. Set backend environment variables
4. Run migrations and seed initial users
5. Attach backend custom domain
6. Deploy frontend to Vercel
7. Set frontend environment variables
8. Attach frontend custom domain
9. Test login, orders, kitchen flow, and inventory deduction

## 10. Post-Deploy Test Checklist

Login:

- open `https://app.yourdomain.com/login`
- verify admin login works
- verify `/sanctum/csrf-cookie` succeeds
- verify `/api/v1/auth/login` succeeds

Orders:

- create cashier order
- create kiosk order
- verify duplicate click does not create duplicate order
- verify insufficient inventory returns a clear error

Kitchen:

- pay order
- verify it appears in `Paid Orders (In Kitchen)`
- move to `PREPARING`
- move to `READY_FOR_PICKUP`

Inventory:

- verify stock deducts at order submission
- verify payment does not double deduct
- edit unpaid order and verify inventory rebalances
- cancel unpaid order and verify stock restores

Uploads:

- upload a product image
- refresh page
- verify image still loads from the deployed backend storage path

## 11. Known Limitation To Respect

If you keep Sanctum SPA cookies, do not treat this as a safe production combination:

- frontend on plain `*.vercel.app`
- backend on plain `*.onrender.com`

Use custom domains under the same parent domain instead.

## 12. Useful Commands

Backend local verification:

```powershell
cd backend
php artisan test
php artisan config:clear
php artisan route:list
```

Frontend local verification:

```powershell
cd frontend
npm run build
```

## 13. Suggested Next Step

Before the real production cutover:

- deploy a staging pair first
- `staging-app.yourdomain.com`
- `staging-api.yourdomain.com`

Then test the full login, order, payment, kitchen, and inventory flow there before using the live domain.
