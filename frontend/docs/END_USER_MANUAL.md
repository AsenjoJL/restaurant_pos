# Restaurant POS End User Manual

This manual explains how customers, cashiers, kitchen staff, and admins use the Restaurant POS system.

## 1. User Types

| User type | Main screens | Purpose |
| --- | --- | --- |
| Customer | `/kiosk`, `/kiosk/menu` | Place self-service orders |
| Cashier | `/pos`, `/orders` | Create staff orders, collect payments, manage queue |
| Kitchen Staff | `/kitchen` | Prepare orders and mark them ready |
| Admin / Manager | `/admin/*` plus staff screens | Manage products, inventory, users, reports, settings |

Customer kiosk ordering does not require login.

Staff and admin users log in through:

```text
/login
```

## 2. Default Staff Accounts

Use these accounts for local testing:

| Role | Username | Password / PIN |
| --- | --- | --- |
| Admin | `admin` | `1111` |
| Cashier | `cashier` | `2222` |
| Kitchen | `kitchen` | `3333` |

After login:

| Role | Opens first |
| --- | --- |
| Admin | Admin dashboard |
| Cashier | POS ordering screen |
| Kitchen | Kitchen display |

## 3. Login and Logout

To log in:

1. Open `/login`.
2. Type the username.
3. Type the password/PIN.
4. Select Sign In.

If login fails:

1. Check spelling of the username.
2. Check the PIN.
3. Ask an admin to confirm the user is active.

To switch users:

1. Log out from the app shell/user menu.
2. Return to `/login`.
3. Sign in with the next account.

## 4. Customer Kiosk Ordering

Route:

```text
/kiosk
```

Use this flow for self-ordering customers.

### Start an Order

1. Customer taps the start button on the welcome screen.
2. Customer chooses the order type:
   - Dine-in
   - Takeout
3. The app opens the menu page.

### Browse the Menu

On the menu page, customers can:

1. Use category filters to show a section of the menu.
2. Search for a menu item.
3. View item name, description, price, and availability.
4. Add available items to the cart.
5. Open item customization when an item has modifiers or bundle choices.

Unavailable items cannot be added.

### Manage the Cart

Customers can:

1. Increase item quantity.
2. Decrease item quantity.
3. Remove an item.
4. Add order notes when needed.
5. Clear the order before submitting.

### Place the Kiosk Order

1. Review the cart.
2. Confirm the order.
3. The app creates an order number.
4. The app opens the success page.
5. An order slip can be printed.
6. Customer pays at the counter.

Important kiosk rule:

The kiosk creates the order, but cashier payment still happens at the counter. Paid orders are sent into the kitchen workflow.

## 5. Cashier POS Ordering

Route:

```text
/pos
```

Allowed users:

| Role | Access |
| --- | --- |
| Cashier | Full cashier operation |
| Admin | Can access POS |

### Create a Staff Order

1. Log in as cashier or admin.
2. Open `/pos`.
3. Choose a category from the left panel.
4. Search if needed.
5. Select menu items.
6. Customize item modifiers or bundle choices if the item requires it.
7. Check the current order panel.

### Set Order Details

In the current order panel:

1. Choose Dine-in or Takeout.
2. For Dine-in, choose a table when required.
3. Add order notes when needed.
4. Add a discount if authorized.
5. Enter a promo code when applicable.

### Edit the Current Order

Cashiers can:

1. Increase or decrease item quantity.
2. Remove an item.
3. Clear the cart.
4. Void an item with a reason when the system asks for one.

### Take Payment

1. Select Checkout or the payment action.
2. The payment modal opens.
3. Review order number, source, item count, and total due.
4. Choose payment method:
   - Cash
   - Card
   - GCash
   - Other
5. Complete the payment fields.

Payment field rules:

| Method | Required fields |
| --- | --- |
| Cash | Amount received must be equal to or higher than total due |
| Card | Card reference is optional |
| GCash | Reference number is required; payer name is optional |
| Other | Reference number is required; payer name is optional |

After selecting Pay & Print:

