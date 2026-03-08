import type { KitchenStation } from '../pos/pos.types'
import { categories, products } from '../../mock/data'

const categoryStationMap = new Map(
  categories.map((category) => [category.id, category.station]),
)

const productMap = new Map(products.map((product) => [product.id, product]))

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

export const getKitchenStationLabel = (station: KitchenStation) => stationLabels[station]

export const resolveKitchenStation = (productId: string): KitchenStation => {
  const product = productMap.get(productId)
  if (product?.stationOverride) {
    return product.stationOverride
  }
  const station = product ? categoryStationMap.get(product.categoryId) : undefined
  return station ?? 'UNASSIGNED'
}
