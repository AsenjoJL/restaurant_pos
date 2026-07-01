Frontend Architecture Notes

The frontend is a React, TypeScript, Redux Toolkit, React Router, and Vite app for the Restaurant POS system.

For local testing, the app uses the Laravel backend API and PostgreSQL database.


App startup

The app starts from src/app/App.tsx.

AppProviders wraps the app with the main setup:

Error boundary
Redux store
Starter data loader
Auth session
Toast messages

After that, AppRouter chooses the page based on the URL.

Public pages open directly.
Staff and admin pages go through RequireAuth first.


Main screens

Customer kiosk

/kiosk opens the customer welcome screen.
/kiosk/menu opens the menu and cart.
/kiosk/success/:orderNo shows the order confirmation.
/kiosk/print/:orderNo opens the printable order slip.

Staff login

/login is used by admin, cashier, and kitchen users.

After login:

Admin goes to /admin/dashboard.
Cashier goes to /pos.
Kitchen goes to /kitchen.

Kitchen status board

/kitchen is the staff kitchen display.
/KDS is the customer-facing board.
/kds-board redirects to /KDS.


Order path

1. Customer creates an order from the kiosk.
2. The order is saved as unpaid.
3. Cashier collects payment from /orders.
4. Cashier can also create a staff order from /pos.
5. Paid orders appear in the kitchen queue.
6. Kitchen marks the order as preparing.
7. Kitchen marks the order as ready.
8. The customer board shows the order as ready.
9. Cashier closes the order after it is served or released.


Public routes

/ opens /kiosk.
/kiosk opens the customer welcome screen.
/kiosk/menu opens customer ordering.
/kiosk/success/:orderNo opens the success screen.
/kiosk/print/:orderNo opens the print screen.
/KDS opens the customer kitchen board.
/kds-board redirects to /KDS.
/login opens staff login.


Staff routes

/pos
Admin and cashier users can open this page.
It is used for staff order taking.

/orders
Admin and cashier users can open this page.
It is used for queue work, payments, receipts, and cash drawer actions.

/kitchen
Admin and kitchen users can open this page.
It is used for kitchen ticket work.


Admin routes

/admin/dashboard
Main dashboard.

/admin/catalog
Catalog menu.

/admin/products
Product management.

/admin/categories
Category management.

/admin/orders-dashboard
Order and inventory deduction view.

/admin/sales-center
Sales tools menu.

/admin/sales
Sales records.

/admin/inventory
Stock management.

/admin/recipes
Product recipe setup.

/admin/replacements
Replacement request review.

/admin/cash-adjustments
Cash adjustment review.

/admin/audit-logs
System activity logs.

/admin/users
Staff account management.

/admin/settings
Store and receipt settings.

/admin/administration
Administration menu.


Login rules

RequireAuth protects staff and admin pages.

If there is no logged-in user, the page redirects to /login.

If the user role is not allowed, the app redirects to that role's default page.

Role defaults:

Admin: /admin/dashboard
Cashier: /pos
Kitchen: /kitchen


Data path

Most screens follow this path:

Component
Controller hook
Redux selector or action
Feature slice
HTTP repository
Laravel API

The screen reads from Redux selectors and writes through Redux actions. Repositories sync data with the Laravel API.


Folder map

src/app
App setup, providers, routing, layout, and store setup.

src/features/auth
Login and user roles.

src/features/kiosk
Customer self-ordering.

src/features/pos
Cashier order-taking.

src/features/orders
Order queue, payments, cash drawer, and order actions.

src/features/kitchen
Kitchen display and customer board.

src/features/admin
Admin pages for products, users, settings, reports, and management.

src/features/inventory
Ingredients, recipes, stock, import, and export.

src/features/sales
Sales records and reporting.

src/shared
Shared components, helpers, styles, and types.


Feature folders

pages
Page layout and screen composition.

components
UI pieces used by the feature.

hooks
Screen behavior and controller logic.

store
Redux slices, actions, and selectors.

api
Repository contracts and HTTP integrations.

types
TypeScript types for the feature.

backend
Laravel API and database source of truth.


Files to know

src/app/App.tsx
Main app component.

src/app/providers/AppProviders.tsx
Main provider wrapper.

src/app/router/AppRouter.tsx
Main route list.

src/app/router/guards/RequireAuth.tsx
Login and role guard.

src/features/auth/auth.utils.ts
Default route per role.

src/app/store/store.ts
Redux store.

src/app/store/store.sync.ts
Local data syncing.


Notes for updates

If a route changes, update AppRouter.tsx and this file.

If a new screen is added, add it to the correct route group.

Keep large page files focused on layout. Move repeated logic into hooks, slices, repositories, or helper files.
