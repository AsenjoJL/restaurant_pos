import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { hasValidationErrors } from '../../../shared/lib/validation'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectAdminUsers } from '../admin.selectors'
import { hydrateAdminFromRepository } from '../admin.store'
import type { AdminUser } from '../admin.types'
import {
  adminUserRoleOptions,
  buildUserPayload,
  emptyUserForm,
  validatePasswordChangeInput,
  validateUserForm,
  type UserErrors,
  type UserFormState,
  type UserPayload,
} from '../admin.users-form'
import { adminRepository } from '../api'

function useAdminUsersPageController() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const users = useAppSelector(selectAdminUsers)
  const authUser = useAppSelector(selectAuthUser)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordTarget, setPasswordTarget] = useState<AdminUser | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserFormState>(emptyUserForm)
  const [errors, setErrors] = useState<UserErrors>({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const stats = useMemo(() => {
    const activeCount = users.filter((user) => user.isActive).length
    const admins = users.filter((user) => user.role === 'admin').length
    const staff = users.length - admins
    return {
      total: users.length,
      active: activeCount,
      disabled: Math.max(users.length - activeCount, 0),
      admins,
      staff,
    }
  }, [users])

  const roleOptions = useMemo(() => adminUserRoleOptions, [])

  const resetUserModalState = () => {
    setEditing(null)
    setForm(emptyUserForm)
    setErrors({})
    setFormError('')
    setIsSaving(false)
  }

  const openAddModal = () => {
    resetUserModalState()
    setIsModalOpen(true)
  }

  const openEditModal = (user: AdminUser) => {
    setEditing(user)
    setForm({
      name: user.name,
      username: user.username,
      role: user.role,
      password: '',
      confirmPassword: '',
    })
    setErrors({})
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetUserModalState()
  }

  const openPasswordModal = (user: AdminUser) => {
    setPasswordTarget(user)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setIsPasswordModalOpen(true)
  }

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false)
    setPasswordTarget(null)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setIsUpdatingPassword(false)
  }

  const failSave = (message: string) => {
    setIsSaving(false)
    setFormError(message)
  }

  const refreshUsers = async () => {
    await dispatch(hydrateAdminFromRepository()).unwrap()
  }

  const upsertUserRecord = async (payload: UserPayload): Promise<boolean> => {
    if (editing) {
      try {
        await adminRepository.updateUser(editing.id, {
          name: payload.name,
          username: payload.username,
          role: payload.role,
          isActive: editing.isActive,
        })
        await refreshUsers()
      } catch {
        failSave('Unable to save user right now. Please try again.')
        return false
      }

      dispatch(
        pushToast({
          title: 'User updated',
          description: `${payload.name} was saved.`,
          variant: 'success',
        }),
      )
      return true
    }

    if (!payload.password) {
      failSave('Password is required for new staff users.')
      return false
    }

    try {
      await adminRepository.createUser({
        name: payload.name,
        username: payload.username,
        role: payload.role,
        password: payload.password,
        isActive: true,
      })
      await refreshUsers()
    } catch {
      failSave('Unable to save user right now. Please try again.')
      return false
    }

    dispatch(
      pushToast({
        title: 'User created',
        description: `${payload.name} was added.`,
        variant: 'success',
      }),
    )
    return true
  }

  const handleSave = async () => {
    if (isSaving) {
      return
    }

    const nextErrors = validateUserForm({
      form,
      users,
      editingId: editing?.id,
    })
    setErrors(nextErrors)
    if (hasValidationErrors(nextErrors)) {
      setFormError('Please fix the highlighted fields.')
      dispatch(
        pushToast({
          title: 'Fix validation errors',
          description: 'Check the required user fields.',
          variant: 'error',
        }),
      )
      return
    }

    setIsSaving(true)
    const synced = await upsertUserRecord(buildUserPayload(form))
    if (!synced) {
      return
    }

    setIsSaving(false)
    closeModal()
  }

  const handleToggleActive = async (user: AdminUser) => {
    try {
      await adminRepository.setUserActive(user.id, !user.isActive)
      await refreshUsers()
      dispatch(
        pushToast({
          title: user.isActive ? 'User disabled' : 'User enabled',
          description: user.name,
          variant: 'info',
        }),
      )
    } catch {
      dispatch(
        pushToast({
          title: 'Update failed',
          description: 'Could not update user status.',
          variant: 'error',
        }),
      )
    }
  }

  const handleChangePassword = async () => {
    if (isUpdatingPassword || !passwordTarget) {
      return
    }
    const actorUser = authUser
    if (!actorUser) {
      setPasswordError('Only admin users can change staff passwords.')
      return
    }
    const validationError = validatePasswordChangeInput({
      actorRole: actorUser.role,
      newPassword,
      confirmPassword,
    })
    if (validationError) {
      setPasswordError(validationError)
      return
    }

    const trimmedPassword = newPassword.trim()
    setIsUpdatingPassword(true)
    setPasswordError('')
    try {
      await adminRepository.changeUserPassword(passwordTarget.id, {
        newPassword: trimmedPassword,
        performedByUserId: actorUser.id,
      })
      dispatch(
        pushToast({
          title: 'Password updated',
          description: `${passwordTarget.username}'s password was changed.`,
          variant: 'success',
        }),
      )
      closePasswordModal()
    } catch {
      setIsUpdatingPassword(false)
      setPasswordError('Unable to update password right now. Please try again.')
      dispatch(
        pushToast({
          title: 'Update failed',
          description: 'Could not change password.',
          variant: 'error',
        }),
      )
    }
  }

  return {
    confirmPassword,
    editing,
    errors,
    form,
    formError,
    isModalOpen,
    isPasswordModalOpen,
    isSaving,
    isUpdatingPassword,
    newPassword,
    passwordError,
    passwordTarget,
    roleOptions,
    stats,
    users,
    setConfirmPassword,
    setForm,
    setNewPassword,
    handleBackToAdministration: () => navigate('/admin/administration'),
    handleChangePasswordAction: () => {
      void handleChangePassword()
    },
    handleClosePasswordModal: closePasswordModal,
    handleCloseUserModal: closeModal,
    handleOpenAddModal: openAddModal,
    handleOpenEditModal: openEditModal,
    handleOpenPasswordModal: openPasswordModal,
    handleSaveUserAction: () => {
      void handleSave()
    },
    handleToggleActiveAction: (user: AdminUser) => {
      void handleToggleActive(user)
    },
  }
}

export default useAdminUsersPageController
