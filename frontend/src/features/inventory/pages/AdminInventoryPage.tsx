import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import Select from '../../../shared/components/ui/Select'
import { pushToast } from '../../../shared/store/ui.store'
import AdminStatCard from '../../admin/components/AdminStatCard'
import { formatCurrency } from '../../../shared/lib/format'
import {
  addIngredient,
  adjustStock,
  syncStockAdjustment,
  syncUpsertIngredient,
  updateIngredient,
} from '../inventory.store'
import {
  selectInventoryIngredients,
} from '../inventory.selectors'
import type { Ingredient, IngredientBaseUnit } from '../inventory.types'
import { formatIngredientQty } from '../inventory.logic'
import {
  calculateUnitCostFromBulk,
  INVENTORY_IMPORT_HEADERS,
  INVENTORY_IMPORT_SAMPLE,
  parseIngredientImportRow,
  parseSheetRows,
} from '../inventory.import'

type IngredientFormState = {
  name: string
  category: string
  baseUnit: IngredientBaseUnit
  onHand: string
  reorderLevel: string
  unitCost: string
  bulkQty: string
  bulkUnit: IngredientBaseUnit | 'kg' | 'l'
  bulkPrice: string
}

type IngredientErrors = {
  name?: string
  category?: string
  baseUnit?: string
  onHand?: string
  reorderLevel?: string
  unitCost?: string
}

type AdjustFormState = {
  ingredientId: string
  type: 'IN' | 'OUT'
  reasonType: 'RESTOCK' | 'WASTE' | 'VARIANCE' | 'MANUAL'
  qty: string
  reason: string
  countedQty: string
  reference: string
}

type AdjustErrors = {
  ingredientId?: string
  qty?: string
  reason?: string
}

const emptyIngredientForm: IngredientFormState = {
  name: '',
  category: '',
  baseUnit: 'pcs',
  onHand: '',
  reorderLevel: '',
  unitCost: '',
  bulkQty: '',
  bulkUnit: 'pcs',
  bulkPrice: '',
}

const emptyAdjustForm: AdjustFormState = {
  ingredientId: '',
  type: 'IN',
  reasonType: 'MANUAL',
  qty: '',
  reason: '',
  countedQty: '',
  reference: '',
}

