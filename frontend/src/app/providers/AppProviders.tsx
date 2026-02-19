import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from '../store/store'
import AuthProvider from './AuthProvider'
import ToastProvider from './ToastProvider'

type AppProvidersProps = {
  children: ReactNode
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </Provider>
  )
}

export default AppProviders
