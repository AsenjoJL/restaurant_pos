import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { useCommandLock } from '../../../shared/hooks/useCommandLock'
import { logAuditEvent } from '../../../shared/lib/audit'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAuthStatus } from '../auth.selectors'
import { login } from '../auth.store'
import { getDefaultRouteForRole } from '../auth.utils'

function useLoginPageController() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const status = useAppSelector(selectAuthStatus)
  const { isLocked, withLock } = useCommandLock('auth.login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const isSubmitting = status === 'loading' || isLocked || isVerifying
  const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !isSubmitting

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const submittedUsername = String(formData.get('username') ?? '').trim()
    const submittedPassword = String(formData.get('password') ?? '')

    if (!submittedUsername || !submittedPassword || isSubmitting) {
      return
    }

    void withLock(async () => {
      setIsVerifying(true)
      setIsShaking(false)
      const [result] = await Promise.all([
        dispatch(login({ username: submittedUsername, password: submittedPassword })),
        new Promise((resolve) => window.setTimeout(resolve, 900)),
      ])

      if (login.fulfilled.match(result)) {
        logAuditEvent(dispatch, {
          scope: 'AUTH',
          action: 'LOGIN',
          message: 'User signed in.',
          user: {
            id: result.payload.user.id,
            name: result.payload.user.name,
            role: result.payload.user.role,
          },
        })
        dispatch(
          pushToast({
            title: 'Welcome back',
            description: `Signed in as ${result.payload.user.name}`,
            variant: 'success',
          }),
        )
        navigate(getDefaultRouteForRole(result.payload.user.role))
      } else {
        setIsShaking(true)
        setPassword('')
        window.setTimeout(() => setIsShaking(false), 450)
        dispatch(
          pushToast({
            title: 'Login failed',
            description: 'Check your username and password.',
            variant: 'error',
          }),
        )
      }

      setIsVerifying(false)
    })
  }

  return {
    canSubmit,
    handleSubmit,
    isShaking,
    isSubmitting,
    isVerifying,
    password,
    setPassword,
    setUsername,
    username,
  }
}

export default useLoginPageController