1. Payment is recorded.
2. Inventory is checked.
3. Ingredient stock is deducted when recipes exist.
4. Sales record is created.
5. Receipt prints.
6. Staff order is sent to the kitchen.

If inventory is insufficient, the payment cannot continue until the shortage is fixed.

## 6. Cashier Queue

Route:

```text
/orders
```

Allowed users:

| Role | Access |
| --- | --- |
| Cashier | Full operation |
| Admin | View by default, can use admin override for operation |

Use the cashier queue to manage customer kiosk orders and staff orders after they are created.

### Find an Order

1. Open `/orders`.
2. Use the search field for order number or customer/order details.
3. Switch between queue tabs such as pending and ready orders.
4. Select an order to view details.

### Common Queue Actions

Depending on order status, the cashier can:

| Action | Use when |
| --- | --- |
| Take Payment | Kiosk order is unpaid |
| Send to Kitchen | Paid order is ready to prepare |
| Print | Customer needs invoice or receipt copy |
| Edit Order | Order needs item or note changes before it is locked |
| Cancel Order | Order must be cancelled with a reason |
| Close Order | Ready order has been served or released |
| Request Replacement | Completed order needs a remake/replacement request |

### Cash Drawer

Cashier queue includes the cash drawer modal.

To open a shift:

1. Open Cash Drawer.
2. Enter opening float.
3. Select Open Drawer.

During the shift:

1. Add Cash In for extra cash added to drawer.
2. Add Cash Out for cash removed from drawer.
3. Add a note/reference for traceability.

To close a shift:

1. Count physical cash.
2. Enter Counted cash.
3. Add closing notes if needed.
4. Select Close Shift.
5. Review expected cash and variance.

### Cash Adjustment Request

Use cash adjustment when there is wrong change, shortage, or overage.

1. Open Cash Adjustment.
2. Choose the adjustment type.
3. Link the order if applicable.
4. Enter amount and reason.
5. Submit the request.
6. Admin reviews it in Sales > Cash Adjustments.

## 7. Kitchen Display System

Staff route:

```text
/kitchen
```

Customer-facing queue board:

```text
/KDS
```

Allowed users for `/kitchen`:

| Role | Access |
| --- | --- |
| Kitchen | Full kitchen operation |
| Admin | View by default, can use admin override for operation |

### Kitchen Workflow

1. Paid orders appear in the kitchen display.
2. Kitchen staff chooses the station filter when needed.
3. Select Start on a ticket to mark it preparing.
4. Prepare the items shown on the ticket.
5. Select Ready when the order is ready for serving or pickup.
6. The order moves to Ready for Serving on the queue board.
7. Cashier closes the order after serving/releasing it.

Kitchen status meaning:

| Status | Meaning |
| --- | --- |
| Sent to Kitchen | Paid order is waiting for preparation |
| Preparing | Kitchen has started the ticket |
| Ready for Pickup / Serving | Kitchen has finished the ticket |
| Completed | Cashier closed the served/released order |

### Replacement Tickets

If an admin approves a replacement/remake request:

1. A replacement ticket appears on the kitchen display.
2. Kitchen staff starts and marks it ready like a normal ticket.

## 8. Admin Dashboard

Route:

```text
/admin/dashboard
```

The dashboard shows operational and sales metrics.

Use it to check:

1. Total sales.
2. Order counts.
3. Profit and margin.
4. Recent trends.
5. Time ranges:
   - 7D
   - 30D
   - 12M

## 9. Catalog Management

Route:

```text
/admin/catalog
```

Catalog contains:

| Section | Route | Purpose |
| --- | --- | --- |
| Products | `/admin/products` | Create, update, price, and activate menu items |
| Categories | `/admin/categories` | Organize menu items |
| Recipes | `/admin/recipes` | Link products to ingredients |

### Products

Use Products to:

1. Create a new menu item.
2. Edit name, description, category, price, and cost.
3. Set product class:
   - Raw
   - Non-raw
4. Upload or set product image.
5. Activate or deactivate a product.
6. Review visual catalog cards.

Product availability affects whether customers and cashiers can add the item.

