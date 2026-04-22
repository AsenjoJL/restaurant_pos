import Button from '../../../shared/components/ui/Button'
import AdminStatCard from '../components/AdminStatCard'
import ChangePinModal from '../components/users/ChangePinModal'
import AdminUsersTable from '../components/users/AdminUsersTable'
import UserFormModal from '../components/users/UserFormModal'
import useAdminUsersPageController from '../hooks/useAdminUsersPageController'

function AdminUsersPage() {
  const {
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
    handleBackToAdministration,
    handleChangePasswordAction,
    handleClosePasswordModal,
    handleCloseUserModal,
    handleOpenAddModal,
    handleOpenEditModal,
    handleOpenPasswordModal,
    handleSaveUserAction,
    handleToggleActiveAction,
  } = useAdminUsersPageController()

  return (
    <div className="page admin-page admin-users-page">
      <div className="page-header">
        <div>
          <h2>Staff Users</h2>
          <p className="muted">Create logins for cashier and kitchen staff.</p>
        </div>
        <div className="admin-actions">
          <Button variant="outline" onClick={handleBackToAdministration}>
            Back to Administration
          </Button>
          <Button variant="primary" onClick={handleOpenAddModal}>
            Add Staff User
          </Button>
        </div>
      </div>

      <div className="admin-metrics">
        <AdminStatCard label="Total Users" value={String(stats.total)} icon="/staff.png" />
        <AdminStatCard label="Active" value={String(stats.active)} helper="Enabled" icon="/staff.png" />
        <AdminStatCard label="Disabled" value={String(stats.disabled)} helper="Off duty" icon="/clear.png" />
        <AdminStatCard label="Admins" value={String(stats.admins)} helper="Managers" icon="/admin.png" />
      </div>

      <AdminUsersTable
        users={users}
        onEdit={handleOpenEditModal}
        onToggleActive={handleToggleActiveAction}
        onChangePin={handleOpenPasswordModal}
      />

      <UserFormModal
        errors={errors}
        form={form}
        formError={formError}
        isOpen={isModalOpen}
        isSaving={isSaving}
        isEditing={Boolean(editing)}
        roleOptions={roleOptions}
        onClose={handleCloseUserModal}
        onFormChange={setForm}
        onSave={handleSaveUserAction}
      />

      <ChangePinModal
        confirmPassword={confirmPassword}
        error={passwordError}
        isOpen={isPasswordModalOpen}
        isSaving={isUpdatingPassword}
        newPassword={newPassword}
        target={passwordTarget}
        onClose={handleClosePasswordModal}
        onConfirmPasswordChange={setConfirmPassword}
        onNewPasswordChange={setNewPassword}
        onSave={handleChangePasswordAction}
      />
    </div>
  )
}

export default AdminUsersPage
