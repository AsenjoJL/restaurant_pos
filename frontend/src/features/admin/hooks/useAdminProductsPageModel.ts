import { nanoid } from '@reduxjs/toolkit'
import { useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { useFileObjectUrl } from '../../../shared/hooks/useFileObjectUrl'
import { hasValidationErrors } from '../../../shared/lib/validation'
import { pushToast } from '../../../shared/store/ui.store'
import { selectInventoryIngredients, selectInventoryRecipes } from '../../inventory/inventory.selectors'
import { runInventorySync } from '../../inventory/inventory.sync'
import { syncSaveRecipe, syncUpsertIngredient } from '../../inventory/inventory.store'
import type { IngredientBaseUnit, RecipeLine } from '../../inventory/inventory.types'
import { dispatchAndSyncAdmin } from '../admin.actions'
import {
  buildProductFormForEdit,
  buildRecipeLinesForSave,
  emptyProductForm,
  validateProductForm,
  validateProductImageFile,
  type ProductErrors,
  type ProductFormState,
} from '../admin.products-form'
import type { DemoProductKey } from '../admin.product-demos'
import {
  buildDemoProductForm,
  buildIngredientSelectOptions,
  buildProductCategoryOptions,
  buildProductPayload,
  buildProductStats,
  filterProducts,
  getFirstProductFormError,
  getProductProfitMetrics,
  PRODUCT_CLASS_OPTIONS,
} from '../admin.products-page'
import { selectAdminCategories, selectAdminProducts } from '../admin.selectors'
import { addProduct, toggleProductActive, updateProduct } from '../admin.store'
import type { AdminProduct } from '../admin.types'
import { adminRepository } from '../api'

export function useAdminProductsPageModel() {
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
  const [form, setForm] = useState<ProductFormState>(emptyProductForm)
  const [errors, setErrors] = useState<ProductErrors>({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const {
    file: pendingImageFile,
    url: pendingImagePreview,
    setFile: setPendingImageFile,
    clear: clearPendingImage,
  } = useFileObjectUrl()

  const categoryOptions = useMemo(() => buildProductCategoryOptions(categories), [categories])

  const ingredientSelectOptions = useMemo(
    () => buildIngredientSelectOptions(ingredients),
    [ingredients],
  )

  const stats = useMemo(() => buildProductStats(products, categories.length), [categories.length, products])

  const classOptions = useMemo(() => PRODUCT_CLASS_OPTIONS, [])

  const filteredProducts = useMemo(
    () =>
      filterProducts({
        categoryFilter,
        classFilter,
        products,
        query,
      }),
    [categoryFilter, classFilter, products, query],
  )

  const resetModalState = useCallback(() => {
    setEditing(null)
    clearPendingImage()
    setForm(emptyProductForm)
    setErrors({})
    setFormError('')
    setIsSaving(false)
  }, [clearPendingImage])

  const openAddModal = useCallback(() => {
    resetModalState()
    setIsModalOpen(true)
  }, [resetModalState])

  const openEditModal = useCallback(
    (product: AdminProduct) => {
      setEditing(product)
      const existingRecipe = recipes.find((recipe) => recipe.productId === product.id)
      setForm(
        buildProductFormForEdit({
          product,
          recipe: existingRecipe,
          ingredients,
        }),
      )
      clearPendingImage()
      setErrors({})
      setFormError('')
      setIsModalOpen(true)
    },
    [clearPendingImage, ingredients, recipes],
  )

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    resetModalState()
  }, [resetModalState])

  const handleIngredientSelect = useCallback(
    (ingredientId: string) => {
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
    },
    [ingredients],
  )

  const handleAdditionalIngredientSelect = useCallback((index: number, ingredientId: string) => {
    setForm((prev) => {
      const next = [...prev.additionalIngredientIds]
      next[index] = ingredientId
      return { ...prev, additionalIngredientIds: next }
    })
  }, [])

  const handleAddIngredientLink = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      additionalIngredientIds: [...prev.additionalIngredientIds, ''],
    }))
  }, [])

  const handleRemoveIngredientLink = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      additionalIngredientIds: prev.additionalIngredientIds.filter((_, rowIndex) => rowIndex !== index),
    }))
  }, [])

  const handleImageFileChange = useCallback(
    (file: File | null) => {
      if (!file) {
        clearPendingImage()
        return
      }

      const imageValidation = validateProductImageFile(file)
      if (imageValidation) {
        dispatch(
          pushToast({
            title: imageValidation.title,
            description: imageValidation.description,
            variant: 'error',
          }),
        )
        return
      }

      setPendingImageFile(file)
    },
    [clearPendingImage, dispatch, setPendingImageFile],
  )

  const handleRecipeIngredientChange = useCallback((index: number, ingredientId: string) => {
    setForm((prev) => {
      const updated = prev.recipeLines.map((line, rowIndex) => {
        if (rowIndex !== index) {
          return line
        }
        const qtyValue = Number(line.qty)
        const nextQty =
          line.qty.trim().length === 0 || !Number.isFinite(qtyValue) || qtyValue <= 0 ? '1' : line.qty
        return {
          ...line,
          ingredientId,
          qty: ingredientId ? nextQty : line.qty,
        }
      })
      return { ...prev, recipeLines: updated }
    })
  }, [])

  const handleRecipeQtyChange = useCallback((index: number, qty: string) => {
    setForm((prev) => ({
      ...prev,
      recipeLines: prev.recipeLines.map((line, rowIndex) => (rowIndex === index ? { ...line, qty } : line)),
    }))
  }, [])

  const failSave = useCallback(
    (
      formMessage: string,
      toast?: {
        title: string
        description: string
      },
    ) => {
      setIsSaving(false)
      setFormError(formMessage)
      if (toast) {
        dispatch(
          pushToast({
            ...toast,
            variant: 'error',
          }),
        )
      }
    },
    [dispatch],
  )

  const uploadPendingProductImage = useCallback(async () => {
    if (!pendingImageFile) {
      return {
        ok: true as const,
        imageUrl: form.imageUrl.trim() || null,
      }
    }

    try {
      const uploaded = await adminRepository.uploadProductImage(pendingImageFile)
      return {
        ok: true as const,
        imageUrl: uploaded.imageUrl,
      }
    } catch {
      failSave('Image upload failed. Please try another image.', {
        title: 'Upload failed',
        description: 'Unable to upload the product image right now.',
      })
      return { ok: false as const }
    }
  }, [failSave, form.imageUrl, pendingImageFile])

  const syncRawIngredientIfNeeded = useCallback(async () => {
    if (form.productType !== 'raw') {
      return true
    }

    const selectedIngredient = ingredients.find((ingredient) => ingredient.id === form.ingredientId)
    if (!selectedIngredient) {
      failSave('Selected ingredient no longer exists. Please reselect an ingredient.', {
        title: 'Ingredient required',
        description: 'Select a valid ingredient before saving.',
      })
      return false
    }

    const baseUnit = form.unit as IngredientBaseUnit
    const categoryName = categories.find((category) => category.id === form.category)?.name || 'Raw Materials'
    const ingredientPayload = {
      name: form.name.trim(),
      category: categoryName,
      baseUnit,
      onHand: Number(form.currentStock),
      reorderLevel: Number(form.lowStockAlert),
      unitCost: Number(form.unitCost),
    }

    const inventorySynced = await runInventorySync(
      dispatch,
      async () => {
        await dispatch(
          syncUpsertIngredient({
            id: selectedIngredient.id,
            ...ingredientPayload,
          }),
        ).unwrap()
      },
      {
        errorTitle: 'Inventory sync failed',
        errorDescription: 'Unable to save ingredient stock changes.',
      },
    )

    if (!inventorySynced) {
      failSave('Inventory update failed. Please try again.')
      return false
    }

    return true
  }, [
    categories,
    dispatch,
    failSave,
    form.category,
    form.currentStock,
    form.ingredientId,
    form.lowStockAlert,
    form.name,
    form.productType,
    form.unit,
    form.unitCost,
    ingredients,
  ])

  const upsertProductRecord = useCallback(
    async (payload: ReturnType<typeof buildProductPayload>) => {
      if (editing) {
        const synced = await dispatchAndSyncAdmin(
          dispatch,
          updateProduct({
            id: editing.id,
            isActive: editing.isActive,
            ...payload,
          }),
        )
        if (!synced) {
          failSave('Unable to save product right now. Please try again.')
          return null
        }

        dispatch(
          pushToast({
            title: 'Product updated',
            description: `${payload.name} was saved.`,
            variant: 'success',
          }),
        )
        return editing.id
      }

      const newProductId = nanoid()
      const synced = await dispatchAndSyncAdmin(
        dispatch,
        addProduct({
          ...payload,
          id: newProductId,
        }),
      )
      if (!synced) {
        failSave('Unable to save product right now. Please try again.')
        return null
      }

      dispatch(
        pushToast({
          title: 'Product added',
          description: `${payload.name} was created.`,
          variant: 'success',
        }),
      )
      return newProductId
    },
    [dispatch, editing, failSave],
  )

  const syncRecipeForProduct = useCallback(
    async (productId: string, lines: RecipeLine[]) => {
      if (!productId || lines.length === 0) {
        return true
      }

      const recipePayload = {
        productId,
        lines,
      }

      const recipeSynced = await runInventorySync(
        dispatch,
        async () => {
          await dispatch(syncSaveRecipe(recipePayload)).unwrap()
        },
        {
          errorTitle: 'Recipe sync failed',
          errorDescription:
            'Product was saved, but recipe sync failed. Inventory deduction may not work yet.',
        },
      )

      if (!recipeSynced) {
        failSave('Recipe sync failed. Please retry saving.')
        return false
      }

      return true
    },
    [dispatch, failSave],
  )

  const handleSave = useCallback(async () => {
    if (isSaving) {
      return
    }

    const nextErrors = validateProductForm(form)
    setErrors(nextErrors)
    if (hasValidationErrors(nextErrors)) {
      const firstError = getFirstProductFormError(nextErrors)
      setFormError(firstError)
      dispatch(
        pushToast({
          title: 'Fix validation errors',
          description: firstError,
          variant: 'error',
        }),
      )
      return
    }

    setIsSaving(true)

    const imageResult = await uploadPendingProductImage()
    if (!imageResult.ok) {
      return
    }

    const inventorySynced = await syncRawIngredientIfNeeded()
    if (!inventorySynced) {
      return
    }

    const payload = buildProductPayload(form, imageResult.imageUrl)
    const validRecipeLines = buildRecipeLinesForSave(form)
    if (form.productType === 'non_raw' && validRecipeLines.length === 0) {
      failSave('At least one valid ingredient line is required.')
      return
    }

    const productId = await upsertProductRecord(payload)
    if (!productId) {
      return
    }

    const recipeSynced = await syncRecipeForProduct(productId, validRecipeLines)
    if (!recipeSynced) {
      return
    }

    setIsSaving(false)
    closeModal()
  }, [
    closeModal,
    dispatch,
    failSave,
    form,
    isSaving,
    syncRawIngredientIfNeeded,
    syncRecipeForProduct,
    upsertProductRecord,
    uploadPendingProductImage,
  ])

  const handleClear = useCallback(() => {
    clearPendingImage()
    setForm(emptyProductForm)
    setErrors({})
    setFormError('')
  }, [clearPendingImage])

  const handleToggleActive = useCallback(
    async (product: AdminProduct) => {
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
    },
    [dispatch],
  )

  const { markupPercentage, profitMarginPercent, profitPerItem } = useMemo(
    () => getProductProfitMetrics(form),
    [form],
  )

  const loadDemoProduct = useCallback(
    (key: DemoProductKey) => {
      setForm(
        buildDemoProductForm({
          categories,
          key,
          emptyForm: emptyProductForm,
        }),
      )
      setErrors({})
      setFormError('')
    },
    [categories],
  )

  return {
    // data
    categories,
    products,
    ingredients,
    stats,

    // filters
    query,
    setQuery,
    categoryFilter,
    setCategoryFilter,
    classFilter,
    setClassFilter,
    categoryOptions,
    classOptions,
    filteredProducts,

    // modal
    isModalOpen,
    editing,
    form,
    setForm,
    errors,
    formError,
    isSaving,
    ingredientSelectOptions,
    pendingImagePreview,
    markupPercentage,
    profitMarginPercent,
    profitPerItem,
    openAddModal,
    openEditModal,
    closeModal,
    handleClear,
    handleSave,
    handleToggleActive,
    handleImageFileChange,
    handleIngredientSelect,
    handleAdditionalIngredientSelect,
    handleAddIngredientLink,
    handleRemoveIngredientLink,
    handleRecipeIngredientChange,
    handleRecipeQtyChange,
    clearPendingImage,
    loadDemoProduct,
  } as const
}
