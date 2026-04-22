import { convertToBase } from './inventory.conversions'
import { hasValidationErrors } from '../../shared/lib/validation'
import type {
  Ingredient,
  IngredientBaseUnit,
  IngredientType,
  MeasurementUnit,
  RecipeLine,
} from './inventory.types'

export type RecipeLineDraft = {
  id: string
  ingredientId: string
  qty: string
  unit: MeasurementUnit | ''
}

export type RecipeIngredientFormState = {
  ingredientType: IngredientType
  name: string
  category: string
  baseUnit: IngredientBaseUnit
  onHand: string
  reorderLevel: string
  unitCost: string
}

export type RecipeIngredientErrors = {
  name?: string
  category?: string
  onHand?: string
  reorderLevel?: string
  unitCost?: string
}

type RecipeIngredientPayload = {
  ingredientType: IngredientType
  name: string
  category: string
  baseUnit: IngredientBaseUnit
  onHand: number
  reorderLevel: number
  unitCost: number
}

export const validateRecipeDraft = ({
  selectedProductId,
  lines,
  ingredients,
}: {
  selectedProductId: string
  lines: RecipeLineDraft[]
  ingredients: Ingredient[]
}): string | null => {
  if (!selectedProductId) {
    return 'Select a product before saving.'
  }
  if (lines.length === 0) {
    return 'Add at least one ingredient line.'
  }

  const seen = new Set<string>()
  for (const line of lines) {
    if (!line.ingredientId) {
      return 'Each line must have an ingredient.'
    }
    if (seen.has(line.ingredientId)) {
      return 'Duplicate ingredient detected. Each ingredient should appear once.'
    }
    seen.add(line.ingredientId)

    const qtyValue = Number(line.qty)
    if (!Number.isFinite(qtyValue) || qtyValue <= 0) {
      return 'Each line must have a quantity greater than zero.'
    }

    const ingredient = ingredients.find((item) => item.id === line.ingredientId)
    if (!ingredient) {
      return 'Ingredient not found for one of the lines.'
    }
    const unit = line.unit || ingredient.baseUnit
    const conversion = convertToBase(ingredient, qtyValue, unit)
    if (!conversion.ok) {
      return conversion.reason
    }
  }

  return null
}

export const toRecipePayloadLines = (lines: RecipeLineDraft[]): RecipeLine[] =>
  lines.map((line) => ({
    ingredientId: line.ingredientId,
    qty: Number(line.qty),
    unit: line.unit || undefined,
  }))

export const validateRecipeIngredientForm = (
  form: RecipeIngredientFormState,
): { errors: RecipeIngredientErrors; payload?: RecipeIngredientPayload } => {
  const errors: RecipeIngredientErrors = {}
  const name = form.name.trim()
  const category = form.category.trim()
  const onHand = Number(form.onHand)
  const reorderLevel = Number(form.reorderLevel)
  const unitCost = Number(form.unitCost)

  if (!name) {
    errors.name = 'Ingredient name is required.'
  }
  if (!category) {
    errors.category = 'Category is required.'
  }
  if (!Number.isFinite(onHand) || onHand < 0) {
    errors.onHand = 'Enter a valid on-hand quantity.'
  }
  if (!Number.isFinite(reorderLevel) || reorderLevel < 0) {
    errors.reorderLevel = 'Enter a valid reorder level.'
  }
  if (!Number.isFinite(unitCost) || unitCost < 0) {
    errors.unitCost = 'Enter a valid unit cost.'
  }

  if (hasValidationErrors(errors)) {
    return { errors }
  }

  return {
    errors,
    payload: {
      ingredientType: form.ingredientType,
      name,
      category,
      baseUnit: form.baseUnit,
      onHand,
      reorderLevel,
      unitCost,
    },
  }
}
