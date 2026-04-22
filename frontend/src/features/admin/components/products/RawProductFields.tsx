import type { CSSProperties, Dispatch, SetStateAction } from 'react'
import type { Ingredient } from '../../../inventory/inventory.types'
import type { ProductErrors, ProductFormState } from '../../admin.products-form'
import { productEditorStyles } from './productEditor.styles'

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

const secondaryButtonStyle: CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#f8fafc',
  color: '#374151',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
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
    <div style={{ marginBottom: '32px' }}>
      <h3 style={productEditorStyles.sectionTitle}>Ingredient Link</h3>
      <div>
        <label style={productEditorStyles.label}>Select Ingredient *</label>
        <select
          value={form.ingredientId}
          onChange={(event) => onIngredientSelect(event.target.value)}
          style={productEditorStyles.input(Boolean(errors.ingredientId))}
        >
          <option value="">-- Select an ingredient --</option>
          {ingredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id}>
              {ingredient.name} ({ingredient.baseUnit})
            </option>
          ))}
        </select>
        {errors.ingredientId ? <div style={productEditorStyles.errorText}>{errors.ingredientId}</div> : null}
      </div>

      {form.additionalIngredientIds.map((ingredientId, index) => (
        <div key={`raw-link-${index}`} style={{ marginTop: '12px' }}>
          <label style={productEditorStyles.label}>Additional Ingredient {index + 1}</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={ingredientId}
              onChange={(event) => onAdditionalIngredientSelect(index, event.target.value)}
              style={{ ...productEditorStyles.input(), flex: 1 }}
            >
              <option value="">-- Select an ingredient --</option>
              {ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name} ({ingredient.baseUnit})
                </option>
              ))}
            </select>
            <button type="button" onClick={() => onRemoveIngredientLink(index)} style={secondaryButtonStyle}>
              Remove
            </button>
          </div>
        </div>
      ))}

      <div style={{ marginTop: '12px' }}>
        <button type="button" onClick={onAddIngredientLink} style={secondaryButtonStyle}>
          + Add Ingredient Link
        </button>
      </div>

      <h3 style={{ ...productEditorStyles.sectionTitle, marginTop: '24px' }}>Inventory Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label style={productEditorStyles.label}>Current Stock *</label>
          <input
            type="number"
            value={form.currentStock}
            onChange={(event) => setForm((prev) => ({ ...prev, currentStock: event.target.value }))}
            style={productEditorStyles.input(Boolean(errors.currentStock))}
            placeholder="0"
            min="0"
          />
          {errors.currentStock ? <div style={productEditorStyles.errorText}>{errors.currentStock}</div> : null}
        </div>
        <div>
          <label style={productEditorStyles.label}>Unit *</label>
          <select
            value={form.unit}
            onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
            style={productEditorStyles.input(Boolean(errors.unit))}
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
          {errors.unit ? <div style={productEditorStyles.errorText}>{errors.unit}</div> : null}
        </div>
        <div>
          <label style={productEditorStyles.label}>Low Stock Alert *</label>
          <input
            type="number"
            value={form.lowStockAlert}
            onChange={(event) => setForm((prev) => ({ ...prev, lowStockAlert: event.target.value }))}
            style={productEditorStyles.input(Boolean(errors.lowStockAlert))}
            placeholder="0"
            min="0"
          />
          {errors.lowStockAlert ? <div style={productEditorStyles.errorText}>{errors.lowStockAlert}</div> : null}
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <label style={productEditorStyles.label}>Unit Cost (Php) *</label>
        <input
          type="number"
          step="0.01"
          value={form.unitCost}
          onChange={(event) => setForm((prev) => ({ ...prev, unitCost: event.target.value }))}
          style={{ ...productEditorStyles.input(Boolean(errors.unitCost)), width: '200px' }}
          placeholder="0.00"
          min="0"
        />
        {errors.unitCost ? <div style={productEditorStyles.errorText}>{errors.unitCost}</div> : null}
      </div>

      <div style={{ marginTop: '16px' }}>
        <label style={productEditorStyles.label}>Selling Price (Php) *</label>
        <input
          type="number"
          step="0.01"
          value={form.sellingPrice}
          onChange={(event) => setForm((prev) => ({ ...prev, sellingPrice: event.target.value }))}
          style={{ ...productEditorStyles.input(Boolean(errors.sellingPrice)), width: '200px' }}
          placeholder="0.00"
          min="0"
        />
        {errors.sellingPrice ? <div style={productEditorStyles.errorText}>{errors.sellingPrice}</div> : null}
      </div>
    </div>
  )
}

export default RawProductFields
