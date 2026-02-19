import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export type ToastMessage = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

type UiState = {
  toasts: ToastMessage[]
  commandLocks: Record<string, boolean>
}

const initialState: UiState = {
  toasts: [],
  commandLocks: {},
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    pushToast: {
      reducer: (state, action: PayloadAction<ToastMessage>) => {
        state.toasts.push(action.payload)
      },
      prepare: (toast: Omit<ToastMessage, 'id'>) => ({
        payload: {
          ...toast,
          id: nanoid(),
        },
      }),
    },
    dismissToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    clearToasts: (state) => {
      state.toasts = []
    },
    lockCommand: (state, action: PayloadAction<string>) => {
      state.commandLocks[action.payload] = true
    },
    unlockCommand: (state, action: PayloadAction<string>) => {
      state.commandLocks[action.payload] = false
    },
  },
})

export const { pushToast, dismissToast, clearToasts, lockCommand, unlockCommand } =
  uiSlice.actions
export default uiSlice.reducer
