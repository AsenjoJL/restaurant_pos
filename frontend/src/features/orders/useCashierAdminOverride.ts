import { useAdminOverride } from '../../shared/hooks/useAdminOverride'

export const useCashierAdminOverride = (isAdmin: boolean) => {
  const override = useAdminOverride('cashier', isAdmin)

  return {
    adminOverride: override.active,
    overrideRemainingMs: override.remainingMs,
    toggleAdminOverride: override.toggle,
  }
}
