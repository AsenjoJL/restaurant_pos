import type { Ingredient } from './inventory.types'
import {
  buildRestockReference,
  emptyAdjustForm,
  emptyIngredientForm,
  reasonTypeDefaultReason,
  type AdjustFormState,
  type IngredientFormState,
} from './inventory.admin-form'

type AdjustmentReferenceLike = {
  reference?: string
}

export const INVENTORY_INGREDIENT_TYPE_FIELD_OPTIONS = [
  { value: 'RAW', label: 'Raw ingredient' },
  { value: 'NON_RAW', label: 'Non-raw / finished stock' },
] as const

export const INVENTORY_BASE_UNIT_FIELD_OPTIONS = [
  { value: 'pcs', label: 'pcs' },
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
] as const

export const INVENTORY_ADJUSTMENT_TYPE_OPTIONS = [
  { value: 'IN', label: 'Stock In' },
  { value: 'OUT', label: 'Stock Out' },
] as const

export const INVENTORY_ADJUSTMENT_REASON_OPTIONS = [
  { value: 'MANUAL', label: 'Manual Adjustment' },
  { value: 'RESTOCK', label: 'Supplier Restock' },
  { value: 'WASTE', label: 'Waste / Spoilage' },
  { value: 'VARIANCE', label: 'Stock Count Variance' },
] as const

export const buildIngredientEditForm = (ingredient: Ingredient): IngredientFormState => ({
  ingredientType: ingredient.ingredientType ?? 'RAW',
  name: ingredient.name,
  category: ingredient.category,
  baseUnit: ingredient.baseUnit,
  onHand: String(ingredient.onHand),
  reorderLevel: String(ingredient.reorderLevel),
  unitCost: String(ingredient.unitCost ?? 0),
  bulkQty: '',
  bulkUnit: ingredient.baseUnit,
  bulkPrice: '',
})

export const createEmptyIngredientDraft = (): IngredientFormState => emptyIngredientForm

export const buildAdjustmentDraft = ({
  adjustments,
  ingredientId,
  mode = 'manual',
}: {
  adjustments: AdjustmentReferenceLike[]
  ingredientId?: string
  mode?: 'manual' | 'restock'
}): AdjustFormState => {
  const isRestock = mode === 'restock'
  return {
    ...emptyAdjustForm,
    ingredientId: ingredientId ?? '',
    type: 'IN',
    reasonType: isRestock ? 'RESTOCK' : 'MANUAL',
    reason: isRestock ? reasonTypeDefaultReason.RESTOCK : '',
    reference: buildRestockReference(adjustments),
  }
}

export const updateAdjustmentReasonType = ({
  adjustments,
  form,
  nextReasonType,
}: {
  adjustments: AdjustmentReferenceLike[]
  form: AdjustFormState
  nextReasonType: AdjustFormState['reasonType']
}): AdjustFormState => {
  const nextType =
    nextReasonType === 'RESTOCK' ? 'IN' : nextReasonType === 'WASTE' ? 'OUT' : form.type

  return {
    ...form,
    reasonType: nextReasonType,
    type: nextType,
    reason: reasonTypeDefaultReason[nextReasonType],
    reference:
      nextReasonType === 'RESTOCK'
        ? form.reference || buildRestockReference(adjustments)
        : form.reference,
  }
}

export const resolveAdjustmentQuantity = ({
  form,
  ingredient,
  qtyValue,
}: {
  form: AdjustFormState
  ingredient: Ingredient
  qtyValue: number
}) => {
  let nextType = form.type
  let nextQty = qtyValue

  if (form.reasonType === 'RESTOCK') {
    nextType = 'IN'
  }
  if (form.reasonType === 'WASTE') {
    nextType = 'OUT'
  }
  if (form.reasonType === 'VARIANCE') {
    const countedValue = Number(form.countedQty)
    const variance = countedValue - ingredient.onHand
    if (variance === 0) {
      return { kind: 'no_variance' as const }
    }
    nextType = variance > 0 ? 'IN' : 'OUT'
    nextQty = Math.abs(variance)
  }

  const delta = nextType === 'IN' ? nextQty : -nextQty
  const nextOnHand = ingredient.onHand + delta

  if (nextOnHand < 0) {
    return { kind: 'negative_stock' as const }
  }

  return {
    kind: 'ok' as const,
    nextQty,
    nextType,
  }
}
