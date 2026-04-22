# Frontend Architecture

This frontend runs as a standalone app backed by mock repositories and local persistence.

## Runtime config

- The app defaults to mock mode.
- Config files:
  - `src/app/config/env.ts`

## Repository pattern

Each core module now has:

- `api/<module>.repository.ts` (interface contract)
- `api/<module>.repository.mock.ts` (mock implementation)
- `api/index.ts` (repository export)

Modules scaffolded:

- `kiosk`
- `orders`
- `kitchen`
- `inventory`
- `sales`
- `admin`

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
