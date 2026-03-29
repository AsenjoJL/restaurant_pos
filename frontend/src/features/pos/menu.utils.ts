import type { MenuCategory, MenuProduct } from './pos.types'
import type { AdminProduct } from '../admin/admin.types'

type FilterMenuProductsParams = {
  activeCategoryId: string
  searchTerm: string
}

const normalizeSearch = (value: string) => value.trim().toLowerCase()

export const filterMenuProducts = (
  items: MenuProduct[],
  params: FilterMenuProductsParams,
) => {
  const normalizedSearch = normalizeSearch(params.searchTerm)
  return items.filter((product) => {
    const matchesCategory =
      params.activeCategoryId === 'all' || product.categoryId === params.activeCategoryId
    const matchesSearch =
      normalizedSearch.length === 0 ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch)
    return matchesCategory && matchesSearch
  })
}

export const buildCategoryNameMap = (items: MenuCategory[]) =>
  new Map(items.map((item) => [item.id, item.name]))

export const getCategoryName = (
  categoryMap: Map<string, string>,
  categoryId: string,
  fallback = 'All Items',
) => categoryMap.get(categoryId) ?? fallback

const toneCycle: Array<MenuProduct['tone']> = ['sun', 'mint', 'berry', 'ocean', 'clay', 'orchard']

const deriveTone = (seed: string): MenuProduct['tone'] => {
  const hash = seed.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return toneCycle[hash % toneCycle.length]
}

const adminImageByName: Record<string, string> = {
  'coffee beans': '/brewed coffee.jpg',
  kangkong: '/kangkong.jpg',
  kankong: '/kangkong.jpg',
  'crispy pata': '/crispyPata.jpg',
}

export const mergeMenuProductsWithAdmin = (
  seedProducts: MenuProduct[],
  adminProducts: AdminProduct[],
) => {
  const seedById = new Map(seedProducts.map((product) => [product.id, product]))

  return adminProducts
    .filter((product) => product.isActive)
    .map((product) => {
      const seeded = seedById.get(product.id)
      const fallbackPrice =
        product.productClass === 'RAW' && product.price <= 0
          ? Math.max(product.baseCost, 0)
          : product.price

      if (seeded) {
        return {
          ...seeded,
          name: product.name,
          description: product.description || seeded.description,
          price: fallbackPrice,
          categoryId: product.categoryId || seeded.categoryId,
        }
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description || 'New menu item',
        price: fallbackPrice,
        categoryId: product.categoryId || 'all',
        tone: deriveTone(product.id),
        image: adminImageByName[product.name.trim().toLowerCase()],
        availability: 'AVAILABLE' as const,
      }
    })
}
