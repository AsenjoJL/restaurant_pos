import type { AdminUser } from './admin.types'

export type UserFormState = {
  name: string
  username: string
  role: AdminUser['role']
}

export type UserErrors = {
  name?: string
  username?: string
  role?: string
}

export type UserPayload = {
  name: string
  username: string
  role: AdminUser['role']
}

export const emptyUserForm: UserFormState = {
  name: '',
  username: '',
  role: 'cashier',
}

export const adminUserRoleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'kitchen', label: 'Kitchen' },
]

export const validateUserForm = ({
  form,
  users,
  editingId,
}: {
  form: UserFormState
  users: AdminUser[]
  editingId?: string
}): UserErrors => {
  const errors: UserErrors = {}

  if (!form.name.trim()) {
    errors.name = 'Name is required.'
  }

  if (!form.username.trim()) {
    errors.username = 'Username is required.'
  } else {
    const usernameExists = users.some(
      (user) =>
        user.username.toLowerCase() === form.username.trim().toLowerCase() &&
        user.id !== editingId,
    )
    if (usernameExists) {
      errors.username = 'Username already exists.'
    }
  }

  if (!form.role) {
    errors.role = 'Role is required.'
  }

  return errors
}

export const buildUserPayload = (form: UserFormState): UserPayload => ({
  name: form.name.trim(),
  username: form.username.trim(),
  role: form.role,
})

export const validatePasswordChangeInput = ({
  actorRole,
  newPassword,
  confirmPassword,
}: {
  actorRole?: AdminUser['role']
  newPassword: string
  confirmPassword: string
}): string | null => {
  if (actorRole !== 'admin') {
    return 'Only admin users can change staff passwords.'
  }

  const trimmedPassword = newPassword.trim()
  if (trimmedPassword.length < 4) {
    return 'PIN must be at least 4 characters.'
  }

  if (trimmedPassword !== confirmPassword.trim()) {
    return 'PIN confirmation does not match.'
  }

  return null
}