### Categories

Use Categories to:

1. Add a new menu category.
2. Rename a category.
3. Activate or deactivate a category.
4. Delete a category when allowed.

Categories appear in the kiosk and POS menu filters.

### Recipes

Use Recipes to:

1. Select a product.
2. Add ingredient lines.
3. Set quantity used per serving.
4. Save the recipe.
5. Create missing inventory ingredients from the recipe flow when needed.

Recipe lines are used for inventory deduction, COGS, gross profit, and gross margin.

## 10. Inventory Management

Route:

```text
/admin/inventory
```

Use inventory to manage raw ingredients and non-raw service items.

### Inventory List

The table shows:

1. Inventory ID.
2. Ingredient name.
3. Type.
4. Category.
5. Base unit.
6. On-hand quantity.
7. Reorder level.
8. Unit cost.
9. Stock status.
10. Actions.

Ingredient types:

| Type | Example |
| --- | --- |
| Raw | Chicken, beef, rice, sauce ingredients |
| Non-raw | Paper bag, cup, container, packaging |

Base units:

| Unit | Use for |
| --- | --- |
| `g` | Weight-based stock |
| `ml` | Liquid stock |
| `pcs` | Countable items |

### Add an Ingredient

1. Open Inventory.
2. Select Add Ingredient.
3. Enter name and category.
4. Choose ingredient type.
5. Choose base unit.
6. Enter on-hand quantity.
7. Enter reorder level.
8. Enter unit cost, or enter bulk quantity/unit/price so the system can calculate unit cost.
9. Save.

### Edit an Ingredient

1. Find the ingredient in the table.
2. Select Edit.
3. Update fields.
4. Save.

### Restock

1. Select Restock on the ingredient.
2. Enter quantity received.
3. Add reason/reference if needed.
4. Save adjustment.

### Manual Adjustment

1. Select Adjust on the ingredient.
2. Choose adjustment reason:
   - Restock
   - Waste
   - Variance
   - Manual
3. Enter quantity or counted quantity.
4. Add reason/reference.
5. Save adjustment.

The app prevents stock from going negative.

### Export Inventory

1. Select Export Inventory.
2. Choose file type:
   - Excel `.xlsx`
   - CSV `.csv`
   - JSON `.json`
3. The file downloads as `inventory-export-YYYY-MM-DD`.

Export includes:

1. Inventory ID.
2. Ingredient type.
3. Name.
4. Category.
5. Base unit.
6. On hand.
7. Reorder level.
8. Unit cost.
9. Status.
10. Inventory value.

### Download Import Template

1. Select Import Inventory.
2. Under Download Template, choose:
   - Excel `.xlsx`
   - CSV `.csv`
   - JSON `.json`
3. Fill in the downloaded template.

Template columns:

| Column | How to fill |
| --- | --- |
| `inventory id` | Optional unique ID like `ING-0001` |
| `ingredient type` | `RAW` or `NON_RAW` |
| `name` | Required ingredient name |
| `category` | Required category |
| `base unit` | `g`, `ml`, or `pcs` |
| `on hand` | Current quantity |
| `reorder level` | Low-stock point |
| `unit cost` | Cost per base unit |
| `bulk qty` | Optional bulk pack quantity |
| `bulk unit` | Optional bulk pack unit |
| `bulk price` | Optional bulk pack price |

Use either `unit cost` or the bulk cost fields. If `unit cost` is blank, the system tries to calculate it from `bulk qty`, `bulk unit`, and `bulk price`.

### Import Inventory

1. Select Import Inventory.
2. Under Import File, choose the matching file type.
3. Select the completed file.
4. Wait for the import summary.

The import summary reports:

| Result | Meaning |
| --- | --- |
| Imported | New ingredients created |
| Updated | Existing ingredients changed |
| Skipped | Blank rows ignored |
| Errors | Rows that could not be read or validated |

## 11. Sales Tools

Route:

```text
/admin/sales-center
```

Sales tools:

