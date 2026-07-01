import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectAdminProducts } from '../../admin/admin.selectors'
import { MAX_NOTE_LENGTH } from '../../../shared/lib/validators'
import { pushToast } from '../../../shared/store/ui.store'
import { useKiosk } from '../useKiosk'
import type { MenuProduct } from '../../pos/pos.types'
import { syncCreateOrder } from '../../orders/orders.store'
import {
  selectInventoryIngredients,
  selectInventoryRecipes,
} from '../../inventory/inventory.selectors'
import { selectRuntimeMenuCategories, selectRuntimeMenuProducts } from '../../pos/menu.selectors'
import { useKioskMenuModel } from '../menu/useKioskMenuModel'

const extractErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }
  }

  return null
}

export function useKioskMenuPageController() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    state,
    totals,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    rememberOrder,
    setNote,
    placeOrder,
  } = useKiosk()
  const ingredients = useAppSelector(selectInventoryIngredients)
  const recipes = useAppSelector(selectInventoryRecipes)
  const adminProducts = useAppSelector(selectAdminProducts)
  const categories = useAppSelector(selectRuntimeMenuCategories)
  const runtimeProducts = useAppSelector(selectRuntimeMenuProducts)

  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})
  const [isPlacing, setIsPlacing] = useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const [clearReason, setClearReason] = useState('')

  useEffect(() => {
    if (!state.orderType) {
      navigate('/kiosk', { replace: true })
    }
  }, [navigate, state.orderType])

  const model = useKioskMenuModel({
    activeCategory,
    adminProducts,
    categories,
    ingredients,
    recipes,
    runtimeProducts,
    searchTerm,
    cart: state.cart,
  })

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    runtimeProducts.forEach((product) => {
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1)
    })
    return counts
  }, [runtimeProducts])

  const upsellProducts = useMemo(() => {
    const preferredCategories = new Set(['drinks', 'desserts'])
    return runtimeProducts
      .filter((product) => {
        const categoryName = model.categoryNameMap
          .get(product.categoryId)
          ?.trim()
          .toLowerCase()

        return (
          preferredCategories.has(product.categoryId.toLowerCase()) ||
          categoryName === 'drinks' ||
          categoryName === 'desserts'
        )
      })
      .filter((product) => model.resolveProductAvailability(product) === 'AVAILABLE')
      .slice(0, 2)
  }, [model, runtimeProducts])

  const handlePlaceOrder = async () => {
    if (isPlacing) {
      return
    }
    if (!state.orderType) {
      dispatch(
        pushToast({
          title: 'Select order type',
          description: 'Please choose dine-in or takeout before placing the order.',
          variant: 'error',
        }),
      )
      return
    }
    if (state.cart.length === 0) {
      dispatch(
        pushToast({
          title: 'Cart is empty',
          description: 'Add at least one item to place an order.',
          variant: 'error',
        }),
      )
      return
    }
    if (model.requiredErrors.length > 0) {
      dispatch(
        pushToast({
          title: 'Missing required options',
          description: `Select required options for ${model.requiredErrors[0]}.`,
          variant: 'error',
        }),
      )
      return
    }
    if (state.note.length > MAX_NOTE_LENGTH) {
      dispatch(
        pushToast({
          title: 'Note too long',
          description: `Order notes must be ${MAX_NOTE_LENGTH} characters or less.`,
          variant: 'error',
        }),
      )
      return
    }

    setIsPlacing(true)
    const result = placeOrder()
    if (!result) {
      setIsPlacing(false)
      dispatch(
        pushToast({
          title: 'Order failed',
          description: 'Please choose an order type and add items.',
          variant: 'error',
        }),
      )
      return
    }

    try {
      const created = await dispatch(syncCreateOrder({ order: result.order })).unwrap()
      rememberOrder(created.order)
      dispatch(
        pushToast({
          title: 'Order placed',
          description: `Order ${created.order.order_no} is ready for payment.`,
          variant: 'success',
        }),
      )
      navigate(`/kiosk/print/${created.order.order_no}`)
    } catch (error) {
      dispatch(
        pushToast({
          title: 'Order save failed',
          description:
            extractErrorMessage(error) ?? 'Could not create the customer order in the backend.',
          variant: 'error',
        }),
      )
    } finally {
      setIsPlacing(false)
    }
  }

  const handleAddDirect = (product: MenuProduct) => {
    addItem({ product, quantity: 1, modifiers: [] })
  }

  const handleCustomize = (product: MenuProduct) => {
    setSelectedProduct(product)
  }

  const handleCustomizedAdd = (payload: {
    product: MenuProduct
    quantity: number
    modifiers: string[]
  }) => {
    addItem(payload)
    setSelectedProduct(null)
  }

  const handleClearFilters = () => {
    setActiveCategory('all')
    setSearchTerm('')
  }

  const handleBackToHome = () => {
    navigate('/kiosk')
  }

  const handleImageError = (productId: string) => {
    setBrokenImages((prev) => ({ ...prev, [productId]: true }))
  }

  const handleConfirmClearCart = () => {
    clearCart()
    setIsClearConfirmOpen(false)
    setClearReason('')
  }

  const handleCancelClearCart = () => {
    setIsClearConfirmOpen(false)
    setClearReason('')
  }

  return {
    activeCategory,
    brokenImages,
    categories,
    categoryCounts,
    clearReason,
    isClearConfirmOpen,
    isPlacing,
    model,
    runtimeProducts,
    searchTerm,
    selectedProduct,
    state,
    totals,
    upsellProducts,
    setActiveCategory,
    setClearReason,
    setIsClearConfirmOpen,
    setNote,
    setSearchTerm,
    setSelectedProduct,
    updateQuantity,
    removeItem,
    handleAddDirect,
    handleBackToHome,
    handleCancelClearCart,
    handleClearFilters,
    handleConfirmClearCart,
    handleCustomize,
    handleCustomizedAdd,
    handleImageError,
    handlePlaceOrder,
  }
}

export default useKioskMenuPageController
