import Button from '../../../../shared/components/ui/Button'
import type { AdminUser } from '../../admin.types'

type AdminUsersTableProps = {
  users: AdminUser[]
  onEdit: (user: AdminUser) => void
  onToggleActive: (user: AdminUser) => void
  onChangePin: (user: AdminUser) => void
}

function AdminUsersTable({
  users,
  onEdit,
  onToggleActive,
  onChangePin,
}: AdminUsersTableProps) {
  return (
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
              <Button variant="ghost" onClick={() => onEdit(user)}>
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => onToggleActive(user)}
              >
                {user.isActive ? 'Disable' : 'Enable'}
              </Button>
              <Button variant="outline" onClick={() => onChangePin(user)}>
                Change PIN
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminUsersTable
