export type CategoryFormState = {
  name: string
  description: string
}

export type CategoryErrors = {
  name?: string
}

export type CategoryPayload = {
  name: string
  description: string
}

export const emptyCategoryForm: CategoryFormState = {
  name: '',
  description: '',
}

export const validateCategoryForm = (form: CategoryFormState): CategoryErrors => {
  const errors: CategoryErrors = {}

  if (!form.name.trim()) {
    errors.name = 'Category name is required.'
  }

  return errors
}

export const buildCategoryPayload = (form: CategoryFormState): CategoryPayload => ({
  name: form.name.trim(),
  description: form.description.trim(),
})
