import { useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAdminProducts } from '../../admin/admin.selectors'
import {
  toRecipePayloadLines,
  validateRecipeDraft,
  validateRecipeIngredientForm,
  type RecipeIngredientErrors,
  type RecipeIngredientFormState,
  type RecipeLineDraft,
} from '../inventory.recipe-form'
import {
  buildIngredientCategoryOptions,
  buildRecipeIngredientOptions,
  buildRecipeProductOptions,
  buildRecipeStats,
  calculateRecipeSummary,
  createEmptyRecipeLine,
  emptyRecipeIngredientForm,
  getRecipeUnitOptions,
  mapRecipeToDraftLines,
} from '../inventory.recipes-page'
import { selectInventoryIngredients, selectInventoryRecipes } from '../inventory.selectors'
import { runInventorySync } from '../inventory.sync'
import { syncRemoveRecipe, syncSaveRecipe, syncUpsertIngredient } from '../inventory.store'

export function useAdminRecipesPageModel() {
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectAdminProducts)
  const ingredients = useAppSelector(selectInventoryIngredients)
  const recipes = useAppSelector(selectInventoryRecipes)

  const productOptions = useMemo(() => buildRecipeProductOptions(products), [products])

  const ingredientOptions = useMemo(
    () => buildRecipeIngredientOptions(ingredients),
    [ingredients],
  )

  const ingredientMap = useMemo(() => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])), [ingredients])

  const getUnitOptionsForLine = useCallback(
    (ingredientId: string) => getRecipeUnitOptions(ingredientMap, ingredientId),
    [ingredientMap],
  )

  const initialProductId = products[0]?.id ?? ''
  const [selectedProductId, setSelectedProductId] = useState(initialProductId)
  const [lines, setLines] = useState(() => {
    if (!initialProductId) {
      return [createEmptyRecipeLine()]
    }
    const existing = recipes.find((recipe) => recipe.productId === initialProductId)
    return existing ? mapRecipeToDraftLines(existing) : [createEmptyRecipeLine()]
  })
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false)
  const [ingredientForm, setIngredientForm] = useState<RecipeIngredientFormState>(emptyRecipeIngredientForm)
  const [ingredientErrors, setIngredientErrors] = useState<RecipeIngredientErrors>({})

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId],
  )

  const currentRecipe = useMemo(
    () => recipes.find((recipe) => recipe.productId === selectedProductId),
    [recipes, selectedProductId],
  )

  const ingredientCategoryOptions = useMemo(
    () => buildIngredientCategoryOptions(ingredients),
    [ingredients],
  )

  const stats = useMemo(() => buildRecipeStats(products.length, recipes.length), [products.length, recipes.length])

  const handleProductChange = useCallback(
    (productId: string) => {
      setSelectedProductId(productId)
      setFormError('')
      const existing = recipes.find((recipe) => recipe.productId === productId)
      setLines(existing ? mapRecipeToDraftLines(existing) : [createEmptyRecipeLine()])
    },
    [recipes],
  )

  const handleLineChange = useCallback((id: string, patch: Partial<RecipeLineDraft>) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }, [])

  const handleAddLine = useCallback(() => {
    setLines((prev) => [...prev, createEmptyRecipeLine()])
  }, [])

  const handleRemoveLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id))
  }, [])

  const {
    recipeCost,
    recipeMargin,
    recipeMarginPct,
    formattedRecipeCost,
    formattedMenuPrice,
    formattedMargin,
  } = useMemo(
    () =>
      calculateRecipeSummary({
        ingredients,
        lines,
        selectedPrice: selectedProduct?.price ?? 0,
      }),
    [ingredients, lines, selectedProduct?.price],
  )

  const handleSave = useCallback(async () => {
    if (isSaving) {
      return
    }
    const error = validateRecipeDraft({
      selectedProductId,
      lines,
      ingredients,
    })
    if (error) {
      setFormError(error)
      dispatch(
        pushToast({
          title: 'Fix recipe fields',
          description: error,
          variant: 'error',
        }),
      )
      return
    }

    const payloadLines = toRecipePayloadLines(lines)

    setIsSaving(true)
    const synced = await runInventorySync(
      dispatch,
      async () => {
        await dispatch(
          syncSaveRecipe({
            productId: selectedProductId,
            lines: payloadLines,
          }),
        ).unwrap()
      },
      {
        errorTitle: 'Recipe sync failed',
        errorDescription: 'Unable to save recipe in mock data.',
      },
    )

    if (!synced) {
      setIsSaving(false)
      return
    }

    dispatch(
      pushToast({
        title: 'Recipe saved',
        description: selectedProduct?.name ?? 'Recipe updated.',
        variant: 'success',
      }),
    )
    setIsSaving(false)
  }, [dispatch, ingredients, isSaving, lines, selectedProduct?.name, selectedProductId])

  const handleClearRecipe = useCallback(async () => {
    if (!selectedProductId) {
      return
    }
    const synced = await runInventorySync(
      dispatch,
      async () => {
        await dispatch(syncRemoveRecipe(selectedProductId)).unwrap()
      },
      {
        errorTitle: 'Recipe sync failed',
        errorDescription: 'Unable to clear recipe in mock data.',
      },
    )
    if (!synced) {
      return
    }
    setLines([createEmptyRecipeLine()])
    dispatch(
      pushToast({
        title: 'Recipe cleared',
        description: selectedProduct?.name ?? 'Recipe removed.',
        variant: 'info',
      }),
    )
  }, [dispatch, selectedProduct?.name, selectedProductId])

  const openIngredientModal = useCallback(() => {
    setIsIngredientModalOpen(true)
  }, [])

  const closeIngredientModal = useCallback(() => {
    setIsIngredientModalOpen(false)
    setIngredientErrors({})
  }, [])

  const handleCreateIngredient = useCallback(async () => {
    const { errors: nextErrors, payload } = validateRecipeIngredientForm(ingredientForm)
    setIngredientErrors(nextErrors)
    if (!payload) {
      dispatch(
        pushToast({
          title: 'Fix ingredient fields',
          description: 'Please complete the required ingredient details.',
          variant: 'error',
        }),
      )
      return
    }

    const synced = await runInventorySync(
      dispatch,
      async () => {
        await dispatch(syncUpsertIngredient(payload)).unwrap()
      },
      {
        errorTitle: 'Ingredient sync failed',
        errorDescription: 'Unable to create ingredient in mock data.',
      },
    )
    if (!synced) {
      return
    }

    dispatch(
      pushToast({
        title: 'Ingredient added',
        description: `${payload.name} is now available in recipes.`,
        variant: 'success',
      }),
    )
    setIngredientForm(emptyRecipeIngredientForm)
    setIngredientErrors({})
    setIsIngredientModalOpen(false)
  }, [dispatch, ingredientForm])

  return {
    // selectors / options
    products,
    ingredients,
    recipes,
    stats,
    productOptions,
    ingredientOptions,
    ingredientCategoryOptions,
    getUnitOptionsForLine,

    // selection & draft
    selectedProductId,
    selectedProduct,
    currentRecipe,
    lines,
    formError,
    isSaving,
    handleProductChange,
    handleLineChange,
    handleAddLine,
    handleRemoveLine,

    // summary
    recipeCost,
    recipeMargin,
    recipeMarginPct,
    formattedRecipeCost,
    formattedMenuPrice,
    formattedMargin,

    // actions
    handleSave,
    handleClearRecipe,

    // ingredient modal
    isIngredientModalOpen,
    ingredientForm,
    ingredientErrors,
    setIngredientForm,
    openIngredientModal,
    closeIngredientModal,
    handleCreateIngredient,
  } as const
}
