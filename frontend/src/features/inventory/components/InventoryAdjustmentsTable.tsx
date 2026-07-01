import Input from '../../../shared/components/ui/Input'
import Select from '../../../shared/components/ui/Select'
import { formatIngredientQty } from '../inventory.logic'
import type { Ingredient, InventoryAdjustment } from '../inventory.types'

type InventoryAdjustmentsTableProps = {
  adjustments: InventoryAdjustment[]
  adjustmentQuery: string
  adjustmentReasonFilter: string
  ingredients: Ingredient[]
  compact?: boolean
  reasonOptions: Array<{ value: string; label: string }>
  onAdjustmentQueryChange: (value: string) => void
  onAdjustmentReasonFilterChange: (value: string) => void
}

function InventoryAdjustmentsTable({
  adjustments,
  adjustmentQuery,
  adjustmentReasonFilter,
  ingredients,
  compact = false,
  reasonOptions,
  onAdjustmentQueryChange,
  onAdjustmentReasonFilterChange,
}: InventoryAdjustmentsTableProps) {
  const ingredientMap = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]))

  const content = (
    <>
      {compact ? null : (
        <div className="admin-card-header">
          <div>
            <h3>Recent Inventory Movements</h3>
            <p className="muted">Backend-persisted restock, sales, waste, returns, and variance entries.</p>
          </div>
          <span className="muted">{adjustments.length} records</span>
        </div>
      )}

      <div className="inventory-adjustment-filters">
        <Input
          label="Search"
          placeholder="Search ingredient, reference, or reason"
          value={adjustmentQuery}
          onChange={(event) => onAdjustmentQueryChange(event.target.value)}
        />
        <Select
          label="Reason"
          options={reasonOptions}
          value={adjustmentReasonFilter}
          onChange={(event) => onAdjustmentReasonFilterChange(event.target.value)}
        />
      </div>

      <div className="admin-table">
        <div className="admin-table-head admin-table-row inventory-adjustments">
          <span>When</span>
          <span>Ingredient</span>
          <span>Movement</span>
          <span>Reason</span>
          <span>Before / After</span>
          <span>Reference</span>
        </div>
        {adjustments.length === 0 ? (
          <div className="inventory-empty-state">
            <h4>No matching inventory movements</h4>
            <p className="muted">Try a different search or reason filter.</p>
          </div>
        ) : (
          adjustments.map((adjustment) => {
            const ingredient = ingredientMap.get(adjustment.ingredientId)
            const unit = ingredient?.baseUnit ?? 'pcs'

            return (
              <div key={adjustment.id} className="admin-table-row inventory-adjustments">
                <div className="inventory-adjustment-cell">
                  <strong>{new Date(adjustment.at).toLocaleString()}</strong>
                </div>
                <div className="inventory-adjustment-cell">
                  <strong>{ingredient?.name ?? 'Unknown ingredient'}</strong>
                  <span className="muted">{ingredient?.inventoryId ?? adjustment.ingredientId}</span>
                </div>
                <div className="inventory-adjustment-cell">
                  <span
                    className={`inventory-badge ${
                      adjustment.type === 'IN'
                        ? 'inventory-badge--recipe-ok'
                        : 'inventory-badge--recipe-warn'
                    }`}
                  >
                    {adjustment.type === 'IN' ? 'Stock In' : 'Stock Out'}
                  </span>
                  <span className="muted">
                    {adjustment.type === 'IN' ? '+' : '-'}
                    {formatIngredientQty(adjustment.qty, unit)}
                  </span>
                </div>
                <div className="inventory-adjustment-cell">
                  <span className="chip">{adjustment.reasonType}</span>
                  <span className="muted">{adjustment.reason || 'No note provided.'}</span>
                </div>
                <div className="inventory-adjustment-cell">
                  <strong>
                    {formatIngredientQty(adjustment.beforeQty ?? 0, unit)} {'->'}{' '}
                    {formatIngredientQty(adjustment.afterQty ?? 0, unit)}
                  </strong>
                  {typeof adjustment.countedQty === 'number' ? (
                    <span className="muted">
                      Counted: {formatIngredientQty(adjustment.countedQty, unit)}
                    </span>
                  ) : null}
                </div>
                <div className="inventory-adjustment-cell">
                  <span>{adjustment.reference || '—'}</span>
                  {adjustment.orderId ? <span className="muted">Order: {adjustment.orderId}</span> : null}
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )

  if (compact) {
    return <div className="inventory-adjustments-modal-content">{content}</div>
  }

  return <div className="panel admin-card inventory-adjustments-card">{content}</div>
}

export default InventoryAdjustmentsTable
