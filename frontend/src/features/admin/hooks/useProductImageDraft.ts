import { useCallback } from 'react'
import { useAppDispatch } from '../../../app/store/hooks'
import { useFileObjectUrl } from '../../../shared/hooks/useFileObjectUrl'
import { pushToast } from '../../../shared/store/ui.store'
import { validateProductImageFile } from '../admin.products-form'
import { adminRepository } from '../api'

type UploadFailureToast = {
  title: string
  description: string
}

type UseProductImageDraftOptions = {
  onUploadFailure: (formMessage: string, toast: UploadFailureToast) => void
}

function useProductImageDraft({ onUploadFailure }: UseProductImageDraftOptions) {
  const dispatch = useAppDispatch()
  const {
    file: pendingImageFile,
    url: pendingImagePreview,
    setFile: setPendingImageFile,
    clear: clearPendingImage,
  } = useFileObjectUrl()

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

  const uploadProductImage = useCallback(
    async (currentImageUrl: string) => {
      if (!pendingImageFile) {
        return {
          ok: true as const,
          imageUrl: currentImageUrl.trim() || null,
        }
      }

      try {
        const uploaded = await adminRepository.uploadProductImage(pendingImageFile)
        return {
          ok: true as const,
          imageUrl: uploaded.imageUrl,
        }
      } catch {
        onUploadFailure('Image upload failed. Please try another image.', {
          title: 'Upload failed',
          description: 'Unable to upload the product image right now.',
        })
        return { ok: false as const }
      }
    },
    [onUploadFailure, pendingImageFile],
  )

  return {
    clearPendingImage,
    handleImageFileChange,
    pendingImagePreview,
    uploadProductImage,
  } as const
}

export default useProductImageDraft
