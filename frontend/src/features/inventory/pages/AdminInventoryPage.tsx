import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import Select from '../../../shared/components/ui/Select'
import { pushToast } from '../../../shared/store/ui.store'
import AdminStatCard from '../../admin/components/AdminStatCard'
import {
  addIngredient,
  adjustStock,
  updateIngredient,
} from '../inventory.store'
import {
  selectInventoryIngredients,
} from '../inventory.selectors'
import type { Ingredient, IngredientUnit } from '../inventory.types'
import { formatIngredientQty } from '../inventory.logic'

type IngredientFormState = {
  name: string
  category: string
  unit: IngredientUnit
  onHand: string
  reorderLevel: string
}

type IngredientErrors = {
  name?: string
  category?: string
  unit?: string
  onHand?: string
  reorderLevel?: string
}

type AdjustFormState = {
  ingredientId: string
  type: 'IN' | 'OUT'
  qty: string
  reason: string
}

type AdjustErrors = {
  ingredientId?: string
  qty?: string
  reason?: string
}

const emptyIngredientForm: IngredientFormState = {
  name: '',
  category: '',
  unit: 'pcs',
  onHand: '',
  reorderLevel: '',
}

const emptyAdjustForm: AdjustFormState = {
  ingredientId: '',
  type: 'IN',
  qty: '',
  reason: '',
}

const unitOptions = [
  { value: 'pcs', label: 'pcs' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'l' },
]

