import Button from '../../../../shared/components/ui/Button'
import Input from '../../../../shared/components/ui/Input'
import Select from '../../../../shared/components/ui/Select'
import type { MeasurementUnit } from '../../inventory.types'
import type { RecipeLineDraft } from '../../inventory.recipe-form'

type RecipeBuilderCardProps = {
  currentRecipeUpdatedAt?: string
  formError: string
  formattedMargin: string
  formattedMenuPrice: string
  formattedRecipeCost: string
  getUnitOptionsForLine: (ingredientId: string) => Array<{ value: string; label: string }>
  ingredientOptions: Array<{ value: string; label: string }>
  lines: RecipeLineDraft[]
  productOptions: Array<{ value: string; label: string }>
  recipeMarginPct: number
  selectedProductId: string
  selectedProductName?: string
  onAddLine: () => void
  onLineChange: (id: string, patch: Partial<RecipeLineDraft>) => void
  onProductChange: (productId: string) => void
  onRemoveLine: (id: string) => void
}

function RecipeBuilderCard({
  currentRecipeUpdatedAt,
  formError,
  formattedMargin,
  formattedMenuPrice,
  formattedRecipeCost,
  getUnitOptionsForLine,
  ingredientOptions,
  lines,
  productOptions,
  recipeMarginPct,
  selectedProductId,
  selectedProductName,
  onAddLine,
  onLineChange,
  onProductChange,
  onRemoveLine,
}: RecipeBuilderCardProps) {
  return (
    <div className="panel admin-card recipe-card">
      <div className="admin-toolbar">
        <Select
          label="Product"
          value={selectedProductId}
          onChange={(event) => onProductChange(event.target.value)}
          options={productOptions}
        />
      </div>

      {formError ? <div className="form-error">{formError}</div> : null}

      {selectedProductName ? (
        <div className="recipe-builder">
          <div className="recipe-lines">
            {lines.map((line) => (
              <div key={line.id} className="recipe-line">
                <Select
                  label="Ingredient"
                  value={line.ingredientId}
                  onChange={(event) => onLineChange(line.id, { ingredientId: event.target.value })}
                  options={ingredientOptions}
                />
                <Input
                  label="Qty per serving"
                  placeholder="0"
                  inputMode="decimal"
                  value={line.qty}
                  onChange={(event) => onLineChange(line.id, { qty: event.target.value })}
                />
                <Select
                  label="Unit"
                  value={line.unit}
                  onChange={(event) =>
                    onLineChange(line.id, {
                      unit: event.target.value as MeasurementUnit | '',
                    })
                  }
                  options={getUnitOptionsForLine(line.ingredientId)}
                />
                <Button variant="ghost" onClick={() => onRemoveLine(line.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="admin-row-actions">
            <Button variant="outline" onClick={onAddLine}>
              Add Ingredient
            </Button>
          </div>

          <div className="recipe-summary">
            <div>
              <span className="muted">Estimated Recipe Cost</span>
              <strong>{formattedRecipeCost}</strong>
            </div>
            <div>
              <span className="muted">Menu Price</span>
              <strong>{formattedMenuPrice}</strong>
            </div>
            <div>
              <span className="muted">Gross Margin</span>
              <strong>
                {formattedMargin} <span className="muted">({Math.round(recipeMarginPct * 100)}%)</span>
              </strong>
            </div>
          </div>

          {currentRecipeUpdatedAt ? (
            <p className="muted">Last updated: {new Date(currentRecipeUpdatedAt).toLocaleString()}</p>
          ) : (
            <p className="muted">No recipe saved yet for this product.</p>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No product selected</h3>
          <p className="muted">Choose a product to build a recipe.</p>
        </div>
      )}
    </div>
  )
}

export default RecipeBuilderCard
