import type { RootState } from '../../app/store/store'

export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectAuthUser = (state: RootState) => state.auth.user
export const selectAuthRole = (state: RootState) => state.auth.user?.role ?? null
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === 'authenticated'
