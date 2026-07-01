import Button from '../../../shared/components/ui/Button'
import { formatCurrency } from '../../../shared/lib/format'
import { formatIngredientQty } from '../inventory.logic'
import type { Ingredient } from '../inventory.types'
import type { IngredientRecipeCoverage } from '../inventory.page'

type InventoryTableProps = {
  ingredients: Ingredient[]
  recipeCoverageMap: Map<string, IngredientRecipeCoverage>
  onEdit: (ingredient: Ingredient) => void
  onRestock: (ingredientId: string) => void
  onAdjust: (ingredientId: string) => void
}

function InventoryTable({
  ingredients,
  recipeCoverageMap,
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
          <span>Recipe Check</span>
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
            const recipeCoverage = recipeCoverageMap.get(ingredient.id)
            return (
              <div
                key={ingredient.id}
                className={`admin-table-row inventory${isLow ? ' inventory-row--critical' : ''}`}
              >
                <span className="inventory-code" data-label="Inventory ID">
                  {ingredient.inventoryId ?? '-'}
                </span>
                <div className="inventory-meta" data-label="Ingredient">
                  <strong>{ingredient.name}</strong>
                </div>
                <div className="inventory-table-field" data-label="Type">
                  <span
                    className={`inventory-type-badge ${
                      (ingredient.ingredientType ?? 'RAW') === 'NON_RAW'
                        ? 'inventory-type-badge--non-raw'
                        : 'inventory-type-badge--raw'
                    }`}
                  >
                    {(ingredient.ingredientType ?? 'RAW') === 'NON_RAW' ? 'Non-raw' : 'Raw'}
                  </span>
                </div>
                <span data-label="Category">{ingredient.category}</span>
                <span className="inventory-unit" data-label="Base Unit">
                  {ingredient.baseUnit}
                </span>
                <span
                  className={`inventory-stock${isLow ? ' inventory-stock--low' : ''}`}
                  data-label="On Hand"
                >
                  {formatIngredientQty(ingredient.onHand, ingredient.baseUnit)}
                </span>
                <span data-label="Reorder">
                  {formatIngredientQty(ingredient.reorderLevel, ingredient.baseUnit)}
                </span>
                <span data-label="Unit Cost">{formatCurrency(ingredient.unitCost ?? 0)}</span>
                <div className="inventory-table-field" data-label="Status">
                  <span
                    className={`inventory-badge ${
                      isLow ? 'inventory-badge--low' : 'inventory-badge--ok'
                    }`}
                  >
                    {isLow ? 'Below reorder' : 'Above reorder'}
                  </span>
                </div>
                <div className="inventory-table-field inventory-recipe-status" data-label="Recipe Check">
                  <span
                    className={`inventory-badge ${
                      recipeCoverage?.tone === 'warn'
                        ? 'inventory-badge--recipe-warn'
                        : recipeCoverage?.tone === 'ok'
                          ? 'inventory-badge--recipe-ok'
                          : 'inventory-badge--recipe-neutral'
                    }`}
                  >
                    {recipeCoverage?.label ?? 'Unused in recipes'}
                  </span>
                  <span className="muted">{recipeCoverage?.detail ?? 'This ingredient is not part of any saved recipe yet.'}</span>
                </div>
                <div className="admin-row-actions inventory-row-actions" data-label="Actions">
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
