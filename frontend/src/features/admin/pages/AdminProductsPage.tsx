import { nanoid } from '@reduxjs/toolkit'
import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Select from '../../../shared/components/ui/Select'
import { formatCurrency } from '../../../shared/lib/format'
import { pushToast } from '../../../shared/store/ui.store'
import {
  selectAdminCategories,
  selectAdminProducts,
} from '../admin.selectors'
import AdminStatCard from '../components/AdminStatCard'
import { dispatchAndSyncAdmin } from '../admin.actions'
import {
  addProduct,
  toggleProductActive,
  updateProduct,
} from '../admin.store'
import { saveRecipe, addIngredient, updateIngredient } from '../../inventory/inventory.store'
import { selectInventoryRecipes, selectInventoryIngredients } from '../../inventory/inventory.selectors'
import type { AdminProduct } from '../admin.types'
import type { RecipeLine, MeasurementUnit } from '../../inventory/inventory.types'

type RecipeLineDraft = {
  id: string
  ingredientId: string
  qty: string
  unit: MeasurementUnit | ''
}

type ProductFormState = {
  productType: 'raw' | 'non_raw'
  name: string
  category: string
  productClass: string
  description: string
  // Raw Material fields
  ingredientId: string
  additionalIngredientIds: string[]
  currentStock: string
  unit: string
  lowStockAlert: string
  unitCost: string
  // Non-Raw Product fields
  costPrice: string
  sellingPrice: string
  recipeLines: RecipeLineDraft[]
}

type ProductErrors = {
  name?: string
  category?: string
  ingredientId?: string
  currentStock?: string
  unit?: string
  lowStockAlert?: string
  unitCost?: string
  costPrice?: string
  sellingPrice?: string
  priceValidation?: string
  recipeLines?: string
}

const createEmptyRecipeLine = (): RecipeLineDraft => ({
  id: nanoid(),
  ingredientId: '',
  qty: '',
  unit: '',
})

const normalizeCategoryKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')

const resolveCategoryName = (
  categoryId: string,
  categories: Array<{ id: string; name: string }>,
) => {
  const exact = categories.find((category) => category.id === categoryId)
  if (exact) {
    return exact.name
  }

  const normalizedId = normalizeCategoryKey(categoryId)
  const relaxed = categories.find(
    (category) =>
      normalizeCategoryKey(category.id) === normalizedId ||
      normalizeCategoryKey(category.name) === normalizedId,
  )

  return relaxed?.name ?? (categoryId || 'Unassigned')
}

const emptyForm: ProductFormState = {
  productType: 'non_raw',
  name: '',
  description: '',
  category: '',
  productClass: 'standard',
  ingredientId: '',
  additionalIngredientIds: [],
  costPrice: '',
  sellingPrice: '',
  currentStock: '',
  unit: '',
  lowStockAlert: '',
  unitCost: '',
  recipeLines: [createEmptyRecipeLine()],
}

