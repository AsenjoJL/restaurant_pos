import Button from '../../../../shared/components/ui/Button'
import type { AdminCategory } from '../../admin.types'

type CategoriesTableProps = {
  categories: AdminCategory[]
  productCounts: Record<string, number>
  onDelete: (category: AdminCategory) => void
  onEdit: (category: AdminCategory) => void
}

function CategoriesTable({
  categories,
  productCounts,
  onDelete,
  onEdit,
}: CategoriesTableProps) {
  return (
    <div className="panel admin-card">
      <div className="admin-table admin-table-categories">
        <div className="admin-table-head admin-table-row categories">
          <span>Name</span>
          <span>Description</span>
          <span>Items</span>
          <span>Actions</span>
        </div>
        {categories.map((category) => (
          <div key={category.id} className="admin-table-row categories">
            <div className="admin-cell-title">
              <strong>{category.name}</strong>
              <span className={`chip ${category.isActive ? 'chip-active' : 'chip-inactive'}`}>
                {category.isActive ? 'Active' : 'Hidden'}
              </span>
            </div>
            <span className="muted">{category.description || 'No description'}</span>
            <span className="admin-count">{productCounts[category.id] ?? 0}</span>
            <div className="admin-row-actions">
              <Button variant="ghost" onClick={() => onEdit(category)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => onDelete(category)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoriesTable
