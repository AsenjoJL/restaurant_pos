import { nanoid } from '@reduxjs/toolkit'
import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import Select from '../../../shared/components/ui/Select'
import { pushToast } from '../../../shared/store/ui.store'
import AdminStatCard from '../../admin/components/AdminStatCard'
import { selectAdminProducts } from '../../admin/admin.selectors'
import {
  addIngredient,
  syncUpsertIngredient,
  saveRecipe,
  removeRecipe,
  syncRemoveRecipe,
  syncSaveRecipe,
} from '../inventory.store'
import {
  selectInventoryIngredients,
  selectInventoryRecipes,
} from '../inventory.selectors'
import type {
  IngredientBaseUnit,
  IngredientType,
  MeasurementUnit,
  RecipeLine,
} from '../inventory.types'
import { calculateRecipeCost } from '../inventory.logic'
import { convertToBase, getCompatibleUnits } from '../inventory.conversions'
import { formatCurrency } from '../../../shared/lib/format'

type RecipeLineDraft = {
  id: string
  ingredientId: string
  qty: string
  unit: MeasurementUnit | ''
}

type IngredientFormState = {
  ingredientType: IngredientType
  name: string
  category: string
  baseUnit: IngredientBaseUnit
  onHand: string
  reorderLevel: string
  unitCost: string
}

type IngredientErrors = {
  name?: string
  category?: string
  onHand?: string
  reorderLevel?: string
  unitCost?: string
}

const createEmptyLine = (): RecipeLineDraft => ({
  id: nanoid(),
  ingredientId: '',
  qty: '',
  unit: '',
})

const emptyIngredientForm: IngredientFormState = {
  ingredientType: 'RAW',
  name: '',
  category: '',
  baseUnit: 'pcs',
  onHand: '',
  reorderLevel: '',
  unitCost: '',
}

