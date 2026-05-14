import type { Dispatch, SetStateAction } from 'react'
import type { AdminCategory } from '../../admin.types'
import type { ProductErrors, ProductFormState } from '../../admin.products-form'

export type ProductDetailsFieldsProps = {
  categories: AdminCategory[]
  errors: ProductErrors
  form: ProductFormState
  setForm: Dispatch<SetStateAction<ProductFormState>>
}

function ProductDetailsFields({
  categories,
  errors,
  form,
  setForm,
}: ProductDetailsFieldsProps) {
  return (
    <div className="product-editor-section">
      <h3 className="product-editor-section-title">Product Details</h3>
      <div className="product-editor-grid product-editor-grid--two">
        <div>
          <label className="product-editor-label">Product Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className={`product-editor-control${errors.name ? ' is-error' : ''}`}
            placeholder="e.g. Classic Cheeseburger"
          />
          {errors.name ? <div className="product-editor-error">{errors.name}</div> : null}
        </div>
        <div>
          <label className="product-editor-label">Category *</label>
          <select
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            className={`product-editor-control${errors.category ? ' is-error' : ''}`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category ? <div className="product-editor-error">{errors.category}</div> : null}
        </div>
      </div>
      <div>
        <label className="product-editor-label">Description</label>
        <textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          className="product-editor-control product-editor-textarea"
          placeholder="Optional product description"
        />
      </div>
    </div>
  )
}

export default ProductDetailsFields