const unitOptions = [
  { value: 'pcs', label: 'pcs' },
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
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
  const [isUnitCostManual, setIsUnitCostManual] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const categories = useMemo(() => {
    const unique = new Set(ingredients.map((item) => item.category))
    return Array.from(unique).sort()
  }, [ingredients])

  const ingredientByName = useMemo(() => {
    const map = new Map<string, Ingredient>()
    ingredients.forEach((ingredient) => {
      map.set(ingredient.name.trim().toLowerCase(), ingredient)
    })
    return map
  }, [ingredients])

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'All categories' },
      ...categories.map((category) => ({ value: category, label: category })),
    ],
    [categories],
  )

  const ingredientCategoryOptions = useMemo(
    () => [
      { value: '', label: 'Select category' },
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
    setIsUnitCostManual(false)
    setIsIngredientModalOpen(true)
  }

  const openEditModal = (ingredient: Ingredient) => {
    setEditing(ingredient)
    setForm({
      name: ingredient.name,
      category: ingredient.category,
      baseUnit: ingredient.baseUnit,
      onHand: String(ingredient.onHand),
      reorderLevel: String(ingredient.reorderLevel),
      unitCost: String(ingredient.unitCost ?? 0),
      bulkQty: '',
      bulkUnit: ingredient.baseUnit,
      bulkPrice: '',
    })
    setErrors({})
    setFormError('')
    setIsUnitCostManual(true)
    setIsIngredientModalOpen(true)
  }

  const openAdjustModal = (ingredientId?: string) => {
    setAdjustForm({
      ingredientId: ingredientId ?? '',
      type: 'IN',
      reasonType: 'MANUAL',
      qty: '',
      reason: '',
      countedQty: '',
      reference: '',
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
    if (!form.baseUnit) {
      nextErrors.baseUnit = 'Base unit is required.'
    }
    const onHandValue = Number(form.onHand)
    if (!Number.isFinite(onHandValue) || onHandValue < 0) {
      nextErrors.onHand = 'Enter a valid on-hand quantity.'
    }
    const reorderValue = Number(form.reorderLevel)
    if (!Number.isFinite(reorderValue) || reorderValue < 0) {
      nextErrors.reorderLevel = 'Enter a valid reorder level.'
    }
    const unitCostValue = Number(form.unitCost)
    if (form.unitCost.trim().length > 0) {
      if (!Number.isFinite(unitCostValue) || unitCostValue < 0) {
        nextErrors.unitCost = 'Enter a valid unit cost.'
      }
    }
    setErrors(nextErrors)
    return { nextErrors, onHandValue, reorderValue, unitCostValue }
  }

  const getBulkUnitOptions = (baseUnit: IngredientBaseUnit) => {
    if (baseUnit === 'g') {
      return [
        { value: 'g', label: 'g' },
        { value: 'kg', label: 'kg' },
      ]
    }
    if (baseUnit === 'ml') {
      return [
        { value: 'ml', label: 'ml' },
        { value: 'l', label: 'l' },
      ]
    }
    return [{ value: 'pcs', label: 'pcs' }]
  }

  const derivedUnitCost = useMemo(
    () =>
      calculateUnitCostFromBulk(
        form.baseUnit,
        Number(form.bulkQty),
        form.bulkUnit,
        Number(form.bulkPrice),
      ),
    [form],
  )

  useEffect(() => {
    if (derivedUnitCost === null) {
      return
    }
    if (!isUnitCostManual || form.unitCost.trim().length === 0) {
      setForm((prev) => ({
        ...prev,
        unitCost: derivedUnitCost.toFixed(4),
      }))
      if (form.unitCost.trim().length === 0) {
        setIsUnitCostManual(false)
      }
    }
  }, [derivedUnitCost, form.unitCost, isUnitCostManual])

  const handleSaveIngredient = () => {
    if (isSaving) {
      return
    }
    const { nextErrors, onHandValue, reorderValue, unitCostValue } = validateIngredient()
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

    const hasManualUnitCost = form.unitCost.trim().length > 0
    if (!hasManualUnitCost && derivedUnitCost === null) {
      setErrors((prev) => ({
        ...prev,
        unitCost: 'Enter unit cost or provide bulk cost details.',
      }))
      setFormError('Unit cost or bulk cost is required.')
      setIsSaving(false)
      return
    }

    const resolvedUnitCost = hasManualUnitCost ? unitCostValue : derivedUnitCost ?? 0

    if (resolvedUnitCost < 0 || !Number.isFinite(resolvedUnitCost)) {
      setErrors((prev) => ({ ...prev, unitCost: 'Enter a valid unit cost.' }))
      setFormError('Please fix the highlighted fields.')
      setIsSaving(false)
      return
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      baseUnit: form.baseUnit,
      onHand: onHandValue,
      reorderLevel: reorderValue,
      unitCost: resolvedUnitCost,
    }

    if (editing) {
      dispatch(updateIngredient({ id: editing.id, ...payload }))
      void dispatch(syncUpsertIngredient({ id: editing.id, ...payload }))
      dispatch(
        pushToast({
          title: 'Ingredient updated',
          description: `${payload.name} was saved.`,
          variant: 'success',
        }),
      )
    } else {
      dispatch(addIngredient(payload))
      void dispatch(syncUpsertIngredient(payload))
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
    if (adjustForm.reasonType !== 'VARIANCE') {
      if (!Number.isFinite(qtyValue) || qtyValue <= 0) {
        nextErrors.qty = 'Enter a valid quantity.'
      }
    }
    if (!adjustForm.reason.trim()) {
      nextErrors.reason = 'Reason is required.'
    }
    if (adjustForm.reasonType === 'VARIANCE') {
      const countedValue = Number(adjustForm.countedQty)
      if (!Number.isFinite(countedValue) || countedValue < 0) {
        nextErrors.qty = 'Enter a valid counted quantity.'
      }
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

    let nextType = adjustForm.type
    let nextQty = qtyValue

    if (adjustForm.reasonType === 'RESTOCK') {
      nextType = 'IN'
    }
    if (adjustForm.reasonType === 'WASTE') {
      nextType = 'OUT'
    }
    if (adjustForm.reasonType === 'VARIANCE') {
      const countedValue = Number(adjustForm.countedQty)
      const variance = countedValue - ingredient.onHand
      if (variance === 0) {
        dispatch(
          pushToast({
            title: 'No variance',
            description: 'Counted quantity matches on-hand stock.',
            variant: 'info',
          }),
        )
        return
      }
      nextType = variance > 0 ? 'IN' : 'OUT'
      nextQty = Math.abs(variance)
    }

    const delta = nextType === 'IN' ? nextQty : -nextQty
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
        type: nextType,
        reasonType: adjustForm.reasonType,
        qty: nextQty,
        reason: adjustForm.reason.trim(),
        reference: adjustForm.reference.trim() || undefined,
        countedQty:
          adjustForm.reasonType === 'VARIANCE'
            ? Number(adjustForm.countedQty)
            : undefined,
      }),
    )
    void dispatch(
      syncStockAdjustment({
        ingredientId: adjustForm.ingredientId,
        type: nextType,
        reasonType: adjustForm.reasonType,
        qty: nextQty,
        reason: adjustForm.reason.trim(),
        reference: adjustForm.reference.trim() || undefined,
        countedQty:
          adjustForm.reasonType === 'VARIANCE' ? Number(adjustForm.countedQty) : undefined,
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

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    setIsImporting(true)
    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        throw new Error('Missing worksheet')
      }
      const sheet = workbook.Sheets[sheetName]
      const rows = parseSheetRows(XLSX, sheet)

      let imported = 0
      let updated = 0
      let skipped = 0
      let errorsCount = 0

      rows.forEach((row) => {
        const result = parseIngredientImportRow(row)
        if (result.status === 'skip') {
          skipped += 1
          return
        }
        if (result.status === 'error') {
          errorsCount += 1
          return
        }

        const payload = result.payload

        const existing = ingredientByName.get(payload.name.toLowerCase())
        if (existing) {
          dispatch(updateIngredient({ id: existing.id, ...payload }))
          void dispatch(syncUpsertIngredient({ id: existing.id, ...payload }))
          updated += 1
          return
        }

        dispatch(addIngredient(payload))
        void dispatch(syncUpsertIngredient(payload))
        imported += 1
      })

      dispatch(
        pushToast({
          title: 'Import complete',
          description: `Imported ${imported}, updated ${updated}, skipped ${skipped}, errors ${errorsCount}.`,
          variant: errorsCount > 0 ? 'warning' : 'success',
        }),
      )
    } catch {
      dispatch(
        pushToast({
          title: 'Import failed',
          description:
            'Could not read the Excel file. Use a .xlsx file with data on the first sheet.',
          variant: 'error',
        }),
      )
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const XLSX = await import('xlsx')
      const worksheet = XLSX.utils.json_to_sheet([INVENTORY_IMPORT_SAMPLE], {
        header: [...INVENTORY_IMPORT_HEADERS],
      })
      XLSX.utils.sheet_add_aoa(worksheet, [[...INVENTORY_IMPORT_HEADERS]], {
        origin: 'A1',
      })
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ingredients')
      XLSX.writeFile(workbook, 'inventory-import-template.xlsx')
    } catch {
      dispatch(
        pushToast({
          title: 'Download failed',
          description: 'Could not generate the template file.',
          variant: 'error',
        }),
      )
    }
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Inventory</h2>
          <p className="muted">Manage ingredients, stock levels, and reorder points.</p>
        </div>
        <div className="admin-row-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <Button variant="ghost" onClick={handleDownloadTemplate} icon="download">
            Download Template
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            icon="upload"
            disabled={isImporting}
          >
            {isImporting ? 'Importing...' : 'Import Excel'}
          </Button>
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
          <span>Base Unit</span>
          <span>On Hand</span>
          <span>Reorder</span>
          <span>Unit Cost</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {filteredIngredients.map((ingredient) => {
          const isLow = ingredient.onHand <= ingredient.reorderLevel
          return (
            <div key={ingredient.id} className="admin-table-row inventory">
              <div className="inventory-meta">
                <strong>{ingredient.name}</strong>
              </div>
              <span>{ingredient.category}</span>
              <span className="inventory-unit">{ingredient.baseUnit}</span>
              <span
                className={`inventory-stock${isLow ? ' inventory-stock--low' : ''}`}
              >
                {formatIngredientQty(ingredient.onHand, ingredient.baseUnit)}
              </span>
              <span>{formatIngredientQty(ingredient.reorderLevel, ingredient.baseUnit)}</span>
              <span>{formatCurrency(ingredient.unitCost ?? 0)}</span>
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
        <Select
          label="Category"
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
          options={ingredientCategoryOptions}
          error={errors.category}
        />
        <Select
          label="Base unit"
          value={form.baseUnit}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              baseUnit: event.target.value as IngredientBaseUnit,
              bulkUnit: event.target.value as IngredientBaseUnit,
            }))
          }
          options={unitOptions}
          error={errors.baseUnit}
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
        <Input
          label="Unit cost"
          placeholder="0.00"
          inputMode="decimal"
          value={form.unitCost}
          onChange={(event) => {
            const nextValue = event.target.value
            setForm({ ...form, unitCost: nextValue })
            setIsUnitCostManual(nextValue.trim().length > 0)
          }}
          error={errors.unitCost}
          helperText="Cost per base unit (e.g., per g, ml, or pcs)"
        />
        <div className="admin-form-grid">
          <Input
            label="Bulk quantity (optional)"
            placeholder="0"
            inputMode="decimal"
            value={form.bulkQty}
            onChange={(event) =>
              setForm({ ...form, bulkQty: event.target.value })
            }
          />
          <Select
            label="Bulk unit"
            value={form.bulkUnit}
            onChange={(event) =>
              setForm({
                ...form,
                bulkUnit: event.target.value as IngredientFormState['bulkUnit'],
              })
            }
            options={getBulkUnitOptions(form.baseUnit)}
          />
          <Input
            label="Bulk price (optional)"
            placeholder="0.00"
            inputMode="decimal"
            value={form.bulkPrice}
            onChange={(event) => setForm({ ...form, bulkPrice: event.target.value })}
            helperText={
              derivedUnitCost !== null
                ? `Calculated unit cost: ₱${derivedUnitCost.toFixed(4)}`
                : 'Enter bulk quantity + price to auto-calculate unit cost.'
            }
          />
        </div>
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
          disabled={adjustForm.reasonType !== 'MANUAL'}
        />
        <Select
          label="Reason Type"
          value={adjustForm.reasonType}
          onChange={(event) =>
            setAdjustForm((prev) => {
              const nextReason = event.target.value as AdjustFormState['reasonType']
              const nextType =
                nextReason === 'RESTOCK'
                  ? 'IN'
                  : nextReason === 'WASTE'
                    ? 'OUT'
                    : prev.type
              return {
                ...prev,
                reasonType: nextReason,
                type: nextType,
              }
            })
          }
          options={[
            { value: 'MANUAL', label: 'Manual Adjustment' },
            { value: 'RESTOCK', label: 'Supplier Restock' },
            { value: 'WASTE', label: 'Waste / Spoilage' },
            { value: 'VARIANCE', label: 'Stock Count Variance' },
          ]}
        />
        {adjustForm.reasonType === 'VARIANCE' ? (
          <Input
            label="Counted quantity"
            placeholder="0"
            inputMode="decimal"
            value={adjustForm.countedQty}
            onChange={(event) =>
              setAdjustForm({ ...adjustForm, countedQty: event.target.value })
            }
            error={adjustErrors.qty}
          />
        ) : (
          <Input
            label="Quantity"
            placeholder="0"
            inputMode="decimal"
            value={adjustForm.qty}
            onChange={(event) => setAdjustForm({ ...adjustForm, qty: event.target.value })}
            error={adjustErrors.qty}
          />
        )}
        <Input
          label="Reason"
          placeholder="Reason for adjustment"
          value={adjustForm.reason}
          onChange={(event) => setAdjustForm({ ...adjustForm, reason: event.target.value })}
          error={adjustErrors.reason}
        />
        {adjustForm.reasonType === 'RESTOCK' ? (
          <Input
            label="Supplier reference (optional)"
            placeholder="Supplier or invoice reference"
            value={adjustForm.reference}
            onChange={(event) => setAdjustForm({ ...adjustForm, reference: event.target.value })}
          />
        ) : null}
      </Modal>
    </div>
  )
}

export default AdminInventoryPage
