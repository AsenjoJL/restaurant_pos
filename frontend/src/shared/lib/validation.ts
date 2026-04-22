export const hasValidationErrors = (errors: Record<string, unknown>) =>
  Object.values(errors).some((value) => Boolean(value))
