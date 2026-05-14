Restaurant POS — User Manual
This guide covers how customers, cashiers, kitchen staff, and admins use the system day to day.

Who Uses What
UserScreensWhat they doCustomer/kiosk, /kiosk/menuSelf-service orderingCashier/pos, /ordersTake orders, collect payments, manage the queueKitchen Staff/kitchenPrepare orders and mark them readyAdmin / Manager/admin/* + staff screensProducts, inventory, users, reports, settings
Customers don't need to log in. Everyone else signs in at /login.

Default Test Accounts
RoleUsernamePINOpens on loginAdminadmin1111Admin dashboardCashiercashier2222POS ordering screenKitchenkitchen3333Kitchen display

Logging In and Out

Go to /login
Enter your username and PIN
Select Sign In

If login fails, double-check the username and PIN spelling. If it still doesn't work, ask an admin to confirm the account is active.
To switch users, log out from the user menu, return to /login, and sign in with the other account.

Customer Kiosk
Route: /kiosk
Placing an Order

Tap the start button on the welcome screen
Choose Dine-in or Takeout
Browse the menu — use category filters or search to find items
Tap an item to add it to the cart; if it has modifiers or bundle choices, a customization screen will appear
Unavailable items can't be added

Managing the Cart
Customers can increase or decrease quantities, remove items, add order notes, or clear the cart entirely before submitting.
Submitting the Order

Review the cart and confirm
The app generates an order number and shows the success page
An order slip can be printed
The customer pays at the counter


The kiosk creates the order, but payment is always collected by the cashier. Once paid, the order enters the kitchen workflow.


Cashier POS
Route: /pos — accessible by Cashier and Admin roles
Building an Order

Log in and open /pos
Choose a category from the left panel, or use search
Select items — customize modifiers or bundle choices when prompted
The current order builds up in the order panel on the right

Order Details
Before checkout, set:

Dine-in or Takeout — and a table number for dine-in if required
Order notes if needed
Discount if authorized
Promo code if applicable

Editing an Order
You can adjust quantities, remove items, clear the cart, or void an item with a reason before the order is locked.
Taking Payment

Select Checkout
Review the order summary — number, source, item count, total due
Choose a payment method:

MethodWhat's requiredCashAmount received must be ≥ total dueCardCard reference is optionalGCashReference number required; payer name optionalOtherReference number required; payer name optional

Select Pay & Print

After payment, the system records the sale, deducts inventory if recipes exist, prints the receipt, and sends the order to the kitchen. If any ingredient is short, payment can't go through until the shortage is resolved.

Cashier Queue
Route: /orders — Cashier (full access), Admin (view + override)
Finding an Order
Use the search field to look up an order by number or details. Switch between queue tabs (pending, ready, etc.) to filter the view.
Queue Actions
ActionWhen to useTake PaymentKiosk order is unpaidSend to KitchenPaid order is ready to preparePrintCustomer needs a receipt or invoice copyEdit OrderOrder needs changes before it's lockedCancel OrderOrder needs to be cancelled — requires a reasonClose OrderOrder has been served or releasedRequest ReplacementCompleted order needs a remake
Cash Drawer
Opening a shift:

Open Cash Drawer
Enter the opening float
Select Open Drawer

During the shift, use Cash In and Cash Out to record any cash added or removed. Add a note or reference for each entry.
Closing a shift:

Count the physical cash
Enter the counted amount
Add any closing notes
Select Close Shift and review the expected vs. actual variance

Cash Adjustment Requests
Use this when there's a wrong change, shortage, or overage:

Open Cash Adjustment
Choose the adjustment type and link an order if relevant
Enter the amount and reason
Submit — admin reviews it under Sales > Cash Adjustments


Kitchen Display
Staff route: /kitchen — Kitchen (full access), Admin (view + override)
Customer-facing board: /KDS
Kitchen Workflow

Paid orders appear on the display automatically
Filter by station if needed
Select Start on a ticket to mark it as preparing
When done, select Ready
The order moves to Ready for Serving on the queue board
The cashier closes it after serving or releasing

Order statuses:
StatusMeaningSent to KitchenWaiting to be startedPreparingKitchen has started the ticketReady for Pickup / ServingKitchen is doneCompletedCashier has closed the order
Replacement Tickets
When an admin approves a replacement request, a new ticket appears on the kitchen display. Handle it the same as a normal ticket — start it, then mark it ready.

Admin Dashboard
Route: /admin/dashboard
Shows a high-level view of sales, order counts, profit, margin, and recent trends. Use the time range selector (7D, 30D, 12M) to adjust the window.

Catalog Management
Route: /admin/catalog
SectionRoutePurposeProducts/admin/productsCreate and manage menu itemsCategories/admin/categoriesOrganize the menuRecipes/admin/recipesLink products to ingredients
Products
Create or edit menu items — name, description, category, price, cost, image, and product class (Raw or Non-raw). Activating or deactivating a product controls whether it's orderable in the kiosk and POS.
Categories
Add, rename, activate, deactivate, or delete categories. Categories appear as filters in the kiosk and POS menu.
Recipes
Select a product, add ingredient lines, and set the quantity used per serving. Recipes drive inventory deduction, COGS, gross profit, and margin calculations. You can create missing ingredients directly from the recipe flow if needed.

Inventory Management
Route: /admin/inventory
Tracks raw ingredients (chicken, rice, sauces) and non-raw items (cups, bags, packaging).
Base units: g for weight, ml for liquids, pcs for countable items.
Adding an Ingredient

Select Add Ingredient
Fill in name, category, type, base unit, on-hand quantity, and reorder level
Enter unit cost directly, or enter bulk quantity/unit/price and let the system calculate it
Save

Restocking
Select Restock on an ingredient, enter the quantity received, add a reference if needed, and save.
Manual Adjustments
Select Adjust, choose a reason (Restock, Waste, Variance, or Manual), enter the quantity, and save. The app won't let stock go negative.
Exporting Inventory
Select Export Inventory, choose a format (.xlsx, .csv, or .json), and the file downloads as inventory-export-YYYY-MM-DD. The export includes ID, type, name, category, unit, on-hand quantity, reorder level, unit cost, status, and total value.
Importing Inventory

Select Import Inventory and download the template in your preferred format
Fill it in:

ColumnNotesinventory idOptional — used to match and update existing ingredientsingredient typeRAW or NON_RAWnameRequiredcategoryRequiredbase unitg, ml, or pcson handDefaults to 0 if blankreorder levelDefaults to 0 if blankunit costRequired unless bulk pricing is providedbulk qty / unit / priceOptional — used to calculate unit cost if unit cost is blank

Upload the file and wait for the import summary — it will show how many rows were imported, updated, skipped, or errored


Sales Tools
Route: /admin/sales-center
ToolRoutePurposeSales History/admin/salesView records, profit, and marginsCash Adjustments/admin/cash-adjustmentsReview cashier adjustment requestsOrder Deductions/admin/orders-dashboardTrack inventory deductions per orderReplacements/admin/replacementsApprove or reject remake requests
Sales History
Search and filter records by payment method, status, or date range. View totals, COGS, profit, and margin. Print receipt copies or export records as needed.
Cash Adjustments
Review pending requests — check the linked order, amount, type, and reason — then approve or reject with a note. All decisions are saved to audit logs.
Replacements
Review pending remake requests, check the items and reason, then approve or reject. Approved replacements go straight to the kitchen as new tickets.

Administration
Route: /admin/administration
SectionRoutePurposeUsers/admin/usersManage staff accountsAudit Logs/admin/audit-logsTrack system activitySettings/admin/settingsStore, receipt, tax, and sync config
Users
Create, edit, activate, or deactivate staff accounts. Give each person their own account, don't share admin logins, and deactivate accounts for staff who have left.
Audit Logs
Tracks logins, payments, cash drawer events, adjustments, replacements, inventory changes, and system events. Filter by text, scope, or severity. Export when management needs a record.
Settings
Configure store name, tax rate, service charge, receipt footer, and live sync timing. Save after making any changes.

Daily Routine
Opening:

Start the app or kiosk
Confirm the kiosk menu is visible
Cashier logs in and opens the cash drawer shift with an opening float
Kitchen staff logs in to /kitchen
Admin checks the dashboard, inventory alerts, and menu availability

During service:

Customers place kiosk orders
Cashier collects payments in /orders
Cashier creates staff orders in /pos when needed
Paid orders go to the kitchen
Kitchen starts and marks tickets ready
Cashier closes served orders
Admin handles adjustment and replacement requests

Closing:

Finish and close all pending orders
Export sales records if needed
Review and clear cash adjustment requests
Count cash and close the drawer shift
Check inventory alerts
Export an inventory backup if needed


A Note on Data
This version is frontend-only — all data is stored locally in the browser. That means data doesn't sync between devices automatically, clearing browser storage will wipe local POS data, and exports are your only backup. A real backend is needed for multi-device production use.

Common Issues
ProblemWhat it meansWhat to doInvalid loginUsername or PIN is wrongRe-enter carefully, or ask admin to resetNot authorizedYour role can't do that actionLog in with the correct roleInsufficient amountCash entered is less than the totalEnter a higher amountReference requiredGCash/Other payment is missing a referenceEnter the payment reference numberInventory shortageNot enough stock to fulfill the orderRestock the ingredient or remove the itemImport failedFile format or headers aren't recognizedDownload a fresh template and try againNo kitchen ticketsNo paid orders are waitingConfirm payment was taken and the order was sent