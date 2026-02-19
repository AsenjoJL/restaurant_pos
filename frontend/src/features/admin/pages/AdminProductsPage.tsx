import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import Select from '../../../shared/components/ui/Select'
import { formatCurrency } from '../../../shared/lib/format'
import { pushToast } from '../../../shared/store/ui.store'
import {
  selectAdminCategories,
  selectAdminProducts,
} from '../admin.selectors'
import AdminStatCard from '../components/AdminStatCard'
import {
  addProduct,
  toggleProductActive,
  updateProduct,
} from '../admin.store'
import type { AdminProduct } from '../admin.types'

type ProductFormState = {
  name: string
  description: string
  price: string
  categoryId: string
}

type ProductErrors = {
  name?: string
  price?: string
  categoryId?: string
}

const emptyForm: ProductFormState = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
}

function AdminProductsPage() {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectAdminCategories)
  const products = useAppSelector(selectAdminProducts)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [form, setForm] = useState<ProductFormState>(emptyForm)
  const [errors, setErrors] = useState<ProductErrors>({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'All categories' },
      ...categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    ],
    [categories],
  )

  const stats = useMemo(() => {
    const activeCount = products.filter((product) => product.isActive).length
    return {
      total: products.length,
      active: activeCount,
      hidden: Math.max(products.length - activeCount, 0),
      categories: categories.length,
    }
  }, [categories.length, products])

  const productCategoryOptions = useMemo(
    () => [
      { value: '', label: 'Select a category' },
      ...categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    ],
    [categories],
  )

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return products.filter((product) => {
      if (categoryFilter !== 'all' && product.categoryId !== categoryFilter) {
        return false
      }
      if (!normalized) {
        return true
      }
      return (
        product.name.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized)
      )
    })
  }, [categoryFilter, products, query])

  const openAddModal = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (product: AdminProduct) => {
    setEditing(product)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      categoryId: product.categoryId,
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
    const nextErrors: ProductErrors = {}
    if (!form.name.trim()) {
      nextErrors.name = 'Product name is required.'
    }
    const priceValue = Number(form.price)
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      nextErrors.price = 'Enter a valid price.'
    }
    if (!form.categoryId) {
      nextErrors.categoryId = 'Select a category.'
    }
    setErrors(nextErrors)
    return { nextErrors, priceValue }
  }

  const handleSave = () => {
    if (isSaving) {
      return
    }
    const { nextErrors, priceValue } = validate()
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please fix the highlighted fields.')
      dispatch(
        pushToast({
          title: 'Fix validation errors',
          description: 'Check the required product fields.',
          variant: 'error',
        }),
      )
      return
    }
    setIsSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: priceValue,
      categoryId: form.categoryId,
    }
    if (editing) {
      dispatch(
        updateProduct({
          id: editing.id,
          isActive: editing.isActive,
          ...payload,
        }),
      )
      dispatch(
        pushToast({
          title: 'Product updated',
          description: `${payload.name} was saved.`,
          variant: 'success',
        }),
      )
    } else {
      dispatch(addProduct(payload))
      dispatch(
        pushToast({
          title: 'Product added',
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

  const handleToggleActive = (product: AdminProduct) => {
    dispatch(toggleProductActive(product.id))
    dispatch(
      pushToast({
        title: product.isActive ? 'Product hidden' : 'Product activated',
        description: product.name,
        variant: 'info',
      }),
    )
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p className="muted">Search, edit, and activate menu items.</p>
        </div>
        <Button variant="primary" onClick={openAddModal} icon="add">
          Add Product
        </Button>
      </div>

      <div className="admin-metrics">
        <AdminStatCard label="Total Products" value={String(stats.total)} icon="inventory_2" />
        <AdminStatCard label="Active" value={String(stats.active)} helper="Visible on POS" icon="visibility" />
        <AdminStatCard label="Hidden" value={String(stats.hidden)} helper="Not visible" icon="visibility_off" />
        <AdminStatCard label="Categories" value={String(stats.categories)} icon="category" />
      </div>

      <div className="admin-toolbar admin-toolbar-surface">
        <Input
          label="Search"
          placeholder="Search products"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          label="Category"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          options={categoryOptions}
        />
      </div>

      <div className="panel admin-card">
        <div className="admin-table admin-table-products">
          <div className="admin-table-head admin-table-row products">
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filteredProducts.map((product) => {
            const category = categories.find((item) => item.id === product.categoryId)
            return (
              <div key={product.id} className="admin-table-row products">
                <div className="admin-cell-title">
                  <strong>{product.name}</strong>
                  <p className="muted">{product.description}</p>
                </div>
                <span>{category?.name ?? 'Unassigned'}</span>
                <span className="admin-price">{formatCurrency(product.price)}</span>
                <span className={`chip ${product.isActive ? 'chip-active' : 'chip-inactive'}`}>
                  {product.isActive ? 'Active' : 'Hidden'}
                </span>
                <div className="admin-row-actions">
                  <Button variant="ghost" onClick={() => openEditModal(product)} icon="edit">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleActive(product)}
                    icon={product.isActive ? 'toggle_off' : 'toggle_on'}
                  >
                    {product.isActive ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editing ? 'Edit Product' : 'Add Product'}
        onClose={closeModal}
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        }
      >
        {formError ? <div className="form-error">{formError}</div> : null}
        <Input
          label="Product name"
          placeholder="e.g. Classic Cheeseburger"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          error={errors.name}
        />
        <label className="input-field">
          <span className="input-label">Description</span>
          <textarea
            className="textarea"
            placeholder="Short description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>
        <Input
          label="Price (PHP)"
          placeholder="0.00"
          inputMode="decimal"
          value={form.price}
          onChange={(event) => setForm({ ...form, price: event.target.value })}
          error={errors.price}
        />
        <Select
          label="Category"
          value={form.categoryId}
          onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
          options={productCategoryOptions}
          error={errors.categoryId}
        />
      </Modal>
    </div>
  )
}

export default AdminProductsPage
