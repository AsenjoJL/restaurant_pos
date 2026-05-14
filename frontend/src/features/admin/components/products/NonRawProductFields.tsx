import type { Dispatch, SetStateAction } from 'react'
import type { MeasurementUnit } from '../../../inventory/inventory.types'
import {
  createEmptyRecipeLine,
  type ProductErrors,
  type ProductFormState,
  type RecipeLineDraft,
} from '../../admin.products-form'
import ProductImageUploadField from './ProductImageUploadField'

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
  const setRecipeLines = updateRecipeLines(setForm)

  return (
    <div className="product-editor-section">
      <h3 className="product-editor-section-title">Pricing & Margins</h3>
      <ProductImageUploadField
        currentImageUrl={form.imageUrl}
        pendingImagePreview={pendingImagePreview}
        onFileChange={onImageFileChange}
        onRemove={() => {
          onClearPendingImage()
          setForm((prev) => ({ ...prev, imageUrl: '' }))
        }}
      />

      <div className="product-editor-grid product-editor-grid--two product-editor-grid--with-gap">
        <div>
          <label className="product-editor-label">Cost Price (Php) *</label>
          <input
            type="number"
            step="0.01"
            value={form.costPrice}
            onChange={(event) => setForm((prev) => ({ ...prev, costPrice: event.target.value }))}
            className={`product-editor-control${errors.costPrice ? ' is-error' : ''}`}
            placeholder="0.00"
            min="0"
          />
          <div className="product-editor-help">Cost to produce or acquire this item</div>
          {errors.costPrice ? <div className="product-editor-error">{errors.costPrice}</div> : null}
        </div>
        <div>
          <label className="product-editor-label">Selling Price (Php) *</label>
          <input
            type="number"
            step="0.01"
            value={form.sellingPrice}
            onChange={(event) => setForm((prev) => ({ ...prev, sellingPrice: event.target.value }))}
            className={`product-editor-control${
              errors.sellingPrice || errors.priceValidation ? ' is-error' : ''
            }`}
            placeholder="0.00"
            min="0"
          />
          <div className="product-editor-help">Price charged to customers</div>
          {errors.sellingPrice ? (
            <div className="product-editor-error">{errors.sellingPrice}</div>
          ) : null}
          {errors.priceValidation ? (
            <div className="product-editor-error">{errors.priceValidation}</div>
          ) : null}
        </div>
      </div>

      {profitPerItem !== null ? (
        <div className="product-editor-metrics">
          <div className="product-editor-metric">
            <div className="product-editor-metric-label">
              PROFIT/ITEM
            </div>
            <div className="product-editor-metric-value">
              Php{profitPerItem.toFixed(2)}
            </div>
          </div>
          <div className="product-editor-metric">
            <div className="product-editor-metric-label">
              MARKUP
            </div>
            <div className="product-editor-metric-value">
              {markupPercentage !== null ? `${Math.round(markupPercentage)}%` : '-'}
            </div>
          </div>
          <div className="product-editor-metric">
            <div className="product-editor-metric-label">
              PROFIT MARGIN
            </div>
            <div className="product-editor-metric-value">
              {profitMarginPercent !== null ? `${Math.round(profitMarginPercent)}%` : '-'}
            </div>
          </div>
        </div>
      ) : null}

      <h3 className="product-editor-section-title">Recipe / Ingredients</h3>
      <div className="product-editor-note">
        Add ingredients that make up this product for inventory tracking and auto-deduction
      </div>

      {form.recipeLines.map((line, index) => (
        <div
          key={line.id}
          className="product-editor-recipe-line"
        >
          <div>
            {index === 0 ? (
              <label className="product-editor-label">Ingredient *</label>
            ) : null}
            <select
              value={line.ingredientId}
              onChange={(event) => onRecipeIngredientChange(index, event.target.value)}
              className="product-editor-control"
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
            {index === 0 ? <label className="product-editor-label">Qty *</label> : null}
            <input
              type="number"
              step="0.01"
              value={line.qty}
              onChange={(event) => onRecipeQtyChange(index, event.target.value)}
              className="product-editor-control"
              placeholder="1"
              min="0.01"
            />
          </div>
          <div>
            {index === 0 ? <label className="product-editor-label">Unit *</label> : null}
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
              className="product-editor-control"
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
            className={`product-editor-remove-btn${
              index === 0 ? ' product-editor-remove-btn--with-label' : ''
            }`}
            title="Remove ingredient"
          >
            x
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setRecipeLines((lines) => [...lines, createEmptyRecipeLine()])}
        className="product-editor-add-line-btn"
      >
        + Add Ingredient
      </button>

      {errors.recipeLines ? (
        <div className="product-editor-error product-editor-error--spaced">
          {errors.recipeLines}
        </div>
      ) : null}
    </div>
  )
}

export default NonRawProductFields
