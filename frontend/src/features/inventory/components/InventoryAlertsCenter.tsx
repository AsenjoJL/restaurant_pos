import type { Ingredient } from '../inventory.types'
import { formatIngredientQty } from '../inventory.logic'

type ReorderSuggestion = Ingredient & {
  suggestedQty: number
}

type ExpiryRiskItem = {
  ingredient: Ingredient
  wasteQty: number
}

type InventoryAlertsCenterProps = {
  lowStockItems: Ingredient[]
  nearReorderItems: Ingredient[]
  reorderSuggestions: ReorderSuggestion[]
  expiryRiskItems: ExpiryRiskItem[]
}

function InventoryAlertsCenter({
  lowStockItems,
  nearReorderItems,
  reorderSuggestions,
  expiryRiskItems,
}: InventoryAlertsCenterProps) {
  return (
    <div className="panel admin-card inventory-alert-center">
      <div className="inventory-alert-center__header">
        <div>
          <h3>Inventory Alerts Center</h3>
          <p className="muted">
            Low stock alerts, waste/expiry risk signals, and reorder guidance.
          </p>
        </div>
        <span className="inventory-alert-center__badge">
          {lowStockItems.length} active alert
          {lowStockItems.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="inventory-alert-center__stats">
        <div className="inventory-alert-kpi">
          <span className="muted">Critical Low</span>
          <strong>{lowStockItems.length}</strong>
        </div>
        <div className="inventory-alert-kpi">
          <span className="muted">Near Reorder</span>
          <strong>{nearReorderItems.length}</strong>
        </div>
        <div className="inventory-alert-kpi">
          <span className="muted">Waste Risk (7 days)</span>
          <strong>{expiryRiskItems.length}</strong>
        </div>
      </div>

      <div className="inventory-alert-center__grid">
        <section className="inventory-alert-card">
          <div className="inventory-alert-card__head">
            <h4>Low Stock Alerts</h4>
          </div>
          <div className="inventory-alert-list">
            {lowStockItems.length === 0 ? (
              <p className="muted">No low-stock items right now.</p>
            ) : (
              lowStockItems.slice(0, 6).map((item) => (
                <div key={item.id} className="inventory-alert-row">
                  <div>
                    <strong>{item.name}</strong>
                    <p className="muted">{item.category}</p>
                  </div>
                  <div className="inventory-alert-values">
                    <span className="inventory-stock inventory-stock--low">
                      {formatIngredientQty(item.onHand, item.baseUnit)}
                    </span>
                    <small className="muted">
                      Reorder: {formatIngredientQty(item.reorderLevel, item.baseUnit)}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="inventory-alert-card">
          <div className="inventory-alert-card__head">
            <h4>Expiry/Waste Risk Signals</h4>
          </div>
          <div className="inventory-alert-list">
            {expiryRiskItems.length === 0 ? (
              <p className="muted">No recent waste activity in the last 7 days.</p>
            ) : (
              expiryRiskItems.map(({ ingredient, wasteQty }) => (
                <div key={ingredient.id} className="inventory-alert-row">
                  <div>
                    <strong>{ingredient.name}</strong>
                    <p className="muted">{ingredient.category}</p>
                  </div>
                  <div className="inventory-alert-values">
                    <span className="inventory-waste-risk">
                      {formatIngredientQty(wasteQty, ingredient.baseUnit)}
                    </span>
                    <small className="muted">Waste in last 7 days</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="inventory-alert-reorder">
        <div className="inventory-alert-card__head">
          <h4>Reorder Suggestions</h4>
        </div>
        <div className="inventory-reorder-list">
          {reorderSuggestions.length === 0 ? (
            <p className="muted">No reorder suggestions yet.</p>
          ) : (
            reorderSuggestions.map((item) => (
              <div key={item.id} className="inventory-reorder-row">
                <div>
                  <strong>{item.name}</strong>
                  <p className="muted">{item.category}</p>
                </div>
                <div className="inventory-reorder-meta">
                  <span>
                    Suggested reorder:{' '}
                    <strong>{formatIngredientQty(item.suggestedQty, item.baseUnit)}</strong>
                  </span>
                  <small className="muted">
                    Current: {formatIngredientQty(item.onHand, item.baseUnit)}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default InventoryAlertsCenter
