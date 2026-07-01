import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { hasValidationErrors } from '../../../shared/lib/validation'
import { pushToast } from '../../../shared/store/ui.store'
import { selectInventoryIngredients, selectInventoryRecipes } from '../../inventory/inventory.selectors'
import { runInventorySync } from '../../inventory/inventory.sync'
import {
  hydrateInventoryFromRepository,
  saveRecipe,
  syncSaveRecipe,
  syncUpsertIngredient,
} from '../../inventory/inventory.store'
import type { IngredientBaseUnit, RecipeLine } from '../../inventory/inventory.types'
import { dispatchAndSyncAdmin } from '../admin.actions'
import { adminRepository } from '../api'
import {
  buildProductFormForEdit,
  buildRecipeLinesForSave,
  emptyProductForm,
  validateProductForm,
  type ProductErrors,
  type ProductFormState,
} from '../admin.products-form'
import {
  buildIngredientSelectOptions,
  buildProductCategoryOptions,
  buildProductPayload,
  buildProductStats,
  filterProducts,
  getFirstProductFormError,
  getProductProfitMetrics,
} from '../admin.products-page'
import { selectAdminCategories, selectAdminProducts } from '../admin.selectors'
import { toggleProductActive, upsertCanonicalProduct } from '../admin.store'
import type { AdminProduct } from '../admin.types'
import useProductFormHandlers from './useProductFormHandlers'
import useProductImageDraft from './useProductImageDraft'

export function useAdminProductsPageModel() {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectAdminCategories)
  const products = useAppSelector(selectAdminProducts).filter(
    (product) => product.productClass === 'NON_RAW',
  )
  const recipes = useAppSelector(selectInventoryRecipes)
  const ingredients = useAppSelector(selectInventoryIngredients)

  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [form, setForm] = useState<ProductFormState>(emptyProductForm)
  const [errors, setErrors] = useState<ProductErrors>({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const ingredientCategoriesNeedRefresh =
    ingredients.length > 0 && ingredients.every((ingredient) => ingredient.category === 'Inventory')

  useEffect(() => {
    if (!ingredientCategoriesNeedRefresh) {
      return
    }

    void dispatch(hydrateInventoryFromRepository())
  }, [dispatch, ingredientCategoriesNeedRefresh])

  const categoryOptions = useMemo(() => buildProductCategoryOptions(categories), [categories])

  const ingredientSelectOptions = useMemo(
    () => buildIngredientSelectOptions(ingredients),
    [ingredients],
  )

  const stats = useMemo(() => buildProductStats(products, categories.length), [categories.length, products])

  const {
    handleAddIngredientLink,
    handleAdditionalIngredientSelect,
    handleIngredientSelect,
    handleRecipeIngredientChange,
    handleRecipeQtyChange,
    handleRemoveIngredientLink,
  } = useProductFormHandlers({ ingredients, setForm })

  const filteredProducts = useMemo(
    () =>
      filterProducts({
        categoryFilter,
        products,
        query,
      }),
    [categoryFilter, products, query],
  )

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

  const {
    clearPendingImage,
    handleImageFileChange,
    pendingImagePreview,
    uploadProductImage,
  } = useProductImageDraft({ onUploadFailure: failSave })

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
        try {
          return await adminRepository.updateProduct(editing.id, {
            ...payload,
            sku: editing.sku,
            isActive: editing.isActive,
          })
        } catch {
          failSave('Unable to save product right now. Please try again.')
          return null
        }
      }

      try {
        return await adminRepository.createProduct(payload)
      } catch {
        failSave('Unable to save product right now. Please try again.')
        return null
      }
    },
    [editing, failSave],
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

      try {
        await dispatch(syncSaveRecipe(recipePayload)).unwrap()
        dispatch(saveRecipe(recipePayload))
      } catch {
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

    const imageResult = await uploadProductImage(form.imageUrl)
    if (!imageResult.ok) {
      return
    }

    const inventorySynced = await syncRawIngredientIfNeeded()
    if (!inventorySynced) {
      return
    }

    const payload = buildProductPayload(form, imageResult.imageUrl)
    const validRecipeLines = buildRecipeLinesForSave(form, ingredients)
    if (form.productType === 'non_raw' && validRecipeLines.length === 0) {
      failSave('At least one valid ingredient line is required.')
      return
    }

    const savedProduct = await upsertProductRecord(payload)
    if (!savedProduct) {
      return
    }

    dispatch(upsertCanonicalProduct(savedProduct))

    const recipeSynced = await syncRecipeForProduct(savedProduct.id, validRecipeLines)
    if (!recipeSynced) {
      return
    }

    dispatch(
      pushToast({
        title: editing ? 'Product updated' : 'Product added',
        description: `${savedProduct.name} was ${editing ? 'saved' : 'created'}.`,
        variant: 'success',
      }),
    )
    setIsSaving(false)
    closeModal()
  }, [
    closeModal,
    dispatch,
    editing,
    failSave,
    form,
    isSaving,
    syncRawIngredientIfNeeded,
    syncRecipeForProduct,
    upsertProductRecord,
    uploadProductImage,
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
    categoryOptions,
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
  } as const
}
