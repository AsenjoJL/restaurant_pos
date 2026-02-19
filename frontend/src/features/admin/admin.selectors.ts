import type { RootState } from '../../app/store/store'

export const selectAdminState = (state: RootState) => state.admin

export const selectAdminCategories = (state: RootState) => state.admin.categories
export const selectAdminProducts = (state: RootState) => state.admin.products
export const selectAdminUsers = (state: RootState) => state.admin.users
export const selectAdminSettings = (state: RootState) => state.admin.settings
