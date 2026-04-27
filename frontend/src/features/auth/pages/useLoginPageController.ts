import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { useCommandLock } from '../../../shared/hooks/useCommandLock'
import { logAuditEvent } from '../../../shared/lib/audit'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAdminUsers } from '../../admin/admin.selectors'
import { selectAuthStatus } from '../auth.selectors'
import { login } from '../auth.store'
import type { Role } from '../auth.types'
import { ROLE_CARD_BY_ID, type NumpadKey } from '../login.constants'
import { formatPosTime, getDefaultRouteForRole } from '../auth.utils'

function useLoginPageController() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const status = useAppSelector(selectAuthStatus)
  const users = useAppSelector(selectAdminUsers)
  const { isLocked, withLock } = useCommandLock('auth.login')
  const [selectedRole, setSelectedRole] = useState<Role>('cashier')
  const [customUsername, setCustomUsername] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [clockLabel, setClockLabel] = useState(() => formatPosTime())

  const roleName = useMemo(() => ROLE_CARD_BY_ID[selectedRole].name, [selectedRole])

  const defaultUsernameByRole = useMemo(() => {
    const entries = users
      .filter((user) => user.isActive)
      .map((user) => [user.role, user.username] as const)
    return new Map<Role, string>(entries)
  }, [users])

  const username = customUsername ?? defaultUsernameByRole.get(selectedRole) ?? ''
  const isSubmitting = status === 'loading' || isLocked || isVerifying
  const canSubmit = username.trim().length > 0 && pin.length === 4 && !isSubmitting

  useEffect(() => {
    const tick = () => setClockLabel(formatPosTime())
    tick()
    const timer = window.setInterval(tick, 10_000)
    return () => window.clearInterval(timer)
  }, [])

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setCustomUsername(null)
    setPin('')
    setIsShaking(false)
  }

  const handleNumpadPress = (key: NumpadKey) => {
    if (isSubmitting) return
    if (key === 'Clear') {
      setPin('')
      return
    }
    if (key === '⌫') {
      setPin((current) => current.slice(0, -1))
      return
    }
    setPin((current) => (current.length < 4 ? `${current}${key}` : current))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    void withLock(async () => {
      setIsVerifying(true)
      setIsShaking(false)
      const [result] = await Promise.all([
        dispatch(login({ username: username.trim(), pin })),
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
        setPin('')
        window.setTimeout(() => setIsShaking(false), 450)
        dispatch(
          pushToast({
            title: 'Login failed',
            description: 'Check your username and PIN/password.',
            variant: 'error',
          }),
        )
      }

      setIsVerifying(false)
    })
  }

  return {
    canSubmit,
    clockLabel,
    handleNumpadPress,
    handleRoleSelect,
    handleSubmit,
    isShaking,
    isSubmitting,
    isVerifying,
    pin,
    roleName,
    selectedRole,
    setUsername: setCustomUsername,
    username,
  }
}

export default useLoginPageController
