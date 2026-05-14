import type { Dispatch, SetStateAction } from 'react'
import type { Ingredient } from '../../../inventory/inventory.types'
import type { AdminCategory, AdminProduct } from '../../admin.types'
import type { ProductErrors, ProductFormState } from '../../admin.products-form'
import type { DemoProductKey } from '../../admin.product-demos'
import NonRawProductFields from './NonRawProductFields'
import ProductDetailsFields from './ProductDetailsFields'
import ProductEditorDemoBar from './ProductEditorDemoBar'
import ProductEditorFooter from './ProductEditorFooter'
import RawProductFields from './RawProductFields'

export type ProductEditorModalProps = {
  categories: AdminCategory[]
  editing: AdminProduct | null
  errors: ProductErrors
  form: ProductFormState
  formError: string
  ingredientSelectOptions: Array<{ value: string; label: string }>
  ingredients: Ingredient[]
  isOpen: boolean
  isSaving: boolean
  markupPercentage: number | null
  pendingImagePreview: string
  profitMarginPercent: number | null
  profitPerItem: number | null
  setForm: Dispatch<SetStateAction<ProductFormState>>
  onAddIngredientLink: () => void
  onClear: () => void
  onClearPendingImage: () => void
  onClose: () => void
  onImageFileChange: (file: File | null) => void
  onIngredientSelect: (ingredientId: string) => void
  onAdditionalIngredientSelect: (index: number, ingredientId: string) => void
  onLoadDemoProduct: (key: DemoProductKey) => void
  onRecipeIngredientChange: (index: number, ingredientId: string) => void
  onRecipeQtyChange: (index: number, qty: string) => void
  onRemoveIngredientLink: (index: number) => void
  onSave: () => void
}

function ProductEditorModal({
  categories,
  editing,
  errors,
  form,
  formError,
  ingredientSelectOptions,
  ingredients,
  isOpen,
  isSaving,
  markupPercentage,
  pendingImagePreview,
  profitMarginPercent,
  profitPerItem,
  setForm,
  onAddIngredientLink,
  onClear,
  onClearPendingImage,
  onClose,
  onImageFileChange,
  onIngredientSelect,
  onAdditionalIngredientSelect,
  onLoadDemoProduct,
  onRecipeIngredientChange,
  onRecipeQtyChange,
  onRemoveIngredientLink,
  onSave,
}: ProductEditorModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="product-editor-overlay">
      <div className="product-editor-shell">
        <div className="product-editor-header">
          <div>
            <h2 className="product-editor-title">{editing ? 'Edit Product' : 'Add Product'}</h2>
          </div>
          <button type="button" onClick={onClose} className="product-editor-close-btn">
            x
          </button>
        </div>

        <ProductEditorDemoBar isVisible={!editing} onLoadDemoProduct={onLoadDemoProduct} />

        <div className="product-editor-body">
          {formError ? <div className="product-editor-error-banner">{formError}</div> : null}

          <ProductDetailsFields categories={categories} errors={errors} form={form} setForm={setForm} />

          {form.productType === 'raw' ? (
            <RawProductFields
              errors={errors}
              form={form}
              ingredients={ingredients}
              onAddIngredientLink={onAddIngredientLink}
              onIngredientSelect={onIngredientSelect}
              onAdditionalIngredientSelect={onAdditionalIngredientSelect}
              onRemoveIngredientLink={onRemoveIngredientLink}
              setForm={setForm}
            />
          ) : null}

          {form.productType === 'non_raw' ? (
            <NonRawProductFields
              errors={errors}
              form={form}
              ingredientSelectOptions={ingredientSelectOptions}
              markupPercentage={markupPercentage}
              pendingImagePreview={pendingImagePreview}
              profitMarginPercent={profitMarginPercent}
              profitPerItem={profitPerItem}
              onClearPendingImage={onClearPendingImage}
              onImageFileChange={onImageFileChange}
              onRecipeIngredientChange={onRecipeIngredientChange}
              onRecipeQtyChange={onRecipeQtyChange}
              setForm={setForm}
            />
          ) : null}
        </div>

        <ProductEditorFooter isSaving={isSaving} onClear={onClear} onClose={onClose} onSave={onSave} />
      </div>
    </div>
  )
}

export default ProductEditorModal
