# Frontend Architecture (Frontend-Only, API-Ready)

This project currently runs in `mock` mode (no backend dependency).
The goal is to keep current UI behavior while preparing an easy switch to Laravel API later.

## Data mode switch

- `VITE_DATA_MODE=mock` uses local/mock repositories.
- `VITE_DATA_MODE=api` uses HTTP repositories.
- Config files:
  - `src/app/config/env.ts`
  - `src/app/config/data-mode.ts`

## Repository pattern

Each core module now has:

- `api/<module>.repository.ts` (interface contract)
- `api/<module>.repository.mock.ts` (frontend-only implementation)
- `api/<module>.repository.http.ts` (Laravel-ready placeholder)
- `api/index.ts` (mock/api switch)

Modules scaffolded:

- `kiosk`
- `orders`
- `kitchen`
- `inventory`
- `sales`
- `admin`

## Mock seed source of truth

Central seed exports are under:

- `src/mock/seed/index.ts`

Seed files:

- `users.seed.ts`
- `categories.seed.ts`
- `products.seed.ts`
- `tables.seed.ts`
- `orders.seed.ts`
- `ingredients.seed.ts`
- `recipes.seed.ts`

## Practical separation rules

- `pages/` = page composition only
- `components/` = presentational UI
- `hooks/` = feature behavior
- `store/` = slice/selectors/actions
- `api/` = repository and transport logic
- `types/` = module contracts and DTOs
- `mock/seed/` = initial local data only

## First business logic to extract from UI

Move these out of components first:

1. Payment validation and state transitions
2. Inventory deduction and shortage validation
3. Sales COGS/profit/margin math
4. Print trigger decisions (what/when to print)
5. Order status transition rules

Keep components focused on rendering and user interaction only.