function AdminProductsPage() {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectAdminCategories)
  const products = useAppSelector(selectAdminProducts)
  const recipes = useAppSelector(selectInventoryRecipes)
  const ingredients = useAppSelector(selectInventoryIngredients)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [classFilter, setClassFilter] = useState<'all' | 'RAW' | 'NON_RAW'>('all')
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

  const classOptions = useMemo(
    () => [
      { value: 'all', label: 'All classes' },
      { value: 'RAW', label: 'Raw' },
      { value: 'NON_RAW', label: 'Non-Raw' },
    ],
    [],
  )

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return products.filter((product) => {
      if (categoryFilter !== 'all' && product.categoryId !== categoryFilter) {
        return false
      }
      if (classFilter !== 'all' && product.productClass !== classFilter) {
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
  }, [categoryFilter, classFilter, products, query])

  const openAddModal = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (product: AdminProduct) => {
    setEditing(product)
    const existingRecipe = recipes.find((r) => r.productId === product.id)
    const recipeLines: RecipeLineDraft[] = existingRecipe
      ? existingRecipe.lines.map((line) => ({
          id: nanoid(),
          ingredientId: line.ingredientId,
          qty: String(line.qty),
          unit: line.unit || '',
        }))
      : [createEmptyRecipeLine()]
    const rawLinkedIngredientIds =
      product.productClass === 'RAW' ? (existingRecipe?.lines ?? []).map((line) => line.ingredientId) : []
    const primaryRawIngredientId = rawLinkedIngredientIds[0] ?? ''
    const additionalRawIngredientIds = rawLinkedIngredientIds.slice(1)
    const matchedIngredient =
      product.productClass === 'RAW'
        ? ingredients.find((ingredient) =>
            primaryRawIngredientId
              ? ingredient.id === primaryRawIngredientId
              : ingredient.name.toLowerCase() === product.name.toLowerCase(),
          )
        : null

    setForm({
      productType: product.productClass === 'RAW' ? 'raw' : 'non_raw',
      name: product.name,
      category: product.categoryId,
      productClass: product.productClass === 'RAW' ? 'raw' : 'non_raw', // Keep form productClass for display
      description: product.description,
      ingredientId: matchedIngredient?.id ?? primaryRawIngredientId,
      additionalIngredientIds: additionalRawIngredientIds,
      currentStock: matchedIngredient ? String(matchedIngredient.onHand) : '',
      unit: matchedIngredient?.baseUnit ?? '',
      lowStockAlert: matchedIngredient ? String(matchedIngredient.reorderLevel) : '',
      unitCost: matchedIngredient ? String(matchedIngredient.unitCost) : String(product.baseCost),
      costPrice: String(product.baseCost),
      sellingPrice: String(product.price),
      recipeLines,
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
    if (!form.category) {
      nextErrors.category = 'Select a category.'
    }
    if (form.productType === 'raw') {
      if (!form.ingredientId) {
        nextErrors.ingredientId = 'Select an ingredient.'
      }
      const stockValue = Number(form.currentStock)
      if (!Number.isFinite(stockValue) || stockValue < 0) {
        nextErrors.currentStock = 'Enter a valid stock quantity (≥ 0).'
      }
      if (!form.unit) {
        nextErrors.unit = 'Select a unit.'
      }
      const alertValue = Number(form.lowStockAlert)
      if (!Number.isFinite(alertValue) || alertValue < 0) {
        nextErrors.lowStockAlert = 'Enter a valid alert quantity (≥ 0).'
      }
      const costValue = Number(form.unitCost)
      if (!Number.isFinite(costValue) || costValue < 0) {
        nextErrors.unitCost = 'Enter a valid unit cost (≥ 0).'
      }
      const sellingValue = Number(form.sellingPrice)
      if (!Number.isFinite(sellingValue) || sellingValue < 0) {
        nextErrors.sellingPrice = 'Enter a valid selling price (≥ 0).'
      }
    } else {
      const costValue = Number(form.costPrice)
      if (!Number.isFinite(costValue) || costValue < 0) {
        nextErrors.costPrice = 'Enter a valid cost price (≥ 0).'
      }
      const priceValue = Number(form.sellingPrice)
      if (!Number.isFinite(priceValue) || priceValue <= 0) {
        nextErrors.sellingPrice = 'Enter a valid selling price (> 0).'
      }
      if (Number.isFinite(costValue) && Number.isFinite(priceValue) && priceValue < costValue) {
        nextErrors.priceValidation = 'Selling price must be greater than or equal to cost price.'
      }
      const validRecipeLines = form.recipeLines.filter((line) => line.ingredientId && line.qty)
      if (validRecipeLines.length === 0) {
        nextErrors.recipeLines = 'At least one ingredient is required.'
      }
    }
    setErrors(nextErrors)
    return { nextErrors }
  }

  const handleIngredientSelect = (ingredientId: string) => {
    const selectedIngredient = ingredients.find((ingredient) => ingredient.id === ingredientId)
    if (!selectedIngredient) {
      setForm((prev) => ({
        ...prev,
        ingredientId,
        currentStock: '',
        unit: '',
        lowStockAlert: '',
        unitCost: '',
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      ingredientId,
      currentStock: String(selectedIngredient.onHand),
      unit: selectedIngredient.baseUnit,
      lowStockAlert: String(selectedIngredient.reorderLevel),
      unitCost: String(selectedIngredient.unitCost),
    }))
  }

  const handleAdditionalIngredientSelect = (index: number, ingredientId: string) => {
    setForm((prev) => {
      const next = [...prev.additionalIngredientIds]
      next[index] = ingredientId
      return { ...prev, additionalIngredientIds: next }
    })
  }

  const handleAddIngredientLink = () => {
    setForm((prev) => ({
      ...prev,
      additionalIngredientIds: [...prev.additionalIngredientIds, ''],
    }))
  }

  const handleRemoveIngredientLink = (index: number) => {
    setForm((prev) => ({
      ...prev,
      additionalIngredientIds: prev.additionalIngredientIds.filter((_, rowIndex) => rowIndex !== index),
    }))
  }

  const handleSave = async () => {
    if (isSaving) {
      return
    }
    const { nextErrors } = validate()
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

    const costValue = form.productType === 'raw' ? Number(form.unitCost) : Number(form.costPrice)
    const priceValue = Number(form.sellingPrice)

    const productClass: 'RAW' | 'NON_RAW' =
      form.productType === 'raw' ? 'RAW' : 'NON_RAW'
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: priceValue,
      baseCost: costValue,
      productClass,
      categoryId: form.category,
    }

    // Handle raw material inventory sync
    if (form.productType === 'raw') {
      const selectedIngredient = ingredients.find((ing) => ing.id === form.ingredientId)
      const name = form.name.trim()
      const categoryName =
        categories.find((cat) => cat.id === form.category)?.name || 'Raw Materials'
      const ingredientPayload = {
        name,
        category: categoryName,
        baseUnit: form.unit as any,
        onHand: Number(form.currentStock),
        reorderLevel: Number(form.lowStockAlert),
        unitCost: Number(form.unitCost),
      }

      if (selectedIngredient) {
        dispatch(
          updateIngredient({
            id: selectedIngredient.id,
            ...ingredientPayload,
          }),
        )
      } else {
        dispatch(addIngredient(ingredientPayload))
      }
    }

    // Prepare recipe lines
    const validRecipeLines: RecipeLine[] =
      form.productType === 'raw'
        ? Array.from(
            new Set(
              [form.ingredientId, ...form.additionalIngredientIds]
                .map((value) => value.trim())
                .filter(Boolean),
            ),
          ).map((ingredientId) => ({
            ingredientId,
            qty: 1,
          }))
        : form.recipeLines
            .filter((line) => line.ingredientId && line.qty)
            .map((line) => ({
              ingredientId: line.ingredientId,
              qty: Number(line.qty),
              unit: (line.unit as MeasurementUnit) || undefined,
            }))

    let productId = editing?.id || ''

    if (editing) {
      const synced = await dispatchAndSyncAdmin(
        dispatch,
        updateProduct({
          id: editing.id,
          isActive: editing.isActive,
          ...payload,
        }),
      )
      if (synced) {
        productId = editing.id
        dispatch(
          pushToast({
            title: 'Product updated',
            description: `${payload.name} was saved.`,
            variant: 'success',
          }),
        )
      }
    } else {
      const synced = await dispatchAndSyncAdmin(dispatch, addProduct(payload))
      if (synced) {
        // Find the newly added product
        const newProduct = products.find(
          (p) => p.name === payload.name && p.price === priceValue,
        )
        if (newProduct) {
          productId = newProduct.id
        }
        dispatch(
          pushToast({
            title: 'Product added',
            description: `${payload.name} was created.`,
            variant: 'success',
          }),
        )
      }
    }

    // Save recipe if there are recipe lines and product was saved
    if (productId && validRecipeLines.length > 0) {
      const recipePayload = {
        productId,
        lines: validRecipeLines,
      }
      await dispatchAndSyncAdmin(dispatch, saveRecipe(recipePayload))
    }

    setTimeout(() => {
      setIsSaving(false)
      closeModal()
    }, 200)
  }

  const handleClear = () => {
    setForm(emptyForm)
    setErrors({})
    setFormError('')
  }

  const handleToggleActive = async (product: AdminProduct) => {
    const synced = await dispatchAndSyncAdmin(dispatch, toggleProductActive(product.id))
    if (synced) {
      dispatch(
        pushToast({
          title: product.isActive ? 'Product hidden' : 'Product activated',
          description: product.name,
          variant: 'info',
        }),
      )
    }
  }

  const markupPercentage = useMemo(() => {
    if (form.productType !== 'non_raw') return null
    const price = Number(form.sellingPrice)
    const baseCost = Number(form.costPrice)
    if (!Number.isFinite(price) || !Number.isFinite(baseCost) || baseCost === 0) {
      return null
    }
    return ((price - baseCost) / baseCost) * 100
  }, [form.sellingPrice, form.costPrice, form.productType])

  const profitMarginPercent = useMemo(() => {
    if (form.productType !== 'non_raw') return null
    const price = Number(form.sellingPrice)
    const baseCost = Number(form.costPrice)
    if (!Number.isFinite(price) || !Number.isFinite(baseCost) || price === 0) {
      return null
    }
    return ((price - baseCost) / price) * 100
  }, [form.sellingPrice, form.costPrice, form.productType])

  const profitPerItem = useMemo(() => {
    if (form.productType !== 'non_raw') return null
    const price = Number(form.sellingPrice)
    const baseCost = Number(form.costPrice)
    if (!Number.isFinite(price) || !Number.isFinite(baseCost)) {
      return null
    }
    return price - baseCost
  }, [form.sellingPrice, form.costPrice, form.productType])

  // Demo preload data
  const demoProducts = {
    espresso: {
      productType: 'non_raw' as const,
      name: 'Espresso',
      category: 'beverages',
      productClass: 'premium',
      description: 'Rich, bold espresso shot made from premium Arabica beans',
      costPrice: '25.00',
      sellingPrice: '45.00',
      recipeLines: [
        { id: nanoid(), ingredientId: 'coffee-beans', qty: '18', unit: 'g' },
        { id: nanoid(), ingredientId: 'milk', qty: '0', unit: '' },
      ],
    },
    cheeseburger: {
      productType: 'non_raw' as const,
      name: 'Cheeseburger',
      category: 'food',
      productClass: 'standard',
      description: 'Classic cheeseburger with lettuce, tomato, and special sauce',
      costPrice: '85.00',
      sellingPrice: '150.00',
      recipeLines: [
        { id: nanoid(), ingredientId: 'beef-patty', qty: '150', unit: 'g' },
        { id: nanoid(), ingredientId: 'cheese-slice', qty: '1', unit: 'pcs' },
        { id: nanoid(), ingredientId: 'bun', qty: '1', unit: 'pcs' },
        { id: nanoid(), ingredientId: 'lettuce', qty: '20', unit: 'g' },
        { id: nanoid(), ingredientId: 'tomato', qty: '30', unit: 'g' },
      ],
    },
    coffeeBeans: {
      productType: 'raw' as const,
      name: 'Coffee Beans',
      category: 'beverages',
      productClass: 'premium',
      description: 'Premium Arabica coffee beans, freshly roasted',
      currentStock: '5000',
      unit: 'g',
      lowStockAlert: '1000',
      unitCost: '8.50',
      costPrice: '',
      sellingPrice: '12.00',
      recipeLines: [createEmptyRecipeLine()],
    },
  }

  const loadDemoProduct = (key: keyof typeof demoProducts) => {
    const demo = demoProducts[key]
    const categoryExists = categories.some((category) => category.id === demo.category)
    const fallbackCategoryId = categories[0]?.id ?? ''
    setForm({
      ...emptyForm,
      ...demo,
      category: categoryExists ? demo.category : fallbackCategoryId,
      recipeLines: demo.recipeLines.map(line => ({
        ...line,
        unit: line.unit as MeasurementUnit | '',
      })),
    })
    setErrors({})
    setFormError('')
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Menu Items</h2>
          <p className="muted">Search, edit, and activate menu items.</p>
        </div>
        <Button variant="primary" onClick={openAddModal} icon="add">
          Add Product
        </Button>
      </div>

      <div className="admin-metrics">
        <AdminStatCard label="Total Menu Items" value={String(stats.total)} icon="inventory_2" />
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
        <Select
          label="Class"
          value={classFilter}
          onChange={(event) =>
            setClassFilter(event.target.value as 'all' | 'RAW' | 'NON_RAW')
          }
          options={classOptions}
        />
      </div>

      <div className="panel admin-card">
      <div className="admin-table admin-table-products">
          <div className="admin-table-head admin-table-row products">
            <span>SKU</span>
            <span>Product</span>
            <span>Class</span>
            <span>Category</span>
            <span>SRP</span>
            <span>Base Cost</span>
            <span>Markup</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filteredProducts.map((product) => {
            const categoryName = resolveCategoryName(product.categoryId, categories)
            const markupPct =
              product.baseCost > 0
                ? ((product.price - product.baseCost) / product.baseCost) * 100
                : 0
            return (
              <div key={product.id} className="admin-table-row products">
                <span className="admin-count">{product.sku}</span>
                <div className="admin-cell-title">
                  <strong>{product.name}</strong>
                  <p className="muted">{product.description}</p>
                </div>
                <span>{product.productClass === 'RAW' ? 'Raw' : 'Non-Raw'}</span>
                <span>{categoryName}</span>
                <span className="admin-price">{formatCurrency(product.price)}</span>
                <span className="admin-price">{formatCurrency(product.baseCost)}</span>
                <span className={`admin-count${markupPct < 0 ? ' inventory-stock--low' : ''}`}>
                  {Math.round(markupPct)}%
                </span>
                <span className={`chip ${product.isActive ? 'chip-active' : 'chip-inactive'}`}>
                  {product.isActive ? 'Active' : 'Hidden'}
                </span>
                <div className="admin-row-actions">
                  <Button variant="primary" onClick={() => openEditModal(product)} icon="edit">
                    Edit
                  </Button>
                  <Button
                    variant={product.isActive ? 'danger' : 'secondary'}
                    onClick={() => {
                      void handleToggleActive(product)
                    }}
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

      {/* Full-page Product Modal (centered, no backdrop) */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            width: 'min(1120px, 100%)',
            maxHeight: 'min(92vh, 960px)',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 18px 42px rgba(16, 24, 40, 0.35)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                {editing ? 'Edit Product' : 'Add Product'}
              </h2>
            </div>
            <button
              onClick={closeModal}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#64748b',
                padding: '4px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Demo Pills */}
          {!editing && (
            <div style={{
              backgroundColor: 'white',
              borderBottom: '1px solid #e2e8f0',
              padding: '16px 24px',
            }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                  Demo Products:
                </span>
                <button
                  onClick={() => loadDemoProduct('espresso')}
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  Espresso
                </button>
                <button
                  onClick={() => loadDemoProduct('cheeseburger')}
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  Cheeseburger
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}>
            {formError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '24px',
                color: '#dc2626',
                fontSize: '14px',
              }}>
                {formError}
              </div>
            )}

            {/* Shared Fields */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
              }}>
                Product Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px',
                  }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.name ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                    }}
                    placeholder="e.g. Classic Cheeseburger"
                  />
                  {errors.name && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.name}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px',
                  }}>
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.category ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                    }}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.category}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minHeight: '80px',
                    backgroundColor: 'white',
                    resize: 'vertical',
                  }}
                  placeholder="Optional product description"
                />
              </div>
            </div>

            {/* Raw Material Fields */}
            {form.productType === 'raw' && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px',
                }}>
                  Ingredient Link
                </h3>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px',
                  }}>
                    Select Ingredient *
                  </label>
                  <select
                    value={form.ingredientId}
                    onChange={(e) => handleIngredientSelect(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.ingredientId ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                    }}
                  >
                    <option value="">-- Select an ingredient --</option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.baseUnit})
                      </option>
                    ))}
                  </select>
                  {errors.ingredientId && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.ingredientId}
                    </div>
                  )}
                </div>
                {form.additionalIngredientIds.map((ingredientId, idx) => (
                  <div key={`raw-link-${idx}`} style={{ marginTop: '12px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px',
                    }}>
                      Additional Ingredient {idx + 1}
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        value={ingredientId}
                        onChange={(e) => handleAdditionalIngredientSelect(idx, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'white',
                        }}
                      >
                        <option value="">-- Select an ingredient --</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.baseUnit})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientLink(idx)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: '#f8fafc',
                          color: '#374151',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={handleAddIngredientLink}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      color: '#1f2937',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    + Add Ingredient Link
                  </button>
                </div>

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px',
                  marginTop: '24px',
                }}>
                  Inventory Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px',
                    }}>
                      Current Stock *
                    </label>
                    <input
                      type="number"
                      value={form.currentStock}
                      onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: errors.currentStock ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                      }}
                      placeholder="0"
                      min="0"
                    />
                    {errors.currentStock && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {errors.currentStock}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px',
                    }}>
                      Unit *
                    </label>
                    <select
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: errors.unit ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                      }}
                    >
                      <option value="">Select unit</option>
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="l">Liters (l)</option>
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="tbsp">Tablespoon (tbsp)</option>
                      <option value="tsp">Teaspoon (tsp)</option>
                    </select>
                    {errors.unit && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {errors.unit}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px',
                    }}>
                      Low Stock Alert *
                    </label>
                    <input
                      type="number"
                      value={form.lowStockAlert}
                      onChange={(e) => setForm({ ...form, lowStockAlert: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: errors.lowStockAlert ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                      }}
                      placeholder="0"
                      min="0"
                    />
                    {errors.lowStockAlert && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {errors.lowStockAlert}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px',
                  }}>
                    Unit Cost (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.unitCost}
                    onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                    style={{
                      width: '200px',
                      padding: '8px 12px',
                      border: errors.unitCost ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                    }}
                    placeholder="0.00"
                    min="0"
                  />
                  {errors.unitCost && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.unitCost}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px',
                  }}>
                    Selling Price (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    style={{
                      width: '200px',
                      padding: '8px 12px',
                      border: errors.sellingPrice ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                    }}
                    placeholder="0.00"
                    min="0"
                  />
                  {errors.sellingPrice && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.sellingPrice}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Non-Raw Product Fields */}
            {form.productType === 'non_raw' && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px',
                }}>
                  Pricing & Margins
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px',
                    }}>
                      Cost Price (₱) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.costPrice}
                      onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: errors.costPrice ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                      }}
                      placeholder="0.00"
                      min="0"
                    />
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Cost to produce or acquire this item
                    </div>
                    {errors.costPrice && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {errors.costPrice}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px',
                    }}>
                      Selling Price (₱) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.sellingPrice}
                      onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: errors.sellingPrice || errors.priceValidation ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                      }}
                      placeholder="0.00"
                      min="0"
                    />
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Price charged to customers
                    </div>
                    {errors.sellingPrice && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {errors.sellingPrice}
                      </div>
                    )}
                    {errors.priceValidation && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {errors.priceValidation}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profit Indicators */}
                {profitPerItem !== null && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    backgroundColor: markupPercentage !== null && markupPercentage >= 30 ? '#f0fdf4' :
                                   markupPercentage !== null && markupPercentage >= 15 ? '#fffbeb' : '#fef2f2',
                    border: `1px solid ${markupPercentage !== null && markupPercentage >= 30 ? '#bbf7d0' :
                                        markupPercentage !== null && markupPercentage >= 15 ? '#fde68a' : '#fecaca'}`,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>
                        PROFIT/ITEM
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: markupPercentage !== null && markupPercentage >= 30 ? '#166534' :
                               markupPercentage !== null && markupPercentage >= 15 ? '#92400e' : '#dc2626',
                      }}>
                        ₱{profitPerItem.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>
                        MARKUP
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: markupPercentage !== null && markupPercentage >= 30 ? '#166534' :
                               markupPercentage !== null && markupPercentage >= 15 ? '#92400e' : '#dc2626',
                      }}>
                        {markupPercentage !== null ? `${Math.round(markupPercentage)}%` : '—'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>
                        PROFIT MARGIN
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: markupPercentage !== null && markupPercentage >= 30 ? '#166534' :
                               markupPercentage !== null && markupPercentage >= 15 ? '#92400e' : '#dc2626',
                      }}>
                        {profitMarginPercent !== null ? `${Math.round(profitMarginPercent)}%` : '—'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recipe Builder */}
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px',
                }}>
                  Recipe / Ingredients
                </h3>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                  Add ingredients that make up this product for inventory tracking and auto-deduction
                </div>

                {form.recipeLines.map((line, idx) => (
                  <div key={line.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto',
                    gap: '12px',
                    alignItems: 'end',
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                  }}>
                    <div>
                      {idx === 0 && (
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '6px',
                        }}>
                          Ingredient *
                        </label>
                      )}
                      <select
                        value={line.ingredientId}
                        onChange={(e) => {
                          const updated = form.recipeLines.map((l, i) =>
                            i === idx ? { ...l, ingredientId: e.target.value } : l,
                          )
                          setForm({ ...form, recipeLines: updated })
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'white',
                        }}
                      >
                        <option value="">Select ingredient</option>
                        <option value="coffee-beans">Coffee Beans</option>
                        <option value="milk">Milk</option>
                        <option value="beef-patty">Beef Patty</option>
                        <option value="cheese-slice">Cheese Slice</option>
                        <option value="bun">Bun</option>
                        <option value="lettuce">Lettuce</option>
                        <option value="tomato">Tomato</option>
                        <option value="sugar">Sugar</option>
                        <option value="flour">Flour</option>
                      </select>
                    </div>
                    <div>
                      {idx === 0 && (
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '6px',
                        }}>
                          Qty *
                        </label>
                      )}
                      <input
                        type="number"
                        step="0.01"
                        value={line.qty}
                        onChange={(e) => {
                          const updated = form.recipeLines.map((l, i) =>
                            i === idx ? { ...l, qty: e.target.value } : l,
                          )
                          setForm({ ...form, recipeLines: updated })
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'white',
                        }}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      {idx === 0 && (
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '6px',
                        }}>
                          Unit *
                        </label>
                      )}
                      <select
                        value={line.unit}
                        onChange={(e) => {
                          const updated = form.recipeLines.map((l, i) =>
                            i === idx ? { ...l, unit: e.target.value as MeasurementUnit | '' } : l,
                          )
                          setForm({ ...form, recipeLines: updated })
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'white',
                        }}
                      >
                        <option value="">Select unit</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="pcs">pcs</option>
                        <option value="tbsp">tbsp</option>
                        <option value="tsp">tsp</option>
                        <option value="cup">cup</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.recipeLines.filter((_, i) => i !== idx)
                        setForm({
                          ...form,
                          recipeLines: updated.length === 0 ? [createEmptyRecipeLine()] : updated,
                        })
                      }}
                      style={{
                        padding: '8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: idx === 0 ? '24px' : '0',
                      }}
                      title="Remove ingredient"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setForm({
                      ...form,
                      recipeLines: [...form.recipeLines, createEmptyRecipeLine()],
                    })
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#374151',
                    marginTop: '12px',
                  }}
                >
                  + Add Ingredient
                </button>

                {errors.recipeLines && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
                    {errors.recipeLines}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: 'white',
            borderTop: '1px solid #e2e8f0',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <button
              onClick={handleClear}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
              }}
            >
              Clear
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={isSaving}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isSaving ? '#9ca3af' : '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: '500',
                }}
              >
                {isSaving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default AdminProductsPage
