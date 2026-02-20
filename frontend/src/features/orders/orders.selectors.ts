import type { RootState } from '../../app/store/store'

export const selectOrders = (state: RootState) => state.orders.list
export const selectReplacementRequests = (state: RootState) =>
  state.orders.replacementRequests
export const selectReplacementTickets = (state: RootState) =>
  state.orders.replacementTickets
