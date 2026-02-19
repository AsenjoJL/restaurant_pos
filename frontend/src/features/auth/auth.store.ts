import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { AuthSession, User } from './auth.types'
import { authService } from './services/auth.service'

type AuthState = {
  status: 'authenticated' | 'unauthenticated' | 'loading'
  user: User | null
  token: string | null
  error: string | null
}

const initialState: AuthState = {
  status: 'unauthenticated',
  user: null,
  token: null,
  error: null,
}

type LoginPayload = {
  username: string
  pin: string
}

export const login = createAsyncThunk<AuthSession, LoginPayload>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.login(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      return rejectWithValue(message)
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.status = 'unauthenticated'
      state.user = null
      state.token = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'unauthenticated'
        state.user = null
        state.token = null
        state.error = (action.payload as string) ?? 'Login failed'
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
