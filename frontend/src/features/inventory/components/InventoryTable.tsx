import Button from '../../../shared/components/ui/Button'
import { formatCurrency } from '../../../shared/lib/format'
import { formatIngredientQty } from '../inventory.logic'
import type { Ingredient } from '../inventory.types'

type InventoryTableProps = {
  ingredients: Ingredient[]
  onEdit: (ingredient: Ingredient) => void
  onRestock: (ingredientId: string) => void
  onAdjust: (ingredientId: string) => void
}

function InventoryTable({
  ingredients,
  onEdit,
  onRestock,
  onAdjust,
}: InventoryTableProps) {
  return (
    <div className="panel admin-card">
      <div className="admin-table admin-table-inventory">
        <div className="admin-table-head admin-table-row inventory">
          <span>Inventory ID</span>
          <span>Ingredient</span>
          <span>Type</span>
          <span>Category</span>
          <span>Base Unit</span>
          <span>On Hand</span>
          <span>Reorder</span>
          <span>Unit Cost</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {ingredients.length === 0 ? (
          <div className="inventory-empty-state">
            <h4>No ingredients found</h4>
            <p className="muted">Try changing your search, category, or status filter.</p>
          </div>
        ) : (
          ingredients.map((ingredient) => {
            const isLow = ingredient.onHand <= ingredient.reorderLevel
            return (
              <div
                key={ingredient.id}
                className={`admin-table-row inventory${isLow ? ' inventory-row--critical' : ''}`}
              >
                <span className="inventory-code">{ingredient.inventoryId ?? '-'}</span>
                <div className="inventory-meta">
                  <strong>{ingredient.name}</strong>
                </div>
                <span
                  className={`inventory-type-badge ${
                    (ingredient.ingredientType ?? 'RAW') === 'NON_RAW'
                      ? 'inventory-type-badge--non-raw'
                      : 'inventory-type-badge--raw'
                  }`}
                >
                  {(ingredient.ingredientType ?? 'RAW') === 'NON_RAW' ? 'Non-raw' : 'Raw'}
                </span>
                <span>{ingredient.category}</span>
                <span className="inventory-unit">{ingredient.baseUnit}</span>
                <span className={`inventory-stock${isLow ? ' inventory-stock--low' : ''}`}>
                  {formatIngredientQty(ingredient.onHand, ingredient.baseUnit)}
                </span>
                <span>{formatIngredientQty(ingredient.reorderLevel, ingredient.baseUnit)}</span>
                <span>{formatCurrency(ingredient.unitCost ?? 0)}</span>
                <span
                  className={`inventory-badge ${
                    isLow ? 'inventory-badge--low' : 'inventory-badge--ok'
                  }`}
                >
                  {isLow ? 'Low' : 'OK'}
                </span>
                <div className="admin-row-actions inventory-row-actions">
                  <Button
                    variant="outline"
                    className="inventory-action-btn inventory-action-edit"
                    onClick={() => onEdit(ingredient)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="inventory-action-btn inventory-action-restock"
                    onClick={() => onRestock(ingredient.id)}
                  >
                    Restock
                  </Button>
                  <Button
                    variant="outline"
                    className="inventory-action-btn inventory-action-adjust"
                    onClick={() => onAdjust(ingredient.id)}
                  >
                    Adjust
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default InventoryTable
