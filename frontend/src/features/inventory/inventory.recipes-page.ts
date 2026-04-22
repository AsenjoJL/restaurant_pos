import { nanoid } from '@reduxjs/toolkit'
import { formatCurrency } from '../../shared/lib/format'
import { getCompatibleUnits } from './inventory.conversions'
import { calculateRecipeCost } from './inventory.logic'
import type {
  Ingredient,
  IngredientBaseUnit,
  IngredientType,
  MeasurementUnit,
  Recipe,
} from './inventory.types'
import type {
  RecipeIngredientFormState,
  RecipeLineDraft,
} from './inventory.recipe-form'

export const createEmptyRecipeLine = (): RecipeLineDraft => ({
  id: nanoid(),
  ingredientId: '',
  qty: '',
  unit: '',
})

export const emptyRecipeIngredientForm: RecipeIngredientFormState = {
  ingredientType: 'RAW',
  name: '',
  category: '',
  baseUnit: 'pcs',
  onHand: '',
  reorderLevel: '',
  unitCost: '',
}

export const mapRecipeToDraftLines = (recipe: Recipe): RecipeLineDraft[] =>
  recipe.lines.map((line) => ({
    id: nanoid(),
    ingredientId: line.ingredientId,
    qty: String(line.qty),
    unit: (line.unit ?? '') as MeasurementUnit | '',
  }))

export const buildRecipeProductOptions = (products: Array<{ id: string; name: string }>) => [
  { value: '', label: 'Select a product' },
  ...products.map((product) => ({
    value: product.id,
    label: product.name,
  })),
]

export const buildRecipeIngredientOptions = (
  ingredients: Array<{ id: string; name: string; inventoryId?: string | null }>,
) => [
  { value: '', label: 'Select ingredient' },
  ...ingredients.map((ingredient) => ({
    value: ingredient.id,
    label: ingredient.inventoryId ? `${ingredient.inventoryId} - ${ingredient.name}` : ingredient.name,
  })),
]

export const buildIngredientCategoryOptions = (
  ingredients: Array<{ category: string }>,
) => [
  { value: '', label: 'Select category' },
  ...Array.from(new Set(ingredients.map((item) => item.category)))
    .sort()
    .map((category) => ({ value: category, label: category })),
]

export const buildRecipeStats = (productsCount: number, recipesCount: number) => ({
  products: productsCount,
  recipes: recipesCount,
})

export const getRecipeUnitOptions = (
  ingredientMap: Map<string, Ingredient>,
  ingredientId: string,
) => {
  const ingredient = ingredientMap.get(ingredientId)
  if (!ingredient) {
    return [{ value: '', label: 'Base unit' }]
  }

  const compatible = getCompatibleUnits(ingredient)
  const extras = compatible.filter((unit) => unit !== ingredient.baseUnit)
  return [
    { value: '', label: `Base (${ingredient.baseUnit})` },
    ...extras.map((unit) => ({ value: unit, label: unit })),
  ]
}

export const calculateRecipeSummary = ({
  ingredients,
  lines,
  selectedPrice,
}: {
  ingredients: Ingredient[]
  lines: RecipeLineDraft[]
  selectedPrice: number
}) => {
  const recipeCost = calculateRecipeCost(
    lines
      .filter((line) => line.ingredientId && Number(line.qty) > 0)
      .map((line) => ({
        ingredientId: line.ingredientId,
        qty: Number(line.qty),
        unit: line.unit || undefined,
      })),
    ingredients,
  )

  const recipeMargin = selectedPrice - recipeCost
  const recipeMarginPct = selectedPrice > 0 ? recipeMargin / selectedPrice : 0

  return {
    recipeCost,
    recipeMargin,
    recipeMarginPct,
    formattedRecipeCost: formatCurrency(recipeCost),
    formattedMenuPrice: formatCurrency(selectedPrice),
    formattedMargin: formatCurrency(recipeMargin),
  }
}

export const INGREDIENT_TYPE_OPTIONS: Array<{ value: IngredientType; label: string }> = [
  { value: 'RAW', label: 'Raw ingredient' },
  { value: 'NON_RAW', label: 'Non-raw / finished stock' },
]

export const INGREDIENT_BASE_UNIT_OPTIONS: Array<{ value: IngredientBaseUnit; label: string }> = [
  { value: 'pcs', label: 'pcs' },
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
]
