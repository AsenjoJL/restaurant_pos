import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import Select from '../../../shared/components/ui/Select'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAdminUsers } from '../admin.selectors'
import { addUser, resetUserPassword, toggleUserActive, updateUser } from '../admin.store'
import type { AdminUser } from '../admin.types'
import AdminStatCard from '../components/AdminStatCard'

type UserFormState = {
  name: string
  username: string
  role: AdminUser['role']
}

type UserErrors = {
  name?: string
  username?: string
  role?: string
}

const emptyForm: UserFormState = {
  name: '',
  username: '',
  role: 'cashier',
}

function AdminUsersPage() {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectAdminUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserFormState>(emptyForm)
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

  const roleOptions = useMemo(
    () => [
      { value: 'admin', label: 'Admin' },
      { value: 'cashier', label: 'Cashier' },
      { value: 'kitchen', label: 'Kitchen' },
    ],
    [],
  )

  const openAddModal = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (user: AdminUser) => {
    setEditing(user)
    setForm({
      name: user.name,
      username: user.username,
      role: user.role,
    })
    setErrors({})
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormError('')
    setIsSaving(false)
  }

  const validate = () => {
    const nextErrors: UserErrors = {}
    if (!form.name.trim()) {
      nextErrors.name = 'Name is required.'
    }
    if (!form.username.trim()) {
      nextErrors.username = 'Username is required.'
    }
    const usernameExists = users.some(
      (user) =>
        user.username.toLowerCase() === form.username.trim().toLowerCase() &&
        user.id !== editing?.id,
    )
    if (usernameExists) {
      nextErrors.username = 'Username already exists.'
    }
    if (!form.role) {
      nextErrors.role = 'Role is required.'
    }
    setErrors(nextErrors)
    return nextErrors
  }

  const handleSave = () => {
    if (isSaving) {
      return
    }
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
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
    const payload = {
      name: form.name.trim(),
      username: form.username.trim(),
      role: form.role,
    }
    if (editing) {
      dispatch(updateUser({ id: editing.id, ...payload }))
      dispatch(
        pushToast({
          title: 'User updated',
          description: `${payload.name} was saved.`,
          variant: 'success',
        }),
      )
    } else {
      dispatch(addUser(payload))
      dispatch(
        pushToast({
          title: 'User created',
          description: `${payload.name} was added.`,
          variant: 'success',
        }),
      )
    }
    setTimeout(() => {
      setIsSaving(false)
      closeModal()
    }, 200)
  }

  const handleToggleActive = (user: AdminUser) => {
    dispatch(toggleUserActive(user.id))
    dispatch(
      pushToast({
        title: user.isActive ? 'User disabled' : 'User enabled',
        description: user.name,
        variant: 'info',
      }),
    )
  }

  const handleResetPassword = (user: AdminUser) => {
    dispatch(resetUserPassword(user.id))
    dispatch(
      pushToast({
        title: 'Reset link sent',
        description: `Password reset for ${user.username}.`,
        variant: 'success',
      }),
    )
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Staff Users</h2>
          <p className="muted">Create logins for cashier and kitchen staff.</p>
        </div>
        <Button variant="primary" onClick={openAddModal} icon="person_add">
          Add Staff User
        </Button>
      </div>

      <div className="admin-metrics">
        <AdminStatCard label="Total Users" value={String(stats.total)} icon="groups" />
        <AdminStatCard label="Active" value={String(stats.active)} helper="Enabled" icon="verified_user" />
        <AdminStatCard label="Disabled" value={String(stats.disabled)} helper="Off duty" icon="block" />
        <AdminStatCard label="Admins" value={String(stats.admins)} helper="Managers" icon="admin_panel_settings" />
      </div>

      <div className="panel admin-card">
        <div className="admin-table admin-table-users">
          <div className="admin-table-head admin-table-row users">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Username</span>
            <span>Actions</span>
          </div>
          {users.map((user) => (
            <div key={user.id} className="admin-table-row users">
              <div className="admin-cell-title">
                <strong>{user.name}</strong>
                <p className="muted">ID {user.id}</p>
              </div>
              <span className="chip chip-role">{user.role.toUpperCase()}</span>
              <span className={`chip ${user.isActive ? 'chip-active' : 'chip-inactive'}`}>
                {user.isActive ? 'Active' : 'Disabled'}
              </span>
              <span>{user.username}</span>
              <div className="admin-row-actions">
                <Button variant="ghost" onClick={() => openEditModal(user)} icon="edit">
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleToggleActive(user)}
                  icon={user.isActive ? 'toggle_off' : 'toggle_on'}
                >
                  {user.isActive ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResetPassword(user)}
                  icon="restart_alt"
                >
                  Reset Password
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editing ? 'Edit Staff User' : 'Add Staff User'}
        onClose={closeModal}
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save User'}
            </Button>
          </div>
        }
      >
        {formError ? <div className="form-error">{formError}</div> : null}
        <Input
          label="Full name"
          placeholder="e.g. Ava Admin"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          error={errors.name}
        />
        <Input
          label="Username"
          placeholder="e.g. cashier01"
          value={form.username}
          onChange={(event) => setForm({ ...form, username: event.target.value })}
          error={errors.username}
        />
        <Select
          label="Role"
          value={form.role}
          onChange={(event) =>
            setForm({ ...form, role: event.target.value as AdminUser['role'] })
          }
          options={roleOptions}
          error={errors.role}
        />
      </Modal>
    </div>
  )
}

export default AdminUsersPage
