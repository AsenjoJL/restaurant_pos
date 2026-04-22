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
    <div style={{ marginBottom: '20px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px',
        }}
      >
        Product Photo (shown to customer)
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white',
        }}
      />
      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
        JPG/PNG up to 5MB.
      </div>
      {(pendingImagePreview || currentImageUrl) && (
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <img
            src={pendingImagePreview || currentImageUrl}
            alt="Product preview"
            style={{
              width: '72px',
              height: '72px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
            }}
          />
          <button
            type="button"
            onClick={onRemove}
            style={{
              padding: '6px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: '#f8fafc',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Remove photo
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductImageUploadField
