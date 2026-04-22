import type { Dispatch, SetStateAction } from 'react'
import type { MeasurementUnit } from '../../../inventory/inventory.types'
import {
  createEmptyRecipeLine,
  type ProductErrors,
  type ProductFormState,
  type RecipeLineDraft,
} from '../../admin.products-form'
import ProductImageUploadField from './ProductImageUploadField'
import { productEditorStyles } from './productEditor.styles'

type NonRawProductFieldsProps = {
  errors: ProductErrors
  form: ProductFormState
  ingredientSelectOptions: Array<{ value: string; label: string }>
  markupPercentage: number | null
  pendingImagePreview: string
  profitMarginPercent: number | null
  profitPerItem: number | null
  onClearPendingImage: () => void
  onImageFileChange: (file: File | null) => void
  onRecipeIngredientChange: (index: number, ingredientId: string) => void
  onRecipeQtyChange: (index: number, qty: string) => void
  setForm: Dispatch<SetStateAction<ProductFormState>>
}

const getMetricTone = (markupPercentage: number | null) => {
  if (markupPercentage !== null && markupPercentage >= 30) {
    return {
      backgroundColor: '#ffffff',
      borderColor: '#b5b5b5',
      textColor: '#000000',
    }
  }
  if (markupPercentage !== null && markupPercentage >= 15) {
    return {
      backgroundColor: '#ffffff',
      borderColor: '#b5b5b5',
      textColor: '#000000',
    }
  }

  return {
    backgroundColor: '#ffffff',
    borderColor: '#b5b5b5',
    textColor: '#000000',
  }
}

const updateRecipeLines =
  (setForm: Dispatch<SetStateAction<ProductFormState>>) =>
  (updater: (lines: RecipeLineDraft[]) => RecipeLineDraft[]) => {
    setForm((prev) => ({
      ...prev,
      recipeLines: updater(prev.recipeLines),
    }))
  }

function NonRawProductFields({
  errors,
  form,
  ingredientSelectOptions,
  markupPercentage,
  pendingImagePreview,
  profitMarginPercent,
  profitPerItem,
  onClearPendingImage,
  onImageFileChange,
  onRecipeIngredientChange,
  onRecipeQtyChange,
  setForm,
}: NonRawProductFieldsProps) {
  const metricTone = getMetricTone(markupPercentage)
  const setRecipeLines = updateRecipeLines(setForm)

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={productEditorStyles.sectionTitle}>Pricing & Margins</h3>
      <ProductImageUploadField
        currentImageUrl={form.imageUrl}
        pendingImagePreview={pendingImagePreview}
        onFileChange={onImageFileChange}
        onRemove={() => {
          onClearPendingImage()
          setForm((prev) => ({ ...prev, imageUrl: '' }))
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={productEditorStyles.label}>Cost Price (Php) *</label>
          <input
            type="number"
            step="0.01"
            value={form.costPrice}
            onChange={(event) => setForm((prev) => ({ ...prev, costPrice: event.target.value }))}
            style={productEditorStyles.input(Boolean(errors.costPrice))}
            placeholder="0.00"
            min="0"
          />
          <div style={productEditorStyles.helperText}>Cost to produce or acquire this item</div>
          {errors.costPrice ? <div style={productEditorStyles.errorText}>{errors.costPrice}</div> : null}
        </div>
        <div>
          <label style={productEditorStyles.label}>Selling Price (Php) *</label>
          <input
            type="number"
            step="0.01"
            value={form.sellingPrice}
            onChange={(event) => setForm((prev) => ({ ...prev, sellingPrice: event.target.value }))}
            style={productEditorStyles.input(Boolean(errors.sellingPrice || errors.priceValidation))}
            placeholder="0.00"
            min="0"
          />
          <div style={productEditorStyles.helperText}>Price charged to customers</div>
          {errors.sellingPrice ? <div style={productEditorStyles.errorText}>{errors.sellingPrice}</div> : null}
          {errors.priceValidation ? <div style={productEditorStyles.errorText}>{errors.priceValidation}</div> : null}
        </div>
      </div>

      {profitPerItem !== null ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            padding: '20px',
            borderRadius: '0',
            marginBottom: '24px',
            backgroundColor: metricTone.backgroundColor,
            border: `1px solid ${metricTone.borderColor}`,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...productEditorStyles.helperText, marginTop: 0, marginBottom: '4px', fontWeight: '500' }}>
              PROFIT/ITEM
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: metricTone.textColor }}>
              Php{profitPerItem.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...productEditorStyles.helperText, marginTop: 0, marginBottom: '4px', fontWeight: '500' }}>
              MARKUP
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: metricTone.textColor }}>
              {markupPercentage !== null ? `${Math.round(markupPercentage)}%` : '-'}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...productEditorStyles.helperText, marginTop: 0, marginBottom: '4px', fontWeight: '500' }}>
              PROFIT MARGIN
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: metricTone.textColor }}>
              {profitMarginPercent !== null ? `${Math.round(profitMarginPercent)}%` : '-'}
            </div>
          </div>
        </div>
      ) : null}

      <h3 style={productEditorStyles.sectionTitle}>Recipe / Ingredients</h3>
      <div style={{ fontSize: '14px', color: '#000000', marginBottom: '16px', fontWeight: '700' }}>
        Add ingredients that make up this product for inventory tracking and auto-deduction
      </div>

      {form.recipeLines.map((line, index) => (
        <div
          key={line.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr auto',
            gap: '12px',
            alignItems: 'end',
            marginBottom: '12px',
            padding: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #b5b5b5',
            borderRadius: '0',
          }}
        >
          <div>
            {index === 0 ? <label style={productEditorStyles.label}>Ingredient *</label> : null}
            <select
              value={line.ingredientId}
              onChange={(event) => onRecipeIngredientChange(index, event.target.value)}
              style={productEditorStyles.input()}
            >
              <option value="">Select ingredient</option>
              {ingredientSelectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            {index === 0 ? <label style={productEditorStyles.label}>Qty *</label> : null}
            <input
              type="number"
              step="0.01"
              value={line.qty}
              onChange={(event) => onRecipeQtyChange(index, event.target.value)}
              style={productEditorStyles.input()}
              placeholder="1"
              min="0.01"
            />
          </div>
          <div>
            {index === 0 ? <label style={productEditorStyles.label}>Unit *</label> : null}
            <select
              value={line.unit}
              onChange={(event) =>
                setRecipeLines((lines) =>
                  lines.map((item, rowIndex) =>
                    rowIndex === index
                      ? { ...item, unit: event.target.value as MeasurementUnit | '' }
                      : item,
                  ),
                )
              }
              style={productEditorStyles.input()}
            >
              <option value="">Select unit</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="pcs">pcs</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
              <option value="cup">cup</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() =>
              setRecipeLines((lines) => {
                const updated = lines.filter((_, rowIndex) => rowIndex !== index)
                return updated.length === 0 ? [createEmptyRecipeLine()] : updated
              })
            }
            style={{
              padding: '8px',
              backgroundColor: '#234d3b',
              color: 'white',
              border: '1px solid #234d3b',
              borderRadius: '0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700',
              marginBottom: index === 0 ? '24px' : '0',
            }}
            title="Remove ingredient"
          >
            x
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setRecipeLines((lines) => [...lines, createEmptyRecipeLine()])}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#234d3b',
          border: '1px solid #234d3b',
          borderRadius: '0',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#ffffff',
          fontWeight: '700',
          marginTop: '12px',
        }}
      >
        + Add Ingredient
      </button>

      {errors.recipeLines ? <div style={{ ...productEditorStyles.errorText, marginTop: '8px' }}>{errors.recipeLines}</div> : null}
    </div>
  )
}

export default NonRawProductFields
