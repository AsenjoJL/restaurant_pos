import type { Dispatch, SetStateAction } from 'react'
import type { AdminCategory } from '../../admin.types'
import type { ProductErrors, ProductFormState } from '../../admin.products-form'
import { productEditorStyles } from './productEditor.styles'

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
    <div style={{ marginBottom: '32px' }}>
      <h3 style={productEditorStyles.sectionTitle}>Product Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={productEditorStyles.label}>Product Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            style={productEditorStyles.input(Boolean(errors.name))}
            placeholder="e.g. Classic Cheeseburger"
          />
          {errors.name ? <div style={productEditorStyles.errorText}>{errors.name}</div> : null}
        </div>
        <div>
          <label style={productEditorStyles.label}>Category *</label>
          <select
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            style={productEditorStyles.input(Boolean(errors.category))}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category ? <div style={productEditorStyles.errorText}>{errors.category}</div> : null}
        </div>
      </div>
      <div>
        <label style={productEditorStyles.label}>Description</label>
        <textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          style={{
            ...productEditorStyles.input(),
            minHeight: '80px',
            resize: 'vertical',
          }}
          placeholder="Optional product description"
        />
      </div>
    </div>
  )
}

export default ProductDetailsFields
