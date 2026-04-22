import { nanoid } from '@reduxjs/toolkit'
import type {
  Ingredient,
  MeasurementUnit,
  Recipe,
  RecipeLine,
} from '../inventory/inventory.types'
import type { AdminCategory, AdminProduct } from './admin.types'

export type RecipeLineDraft = {
  id: string
  ingredientId: string
  qty: string
  unit: MeasurementUnit | ''
}

export type ProductFormState = {
  productType: 'raw' | 'non_raw'
  name: string
  category: string
  productClass: string
  description: string
  imageUrl: string
  ingredientId: string
  additionalIngredientIds: string[]
  currentStock: string
  unit: string
  lowStockAlert: string
  unitCost: string
  costPrice: string
  sellingPrice: string
  recipeLines: RecipeLineDraft[]
}

export type ProductErrors = {
  name?: string
  category?: string
  ingredientId?: string
  currentStock?: string
  unit?: string
  lowStockAlert?: string
  unitCost?: string
  costPrice?: string
  sellingPrice?: string
  priceValidation?: string
  recipeLines?: string
}

type ProductImageValidationError = {
  title: string
  description: string
}

const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export const createEmptyRecipeLine = (): RecipeLineDraft => ({
  id: nanoid(),
  ingredientId: '',
  qty: '1',
  unit: '',
})

export const emptyProductForm: ProductFormState = {
  productType: 'non_raw',
  name: '',
  description: '',
  imageUrl: '',
  category: '',
  productClass: 'standard',
  ingredientId: '',
  additionalIngredientIds: [],
  costPrice: '',
  sellingPrice: '',
  currentStock: '',
  unit: '',
  lowStockAlert: '',
  unitCost: '',
  recipeLines: [createEmptyRecipeLine()],
}

const normalizeCategoryKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')

export const resolveCategoryName = (
  categoryId: string,
  categories: AdminCategory[],
): string => {
  const exact = categories.find((category) => category.id === categoryId)
  if (exact) {
    return exact.name
  }

  const normalizedId = normalizeCategoryKey(categoryId)
  const relaxed = categories.find(
    (category) =>
      normalizeCategoryKey(category.id) === normalizedId ||
      normalizeCategoryKey(category.name) === normalizedId,
  )

  return relaxed?.name ?? (categoryId || 'Unassigned')
}

export const buildProductFormForEdit = ({
  product,
  recipe,
  ingredients,
}: {
  product: AdminProduct
  recipe?: Recipe
  ingredients: Ingredient[]
}): ProductFormState => {
  const recipeLines: RecipeLineDraft[] = recipe
    ? recipe.lines.map((line) => ({
        id: nanoid(),
        ingredientId: line.ingredientId,
        qty: Number(line.qty) > 0 ? String(line.qty) : '1',
        unit: line.unit || '',
      }))
    : [createEmptyRecipeLine()]

  const rawLinkedIngredientIds =
    product.productClass === 'RAW' ? (recipe?.lines ?? []).map((line) => line.ingredientId) : []
  const primaryRawIngredientId = rawLinkedIngredientIds[0] ?? ''
  const additionalRawIngredientIds = rawLinkedIngredientIds.slice(1)
  const matchedIngredient =
    product.productClass === 'RAW'
      ? ingredients.find((ingredient) =>
          primaryRawIngredientId
            ? ingredient.id === primaryRawIngredientId
            : ingredient.name.toLowerCase() === product.name.toLowerCase(),
        )
      : null

  return {
    productType: product.productClass === 'RAW' ? 'raw' : 'non_raw',
    name: product.name,
    category: product.categoryId,
    productClass: product.productClass === 'RAW' ? 'raw' : 'non_raw',
    description: product.description,
    imageUrl: product.imageUrl ?? '',
    ingredientId: matchedIngredient?.id ?? primaryRawIngredientId,
    additionalIngredientIds: additionalRawIngredientIds,
    currentStock: matchedIngredient ? String(matchedIngredient.onHand) : '',
    unit: matchedIngredient?.baseUnit ?? '',
    lowStockAlert: matchedIngredient ? String(matchedIngredient.reorderLevel) : '',
    unitCost: String(matchedIngredient?.unitCost ?? product.baseCost),
    costPrice: String(product.baseCost),
    sellingPrice: String(product.price),
    recipeLines,
  }
}

