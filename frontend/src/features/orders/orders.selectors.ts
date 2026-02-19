import type { RootState } from '../../app/store/store'

export const selectOrders = (state: RootState) => state.orders.list
