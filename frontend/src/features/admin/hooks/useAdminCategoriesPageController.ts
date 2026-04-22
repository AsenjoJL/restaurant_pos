import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { hasValidationErrors } from '../../../shared/lib/validation'
import { pushToast } from '../../../shared/store/ui.store'
import { dispatchAndSyncAdmin } from '../admin.actions'
import {
  buildCategoryPayload,
  emptyCategoryForm,
  validateCategoryForm,
  type CategoryErrors,
  type CategoryFormState,
  type CategoryPayload,
} from '../admin.categories-form'
import { selectAdminCategories, selectAdminProducts } from '../admin.selectors'
import { addCategory, deleteCategory, updateCategory } from '../admin.store'
import type { AdminCategory } from '../admin.types'

type ConfirmState = {
  isOpen: boolean
  reason: string
  targetId: string | null
}

function useAdminCategoriesPageController() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectAdminCategories)
  const products = useAppSelector(selectAdminProducts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCategory | null>(null)
  const [form, setForm] = useState<CategoryFormState>(emptyCategoryForm)
  const [errors, setErrors] = useState<CategoryErrors>({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    targetId: null,
    reason: '',
  })

  const productCounts = useMemo(
    () =>
      products.reduce<Record<string, number>>((acc, product) => {
        acc[product.categoryId] = (acc[product.categoryId] ?? 0) + 1
        return acc
      }, {}),
    [products],
  )

  const stats = useMemo(() => {
    const activeCount = categories.filter((category) => category.isActive).length
    return {
      total: categories.length,
      active: activeCount,
      hidden: Math.max(categories.length - activeCount, 0),
      products: products.length,
    }
  }, [categories, products.length])

  const resetFormState = () => {
    setEditing(null)
    setForm(emptyCategoryForm)
    setErrors({})
    setFormError('')
    setIsSaving(false)
  }

  const openAddModal = () => {
    resetFormState()
    setIsModalOpen(true)
  }

  const openEditModal = (category: AdminCategory) => {
    setEditing(category)
    setForm({
      name: category.name,
      description: category.description,
    })
    setErrors({})
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetFormState()
  }

  const failSave = (message: string) => {
    setIsSaving(false)
    setFormError(message)
  }

  const upsertCategoryRecord = async (payload: CategoryPayload): Promise<boolean> => {
    if (editing) {
      const synced = await dispatchAndSyncAdmin(
        dispatch,
        updateCategory({
          id: editing.id,
          isActive: editing.isActive,
          ...payload,
        }),
      )
      if (!synced) {
        failSave('Unable to save category right now. Please try again.')
        return false
      }

      dispatch(
        pushToast({
          title: 'Category updated',
          description: `${payload.name} was saved.`,
          variant: 'success',
        }),
      )
      return true
    }

    const synced = await dispatchAndSyncAdmin(dispatch, addCategory(payload))
    if (!synced) {
      failSave('Unable to save category right now. Please try again.')
      return false
    }

    dispatch(
      pushToast({
        title: 'Category added',
        description: `${payload.name} was created.`,
        variant: 'success',
      }),
    )
    return true
  }

  const handleSave = async () => {
    if (isSaving) {
      return
    }
    const nextErrors = validateCategoryForm(form)
    setErrors(nextErrors)
    if (hasValidationErrors(nextErrors)) {
      setFormError('Please fix the highlighted fields.')
      dispatch(
        pushToast({
          title: 'Fix validation errors',
          description: 'Category name is required.',
          variant: 'error',
        }),
      )
      return
    }

    setIsSaving(true)
    const payload = buildCategoryPayload(form)
    const synced = await upsertCategoryRecord(payload)
    if (!synced) {
      return
    }

    setIsSaving(false)
    closeModal()
  }

  const handleDeleteRequest = (category: AdminCategory) => {
    const count = productCounts[category.id] ?? 0
    if (count > 0) {
      dispatch(
        pushToast({
          title: 'Category has products',
          description: 'Move products to another category before deleting.',
          variant: 'error',
        }),
      )
      return
    }

    setConfirm({ isOpen: true, targetId: category.id, reason: '' })
  }

  const handleDeleteConfirm = async () => {
    if (!confirm.targetId) {
      return
    }
    const category = categories.find((item) => item.id === confirm.targetId)
    const synced = await dispatchAndSyncAdmin(dispatch, deleteCategory(confirm.targetId))
    if (synced) {
      dispatch(
        pushToast({
          title: 'Category deleted',
          description: category ? `${category.name} was removed.` : 'Category removed.',
          variant: 'warning',
        }),
      )
    }
    setConfirm({ isOpen: false, targetId: null, reason: '' })
  }

  return {
    categories,
    closeModal,
    confirm,
    editing,
    errors,
    form,
    formError,
    handleDeleteConfirm,
    handleDeleteRequest,
    handleSave,
    isModalOpen,
    isSaving,
    navigate,
    openAddModal,
    openEditModal,
    productCounts,
    setConfirm,
    setForm,
    stats,
  }
}

export default useAdminCategoriesPageController
