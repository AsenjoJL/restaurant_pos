import type {
  IngredientBaseUnit,
  IngredientType,
  InventoryAdjustment,
} from './inventory.types'

export type IngredientFormState = {
  ingredientType: IngredientType
  name: string
  category: string
  baseUnit: IngredientBaseUnit
  onHand: string
  reorderLevel: string
  unitCost: string
  bulkQty: string
  bulkUnit: IngredientBaseUnit | 'kg' | 'l'
  bulkPrice: string
}

export type IngredientErrors = {
  name?: string
  category?: string
  baseUnit?: string
  onHand?: string
  reorderLevel?: string
  unitCost?: string
}

export type AdjustFormState = {
  ingredientId: string
  type: 'IN' | 'OUT'
  reasonType: 'RESTOCK' | 'WASTE' | 'VARIANCE' | 'MANUAL'
  qty: string
  reason: string
  countedQty: string
  reference: string
}

export type AdjustErrors = {
  ingredientId?: string
  qty?: string
  reason?: string
  reference?: string
}

type IngredientFormValidationResult = {
  errors: IngredientErrors
  values: {
    name: string
    category: string
    onHandValue: number
    reorderValue: number
    unitCostValue: number
  }
}

type AdjustmentFormValidationResult = {
  errors: AdjustErrors
  values: {
    qtyValue: number
    normalizedReference: string
  }
}

export const emptyIngredientForm: IngredientFormState = {
  ingredientType: 'RAW',
  name: '',
  category: '',
  baseUnit: 'pcs',
  onHand: '',
  reorderLevel: '',
  unitCost: '',
  bulkQty: '',
  bulkUnit: 'pcs',
  bulkPrice: '',
}

export const emptyAdjustForm: AdjustFormState = {
  ingredientId: '',
  type: 'IN',
  reasonType: 'MANUAL',
  qty: '',
  reason: '',
  countedQty: '',
  reference: '',
}

export const unitOptions = [
  { value: 'pcs', label: 'pcs' },
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
]

export const reasonTypeDefaultReason: Record<AdjustFormState['reasonType'], string> = {
  MANUAL: 'Manual adjustment',
  RESTOCK: 'Supplier restock',
  WASTE: 'Waste / spoilage',
  VARIANCE: 'Stock count variance',
}

export const buildRestockReference = (
  existingAdjustments: Array<Pick<InventoryAdjustment, 'reference'>>,
) => {
  const now = new Date()
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`
  const prefix = `RST-${datePart}-`
  const used = existingAdjustments
    .map((item) => item.reference?.trim().toUpperCase() ?? '')
    .filter((value) => value.startsWith(prefix))
    .map((value) => Number(value.slice(prefix.length)))
    .filter((value) => Number.isFinite(value))
  const next = (used.length > 0 ? Math.max(...used) : 0) + 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

export const getBulkUnitOptions = (baseUnit: IngredientBaseUnit) => {
  if (baseUnit === 'g') {
    return [
      { value: 'g', label: 'g' },
      { value: 'kg', label: 'kg' },
    ]
  }
  if (baseUnit === 'ml') {
    return [
      { value: 'ml', label: 'ml' },
      { value: 'l', label: 'l' },
    ]
  }
  return [{ value: 'pcs', label: 'pcs' }]
}

export const validateIngredientForm = (
  form: IngredientFormState,
): IngredientFormValidationResult => {
  const errors: IngredientErrors = {}
  const name = form.name.trim()
  const category = form.category.trim()

  if (!name) {
    errors.name = 'Ingredient name is required.'
  }
  if (!category) {
    errors.category = 'Category is required.'
  }
  if (!form.baseUnit) {
    errors.baseUnit = 'Base unit is required.'
  }

  const onHandValue = Number(form.onHand)
  if (!Number.isFinite(onHandValue) || onHandValue < 0) {
    errors.onHand = 'Enter a valid on-hand quantity.'
  }

  const reorderValue = Number(form.reorderLevel)
  if (!Number.isFinite(reorderValue) || reorderValue < 0) {
    errors.reorderLevel = 'Enter a valid reorder level.'
  }

  const unitCostValue = Number(form.unitCost)
  if (form.unitCost.trim().length > 0) {
    if (!Number.isFinite(unitCostValue) || unitCostValue < 0) {
      errors.unitCost = 'Enter a valid unit cost.'
    }
  }

  return {
    errors,
    values: {
      name,
      category,
      onHandValue,
      reorderValue,
      unitCostValue,
    },
  }
}

export const validateAdjustmentForm = ({
  form,
}: {
  form: AdjustFormState
}): AdjustmentFormValidationResult => {
  const errors: AdjustErrors = {}

  if (!form.ingredientId) {
    errors.ingredientId = 'Select an ingredient.'
  }

  const qtyValue = Number(form.qty)
  if (form.reasonType !== 'VARIANCE') {
    if (!Number.isFinite(qtyValue) || qtyValue <= 0) {
      errors.qty = 'Enter a valid quantity.'
    }
  }

  if (!form.reason.trim()) {
    errors.reason = 'Reason is required.'
  }

  const normalizedReference = form.reference.trim().toUpperCase()
  if (form.reasonType === 'RESTOCK') {
    if (!normalizedReference) {
      errors.reference = 'Restock reference is required.'
    }
  }

  if (form.reasonType === 'VARIANCE') {
    const countedValue = Number(form.countedQty)
    if (!Number.isFinite(countedValue) || countedValue < 0) {
      errors.qty = 'Enter a valid counted quantity.'
    }
  }

  return {
    errors,
    values: {
      qtyValue,
      normalizedReference,
    },
  }
}
