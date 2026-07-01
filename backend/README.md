# Restaurant POS API

Laravel 13 REST API for the React-based restaurant POS frontend.

## Stack

- Laravel 13
- PostgreSQL
- Laravel Sanctum (SPA auth)
- Eloquent ORM
- Form Requests
- API Resources

## Setup

1. Copy `.env.example` to `.env`.
2. Set PostgreSQL credentials in `.env`.
3. Install dependencies:
   - `composer install`
4. Generate the app key:
   - `php artisan key:generate`
5. Run migrations and seeders:
   - `php artisan migrate --seed`
6. Start the API:
   - `php artisan serve`

Default seeded admin:

- `username`: `admin`
- `password`: `password123`

## Sanctum SPA Auth

Frontend login flow:

1. `GET /sanctum/csrf-cookie`
2. `POST /api/v1/auth/login`
3. `GET /api/v1/auth/me`
4. `POST /api/v1/auth/logout`

The frontend must send requests with `credentials: include`.

## Main Endpoints

- `GET /api/v1/dashboard`
- `GET|POST|PUT|DELETE /api/v1/categories`
- `GET|POST|PUT|DELETE /api/v1/products`
- `GET|POST|PUT|DELETE /api/v1/inventory`
- `GET|POST|PUT|DELETE /api/v1/suppliers`
- `GET|POST|PUT|DELETE /api/v1/purchase-orders`
- `GET|POST|PUT|DELETE /api/v1/customers`
- `GET|POST|PUT|DELETE /api/v1/tables`
- `GET|POST|PUT|DELETE /api/v1/orders`
- `POST /api/v1/orders/{order}/checkout`
- `POST /api/v1/orders/{order}/capture-payment`
- `POST /api/v1/orders/{order}/cancel`
- `POST /api/v1/orders/{order}/void`
- `GET /api/v1/orders/{order}/receipt`
- `GET|POST /api/v1/payments`
- `GET|POST|PUT|DELETE /api/v1/discounts`
- `GET /api/v1/reports/sales`
- `GET /api/v1/reports/inventory`
- `GET|POST|PUT /api/v1/settings`
- `GET /api/v1/audit-logs`

## Frontend Connection

In `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_LARAVEL_API=true
```

Current frontend integration in this workspace:

- Auth now supports Laravel Sanctum login.
- API base URL and cookie-based fetch helper are added.
- Existing non-auth repositories remain separate from the UI and can be swapped incrementally onto the Laravel endpoints without redesigning components.
