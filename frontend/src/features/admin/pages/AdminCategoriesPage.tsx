import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import { pushToast } from '../../../shared/store/ui.store'
import {
  selectAdminCategories,
  selectAdminProducts,
} from '../admin.selectors'
import AdminStatCard from '../components/AdminStatCard'
import {
  addCategory,
  deleteCategory,
  updateCategory,
} from '../admin.store'
import type { AdminCategory } from '../admin.types'

type CategoryFormState = {
  name: string
  description: string
}

type CategoryErrors = {
  name?: string
}

type ConfirmState = {
  isOpen: boolean
  targetId: string | null
  reason: string
}

const emptyForm: CategoryFormState = {
  name: '',
  description: '',
}

function AdminCategoriesPage() {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectAdminCategories)
  const products = useAppSelector(selectAdminProducts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCategory | null>(null)
  const [form, setForm] = useState<CategoryFormState>(emptyForm)
  const [errors, setErrors] = useState<CategoryErrors>({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    targetId: null,
    reason: '',
  })

  const productCounts = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      acc[product.categoryId] = (acc[product.categoryId] ?? 0) + 1
      return acc
    }, {})
  }, [products])

  const stats = useMemo(() => {
    const activeCount = categories.filter((category) => category.isActive).length
    return {
      total: categories.length,
      active: activeCount,
      hidden: Math.max(categories.length - activeCount, 0),
      products: products.length,
    }
  }, [categories, products.length])

  const openAddModal = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (category: AdminCategory) => {
    setEditing(category)
    setForm({
      name: category.name,
      description: category.description,
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
    const nextErrors: CategoryErrors = {}
    if (!form.name.trim()) {
      nextErrors.name = 'Category name is required.'
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
          description: 'Category name is required.',
          variant: 'error',
        }),
      )
      return
    }
    setIsSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
    }
    if (editing) {
      dispatch(
        updateCategory({
          id: editing.id,
          isActive: editing.isActive,
          ...payload,
        }),
      )
      dispatch(
        pushToast({
          title: 'Category updated',
          description: `${payload.name} was saved.`,
          variant: 'success',
        }),
      )
    } else {
      dispatch(addCategory(payload))
      dispatch(
        pushToast({
          title: 'Category added',
          description: `${payload.name} was created.`,
          variant: 'success',
        }),
      )
    }
    setTimeout(() => {
      setIsSaving(false)
      closeModal()
    }, 200)
  }

  const handleDeleteRequest = (category: AdminCategory) => {
    const count = productCounts[category.id] ?? 0
    if (count > 0) {
      dispatch(
        pushToast({
          title: 'Category has products',
          description: 'Move products to another category before deleting.',
          variant: 'error',
        }),
      )
      return
    }
    setConfirm({ isOpen: true, targetId: category.id, reason: '' })
  }

  const handleDeleteConfirm = () => {
    if (!confirm.targetId) {
      return
    }
    const category = categories.find((item) => item.id === confirm.targetId)
    dispatch(deleteCategory(confirm.targetId))
    dispatch(
      pushToast({
        title: 'Category deleted',
        description: category ? `${category.name} was removed.` : 'Category removed.',
        variant: 'warning',
      }),
    )
    setConfirm({ isOpen: false, targetId: null, reason: '' })
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p className="muted">Group menu items for easier browsing.</p>
        </div>
        <Button variant="primary" onClick={openAddModal} icon="add">
          Add Category
        </Button>
      </div>

      <div className="admin-metrics">
        <AdminStatCard label="Total Categories" value={String(stats.total)} icon="category" />
        <AdminStatCard label="Active" value={String(stats.active)} helper="Visible" icon="visibility" />
        <AdminStatCard label="Hidden" value={String(stats.hidden)} helper="Not visible" icon="visibility_off" />
        <AdminStatCard label="Menu Items" value={String(stats.products)} icon="inventory_2" />
      </div>

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
                <span
                  className={`chip ${category.isActive ? 'chip-active' : 'chip-inactive'}`}
                >
                  {category.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <span className="muted">
                {category.description || 'No description'}
              </span>
              <span className="admin-count">{productCounts[category.id] ?? 0}</span>
              <div className="admin-row-actions">
                <Button variant="ghost" onClick={() => openEditModal(category)} icon="edit">
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDeleteRequest(category)} icon="delete">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editing ? 'Edit Category' : 'Add Category'}
        onClose={closeModal}
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        }
      >
        {formError ? <div className="form-error">{formError}</div> : null}
        <Input
          label="Category name"
          placeholder="e.g. Burgers"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          error={errors.name}
        />
        <label className="input-field">
          <span className="input-label">Description</span>
          <textarea
            className="textarea"
            placeholder="Short description (optional)"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.isOpen}
        title="Delete category"
        description="This will remove the category from the admin list."
        reason={confirm.reason}
        onReasonChange={(value) => setConfirm((prev) => ({ ...prev, reason: value }))}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirm({ isOpen: false, targetId: null, reason: '' })}
        confirmLabel="Delete"
      />
    </div>
  )
}

export default AdminCategoriesPage
