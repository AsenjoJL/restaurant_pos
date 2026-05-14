import { useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { pushToast } from '../../../shared/store/ui.store'
import { hasValidationErrors } from '../../../shared/lib/validation'
import type { Ingredient, IngredientType } from '../inventory.types'
import { calculateUnitCostFromBulk } from '../inventory.import'
import {
  emptyAdjustForm,
  emptyIngredientForm,
  validateAdjustmentForm,
  validateIngredientForm,
  type AdjustErrors,
  type AdjustFormState,
  type IngredientErrors,
  type IngredientFormState,
} from '../inventory.admin-form'
import {
  buildIngredientCategoryOptions,
  buildIngredientLookupByInventoryId,
  buildIngredientLookupByName,
  buildInventoryAlerts,
  buildInventoryCategories,
  buildInventoryCategoryOptions,
  buildInventoryIngredientOptions,
  buildInventoryStats,
  filterInventoryIngredients,
  INVENTORY_INGREDIENT_TYPE_OPTIONS,
  INVENTORY_STATUS_OPTIONS,
} from '../inventory.page'
import {
  buildAdjustmentDraft,
  buildIngredientEditForm,
  resolveAdjustmentQuantity,
} from '../inventory.adjustments'
import { selectInventoryAdjustments, selectInventoryIngredients } from '../inventory.selectors'
import { runInventorySync } from '../inventory.sync'
import {
  syncStockAdjustment,
  syncUpsertIngredient,
} from '../inventory.store'
import useInventoryImportExport from './useInventoryImportExport'

export function useAdminInventoryPageModel() {
  const dispatch = useAppDispatch()
  const ingredients = useAppSelector(selectInventoryIngredients)
  const adjustments = useAppSelector(selectInventoryAdjustments)

  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [ingredientTypeFilter, setIngredientTypeFilter] = useState<'all' | IngredientType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'ok'>('all')

  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)

  const [editing, setEditing] = useState<Ingredient | null>(null)
  const [form, setForm] = useState<IngredientFormState>(emptyIngredientForm)
  const [errors, setErrors] = useState<IngredientErrors>({})
  const [formError, setFormError] = useState('')

  const [adjustForm, setAdjustForm] = useState<AdjustFormState>(emptyAdjustForm)
  const [adjustErrors, setAdjustErrors] = useState<AdjustErrors>({})

  const [isSaving, setIsSaving] = useState(false)

  const categories = useMemo(() => buildInventoryCategories(ingredients), [ingredients])

  const ingredientByName = useMemo(() => buildIngredientLookupByName(ingredients), [ingredients])

  const ingredientByInventoryId = useMemo(
    () => buildIngredientLookupByInventoryId(ingredients),
    [ingredients],
  )

  const inventoryFileActions = useInventoryImportExport({
    ingredients,
    ingredientByInventoryId,
    ingredientByName,
  })

  const categoryOptions = useMemo(() => buildInventoryCategoryOptions(categories), [categories])

  const statusOptions = useMemo(() => [...INVENTORY_STATUS_OPTIONS], [])

  const ingredientTypeOptions = useMemo(() => [...INVENTORY_INGREDIENT_TYPE_OPTIONS], [])

  const ingredientCategoryOptions = useMemo(
    () => buildIngredientCategoryOptions(categories),
    [categories],
  )

  const ingredientOptions = useMemo(() => buildInventoryIngredientOptions(ingredients), [ingredients])

  const stats = useMemo(() => buildInventoryStats(ingredients, categories.length), [categories.length, ingredients])

  const alerts = useMemo(() => buildInventoryAlerts(ingredients, adjustments), [adjustments, ingredients])

  const filteredIngredients = useMemo(
    () =>
      filterInventoryIngredients({
        categoryFilter,
        ingredientTypeFilter,
        ingredients,
        query,
        statusFilter,
      }),
    [categoryFilter, ingredientTypeFilter, ingredients, query, statusFilter],
  )

  const openEditModal = useCallback((ingredient: Ingredient) => {
    setEditing(ingredient)
    setForm(buildIngredientEditForm(ingredient))
    setErrors({})
    setFormError('')
    setIsIngredientModalOpen(true)
  }, [])

  const openAdjustModal = useCallback(
    (ingredientId?: string, mode: 'manual' | 'restock' = 'manual') => {
      setAdjustForm(
        buildAdjustmentDraft({
          adjustments,
          ingredientId,
          mode,
        }),
      )
      setAdjustErrors({})
      setIsAdjustModalOpen(true)
    },
    [adjustments],
  )

  const closeIngredientModal = useCallback(() => {
    setIsIngredientModalOpen(false)
    setEditing(null)
    setForm(emptyIngredientForm)
    setErrors({})
    setFormError('')
    setIsSaving(false)
  }, [])

  const closeAdjustModal = useCallback(() => {
    setIsAdjustModalOpen(false)
    setAdjustForm(emptyAdjustForm)
    setAdjustErrors({})
    setIsSaving(false)
  }, [])

  const derivedUnitCost = useMemo(() => {
    return calculateUnitCostFromBulk(
      form.baseUnit,
      Number(form.bulkQty),
      form.bulkUnit,
      Number(form.bulkPrice),
    )
  }, [form.baseUnit, form.bulkPrice, form.bulkQty, form.bulkUnit])

  const handleSaveIngredient = useCallback(async () => {
    if (isSaving) {
      return
    }
    const {
      errors: nextErrors,
      values: { name, category, onHandValue, reorderValue, unitCostValue },
    } = validateIngredientForm(form)
    setErrors(nextErrors)
    if (hasValidationErrors(nextErrors)) {
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
      ingredientType: form.ingredientType,
      name,
      category,
      baseUnit: form.baseUnit,
      onHand: onHandValue,
      reorderLevel: reorderValue,
      unitCost: resolvedUnitCost,
    }

    const synced = await runInventorySync(
      dispatch,
      async () => {
        await dispatch(
          syncUpsertIngredient(editing ? { id: editing.id, ...payload } : payload),
        ).unwrap()
      },
      {
        errorTitle: 'Inventory sync failed',
        errorDescription: 'Unable to save ingredient in mock data.',
      },
    )

    if (!synced) {
      setIsSaving(false)
      setFormError('Unable to save ingredient right now. Please try again.')
      return
    }

    dispatch(
      pushToast({
        title: editing ? 'Ingredient updated' : 'Ingredient added',
        description: editing ? `${payload.name} was saved.` : `${payload.name} was created.`,
        variant: 'success',
      }),
    )
    setIsSaving(false)
    closeIngredientModal()
  }, [closeIngredientModal, derivedUnitCost, dispatch, editing, form, isSaving])

  const handleAdjustStock = useCallback(async () => {
    if (isSaving) {
      return
    }
    const {
      errors: nextErrors,
      values: { qtyValue, normalizedReference },
    } = validateAdjustmentForm({
      form: adjustForm,
    })
    setAdjustErrors(nextErrors)
    if (hasValidationErrors(nextErrors)) {
      dispatch(
        pushToast({
          title: 'Fix adjustment fields',
          description: 'Check the stock adjustment details.',
          variant: 'error',
        }),
      )
      return
    }

    const ingredient = ingredients.find((item) => item.id === adjustForm.ingredientId)
    if (!ingredient) {
      return
    }

    const adjustmentResult = resolveAdjustmentQuantity({
      form: adjustForm,
      ingredient,
      qtyValue,
    })

    if (adjustmentResult.kind === 'no_variance') {
      dispatch(
        pushToast({
          title: 'No variance',
          description: 'Counted quantity matches on-hand stock.',
          variant: 'info',
        }),
      )
      return
    }

    if (adjustmentResult.kind === 'negative_stock') {
      dispatch(
        pushToast({
          title: 'Insufficient stock',
          description: `${ingredient.name} would go negative.`,
          variant: 'error',
        }),
      )
      return
    }

    const { nextQty, nextType } = adjustmentResult

    setIsSaving(true)
    const adjustmentPayload = {
      ingredientId: adjustForm.ingredientId,
      type: nextType,
      reasonType: adjustForm.reasonType,
      qty: nextQty,
      reason: adjustForm.reason.trim(),
      reference: normalizedReference || undefined,
      countedQty: adjustForm.reasonType === 'VARIANCE' ? Number(adjustForm.countedQty) : undefined,
    }

    const synced = await runInventorySync(
      dispatch,
      async () => {
        await dispatch(syncStockAdjustment(adjustmentPayload)).unwrap()
      },
      {
        errorTitle: 'Adjustment failed',
        errorDescription: 'Unable to apply stock adjustment in mock data.',
      },
    )

    if (!synced) {
      setIsSaving(false)
      return
    }

    dispatch(
      pushToast({
        title: 'Stock adjusted',
        description: `${ingredient.name} updated.`,
        variant: 'success',
      }),
    )
    setIsSaving(false)
    closeAdjustModal()
  }, [adjustForm, closeAdjustModal, dispatch, ingredients, isSaving])

  return {
    // data
    ingredients,
    adjustments,
    stats,
    alerts,
    filteredIngredients,

    // filters
    query,
    setQuery,
    categoryFilter,
    setCategoryFilter,
    ingredientTypeFilter,
    setIngredientTypeFilter,
    statusFilter,
    setStatusFilter,
    categoryOptions,
    ingredientTypeOptions,
    statusOptions,

    // ingredient modal
    isIngredientModalOpen,
    editing,
    form,
    errors,
    formError,
    isSaving,
    derivedUnitCost,
    ingredientCategoryOptions,
    setForm,
    openEditModal,
    closeIngredientModal,
    handleSaveIngredient,

    // adjustment modal
    isAdjustModalOpen,
    adjustForm,
    adjustErrors,
    ingredientOptions,
    setAdjustForm,
    openAdjustModal,
    closeAdjustModal,
    handleAdjustStock,

    // import/export
    ...inventoryFileActions,
  } as const
}
