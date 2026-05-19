Restaurant POS User Manual

These notes explain how the users work with the Restaurant POS system.


User roles

Customer
Uses the kiosk to place orders.

Cashier
Uses the POS and order queue to take orders, accept payments, and print receipts.

Kitchen staff
Uses the kitchen display to prepare orders and mark them ready.

Admin or manager
Manages menu items, inventory, staff accounts, sales, reports, and settings.

Customers do not log in.
Staff users log in from /login.


Test accounts

Admin
Username: admin
PIN: 1111

Cashier
Username: cashier
PIN: 2222

Kitchen
Username: kitchen
PIN: 3333


Login

1. Open /login.
2. Type the username.
3. Type the PIN.
4. Select Sign In.

If the login fails, check the username and PIN. If it still fails, ask an admin to check the account.

To change users, sign out first and log in again with another account.


Customer kiosk

Route: /kiosk

Customer order steps:

1. Start on the kiosk welcome screen.
2. Choose Dine-in or Takeout.
3. Browse by category or search for an item.
4. Add items to the cart.
5. Choose modifiers or bundle choices if shown.
6. Review the cart.
7. Submit the order.
8. Take note of the order number.
9. Pay at the counter.

Customers can change quantities, remove items, add notes, or clear the cart before submitting.

Unavailable items cannot be ordered.


Cashier POS

Route: /pos

Cashier order steps:

1. Log in as cashier or admin.
2. Open /pos.
3. Pick a category or search for an item.
4. Add items to the order.
5. Choose modifiers or bundle choices if needed.
6. Set Dine-in or Takeout.
7. Add table number, notes, discount, or promo code if needed.
8. Select Checkout.

Payment methods:

Cash
Enter the amount received. It must be equal to or higher than the total.

Card
Reference number is optional.

GCash
Reference number is required.

Other
Reference number is required.

After payment, the sale is saved, inventory is deducted when recipes exist, the receipt can be printed, and the order goes to the kitchen.


Orders and payments

Route: /orders

This page is used for kiosk payments, queue management, receipts, cash drawer work, edits, cancellations, closing orders, and replacement requests.

Common actions:

Take Payment
For unpaid kiosk orders.

Send to Kitchen
For paid orders ready for preparation.

Print
For receipt or order copy printing.

Edit Order
For changing an order before it is locked.

Cancel Order
For cancelled orders. A reason is needed.

Close Order
For orders that are already served or released.

Request Replacement
For completed orders that need a remake.


Cash drawer

Opening:

1. Select Open Cash Drawer.
2. Enter the opening float.
3. Confirm.

During the shift:

Use Cash In and Cash Out for cash movements. Add a note or reference for each one.

Closing:

1. Count the cash.
2. Enter the counted amount.
3. Add notes if needed.
4. Close the shift.
5. Review the variance.


Cash adjustment

Use this for wrong change, shortage, or overage.

1. Open Cash Adjustment.
2. Pick the adjustment type.
3. Link an order if needed.
4. Enter the amount.
5. Write the reason.
6. Submit.

Admin reviews the request later.


Kitchen display

Staff route: /kitchen
Customer board: /KDS

Kitchen steps:

1. Paid orders appear on the kitchen display.
2. Select Start when preparation begins.
3. Select Ready when the order is done.
4. The customer board shows the ready status.
5. Cashier closes the order after serving.

Status meanings:

Sent to Kitchen
Waiting to be started.

Preparing
Kitchen has started it.

Ready for Pickup or Serving
Kitchen is finished.

Completed
Cashier has closed the order.

Replacement tickets appear in the kitchen after admin approval.


Admin dashboard

Route: /admin/dashboard

The dashboard shows sales, order count, profit, average ticket, staff count, active menu items, low stock, and sales trends.

Use the range buttons to view 7 days, 30 days, or 12 months.


Catalog

Catalog hub: /admin/catalog

Products: /admin/products
Create and edit menu items.

Categories: /admin/categories
Organize menu filters.

Recipes: /admin/recipes
Connect products to ingredients.

Recipes are important because they control inventory deduction, cost, profit, and margin.


Inventory

Route: /admin/inventory

Inventory tracks raw ingredients and non-raw items.

Units:

g for weight
ml for liquid
pcs for countable items

Add ingredient:

1. Select Add Ingredient.
2. Enter name, category, type, unit, stock, and reorder level.
3. Enter unit cost or bulk pricing.
4. Save.

Restock:

Select Restock, enter the quantity received, add a reference if needed, then save.

Adjust:

Select Adjust, choose a reason, enter the quantity, then save.

Export:

Select Export Inventory and choose .xlsx, .csv, or .json.

Import:

1. Select Import Inventory.
2. Download the template.
3. Fill in the file.
4. Upload it.
5. Read the import summary.

Import fields:

Required:
name
category
base unit
unit cost, unless bulk price is used

Optional:
inventory id
ingredient type
on hand
reorder level
bulk quantity
bulk unit
bulk price


Sales tools

Sales center: /admin/sales-center

Sales records: /admin/sales
View sales history, payment method, profit, margin, and receipt copies.

Cash adjustments: /admin/cash-adjustments
Approve or reject cashier cash reports.

Order deductions: /admin/orders-dashboard
Check inventory deduction per order.

Replacement requests: /admin/replacements
Approve or reject remake requests.


Administration

Administration hub: /admin/administration

Users: /admin/users
Create, edit, activate, and deactivate staff accounts.

Audit logs: /admin/audit-logs
Review login, payment, cash drawer, inventory, replacement, and system events.

Settings: /admin/settings
Set store name, tax, service charge, receipt footer, and sync timing.


Daily routine

Opening:

Start the app.
Check the kiosk menu.
Cashier opens the cash drawer.
Kitchen opens /kitchen.
Admin checks dashboard and inventory alerts.

During service:

Customers place kiosk orders.
Cashier accepts payments.
Cashier creates staff orders if needed.
Paid orders go to the kitchen.
Kitchen marks orders ready.
Cashier closes served orders.
Admin handles adjustments and replacements.

Closing:

Finish pending orders.
Export sales if needed.
Review cash adjustment requests.
Close the cash drawer.
Check inventory alerts.
Export an inventory backup if needed.


Data note

This frontend version saves data in the browser on the same device.

Clearing browser storage removes the POS data.

Exports are the backup while there is no backend database.


Common problems

Invalid login
Username or PIN is wrong.

Not authorized
The account role cannot open that page.

Insufficient amount
Cash received is lower than the total.

Reference required
GCash or Other payment needs a reference number.

Inventory shortage
Stock is not enough for the order.

Import failed
The file format or columns are wrong.

No kitchen tickets
No paid order is waiting in the kitchen queue.
