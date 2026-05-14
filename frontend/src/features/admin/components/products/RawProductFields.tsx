import type { Dispatch, SetStateAction } from 'react'
import type { Ingredient } from '../../../inventory/inventory.types'
import type { ProductErrors, ProductFormState } from '../../admin.products-form'

type RawProductFieldsProps = {
  errors: ProductErrors
  form: ProductFormState
  ingredients: Ingredient[]
  onAddIngredientLink: () => void
  onIngredientSelect: (ingredientId: string) => void
  onAdditionalIngredientSelect: (index: number, ingredientId: string) => void
  onRemoveIngredientLink: (index: number) => void
  setForm: Dispatch<SetStateAction<ProductFormState>>
}

function RawProductFields({
  errors,
  form,
  ingredients,
  onAddIngredientLink,
  onIngredientSelect,
  onAdditionalIngredientSelect,
  onRemoveIngredientLink,
  setForm,
}: RawProductFieldsProps) {
  return (
    <div className="product-editor-section">
      <h3 className="product-editor-section-title">Ingredient Link</h3>
      <div>
        <label className="product-editor-label">Select Ingredient *</label>
        <select
          value={form.ingredientId}
          onChange={(event) => onIngredientSelect(event.target.value)}
          className={`product-editor-control${errors.ingredientId ? ' is-error' : ''}`}
        >
          <option value="">-- Select an ingredient --</option>
          {ingredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id}>
              {ingredient.name} ({ingredient.baseUnit})
            </option>
          ))}
        </select>
        {errors.ingredientId ? (
          <div className="product-editor-error">{errors.ingredientId}</div>
        ) : null}
      </div>

      {form.additionalIngredientIds.map((ingredientId, index) => (
        <div key={`raw-link-${index}`} className="product-editor-link-row">
          <label className="product-editor-label">Additional Ingredient {index + 1}</label>
          <div className="product-editor-inline-row">
            <select
              value={ingredientId}
              onChange={(event) => onAdditionalIngredientSelect(index, event.target.value)}
              className="product-editor-control product-editor-flex-control"
            >
              <option value="">-- Select an ingredient --</option>
              {ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name} ({ingredient.baseUnit})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="product-editor-secondary-btn"
              onClick={() => onRemoveIngredientLink(index)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="product-editor-link-row">
        <button
          type="button"
          className="product-editor-secondary-btn"
          onClick={onAddIngredientLink}
        >
          + Add Ingredient Link
        </button>
      </div>

      <h3 className="product-editor-section-title product-editor-section-title--spaced">
        Inventory Details
      </h3>
      <div className="product-editor-grid product-editor-grid--three">
        <div>
          <label className="product-editor-label">Current Stock *</label>
          <input
            type="number"
            value={form.currentStock}
            onChange={(event) => setForm((prev) => ({ ...prev, currentStock: event.target.value }))}
            className={`product-editor-control${errors.currentStock ? ' is-error' : ''}`}
            placeholder="0"
            min="0"
          />
          {errors.currentStock ? (
            <div className="product-editor-error">{errors.currentStock}</div>
          ) : null}
        </div>
        <div>
          <label className="product-editor-label">Unit *</label>
          <select
            value={form.unit}
            onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
            className={`product-editor-control${errors.unit ? ' is-error' : ''}`}
          >
            <option value="">Select unit</option>
            <option value="g">Grams (g)</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="ml">Milliliters (ml)</option>
            <option value="l">Liters (l)</option>
            <option value="pcs">Pieces (pcs)</option>
            <option value="tbsp">Tablespoon (tbsp)</option>
            <option value="tsp">Teaspoon (tsp)</option>
          </select>
          {errors.unit ? <div className="product-editor-error">{errors.unit}</div> : null}
        </div>
        <div>
          <label className="product-editor-label">Low Stock Alert *</label>
          <input
            type="number"
            value={form.lowStockAlert}
            onChange={(event) => setForm((prev) => ({ ...prev, lowStockAlert: event.target.value }))}
            className={`product-editor-control${errors.lowStockAlert ? ' is-error' : ''}`}
            placeholder="0"
            min="0"
          />
          {errors.lowStockAlert ? (
            <div className="product-editor-error">{errors.lowStockAlert}</div>
          ) : null}
        </div>
      </div>

      <div className="product-editor-field-row">
        <label className="product-editor-label">Unit Cost (Php) *</label>
        <input
          type="number"
          step="0.01"
          value={form.unitCost}
          onChange={(event) => setForm((prev) => ({ ...prev, unitCost: event.target.value }))}
          className={`product-editor-control product-editor-control--narrow${
            errors.unitCost ? ' is-error' : ''
          }`}
          placeholder="0.00"
          min="0"
        />
        {errors.unitCost ? <div className="product-editor-error">{errors.unitCost}</div> : null}
      </div>

      <div className="product-editor-field-row">
        <label className="product-editor-label">Selling Price (Php) *</label>
        <input
          type="number"
          step="0.01"
          value={form.sellingPrice}
          onChange={(event) => setForm((prev) => ({ ...prev, sellingPrice: event.target.value }))}
          className={`product-editor-control product-editor-control--narrow${
            errors.sellingPrice ? ' is-error' : ''
          }`}
          placeholder="0.00"
          min="0"
        />
        {errors.sellingPrice ? (
          <div className="product-editor-error">{errors.sellingPrice}</div>
        ) : null}
      </div>
    </div>
  )
}

export default RawProductFields