function AdminInventoryPage() {
  const dispatch = useAppDispatch()
  const ingredients = useAppSelector(selectInventoryIngredients)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [editing, setEditing] = useState<Ingredient | null>(null)
  const [form, setForm] = useState<IngredientFormState>(emptyIngredientForm)
  const [errors, setErrors] = useState<IngredientErrors>({})
  const [formError, setFormError] = useState('')
  const [adjustForm, setAdjustForm] = useState<AdjustFormState>(emptyAdjustForm)
  const [adjustErrors, setAdjustErrors] = useState<AdjustErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  const categories = useMemo(() => {
    const unique = new Set(ingredients.map((item) => item.category))
    return Array.from(unique).sort()
  }, [ingredients])

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'All categories' },
      ...categories.map((category) => ({ value: category, label: category })),
    ],
    [categories],
  )

  const ingredientOptions = useMemo(
    () => [
      { value: '', label: 'Select ingredient' },
      ...ingredients.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    ],
    [ingredients],
  )

  const stats = useMemo(() => {
    const lowStock = ingredients.filter(
      (item) => item.onHand <= item.reorderLevel,
    ).length
    return {
      total: ingredients.length,
      lowStock,
      categories: categories.length,
    }
  }, [categories.length, ingredients])

  const filteredIngredients = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return ingredients.filter((ingredient) => {
      if (categoryFilter !== 'all' && ingredient.category !== categoryFilter) {
        return false
      }
      if (!normalized) {
        return true
      }
      return ingredient.name.toLowerCase().includes(normalized)
    })
  }, [categoryFilter, ingredients, query])

  const openAddModal = () => {
    setEditing(null)
    setForm(emptyIngredientForm)
    setErrors({})
    setFormError('')
    setIsIngredientModalOpen(true)
  }

  const openEditModal = (ingredient: Ingredient) => {
    setEditing(ingredient)
    setForm({
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      onHand: String(ingredient.onHand),
      reorderLevel: String(ingredient.reorderLevel),
    })
    setErrors({})
    setFormError('')
    setIsIngredientModalOpen(true)
  }

  const openAdjustModal = (ingredientId?: string) => {
    setAdjustForm({
      ingredientId: ingredientId ?? '',
      type: 'IN',
      qty: '',
      reason: '',
    })
    setAdjustErrors({})
    setIsAdjustModalOpen(true)
  }

  const closeIngredientModal = () => {
    setIsIngredientModalOpen(false)
    setEditing(null)
    setForm(emptyIngredientForm)
    setErrors({})
    setFormError('')
    setIsSaving(false)
  }

  const closeAdjustModal = () => {
    setIsAdjustModalOpen(false)
    setAdjustForm(emptyAdjustForm)
    setAdjustErrors({})
    setIsSaving(false)
  }

  const validateIngredient = () => {
    const nextErrors: IngredientErrors = {}
    if (!form.name.trim()) {
      nextErrors.name = 'Ingredient name is required.'
    }
    if (!form.category.trim()) {
      nextErrors.category = 'Category is required.'
    }
    if (!form.unit) {
      nextErrors.unit = 'Unit is required.'
    }
    const onHandValue = Number(form.onHand)
    if (!Number.isFinite(onHandValue) || onHandValue < 0) {
      nextErrors.onHand = 'Enter a valid on-hand quantity.'
    }
    const reorderValue = Number(form.reorderLevel)
    if (!Number.isFinite(reorderValue) || reorderValue < 0) {
      nextErrors.reorderLevel = 'Enter a valid reorder level.'
    }
    setErrors(nextErrors)
    return { nextErrors, onHandValue, reorderValue }
  }

  const handleSaveIngredient = () => {
    if (isSaving) {
      return
    }
    const { nextErrors, onHandValue, reorderValue } = validateIngredient()
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please fix the highlighted fields.')
      dispatch(
        pushToast({
          title: 'Fix validation errors',
          description: 'Check the ingredient fields.',
          variant: 'error',
        }),
      )
      return
    }
    setIsSaving(true)

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      unit: form.unit,
      onHand: onHandValue,
      reorderLevel: reorderValue,
    }

    if (editing) {
      dispatch(updateIngredient({ id: editing.id, ...payload }))
      dispatch(
        pushToast({
          title: 'Ingredient updated',
          description: `${payload.name} was saved.`,
          variant: 'success',
        }),
      )
    } else {
      dispatch(addIngredient(payload))
      dispatch(
        pushToast({
          title: 'Ingredient added',
          description: `${payload.name} was created.`,
          variant: 'success',
        }),
      )
    }

    setTimeout(() => {
      setIsSaving(false)
      closeIngredientModal()
    }, 200)
  }

  const validateAdjustment = () => {
    const nextErrors: AdjustErrors = {}
    if (!adjustForm.ingredientId) {
      nextErrors.ingredientId = 'Select an ingredient.'
    }
    const qtyValue = Number(adjustForm.qty)
    if (!Number.isFinite(qtyValue) || qtyValue <= 0) {
      nextErrors.qty = 'Enter a valid quantity.'
    }
    if (!adjustForm.reason.trim()) {
      nextErrors.reason = 'Reason is required.'
    }
    setAdjustErrors(nextErrors)
    return { nextErrors, qtyValue }
  }

  const handleAdjustStock = () => {
    if (isSaving) {
      return
    }
    const { nextErrors, qtyValue } = validateAdjustment()
    if (Object.keys(nextErrors).length > 0) {
      dispatch(
        pushToast({
          title: 'Fix adjustment fields',
          description: 'Check the stock adjustment details.',
          variant: 'error',
        }),
      )
      return
    }

    const ingredient = ingredients.find(
      (item) => item.id === adjustForm.ingredientId,
    )
    if (!ingredient) {
      return
    }

    const delta = adjustForm.type === 'IN' ? qtyValue : -qtyValue
    const nextOnHand = ingredient.onHand + delta

    if (nextOnHand < 0) {
      dispatch(
        pushToast({
          title: 'Insufficient stock',
          description: `${ingredient.name} would go negative.`,
          variant: 'error',
        }),
      )
      return
    }

    setIsSaving(true)
    dispatch(
      adjustStock({
        ingredientId: adjustForm.ingredientId,
        type: adjustForm.type,
        qty: qtyValue,
        reason: adjustForm.reason.trim(),
      }),
    )
    dispatch(
      pushToast({
        title: 'Stock adjusted',
        description: `${ingredient.name} updated.`,
        variant: 'success',
      }),
    )
    setTimeout(() => {
      setIsSaving(false)
      closeAdjustModal()
    }, 200)
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Inventory</h2>
          <p className="muted">Manage ingredients, stock levels, and reorder points.</p>
        </div>
        <div className="admin-row-actions">
          <Button variant="outline" onClick={() => openAdjustModal()} icon="sync">
            Stock Adjustment
          </Button>
          <Button variant="primary" onClick={openAddModal} icon="add">
            Add Ingredient
          </Button>
        </div>
      </div>

      <div className="admin-metrics">
        <AdminStatCard label="Ingredients" value={String(stats.total)} icon="inventory" />
        <AdminStatCard label="Low Stock" value={String(stats.lowStock)} icon="warning" />
        <AdminStatCard label="Categories" value={String(stats.categories)} icon="category" />
      </div>

      <div className="admin-toolbar admin-toolbar-surface">
        <Input
          label="Search"
          placeholder="Search ingredients"
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
        <div className="admin-table admin-table-inventory">
          <div className="admin-table-head admin-table-row inventory">
            <span>Ingredient</span>
            <span>Category</span>
            <span>Unit</span>
            <span>On Hand</span>
            <span>Reorder</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filteredIngredients.map((ingredient) => {
            const isLow = ingredient.onHand <= ingredient.reorderLevel
            return (
              <div key={ingredient.id} className="admin-table-row inventory">
                <div className="inventory-meta">
                  <strong>{ingredient.name}</strong>
                  <span className="muted">{ingredient.category}</span>
                </div>
                <span>{ingredient.category}</span>
                <span className="inventory-unit">{ingredient.unit}</span>
                <span
                  className={`inventory-stock${isLow ? ' inventory-stock--low' : ''}`}
                >
                  {formatIngredientQty(ingredient.onHand, ingredient.unit)}
                </span>
                <span>{formatIngredientQty(ingredient.reorderLevel, ingredient.unit)}</span>
                <span
                  className={`inventory-badge ${
                    isLow ? 'inventory-badge--low' : 'inventory-badge--ok'
                  }`}
                >
                  {isLow ? 'Low' : 'OK'}
                </span>
                <div className="admin-row-actions">
                  <Button variant="ghost" onClick={() => openEditModal(ingredient)} icon="edit">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openAdjustModal(ingredient.id)}
                    icon="sync"
                  >
                    Adjust
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal
        isOpen={isIngredientModalOpen}
        title={editing ? 'Edit Ingredient' : 'Add Ingredient'}
        onClose={closeIngredientModal}
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={closeIngredientModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveIngredient} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Ingredient'}
            </Button>
          </div>
        }
      >
        {formError ? <div className="form-error">{formError}</div> : null}
        <Input
          label="Ingredient name"
          placeholder="e.g. Chicken Thigh"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          error={errors.name}
        />
        <Input
          label="Category"
          placeholder="e.g. Protein"
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
          error={errors.category}
        />
        <Select
          label="Unit"
          value={form.unit}
          onChange={(event) =>
            setForm({ ...form, unit: event.target.value as IngredientUnit })
          }
          options={unitOptions}
          error={errors.unit}
        />
        <Input
          label="On hand"
          placeholder="0"
          inputMode="decimal"
          value={form.onHand}
          onChange={(event) => setForm({ ...form, onHand: event.target.value })}
          error={errors.onHand}
        />
        <Input
          label="Reorder level"
          placeholder="0"
          inputMode="decimal"
          value={form.reorderLevel}
          onChange={(event) => setForm({ ...form, reorderLevel: event.target.value })}
          error={errors.reorderLevel}
        />
      </Modal>

      <Modal
        isOpen={isAdjustModalOpen}
        title="Stock Adjustment"
        onClose={closeAdjustModal}
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={closeAdjustModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdjustStock} disabled={isSaving}>
              Apply Adjustment
            </Button>
          </div>
        }
      >
        <Select
          label="Ingredient"
          value={adjustForm.ingredientId}
          onChange={(event) =>
            setAdjustForm({ ...adjustForm, ingredientId: event.target.value })
          }
          options={ingredientOptions}
          error={adjustErrors.ingredientId}
        />
        <Select
          label="Adjustment Type"
          value={adjustForm.type}
          onChange={(event) =>
            setAdjustForm({
              ...adjustForm,
              type: event.target.value as AdjustFormState['type'],
            })
          }
          options={[
            { value: 'IN', label: 'Stock In' },
            { value: 'OUT', label: 'Stock Out' },
          ]}
        />
        <Input
          label="Quantity"
          placeholder="0"
          inputMode="decimal"
          value={adjustForm.qty}
          onChange={(event) => setAdjustForm({ ...adjustForm, qty: event.target.value })}
          error={adjustErrors.qty}
        />
        <Input
          label="Reason"
          placeholder="Reason for adjustment"
          value={adjustForm.reason}
          onChange={(event) => setAdjustForm({ ...adjustForm, reason: event.target.value })}
          error={adjustErrors.reason}
        />
      </Modal>
    </div>
  )
}

export default AdminInventoryPage
