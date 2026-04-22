import type { KitchenStation } from '../pos/pos.types'

type CachedAdminCategory = {
  id: string
  name: string
}

type CachedAdminProduct = {
  id: string
  name: string
  categoryId: string
}

type CachedAdminState = {
  categories: CachedAdminCategory[]
  products: CachedAdminProduct[]
}

const ADMIN_STORAGE_KEY = 'pos.admin.v4'

const stationLabels: Record<KitchenStation, string> = {
  GRILL: 'Grill',
  FRY: 'Fry',
  PANTRY: 'Pantry',
  PIZZA: 'Pizza',
  BAR: 'Bar',
  DESSERT: 'Dessert',
  ASSEMBLY: 'Assembly',
  UNASSIGNED: 'Unassigned',
}

const keywordStationRules: Array<{ station: KitchenStation; keywords: string[] }> = [
  { station: 'PIZZA', keywords: ['pizza'] },
  { station: 'BAR', keywords: ['drink', 'beverage', 'juice', 'coffee', 'tea', 'soda'] },
  { station: 'DESSERT', keywords: ['dessert', 'cake', 'sweet'] },
  { station: 'FRY', keywords: ['fries', 'fried', 'crispy'] },
  { station: 'GRILL', keywords: ['grill', 'steak', 'bbq'] },
  { station: 'PANTRY', keywords: ['salad', 'sandwich', 'cold'] },
  { station: 'ASSEMBLY', keywords: ['rice', 'meal', 'combo', 'burger', 'pasta'] },
]

const loadAdminCatalog = (): CachedAdminState => {
  if (typeof window === 'undefined') {
    return { categories: [], products: [] }
  }

  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (!raw) {
      return { categories: [], products: [] }
    }
    const parsed = JSON.parse(raw) as Partial<CachedAdminState>
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      products: Array.isArray(parsed.products) ? parsed.products : [],
    }
  } catch {
    return { categories: [], products: [] }
  }
}

const inferStationFromText = (value: string): KitchenStation => {
  const normalized = value.toLowerCase()
  for (const rule of keywordStationRules) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.station
    }
  }
  return 'UNASSIGNED'
}

export const getKitchenStationLabel = (station: KitchenStation) => stationLabels[station]

export const resolveKitchenStation = (productId: string): KitchenStation => {
  const { products, categories } = loadAdminCatalog()
  const product = products.find((item) => item.id === productId)
  if (!product) {
    return 'UNASSIGNED'
  }

  const categoryName =
    categories.find((category) => category.id === product.categoryId)?.name ?? product.categoryId

  return inferStationFromText(`${categoryName} ${product.name}`)
}