export const validateProductForm = (form: ProductFormState): ProductErrors => {
  const errors: ProductErrors = {}

  if (!form.name.trim()) {
    errors.name = 'Product name is required.'
  }
  if (!form.category) {
    errors.category = 'Select a category.'
  }

  if (form.productType === 'raw') {
    if (!form.ingredientId) {
      errors.ingredientId = 'Select an ingredient.'
    }
    const stockValue = Number(form.currentStock)
    if (!Number.isFinite(stockValue) || stockValue < 0) {
      errors.currentStock = 'Enter a valid stock quantity (≥ 0).'
    }
    if (!form.unit) {
      errors.unit = 'Select a unit.'
    }
    const alertValue = Number(form.lowStockAlert)
    if (!Number.isFinite(alertValue) || alertValue < 0) {
      errors.lowStockAlert = 'Enter a valid alert quantity (≥ 0).'
    }
    const costValue = Number(form.unitCost)
    if (!Number.isFinite(costValue) || costValue < 0) {
      errors.unitCost = 'Enter a valid unit cost (≥ 0).'
    }
    const sellingValue = Number(form.sellingPrice)
    if (!Number.isFinite(sellingValue) || sellingValue < 0) {
      errors.sellingPrice = 'Enter a valid selling price (≥ 0).'
    }
    return errors
  }

  const costValue = Number(form.costPrice)
  if (!Number.isFinite(costValue) || costValue < 0) {
    errors.costPrice = 'Enter a valid cost price (≥ 0).'
  }

  const priceValue = Number(form.sellingPrice)
  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    errors.sellingPrice = 'Enter a valid selling price (> 0).'
  }

  if (Number.isFinite(costValue) && Number.isFinite(priceValue) && priceValue < costValue) {
    errors.priceValidation = 'Selling price must be greater than or equal to cost price.'
  }

  const hasPartialRecipeLine = form.recipeLines.some((line) => {
    const hasIngredient = line.ingredientId.trim().length > 0
    const hasQty = line.qty.trim().length > 0
    if (!hasIngredient && !hasQty) {
      return false
    }
    if (!hasIngredient || !hasQty) {
      return true
    }
    const qty = Number(line.qty)
    return !Number.isFinite(qty) || qty <= 0
  })
  if (hasPartialRecipeLine) {
    errors.recipeLines = 'Each ingredient line needs a valid quantity greater than 0.'
    return errors
  }

  const validRecipeLines = normalizeNonRawRecipeLines(form.recipeLines)
  if (validRecipeLines.length === 0) {
    errors.recipeLines = 'At least one ingredient is required.'
    return errors
  }

  const ingredientIds = validRecipeLines.map((line) => line.ingredientId)
  if (new Set(ingredientIds).size !== ingredientIds.length) {
    errors.recipeLines = 'Duplicate ingredients are not allowed.'
  }

  return errors
}

const normalizeNonRawRecipeLines = (lines: RecipeLineDraft[]): RecipeLine[] =>
  lines
    .filter((line) => line.ingredientId.trim().length > 0 && line.qty.trim().length > 0)
    .map((line) => ({
      ingredientId: line.ingredientId,
      qty: Number(line.qty),
      unit: (line.unit as MeasurementUnit) || undefined,
    }))
    .filter((line) => Number.isFinite(line.qty) && line.qty > 0)

export const buildRecipeLinesForSave = (form: ProductFormState): RecipeLine[] =>
  form.productType === 'raw'
    ? Array.from(
        new Set(
          [form.ingredientId, ...form.additionalIngredientIds]
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ).map((ingredientId) => ({
        ingredientId,
        qty: 1,
      }))
    : normalizeNonRawRecipeLines(form.recipeLines)

export const validateProductImageFile = (
  file: File,
): ProductImageValidationError | null => {
  if (!file.type.startsWith('image/')) {
    return {
      title: 'Invalid image',
      description: 'Please choose a valid image file.',
    }
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
    return {
      title: 'Image too large',
      description: 'Use an image up to 5MB.',
    }
  }

  return null
}
