import type { Ingredient } from '../inventory/inventory.types'
import type {
  ProductErrors,
  ProductFormState,
} from './admin.products-form'
import type { AdminCategory, AdminProduct } from './admin.types'

export type IngredientSelectOption = {
  value: string
  label: string
  category: string
  unit: string
}

export const PRODUCT_CLASS_OPTIONS: Array<{ value: 'all' | 'RAW' | 'NON_RAW'; label: string }> = [
  { value: 'all', label: 'All item types' },
  { value: 'RAW', label: 'Ingredient / stock item' },
  { value: 'NON_RAW', label: 'Menu product' },
]

export const buildProductCategoryOptions = (categories: AdminCategory[]) => [
  { value: 'all', label: 'All categories' },
  ...categories.map((category) => ({
    value: category.id,
    label: category.name,
  })),
]

export const buildIngredientSelectOptions = (ingredients: Ingredient[]): IngredientSelectOption[] =>
  ingredients
    .map((ingredient) => ({
      value: ingredient.id,
      label: ingredient.name,
      category: ingredient.category || 'Uncategorized',
      unit: ingredient.baseUnit,
    }))
    .sort((left, right) => {
      const categoryOrder = left.category.localeCompare(right.category)
      if (categoryOrder !== 0) {
        return categoryOrder
      }

      return left.label.localeCompare(right.label)
    })

export const buildProductStats = (products: AdminProduct[], categoryCount: number) => {
  const activeCount = products.filter((product) => product.isActive).length
  return {
    total: products.length,
    active: activeCount,
    hidden: Math.max(products.length - activeCount, 0),
    categories: categoryCount,
  }
}

export const filterProducts = ({
  categoryFilter,
  products,
  query,
}: {
  categoryFilter: string
  products: AdminProduct[]
  query: string
}) => {
  const normalizedQuery = query.trim().toLowerCase()

  return products.filter((product) => {
    if (categoryFilter !== 'all' && product.categoryId !== categoryFilter) {
      return false
    }

    if (!normalizedQuery) {
      return true
    }

    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery)
    )
  })
}

export const getFirstProductFormError = (errors: ProductErrors) =>
  errors.recipeLines ||
  errors.priceValidation ||
  errors.sellingPrice ||
  errors.costPrice ||
  errors.ingredientId ||
  errors.name ||
  errors.category ||
  'Please fix the highlighted fields.'

const parseFiniteNumber = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const getProductProfitMetrics = (form: ProductFormState) => {
  if (form.productType !== 'non_raw') {
    return {
      markupPercentage: null,
      profitMarginPercent: null,
      profitPerItem: null,
    }
  }

  const price = parseFiniteNumber(form.sellingPrice)
  const baseCost = parseFiniteNumber(form.costPrice)

  if (price === null || baseCost === null) {
    return {
      markupPercentage: null,
      profitMarginPercent: null,
      profitPerItem: null,
    }
  }

  return {
    markupPercentage: baseCost === 0 ? null : ((price - baseCost) / baseCost) * 100,
    profitMarginPercent: price === 0 ? null : ((price - baseCost) / price) * 100,
    profitPerItem: price - baseCost,
  }
}

export const buildProductPayload = (form: ProductFormState, imageUrl: string | null) => ({
  name: form.name.trim(),
  description: form.description.trim(),
  price: Number(form.sellingPrice),
  baseCost: form.productType === 'raw' ? Number(form.unitCost) : Number(form.costPrice),
  productClass: form.productType === 'raw' ? ('RAW' as const) : ('NON_RAW' as const),
  categoryId: form.category,
  imageUrl,
})
