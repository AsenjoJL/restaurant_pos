import type { MenuCategory, MenuProduct } from './pos.types'

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
