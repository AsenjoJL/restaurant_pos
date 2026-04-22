import { createSelector } from '@reduxjs/toolkit'
import { selectAdminCategories, selectAdminProducts } from '../admin/admin.selectors'
import { mergeMenuProductsWithAdmin } from './menu.utils'
import type { MenuCategory } from './pos.types'

const ROOT_CATEGORY: MenuCategory = {
  id: 'all',
  name: 'All Items',
}

export const selectRuntimeMenuCategories = createSelector(
  [selectAdminCategories],
  (adminCategories) => [
    ROOT_CATEGORY,
    ...adminCategories
      .filter((category) => category.isActive)
      .map((category) => ({
        id: category.id,
        name: category.name,
      })),
  ],
)

export const selectRuntimeMenuProducts = createSelector([selectAdminProducts], (adminProducts) =>
  mergeMenuProductsWithAdmin([], adminProducts),
)

export const selectRuntimeMenuProductsById = createSelector(
  [selectRuntimeMenuProducts],
  (products) => new Map(products.map((product) => [product.id, product])),
)
