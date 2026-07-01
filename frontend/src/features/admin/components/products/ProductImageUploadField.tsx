type ProductImageUploadFieldProps = {
  currentImageUrl: string
  pendingImagePreview: string
  onFileChange: (file: File | null) => void
  onRemove: () => void
}

function ProductImageUploadField({
  currentImageUrl,
  pendingImagePreview,
  onFileChange,
  onRemove,
}: ProductImageUploadFieldProps) {
  return (
    <div className="product-editor-photo-field">
      <label className="product-editor-photo-label">
        Product Photo (shown to customer)
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        className="product-editor-photo-input"
      />
      <div className="product-editor-photo-hint">
        JPG, PNG, WEBP, or AVIF up to 5MB.
      </div>
      {(pendingImagePreview || currentImageUrl) && (
        <div className="product-editor-photo-preview-row">
          <img
            src={pendingImagePreview || currentImageUrl}
            alt="Product preview"
            className="product-editor-photo-preview"
          />
          <button
            type="button"
            onClick={onRemove}
            className="product-editor-secondary-btn"
          >
            Remove photo
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductImageUploadField
