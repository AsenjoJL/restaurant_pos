import type { Dispatch, SetStateAction } from 'react'
import { getCompatibleUnits } from '../../../inventory/inventory.conversions'
import type { Ingredient } from '../../../inventory/inventory.types'
import type { MeasurementUnit } from '../../../inventory/inventory.types'
import {
  createEmptyRecipeLine,
  type ProductErrors,
  type ProductFormState,
  type RecipeLineDraft,
} from '../../admin.products-form'
import type { IngredientSelectOption } from '../../admin.products-page'
import IngredientSearchSelect, { type IngredientSelectionDraft } from './IngredientSearchSelect'
import ProductImageUploadField from './ProductImageUploadField'

type NonRawProductFieldsProps = {
  errors: ProductErrors
  form: ProductFormState
  ingredients: Ingredient[]
  ingredientSelectOptions: IngredientSelectOption[]
  markupPercentage: number | null
  pendingImagePreview: string
  profitMarginPercent: number | null
  profitPerItem: number | null
  onClearPendingImage: () => void
  onImageFileChange: (file: File | null) => void
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
  ingredients,
  ingredientSelectOptions,
  markupPercentage,
  pendingImagePreview,
  profitMarginPercent,
  profitPerItem,
  onClearPendingImage,
  onImageFileChange,
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

      {form.recipeLines.map((line, index) => {
        const selectedIngredient = ingredients.find((ingredient) => ingredient.id === line.ingredientId)
        const unitOptions = selectedIngredient ? getCompatibleUnits(selectedIngredient) : []

        return (
        <div
          key={line.id}
          className="product-editor-recipe-line"
        >
          <div>
            {index === 0 ? (
              <label className="product-editor-label">Ingredient *</label>
            ) : null}
            <IngredientSearchSelect
              value={line.ingredientId}
              currentQty={line.qty}
              currentUnit={line.unit}
              ingredients={ingredients}
              options={ingredientSelectOptions}
              onApply={(drafts) =>
                setRecipeLines((lines) => {
                  const uniqueDrafts = drafts.filter(
                    (draft, position, current) =>
                      current.findIndex((item) => item.ingredientId === draft.ingredientId) ===
                      position,
                  )

                  if (uniqueDrafts.length === 0) {
                    return lines.map((item, rowIndex) =>
                      rowIndex === index ? { ...item, ingredientId: '', unit: '' } : item,
                    )
                  }

                  const usedElsewhere = new Set(
                    lines
                      .filter((_, rowIndex) => rowIndex !== index)
                      .map((item) => item.ingredientId)
                      .filter(Boolean),
                  )
                  const nextSelectedDrafts = uniqueDrafts.filter(
                    (draft) => !usedElsewhere.has(draft.ingredientId),
                  )

                  if (nextSelectedDrafts.length === 0) {
                    return lines
                  }

                  const [firstDraft, ...restDrafts] = nextSelectedDrafts

                  const updatedLines = lines.map((item, rowIndex) => {
                    if (rowIndex !== index) {
                      return item
                    }

                    return {
                      ...item,
                      ingredientId: firstDraft.ingredientId,
                      qty: firstDraft.qty.trim() || '1',
                      unit: firstDraft.unit,
                    }
                  })

                  if (restDrafts.length === 0) {
                    return updatedLines
                  }

                  const appendedLines = restDrafts.map((draft: IngredientSelectionDraft) => {
                    return {
                      ...createEmptyRecipeLine(),
                      ingredientId: draft.ingredientId,
                      qty: draft.qty.trim() || '1',
                      unit: draft.unit,
                    }
                  })

                  return [
                    ...updatedLines.slice(0, index + 1),
                    ...appendedLines,
                    ...updatedLines.slice(index + 1),
                  ]
                })
              }
            />
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
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
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
        )
      })}

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
