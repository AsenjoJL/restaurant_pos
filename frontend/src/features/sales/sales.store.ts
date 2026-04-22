import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store/store'
import type { SalesRecord } from '../../shared/types/sales'
import { salesRepository } from './api'
import type { UpsertSalesRecordInput } from './api/sales.repository'

export const SALES_STORAGE_KEY = 'pos.sales.v2'

type SalesState = {
  records: SalesRecord[]
}

export type AddSalesRecordPayload = Omit<SalesRecord, 'id' | 'paidAt'> & {
  id?: string
  paidAt?: string
}

const fillCostFields = (record: SalesRecord): SalesRecord => {
  const cogs = record.cogs ?? 0
  const grossProfit = record.grossProfit ?? record.total - cogs
  const grossMargin =
    record.grossMargin ?? (record.total > 0 ? grossProfit / record.total : 0)
  return {
    ...record,
    cogs,
    grossProfit,
    grossMargin,
  }
}

const migrateSalesRecords = (records: SalesRecord[]) => {
  let changed = false
  const migrated = records.map((record) => {
    if (
      record.cogs !== undefined &&
      record.grossProfit !== undefined &&
      record.grossMargin !== undefined
    ) {
      return record
    }
    changed = true
    return fillCostFields(record)
  })
  return { migrated, changed }
}

const loadStoredSales = () => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = localStorage.getItem(SALES_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return null
    }
    const { migrated } = migrateSalesRecords(parsed as SalesRecord[])
    return migrated
  } catch {
    return null
  }
}

const initialState: SalesState = {
  records: loadStoredSales() ?? [],
}

const toRepositoryPayload = (record: SalesRecord): UpsertSalesRecordInput => ({
  ...record,
})

export const hydrateSalesFromRepository = createAsyncThunk(
  'sales/hydrateFromRepository',
  async () => salesRepository.getSnapshot(),
)

export const syncSalesRecord = createAsyncThunk<
  void,
  { orderId: string },
  { state: RootState }
>('sales/syncRecord', async ({ orderId }, { getState }) => {
  const record = getState().sales.records.find((item) => item.orderId === orderId)
  if (!record) {
    return
  }
  await salesRepository.upsertRecord(toRepositoryPayload(record))
})

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    addSalesRecord: (state, action: { payload: AddSalesRecordPayload }) => {
      const exists = state.records.some(
        (record) => record.orderId === action.payload.orderId,
      )
      if (exists) {
        return
      }
      const paidAt = action.payload.paidAt ?? new Date().toISOString()
      const id = action.payload.id ?? nanoid()
      const record = fillCostFields({
        ...action.payload,
        id,
        paidAt,
      })
      state.records.unshift(record)
    },
    setSalesRecords: (state, action: { payload: SalesRecord[] }) => {
      state.records = action.payload.map((record) => fillCostFields(record))
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateSalesFromRepository.fulfilled, (state, action) => {
      state.records = action.payload.records.map((record) => fillCostFields(record))
    })
  },
})

export const { addSalesRecord, setSalesRecords } = salesSlice.actions
export default salesSlice.reducer
