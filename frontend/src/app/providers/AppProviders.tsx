import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from '../store/store'
import AuthProvider from './AuthProvider'
import ToastProvider from './ToastProvider'
import DataBootstrapProvider from './DataBootstrapProvider'

type AppProvidersProps = {
  children: ReactNode
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <DataBootstrapProvider>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </DataBootstrapProvider>
    </Provider>
  )
}

export default AppProviders
