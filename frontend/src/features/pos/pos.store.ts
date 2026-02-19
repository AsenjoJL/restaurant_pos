import { combineReducers, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type {
  CartItem,
  ConfirmIntent,
  DraftOrder,
  MenuProduct,
  OrderType,
  SelectedModifier,
} from './pos.types'
import { sanitizeNote } from './pos.utils'

type PosDraftState = DraftOrder

type ConfirmState = {
  isOpen: boolean
  intent: ConfirmIntent | null
  targetId: string | null
  reason: string
}

type PosUiState = {
  activeCategoryId: string
  searchTerm: string
  isPaymentOpen: boolean
  activeOrderId: string | null
  isModifierOpen: boolean
  modifierTargetId: string | null
  isReceiptOpen: boolean
  confirm: ConfirmState
}

const createDraft = (): DraftOrder => ({
  id: `DRAFT-${nanoid(6).toUpperCase()}`,
  orderType: 'dine-in',
  tableId: null,
  staffId: null,
  notes: '',
  items: [],
  discount: 0,
  serviceCharge: 0,
  taxRate: 0.0825,
  status: 'draft',
})

const initialDraftState: PosDraftState = createDraft()

const draftSlice = createSlice({
  name: 'posDraft',
  initialState: initialDraftState,
  reducers: {
    addItem: (state, action: PayloadAction<MenuProduct>) => {
      const existing = state.items.find((item) => item.product.id === action.payload.id)
      if (existing) {
        existing.quantity += 1
        return
      }
      const newItem: CartItem = {
        product: action.payload,
        quantity: 1,
        note: '',
        selectedModifiers: [],
        finalUnitPrice: action.payload.price,
      }
      state.items.push(newItem)
    },
    setItemQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const target = state.items.find((item) => item.product.id === action.payload.productId)
      if (!target) {
        return
      }
      target.quantity = Math.max(0, action.payload.quantity)
      state.items = state.items.filter((item) => item.quantity > 0)
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload)
    },
    setItemNote: (
      state,
      action: PayloadAction<{ productId: string; note: string }>,
    ) => {
      const target = state.items.find((item) => item.product.id === action.payload.productId)
      if (target) {
        target.note = sanitizeNote(action.payload.note)
      }
    },
    setItemModifiers: (
      state,
      action: PayloadAction<{
        productId: string
        selectedModifiers: SelectedModifier[]
        finalUnitPrice: number
      }>,
    ) => {
      const target = state.items.find((item) => item.product.id === action.payload.productId)
      if (!target) {
        return
      }
      target.selectedModifiers = action.payload.selectedModifiers
      target.finalUnitPrice = action.payload.finalUnitPrice
    },
    setOrderType: (state, action: PayloadAction<OrderType>) => {
      state.orderType = action.payload
      if (action.payload !== 'dine-in') {
        state.tableId = null
      }
    },
    setTable: (state, action: PayloadAction<string | null>) => {
      state.tableId = action.payload
    },
    setStaff: (state, action: PayloadAction<string | null>) => {
      state.staffId = action.payload
    },
    setOrderNotes: (state, action: PayloadAction<string>) => {
      state.notes = sanitizeNote(action.payload)
    },
    setDiscount: (state, action: PayloadAction<number>) => {
      state.discount = Math.max(0, action.payload)
    },
    setServiceCharge: (state, action: PayloadAction<number>) => {
      state.serviceCharge = Math.max(0, action.payload)
    },
    clearDraft: (state) => {
      const reset = createDraft()
      state.id = reset.id
      state.orderType = reset.orderType
      state.tableId = reset.tableId
      state.staffId = reset.staffId
      state.notes = reset.notes
      state.items = reset.items
      state.discount = reset.discount
      state.serviceCharge = reset.serviceCharge
      state.taxRate = reset.taxRate
      state.status = reset.status
    },
    clearItems: (state) => {
      state.items = []
    },
  },
})

const initialUiState: PosUiState = {
  activeCategoryId: 'all',
  searchTerm: '',
  isPaymentOpen: false,
  activeOrderId: null,
  isModifierOpen: false,
  modifierTargetId: null,
  isReceiptOpen: false,
  confirm: {
    isOpen: false,
    intent: null,
    targetId: null,
    reason: '',
  },
}

const uiSlice = createSlice({
  name: 'posUi',
  initialState: initialUiState,
  reducers: {
    setActiveCategoryId: (state, action: PayloadAction<string>) => {
      state.activeCategoryId = action.payload
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    openPaymentModal: (state, action: PayloadAction<{ orderId: string }>) => {
      state.isPaymentOpen = true
      state.activeOrderId = action.payload.orderId
    },
    closePaymentModal: (state) => {
      state.isPaymentOpen = false
      state.activeOrderId = null
    },
    openModifierModal: (state, action: PayloadAction<string>) => {
      state.isModifierOpen = true
      state.modifierTargetId = action.payload
    },
    closeModifierModal: (state) => {
      state.isModifierOpen = false
      state.modifierTargetId = null
    },
    openReceiptModal: (state) => {
      state.isReceiptOpen = true
    },
    closeReceiptModal: (state) => {
      state.isReceiptOpen = false
    },
    openConfirm: (
      state,
      action: PayloadAction<{ intent: ConfirmIntent; targetId?: string | null }>,
    ) => {
      state.confirm.isOpen = true
      state.confirm.intent = action.payload.intent
      state.confirm.targetId = action.payload.targetId ?? null
      state.confirm.reason = ''
    },
    closeConfirm: (state) => {
      state.confirm.isOpen = false
      state.confirm.intent = null
      state.confirm.targetId = null
      state.confirm.reason = ''
    },
    setConfirmReason: (state, action: PayloadAction<string>) => {
      state.confirm.reason = sanitizeNote(action.payload)
    },
  },
})

export const {
  addItem,
  setItemQuantity,
  removeItem,
  setItemNote,
  setItemModifiers,
  setOrderType,
  setTable,
  setStaff,
  setOrderNotes,
  setDiscount,
  setServiceCharge,
  clearDraft,
  clearItems,
} = draftSlice.actions

export const {
  setActiveCategoryId,
  setSearchTerm,
  openPaymentModal,
  closePaymentModal,
  openModifierModal,
  closeModifierModal,
  openReceiptModal,
  closeReceiptModal,
  openConfirm,
  closeConfirm,
  setConfirmReason,
} = uiSlice.actions

const posReducer = combineReducers({
  draft: draftSlice.reducer,
  ui: uiSlice.reducer,
})

export default posReducer
