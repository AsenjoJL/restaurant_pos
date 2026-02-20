import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { login } from '../auth.store'
import { selectAuthStatus } from '../auth.selectors'
import { useCommandLock } from '../../../shared/hooks/useCommandLock'
import { pushToast } from '../../../shared/store/ui.store'

function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const status = useAppSelector(selectAuthStatus)
  const { isLocked, withLock } = useCommandLock('auth.login')
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')

  const isSubmitting = status === 'loading' || isLocked

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void withLock(async () => {
      const result = await dispatch(login({ username, pin }))
      if (login.fulfilled.match(result)) {
        dispatch(
          pushToast({
            title: 'Welcome back',
            description: `Signed in as ${result.payload.user.name}`,
            variant: 'success',
          }),
        )
        const role = result.payload.user.role
        const route =
          role === 'kitchen' ? '/kitchen' : '/pos'
        navigate(route)
      } else {
        dispatch(
          pushToast({
            title: 'Login failed',
            description: 'Check your username and PIN.',
            variant: 'error',
          }),
        )
      }
    })
  }

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <div className="auth-hero-card">
          <span className="auth-badge">Staff Access</span>
          <h1>Restaurant POS</h1>
          <p className="muted">
            Secure sign-in for cashier, kitchen, and admin workflows.
          </p>
          <div className="auth-hero-grid">
            <div className="auth-hero-item">
              <span className="material-symbols-rounded" aria-hidden="true">
                point_of_sale
              </span>
              <div>
                <h3>Cashier</h3>
                <p className="muted">Take payments and issue receipts quickly.</p>
              </div>
            </div>
            <div className="auth-hero-item">
              <span className="material-symbols-rounded" aria-hidden="true">
                local_dining
              </span>
              <div>
                <h3>Kitchen</h3>
                <p className="muted">Track tickets with real-time updates.</p>
              </div>
            </div>
            <div className="auth-hero-item">
              <span className="material-symbols-rounded" aria-hidden="true">
                admin_panel_settings
              </span>
              <div>
                <h3>Admin</h3>
                <p className="muted">Manage menu, staff, and settings.</p>
              </div>
            </div>
          </div>
          <div className="auth-demo panel">
            <span className="auth-demo-title">Demo accounts</span>
            <p className="muted">Use credentials from mock data.</p>
          </div>
        </div>
      </div>

      <div className="auth-card panel">
        <div className="auth-header">
          <span className="material-symbols-rounded auth-lock" aria-hidden="true">
            lock
          </span>
          <div>
            <h2>Staff Login</h2>
            <p className="muted">Enter your username and PIN.</p>
          </div>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Username"
            placeholder="Enter username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
          <Input
            label="PIN"
            placeholder="4-digit PIN"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            helperText="Use your 4-digit staff PIN"
            required
          />
          <Button
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            type="submit"
          >
            Sign In
          </Button>
        </form>
        <div className="auth-hint">
          <p className="muted">Need access? Contact your manager.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