function AdminRecipesPage() {
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectAdminProducts)
  const ingredients = useAppSelector(selectInventoryIngredients)
  const recipes = useAppSelector(selectInventoryRecipes)

  const productOptions = useMemo(
    () => [
      { value: '', label: 'Select a product' },
      ...products.map((product) => ({
        value: product.id,
        label: product.name,
      })),
    ],
    [products],
  )

  const ingredientOptions = useMemo(
    () => [
      { value: '', label: 'Select ingredient' },
      ...ingredients.map((ingredient) => ({
        value: ingredient.id,
        label: ingredient.inventoryId
          ? `${ingredient.inventoryId} - ${ingredient.name}`
          : ingredient.name,
      })),
    ],
    [ingredients],
  )

  const ingredientMap = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  )

  const getUnitOptionsForLine = (ingredientId: string) => {
    const ingredient = ingredientMap.get(ingredientId)
    if (!ingredient) {
      return [{ value: '', label: 'Base unit' }]
    }
    const compatible = getCompatibleUnits(ingredient)
    const extras = compatible.filter((unit) => unit !== ingredient.baseUnit)
    return [
      { value: '', label: `Base (${ingredient.baseUnit})` },
      ...extras.map((unit) => ({ value: unit, label: unit })),
    ]
  }

  const initialProductId = products[0]?.id ?? ''
  const [selectedProductId, setSelectedProductId] = useState(initialProductId)
  const [lines, setLines] = useState<RecipeLineDraft[]>([createEmptyLine()])
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false)
  const [ingredientForm, setIngredientForm] = useState<IngredientFormState>(emptyIngredientForm)
  const [ingredientErrors, setIngredientErrors] = useState<IngredientErrors>({})

  const ingredientCategoryOptions = useMemo(
    () => [
      { value: '', label: 'Select category' },
      ...Array.from(new Set(ingredients.map((item) => item.category)))
        .sort()
        .map((category) => ({ value: category, label: category })),
    ],
    [ingredients],
  )

  const selectedProduct = products.find((product) => product.id === selectedProductId)
  const currentRecipe = recipes.find((recipe) => recipe.productId === selectedProductId)
  const recipeCost = useMemo(() => {
    const draftLines = lines
      .filter((line) => line.ingredientId && Number(line.qty) > 0)
      .map((line) => ({
        ingredientId: line.ingredientId,
        qty: Number(line.qty),
        unit: line.unit || undefined,
      }))
    return calculateRecipeCost(draftLines, ingredients)
  }, [ingredients, lines])
  const recipeMargin = selectedProduct ? selectedProduct.price - recipeCost : 0
  const recipeMarginPct =
    selectedProduct && selectedProduct.price > 0
      ? recipeMargin / selectedProduct.price
      : 0

  const stats = useMemo(() => {
    const recipeCount = recipes.length
    return {
      products: products.length,
      recipes: recipeCount,
    }
  }, [products.length, recipes.length])

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId)
    setFormError('')
    const existing = recipes.find((recipe) => recipe.productId === productId)
    if (existing) {
      setLines(
        existing.lines.map((line) => ({
          id: nanoid(),
          ingredientId: line.ingredientId,
          qty: String(line.qty),
          unit: line.unit ?? '',
        })),
      )
      return
    }
    setLines([createEmptyLine()])
  }

  const handleLineChange = (id: string, patch: Partial<RecipeLineDraft>) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    )
  }

  const handleAddLine = () => {
    setLines((prev) => [...prev, createEmptyLine()])
  }

  const handleRemoveLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id))
  }

  const validate = () => {
    if (!selectedProductId) {
      return 'Select a product before saving.'
    }
    if (lines.length === 0) {
      return 'Add at least one ingredient line.'
    }

    const seen = new Set<string>()
    for (const line of lines) {
      if (!line.ingredientId) {
        return 'Each line must have an ingredient.'
      }
      if (seen.has(line.ingredientId)) {
        return 'Duplicate ingredient detected. Each ingredient should appear once.'
      }
      seen.add(line.ingredientId)

      const qtyValue = Number(line.qty)
      if (!Number.isFinite(qtyValue) || qtyValue <= 0) {
        return 'Each line must have a quantity greater than zero.'
      }

      const ingredient = ingredients.find((item) => item.id === line.ingredientId)
      if (!ingredient) {
        return 'Ingredient not found for one of the lines.'
      }
      const unit = line.unit || ingredient.baseUnit
      const conversion = convertToBase(ingredient, qtyValue, unit)
      if (!conversion.ok) {
        return conversion.reason
      }
    }
    return ''
  }

  const handleSave = () => {
    if (isSaving) {
      return
    }
    const error = validate()
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

    const payloadLines: RecipeLine[] = lines.map((line) => ({
      ingredientId: line.ingredientId,
      qty: Number(line.qty),
      unit: line.unit || undefined,
    }))

    setIsSaving(true)
    dispatch(
      saveRecipe({
        productId: selectedProductId,
        lines: payloadLines,
      }),
    )
    void dispatch(
      syncSaveRecipe({
        productId: selectedProductId,
        lines: payloadLines,
      }),
    )
    dispatch(
      pushToast({
        title: 'Recipe saved',
        description: selectedProduct?.name ?? 'Recipe updated.',
        variant: 'success',
      }),
    )
    setTimeout(() => setIsSaving(false), 200)
  }

  const handleClearRecipe = () => {
    if (!selectedProductId) {
      return
    }
    dispatch(removeRecipe(selectedProductId))
    void dispatch(syncRemoveRecipe(selectedProductId))
    setLines([createEmptyLine()])
    dispatch(
      pushToast({
        title: 'Recipe cleared',
        description: selectedProduct?.name ?? 'Recipe removed.',
        variant: 'info',
      }),
    )
  }

  const handleCreateIngredient = () => {
    const nextErrors: IngredientErrors = {}
    const name = ingredientForm.name.trim()
    const category = ingredientForm.category.trim()
    const onHand = Number(ingredientForm.onHand)
    const reorderLevel = Number(ingredientForm.reorderLevel)
    const unitCost = Number(ingredientForm.unitCost)

    if (!name) {
      nextErrors.name = 'Ingredient name is required.'
    }
    if (!category) {
      nextErrors.category = 'Category is required.'
    }
    if (!Number.isFinite(onHand) || onHand < 0) {
      nextErrors.onHand = 'Enter a valid on-hand quantity.'
    }
    if (!Number.isFinite(reorderLevel) || reorderLevel < 0) {
      nextErrors.reorderLevel = 'Enter a valid reorder level.'
    }
    if (!Number.isFinite(unitCost) || unitCost < 0) {
      nextErrors.unitCost = 'Enter a valid unit cost.'
    }

    setIngredientErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      dispatch(
        pushToast({
          title: 'Fix ingredient fields',
          description: 'Please complete the required ingredient details.',
          variant: 'error',
        }),
      )
      return
    }

    const payload = {
      ingredientType: ingredientForm.ingredientType,
      name,
      category,
      baseUnit: ingredientForm.baseUnit,
      onHand,
      reorderLevel,
      unitCost,
    }

    dispatch(addIngredient(payload))
    void dispatch(syncUpsertIngredient(payload))
    dispatch(
      pushToast({
        title: 'Ingredient added',
        description: `${name} is now available in recipes.`,
        variant: 'success',
      }),
    )
    setIngredientForm(emptyIngredientForm)
    setIngredientErrors({})
    setIsIngredientModalOpen(false)
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Recipes</h2>
          <p className="muted">Map ingredients to menu products for inventory deduction.</p>
        </div>
        <div className="admin-row-actions recipe-header-actions">
          <Button
            variant="outline"
            className="recipe-action-btn recipe-action-add"
            onClick={() => setIsIngredientModalOpen(true)}
            icon="add"
          >
            New Inventory Ingredient
          </Button>
          <Button
            variant="outline"
            className="recipe-action-btn recipe-action-clear"
            onClick={handleClearRecipe}
            icon="delete"
          >
            Clear Recipe
          </Button>
          <Button
            variant="primary"
            className="recipe-action-btn recipe-action-save"
            onClick={handleSave}
            icon="save"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Recipe'}
          </Button>
        </div>
      </div>

      <div className="admin-metrics">
        <AdminStatCard label="Products" value={String(stats.products)} icon="inventory_2" />
        <AdminStatCard label="Recipes" value={String(stats.recipes)} icon="menu_book" />
      </div>

      <div className="panel admin-card recipe-card">
        <div className="admin-toolbar">
          <Select
            label="Product"
            value={selectedProductId}
            onChange={(event) => handleProductChange(event.target.value)}
            options={productOptions}
          />
        </div>

        {formError ? <div className="form-error">{formError}</div> : null}

        {selectedProduct ? (
          <div className="recipe-builder">
            <div className="recipe-lines">
              {lines.map((line) => (
                <div key={line.id} className="recipe-line">
                  <Select
                    label="Ingredient"
                    value={line.ingredientId}
                    onChange={(event) =>
                      handleLineChange(line.id, { ingredientId: event.target.value })
                    }
                    options={ingredientOptions}
                  />
                  <Input
                    label="Qty per serving"
                    placeholder="0"
                    inputMode="decimal"
                    value={line.qty}
                    onChange={(event) =>
                      handleLineChange(line.id, { qty: event.target.value })
                    }
                  />
                  <Select
                    label="Unit"
                    value={line.unit}
                    onChange={(event) =>
                      handleLineChange(line.id, {
                        unit: event.target.value as MeasurementUnit | '',
                      })
                    }
                    options={getUnitOptionsForLine(line.ingredientId)}
                  />
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveLine(line.id)}
                    icon="delete"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="admin-row-actions">
              <Button variant="outline" onClick={handleAddLine} icon="add">
                Add Ingredient
              </Button>
            </div>

            <div className="recipe-summary">
              <div>
                <span className="muted">Estimated Recipe Cost</span>
                <strong>{formatCurrency(recipeCost)}</strong>
              </div>
              <div>
                <span className="muted">Menu Price</span>
                <strong>{formatCurrency(selectedProduct.price)}</strong>
              </div>
              <div>
                <span className="muted">Gross Margin</span>
                <strong>
                  {formatCurrency(recipeMargin)}{' '}
                  <span className="muted">
                    ({Math.round(recipeMarginPct * 100)}%)
                  </span>
                </strong>
              </div>
            </div>

            {currentRecipe ? (
              <p className="muted">
                Last updated: {new Date(currentRecipe.updatedAt).toLocaleString()}
              </p>
            ) : (
              <p className="muted">No recipe saved yet for this product.</p>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No product selected</h3>
            <p className="muted">Choose a product to build a recipe.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isIngredientModalOpen}
        title="Add Inventory Ingredient"
        onClose={() => {
          setIsIngredientModalOpen(false)
          setIngredientErrors({})
        }}
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setIsIngredientModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateIngredient}>
              Add Ingredient
            </Button>
          </div>
        }
      >
        <Input
          label="Ingredient name"
          placeholder="e.g. Chicken Thigh"
          value={ingredientForm.name}
          onChange={(event) =>
            setIngredientForm((prev) => ({ ...prev, name: event.target.value }))
          }
          error={ingredientErrors.name}
        />
        <Select
          label="Ingredient type"
          value={ingredientForm.ingredientType}
          onChange={(event) =>
            setIngredientForm((prev) => ({
              ...prev,
              ingredientType: event.target.value as IngredientType,
            }))
          }
          options={[
            { value: 'RAW', label: 'Raw ingredient' },
            { value: 'NON_RAW', label: 'Non-raw / finished stock' },
          ]}
        />
        <Select
          label="Category"
          value={ingredientForm.category}
          onChange={(event) =>
            setIngredientForm((prev) => ({ ...prev, category: event.target.value }))
          }
          options={ingredientCategoryOptions}
          error={ingredientErrors.category}
        />
        <Select
          label="Base unit"
          value={ingredientForm.baseUnit}
          onChange={(event) =>
            setIngredientForm((prev) => ({
              ...prev,
              baseUnit: event.target.value as IngredientBaseUnit,
            }))
          }
          options={[
            { value: 'pcs', label: 'pcs' },
            { value: 'g', label: 'g' },
            { value: 'ml', label: 'ml' },
          ]}
        />
        <Input
          label="On hand"
          inputMode="decimal"
          placeholder="0"
          value={ingredientForm.onHand}
          onChange={(event) =>
            setIngredientForm((prev) => ({ ...prev, onHand: event.target.value }))
          }
          error={ingredientErrors.onHand}
        />
        <Input
          label="Reorder level"
          inputMode="decimal"
          placeholder="0"
          value={ingredientForm.reorderLevel}
          onChange={(event) =>
            setIngredientForm((prev) => ({ ...prev, reorderLevel: event.target.value }))
          }
          error={ingredientErrors.reorderLevel}
        />
        <Input
          label="Unit cost"
          inputMode="decimal"
          placeholder="0.00"
          value={ingredientForm.unitCost}
          onChange={(event) =>
            setIngredientForm((prev) => ({ ...prev, unitCost: event.target.value }))
          }
          error={ingredientErrors.unitCost}
        />
      </Modal>
    </div>
  )
}

export default AdminRecipesPage
