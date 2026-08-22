import { create } from 'zustand'
import type { Product } from '@/types'
import { wishlistApi } from '@/services'
import { getErrorMessage } from '@/services/api'
import { useAuthStore } from './authStore'

interface WishlistState {
  products: Product[]
  loading: boolean
  error: string | null
  ids: Set<string>
  fetchWishlist: () => Promise<void>
  isWishlisted: (id: string) => boolean
  toggle: (product: Product) => Promise<{ added: boolean }>
  remove: (productId: string) => Promise<void>
  reset: () => void
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  ids: new Set<string>(),

  fetchWishlist: async () => {
    if (!useAuthStore.getState().user) return
    set({ loading: true })
    try {
      const { data } = await wishlistApi.get()
      set({ products: data.products, ids: new Set(data.products.map((p) => p._id)), error: null })
    } catch (err) {
      set({ error: getErrorMessage(err) })
    } finally {
      set({ loading: false })
    }
  },

  isWishlisted: (id) => get().ids.has(id),

  toggle: async (product) => {
    const was = get().ids.has(product._id)
    if (was) {
      await wishlistApi.remove(product._id)
      set((s) => ({
        products: s.products.filter((p) => p._id !== product._id),
        ids: new Set([...s.ids].filter((i) => i !== product._id)),
      }))
      return { added: false }
    }
    await wishlistApi.add(product._id)
    set((s) => ({ products: [product, ...s.products], ids: new Set([...s.ids, product._id]) }))
    return { added: true }
  },

  remove: async (productId) => {
    await wishlistApi.remove(productId)
    set((s) => ({
      products: s.products.filter((p) => p._id !== productId),
      ids: new Set([...s.ids].filter((i) => i !== productId)),
    }))
  },

  reset: () => set({ products: [], ids: new Set(), error: null, loading: false }),
}))