| Tool | Route | Purpose |
| --- | --- | --- |
| Sales History | `/admin/sales` | View sales records and profit |
| Cash Adjustments | `/admin/cash-adjustments` | Review cashier adjustment requests |
| Order Deductions | `/admin/orders-dashboard` | Track order and inventory deductions |
| Replacements | `/admin/replacements` | Approve or reject remake/replacement requests |

### Sales History

Use Sales History to:

1. Search order records.
2. Filter by payment method.
3. Filter by status.
4. Filter by date range.
5. View sales totals, COGS, profit, and margin.
6. Open record details.
7. Print receipt copy.
8. Export records.

### Cash Adjustments Review

1. Open Cash Adjustments.
2. Review pending requests.
3. Check order link, amount, type, and reason.
4. Approve or reject with review note.
5. The decision is saved to history and audit logs.

### Replacements Review

1. Open Replacements.
2. Review pending replacement/remake requests.
3. Check items and reason.
4. Approve or reject.
5. Approved replacements are sent to the kitchen as replacement tickets.

## 12. Administration

Route:

```text
/admin/administration
```

Administration contains:

| Section | Route | Purpose |
| --- | --- | --- |
| Users | `/admin/users` | Create staff accounts and manage access |
| Audit Logs | `/admin/audit-logs` | Track system activity |
| Settings | `/admin/settings` | Configure store, receipt, tax, and sync settings |

### Users

Use Users to:

1. Create cashier, kitchen, or admin accounts.
2. Edit staff name and username.
3. Change PIN/password.
4. Activate or deactivate a user.

Recommended user rules:

1. Give each staff member their own account.
2. Do not share admin accounts.
3. Deactivate staff accounts that are no longer used.

### Audit Logs

Audit logs track important actions such as:

1. Login/auth actions.
2. Payment confirmation.
3. Cash drawer open/close.
4. Cash adjustment review.
5. Replacement review.
6. Inventory changes.
7. System events.

Use filters to search by:

1. Text.
2. Scope.
3. Severity.

Export audit logs when management needs a record.

### Settings

Use Settings to configure:

1. Store name.
2. Tax rate.
3. Service charge rate.
4. Receipt footer message.
5. Live sync timing.

Save settings after editing.

## 13. Daily Operating Routine

Recommended opening routine:

1. Start the local app or kiosk app.
2. Confirm kiosk menu is visible.
3. Cashier logs in.
4. Open the cash drawer shift and enter opening float.
5. Kitchen staff logs in to `/kitchen`.
6. Admin checks dashboard, inventory alerts, and menu availability.

Recommended during-service routine:

1. Customers place kiosk orders.
2. Cashier collects kiosk payments in `/orders`.
3. Cashier creates staff orders in `/pos` when needed.
4. Paid orders are sent to kitchen.
5. Kitchen starts and marks tickets ready.
6. Cashier closes served or released orders.
7. Admin handles adjustment and replacement requests.

Recommended closing routine:

1. Finish all pending orders.
2. Close ready orders after serving.
3. Export sales if needed.
4. Review cash adjustment requests.
5. Count physical cash.
6. Close cash drawer shift.
7. Check inventory alerts.
8. Export inventory backup if needed.

## 14. Important Data Notes

This version is frontend-only and stores data locally in the browser/device.

That means:

1. Data is not automatically shared with another computer.
2. Clearing browser local storage removes local POS data.
3. Exports are important when you need backups or reports.
4. A real backend/database is required for multi-device production deployment.

## 15. Common Errors and What To Do

| Message / problem | What it means | What to do |
| --- | --- | --- |
| Invalid login | Username or PIN is wrong | Re-enter credentials or ask admin to reset PIN |
| Not authorized | Current role cannot do the action | Log in with the correct role |
| Insufficient amount | Cash received is less than total due | Enter a higher cash amount |
| Reference required | GCash/Other payment is missing reference | Enter the payment reference |
| Inventory shortage | Ingredients are not enough for the order | Restock/adjust inventory or remove the unavailable item |
| Import failed | File format or headers cannot be read | Download a new template and retry |
| No kitchen tickets yet | No paid/sent orders are waiting | Confirm payment and send order to kitchen |

