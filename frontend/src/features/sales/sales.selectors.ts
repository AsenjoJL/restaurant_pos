import type { RootState } from '../../app/store/store'

export const selectSalesRecords = (state: RootState) => state.sales.records
