import { create } from 'zustand'
import type { Cart, CartItem, CouponInfo } from '@/types'
import { cartApi } from '@/services'
import { getErrorMessage } from '@/services/api'
import { useAuthStore } from './authStore'

interface CartState {
  cart: Cart | null
  coupon: CouponInfo | null
  loading: boolean
  error: string | null
  fetchCart: () => Promise<void>
  addItem: (productId: string, quantity?: number) => Promise<CartItem | null>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  applyCoupon: (code: string) => Promise<void>
  removeCoupon: () => Promise<void>
  setCart: (cart: Cart | null) => void
  reset: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  coupon: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    if (!useAuthStore.getState().user) return
    set({ loading: true })
    try {
      const { data } = await cartApi.get()
      set({ cart: data.cart, coupon: data.coupon, error: null })
    } catch (err) {
      set({ error: getErrorMessage(err) })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (productId, quantity = 1) => {
    const { data } = await cartApi.add(productId, quantity)
    set({ cart: data.cart, coupon: get().coupon })
    const added = data.cart.items.find((i) => i.product._id === productId)
    return added ?? null
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await cartApi.update(itemId, quantity)
    set({ cart: data.cart })
  },

  removeItem: async (itemId) => {
    const { data } = await cartApi.remove(itemId)
    set({ cart: data.cart })
  },

  clearCart: async () => {
    const { data } = await cartApi.clear()
    set({ cart: data.cart, coupon: null })
  },

  applyCoupon: async (code) => {
    const { data } = await cartApi.applyCoupon(code)
    set({ cart: data.cart, coupon: { code, type: data.cart.couponCode ? 'PERCENTAGE' : 'FIXED', value: data.discount } as CouponInfo })
  },

  removeCoupon: async () => {
    const { data } = await cartApi.removeCoupon()
    set({ cart: data.cart, coupon: null })
  },

  setCart: (cart) => set({ cart }),
  reset: () => set({ cart: null, coupon: null, error: null, loading: false }),
}))